using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ProjektLabor.Data;
using System.Security.Claims;

public static class UserEndpoints
{
    public record UpdateProfileRequest(string? FullName);
    public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
    public record UpdateRolesRequest(string[] Roles);
    public record LockUserRequest(bool Lock);
    public record UserDto(string Id, string? Email, string? FullName, string[] Roles, bool Locked);


    public static void MapUserEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/v1/users/me", async (
            ClaimsPrincipal user,
            UserManager<ApplicationUser> userManager) =>
        {
            var appUser = await userManager.GetUserAsync(user);
            if (appUser == null) return Results.Unauthorized();
            var roles = await userManager.GetRolesAsync(appUser);
            return Results.Ok(new
            {
                id = appUser.Id,
                email = appUser.Email,
                fullName = appUser.FullName,
                roles = roles,
                resumePath = appUser.ResumePath
            });
        }).RequireAuthorization();

        app.MapPatch("/api/v1/users/me", async (
            [FromBody] UpdateProfileRequest req,
            ClaimsPrincipal user,
            UserManager<ApplicationUser> userManager) =>
        {
            var appUser = await userManager.GetUserAsync(user);
            if (appUser == null) return Results.Unauthorized();
            if (!string.IsNullOrEmpty(req.FullName))
                appUser.FullName = req.FullName;
            await userManager.UpdateAsync(appUser);
            return Results.Ok(new
            {
                id = appUser.Id,
                email = appUser.Email,
                fullName = appUser.FullName
            });
        }).RequireAuthorization();

        app.MapPost("/api/v1/users/change-password", async (
            [FromBody] ChangePasswordRequest req,
            ClaimsPrincipal user,
            UserManager<ApplicationUser> userManager) =>
        {
            var appUser = await userManager.GetUserAsync(user);
            if (appUser == null) return Results.Unauthorized();
            var result = await userManager.ChangePasswordAsync(appUser, req.CurrentPassword, req.NewPassword);
            if (!result.Succeeded)
                return Results.BadRequest(result.Errors);
            return Results.Ok();
        }).RequireAuthorization();

        // Admin
        app.MapGet("/api/v1/users", async (
            [FromQuery] string? role,
            [FromQuery] int? page,
            [FromQuery] int? pageSize,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager) =>
        {
            var p = (page ?? 1) <= 0 ? 1 : (page ?? 1);
            var ps = (pageSize ?? 10) <= 0 || (pageSize ?? 10) > 100 ? 10 : (pageSize ?? 10);

            var query = userManager.Users.AsQueryable();
            var total = query.Count();

            var users = query
                .OrderBy(u => u.Email)
                .Skip((p - 1) * ps)
                .Take(ps)
                .ToList();

            var items = new List<UserDto>(users.Count);
            foreach (var u in users)
            {
                var rolesArr = (await userManager.GetRolesAsync(u)).ToArray();
                var locked = u.LockoutEnabled && u.LockoutEnd.HasValue && u.LockoutEnd.Value > DateTimeOffset.UtcNow;
                items.Add(new UserDto(u.Id, u.Email, u.FullName, rolesArr, locked));
            }

            if (!string.IsNullOrWhiteSpace(role))
            {
                var roleNorm = role.Trim();
                items = items.Where(i => i.Roles.Contains(roleNorm)).ToList();
                total = items.Count; // filtered total
            }

            return Results.Ok(new { items, total, page = p, pageSize = ps });
        }).RequireAuthorization("AdminPolicy");

        app.MapPatch("/api/v1/users/{id}/roles", async (
            string id,
            [FromBody] UpdateRolesRequest req,
            ClaimsPrincipal current,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager) =>
        {
            var currentUser = await userManager.GetUserAsync(current);
            if (currentUser != null && currentUser.Id == id)
                return Results.BadRequest("Cannot modify your own roles");

            var user = await userManager.FindByIdAsync(id);
            if (user == null) return Results.NotFound();

            // Validate requested roles exist and are allowed
            var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Admin", "Company", "JobSeeker" };
            foreach (var r in req.Roles)
            {
                if (!allowed.Contains(r)) return Results.BadRequest($"Invalid role: {r}");
            }

            var currentRoles = await userManager.GetRolesAsync(user);
            var removeRes = await userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeRes.Succeeded) return Results.BadRequest(removeRes.Errors);

            if (req.Roles != null && req.Roles.Length > 0)
            {
                var addRes = await userManager.AddToRolesAsync(user, req.Roles);
                if (!addRes.Succeeded) return Results.BadRequest(addRes.Errors);
            }
            return Results.NoContent();
        }).RequireAuthorization("AdminPolicy");

        app.MapPatch("/api/v1/users/{id}/lock", async (
            string id,
            [FromBody] LockUserRequest req,
            ClaimsPrincipal current,
            UserManager<ApplicationUser> userManager) =>
        {
            var currentUser = await userManager.GetUserAsync(current);
            if (currentUser != null && currentUser.Id == id)
                return Results.BadRequest("Cannot lock/unlock yourself");

            var user = await userManager.FindByIdAsync(id);
            if (user == null) return Results.NotFound();

            await userManager.SetLockoutEnabledAsync(user, true);
            if (req.Lock)
            {
                await userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
            }
            else
            {
                await userManager.SetLockoutEndDateAsync(user, null);
            }
            return Results.NoContent();
        }).RequireAuthorization("AdminPolicy");
    }
}
