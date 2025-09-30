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


    public static void MapUserEndpoints(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/v1/users/me", async (
            ClaimsPrincipal user,
            UserManager<ApplicationUser> userManager) =>
        {
            var appUser = await userManager.GetUserAsync(user);
            var roles = await userManager.GetRolesAsync(appUser);
            return Results.Ok(new
            {
                id = appUser.Id,
                email = appUser.Email,
                fullName = appUser.FullName,
                roles = roles
            });
        }).RequireAuthorization();

        app.MapPatch("/api/v1/users/me", async (
            [FromBody] UpdateProfileRequest req,
            ClaimsPrincipal user,
            UserManager<ApplicationUser> userManager) =>
        {
            var appUser = await userManager.GetUserAsync(user);
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
            var result = await userManager.ChangePasswordAsync(appUser, req.CurrentPassword, req.NewPassword);
            if (!result.Succeeded)
                return Results.BadRequest(result.Errors);
            return Results.Ok();
        }).RequireAuthorization();

        // Admin endpoints
        app.MapGet("/api/v1/users", async (
            UserManager<ApplicationUser> userManager) =>
        {
            var users = userManager.Users.ToList();
            var userDtos = new List<object>();
            
            foreach (var user in users)
            {
                var roles = await userManager.GetRolesAsync(user);
                userDtos.Add(new
                {
                    id = user.Id,
                    email = user.Email,
                    fullName = user.FullName,
                    roles = roles
                });
            }
            
            return Results.Ok(new
            {
                items = userDtos,
                total = userDtos.Count
            });
        }).RequireAuthorization("AdminPolicy");
    }
}
