using Microsoft.Extensions.DependencyInjection;
using ProjektLabor.Data;
using ProjektLabor.Data.Entity;
using Microsoft.AspNetCore.Identity;
using System;
using System.Threading.Tasks;

namespace ProjektLabor.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            // Roles
            string[] roles = { "Admin", "Company", "JobSeeker" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                    await roleManager.CreateAsync(new IdentityRole(role));
            }

            // Admin user
            if (await userManager.FindByEmailAsync("admin@demo.hu") == null)
            {
                var admin = new ApplicationUser { UserName = "admin@demo.hu", Email = "admin@demo.hu", EmailConfirmed = true, FullName = "Admin Teszt", ResumePath = "" };
                await userManager.CreateAsync(admin, "Admin123!");
                await userManager.AddToRoleAsync(admin, "Admin");
            }

            // Company user
            if (await userManager.FindByEmailAsync("company@demo.hu") == null)
            {
                var company = new ApplicationUser { UserName = "company@demo.hu", Email = "company@demo.hu", EmailConfirmed = true, FullName = "Cég Teszt", ResumePath = "" };
                await userManager.CreateAsync(company, "Company123!");
                await userManager.AddToRoleAsync(company, "Company");
            }

            // JobSeeker user
            if (await userManager.FindByEmailAsync("jobseeker@demo.hu") == null)
            {
                var seeker = new ApplicationUser { UserName = "jobseeker@demo.hu", Email = "jobseeker@demo.hu", EmailConfirmed = true, FullName = "Jelentkező Teszt", ResumePath = "" };
                await userManager.CreateAsync(seeker, "Jobseeker123!");
                await userManager.AddToRoleAsync(seeker, "JobSeeker");
            }
        }
    }
}
