using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using ProjektLabor.Data;
using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public static class AuthEndpoints
{
    public record RegisterRequest(string Email, string Password, string FullName);
    public record LoginRequest(string Email, string Password);
    
    public static void MapAuthEndpoints(IEndpointRouteBuilder app, IConfiguration configuration)
    {
        app.MapPost("/api/v1/auth/register", async (
            [FromBody] RegisterRequest req,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager) =>
        {
            var user = new ApplicationUser
            {
                UserName = req.Email,
                Email = req.Email,
                FullName = req.FullName,
                ResumePath = ""
            };
            var result = await userManager.CreateAsync(user, req.Password);
            if (!result.Succeeded)
                return Results.BadRequest(string.Join("; ", result.Errors.Select(e => e.Description)));

            await userManager.AddToRoleAsync(user, "JobSeeker");
            return Results.Ok();
        });

        app.MapPost("/api/v1/auth/login", async (
            [FromBody] LoginRequest req,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager) =>
        {
            var user = await userManager.FindByEmailAsync(req.Email);
            if (user == null)
                return Results.BadRequest();

            var result = await signInManager.CheckPasswordSignInAsync(user, req.Password, false);
            if (!result.Succeeded)
                return Results.BadRequest();

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.AuthTime, DateTime.Now.ToString(CultureInfo.InvariantCulture))
            };
            var roles = await userManager.GetRolesAsync(user);
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.Now.AddDays(Convert.ToDouble(configuration["Jwt:ExpireDays"]));

            var token = new JwtSecurityToken(
                configuration["Jwt:Issuer"], configuration["Jwt:Audience"], claims, expires: expires, signingCredentials: creds
            );

            return Results.Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
        });


    }
}
