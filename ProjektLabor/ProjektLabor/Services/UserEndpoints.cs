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

        // Admin
        /* TODO
         (Admin) GET /api/v1/users

            Auth: Admin
            Query: role?=Admin|Company|JobSeeker, page?, pageSize?
            V�lasz: { items: UserDto[], total }

            (Admin) PATCH /api/v1/users/{id}/roles

            Auth: Admin
            Body: { roles: string[] }
            V�lasz: 204

            (Admin) PATCH /api/v1/users/{id}/lock

            Auth: Admin
            Body: { lock: boolean }
            V�lasz: 204 
         
         */
    }
}
