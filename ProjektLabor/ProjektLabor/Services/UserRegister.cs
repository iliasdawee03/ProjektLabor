using Microsoft.AspNetCore.Identity;
using ProjektLabor.Data;

namespace ProjektLabor.Services
{
    public class UserRegister
    {
        public record Request(string Email, string Password, string FullName);

        public static void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/register", async (Request request, UserManager<ApplicationUser> userManager) =>
            {
                var user = new ApplicationUser
                {
                    UserName = request.Email,
                    Email = request.Email,
                    FullName = request.FullName,
                    ResumePath = ""
                };
                IdentityResult identityResult = await userManager.CreateAsync(user, request.Password);
                if (!identityResult.Succeeded)
                {
                    return Results.BadRequest(identityResult.Errors);
                }
                var roles = new Roles();
                IdentityResult AddRole = await userManager.AddToRoleAsync(user, roles.JobSeeker);
                if (!AddRole.Succeeded)
                {
                    return Results.BadRequest(AddRole.Errors);
                }
                return Results.Ok("User created successfully");
            });

        }
    }
}
