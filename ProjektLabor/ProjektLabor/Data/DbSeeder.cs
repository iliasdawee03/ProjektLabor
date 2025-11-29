using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ProjektLabor.Data.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
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

            // Ensure required roles exist
            string[] roles = { "Admin", "Company", "JobSeeker" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }

            var now = DateTime.UtcNow;

            // Core users
            _ = await EnsureUserAsync(userManager, "admin@demo.hu", "Admin Teszt", "Admin123!", new[] { "Admin" });

            // Companies with public profiles
            var companySeeds = new[]
            {
                new CompanySeed(
                    Email: "company@demo.hu",
                    FullName: "TechNova HR",
                    Password: "Company123!",
                    CompanyName: "TechNova Kft.",
                    Website: "https://technova.hu",
                    ContactEmail: "karrier@technova.hu",
                    ContactPhone: "+36 1 555 1234",
                    About: "Egyedi vállalati szoftvereket és felhőmegoldásokat szállító, 40 fős fejlesztő csapat."),
                new CompanySeed(
                    Email: "studio@designhub.hu",
                    FullName: "DesignHub Studio HR",
                    Password: "Company123!",
                    CompanyName: "DesignHub Studio",
                    Website: "https://designhub.hu",
                    ContactEmail: "hello@designhub.hu",
                    ContactPhone: "+36 30 222 3344",
                    About: "UX/UI fókusú digitális ügynökség, amely terméktervezésben és brandingben segíti ügyfeleit."),
                new CompanySeed(
                    Email: "hr@greenfood.hu",
                    FullName: "GreenFood Logistics HR",
                    Password: "Company123!",
                    CompanyName: "GreenFood Logistics Zrt.",
                    Website: "https://greenfood.hu",
                    ContactEmail: "jobs@greenfood.hu",
                    ContactPhone: "+36 1 700 8899",
                    About: "Fenntartható élelmiszer-ellátási láncot támogató logisztikai és gyártási megoldásokkal foglalkozunk."),
            };

            var companyUsers = new Dictionary<string, ApplicationUser>();
            foreach (var company in companySeeds)
            {
                var user = await EnsureUserAsync(userManager, company.Email, company.FullName, company.Password, new[] { "Company" });
                companyUsers[company.Email] = user;

                if (!await context.CompanyProfiles.AnyAsync(p => p.UserId == user.Id))
                {
                    context.CompanyProfiles.Add(new CompanyProfile
                    {
                        UserId = user.Id,
                        Name = company.CompanyName,
                        Website = company.Website,
                        ContactEmail = company.ContactEmail,
                        ContactPhone = company.ContactPhone,
                        About = company.About,
                        UpdatedAt = now
                    });
                }
            }
            if (context.ChangeTracker.HasChanges())
            {
                await context.SaveChangesAsync();
            }

            var candidateSeeds = new[]
            {
                new CandidateSeed("jobseeker@demo.hu", "Jelentkező Teszt", "Jobseeker123!", "seed/resume-lajos.pdf"),
                new CandidateSeed("reka@demo.hu", "Kovács Réka", "Jobseeker123!", "seed/resume-reka.pdf"),
                new CandidateSeed("balazs@demo.hu", "Farkas Balázs", "Jobseeker123!", "seed/resume-balazs.pdf")
            };

            var jobSeekers = new Dictionary<string, ApplicationUser>();
            foreach (var candidate in candidateSeeds)
            {
                var user = await EnsureUserAsync(userManager, candidate.Email, candidate.FullName, candidate.Password, new[] { "JobSeeker" }, candidate.ResumePath);
                jobSeekers[candidate.Email] = user;
            }

            var companyInfo = companySeeds.ToDictionary(c => c.Email);
            var jobSeeds = new[]
            {
                new JobSeed(
                    Title: "Senior .NET fejlesztő",
                    CompanyEmail: "company@demo.hu",
                    Description: "Zöldmezős, felhő alapú ügyfélportált építünk .NET 9 és Azure stackre. Clean code, code review és DevOps támogatás vár.",
                    Category: Category.Informatika,
                    Location: "Budapest",
                    SalaryMin: 900_000,
                    SalaryMax: 1_200_000,
                    PostedDaysAgo: 6,
                    Approved: true),
                new JobSeed(
                    Title: "Junior QA mérnök",
                    CompanyEmail: "company@demo.hu",
                    Description: "Teszttervek írása, automatizált UI tesztek Playwrighttal, szoros együttműködés fejlesztőkkel.",
                    Category: Category.Informatika,
                    Location: "Debrecen / hibrid",
                    SalaryMin: 550_000,
                    SalaryMax: 700_000,
                    PostedDaysAgo: 3,
                    Approved: true),
                new JobSeed(
                    Title: "Lead UX designer",
                    CompanyEmail: "studio@designhub.hu",
                    Description: "Nemzetközi fintech ügyféllel dolgozunk design systemen és kutatási programon.",
                    Category: Category.Oktatás,
                    Location: "Budapest",
                    SalaryMin: 800_000,
                    SalaryMax: 1_050_000,
                    PostedDaysAgo: 9,
                    Approved: true),
                new JobSeed(
                    Title: "React Native gyakornok",
                    CompanyEmail: "studio@designhub.hu",
                    Description: "Mobil prototípusok készítése React Native környezetben, mentor programmal. Első publikálás, ezért moderációra vár.",
                    Category: Category.Informatika,
                    Location: "Szeged / remote",
                    SalaryMin: null,
                    SalaryMax: null,
                    PostedDaysAgo: 1,
                    Approved: false,
                    IsArchived: false,
                    ModerationReason: "Új hirdetés, admin jóváhagyásra vár"),
                new JobSeed(
                    Title: "Élelmiszeripari folyamatmérnök",
                    CompanyEmail: "hr@greenfood.hu",
                    Description: "Gyártósor optimalizálás, OEE mérés és auditok koordinálása modern feldolgozó üzemben.",
                    Category: Category.Gyártás,
                    Location: "Győr",
                    SalaryMin: 750_000,
                    SalaryMax: 950_000,
                    PostedDaysAgo: 12,
                    Approved: true),
                new JobSeed(
                    Title: "Regionális értékesítési vezető",
                    CompanyEmail: "hr@greenfood.hu",
                    Description: "HORECA partnerek kezelése és új üzletek felkutatása, céges autóval.",
                    Category: Category.Értékesítés,
                    Location: "Pécs",
                    SalaryMin: 600_000,
                    SalaryMax: 1_000_000,
                    PostedDaysAgo: 20,
                    Approved: true,
                    IsArchived: true)
            };

            foreach (var jobSeed in jobSeeds)
            {
                if (!companyUsers.TryGetValue(jobSeed.CompanyEmail, out var companyUser))
                {
                    continue;
                }

                bool alreadyExists = await context.Jobs.AnyAsync(j => j.CompanyId == companyUser.Id && j.Title == jobSeed.Title);
                if (alreadyExists)
                {
                    continue;
                }

                var companyName = companyInfo.TryGetValue(jobSeed.CompanyEmail, out var companyMeta)
                    ? companyMeta.CompanyName
                    : "Ismeretlen cég";

                context.Jobs.Add(new Job
                {
                    Title = jobSeed.Title,
                    Company = companyName,
                    Description = jobSeed.Description,
                    Category = jobSeed.Category,
                    Location = jobSeed.Location,
                    SalaryMin = jobSeed.SalaryMin,
                    SalaryMax = jobSeed.SalaryMax,
                    PostedAt = now.AddDays(-jobSeed.PostedDaysAgo),
                    CompanyId = companyUser.Id,
                    Approved = jobSeed.Approved,
                    ModerationReason = jobSeed.ModerationReason,
                    IsArchived = jobSeed.IsArchived
                });
            }
            if (context.ChangeTracker.HasChanges())
            {
                await context.SaveChangesAsync();
            }

            var targetedCompanyIds = companyUsers.Values.Select(u => u.Id).ToList();
            var jobLookup = await context.Jobs
                .Where(j => targetedCompanyIds.Contains(j.CompanyId))
                .ToListAsync();
            var jobMap = jobLookup.ToDictionary(j => (j.CompanyId, j.Title));

            var applicationSeeds = new[]
            {
                new ApplicationSeed("Senior .NET fejlesztő", "company@demo.hu", "jobseeker@demo.hu", Status.InReview, 3),
                new ApplicationSeed("Junior QA mérnök", "company@demo.hu", "reka@demo.hu", Status.Received, 2),
                new ApplicationSeed("Élelmiszeripari folyamatmérnök", "hr@greenfood.hu", "balazs@demo.hu", Status.Accepted, 7)
            };

            foreach (var applicationSeed in applicationSeeds)
            {
                if (!companyUsers.TryGetValue(applicationSeed.CompanyEmail, out var companyUser) ||
                    !jobSeekers.TryGetValue(applicationSeed.ApplicantEmail, out var applicant))
                {
                    continue;
                }

                if (!jobMap.TryGetValue((companyUser.Id, applicationSeed.JobTitle), out var job))
                {
                    continue;
                }

                bool alreadyExists = await context.Applications.AnyAsync(a => a.JobId == job.Id && a.UserId == applicant.Id);
                if (alreadyExists)
                {
                    continue;
                }

                context.Applications.Add(new Application
                {
                    JobId = job.Id,
                    UserId = applicant.Id,
                    ResumeId = applicant.ResumePath,
                    AppliedAt = now.AddDays(-applicationSeed.AppliedDaysAgo),
                    Status = applicationSeed.Status
                });
            }

            if (context.ChangeTracker.HasChanges())
            {
                await context.SaveChangesAsync();
            }
        }

        private static async Task<ApplicationUser> EnsureUserAsync(
            UserManager<ApplicationUser> userManager,
            string email,
            string fullName,
            string password,
            string[] roles,
            string? resumePath = null)
        {
            var user = await userManager.FindByEmailAsync(email);
            if (user == null)
            {
                user = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    EmailConfirmed = true,
                    FullName = fullName,
                    ResumePath = resumePath ?? string.Empty
                };
                var createResult = await userManager.CreateAsync(user, password);
                if (!createResult.Succeeded)
                {
                    var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                    throw new InvalidOperationException($"Nem sikerült létrehozni a(z) {email} seed felhasználót: {errors}");
                }
            }

            bool requiresUpdate = false;
            if (!string.Equals(user.FullName, fullName, StringComparison.Ordinal))
            {
                user.FullName = fullName;
                requiresUpdate = true;
            }

            var desiredResume = resumePath ?? string.Empty;
            if (!string.Equals(user.ResumePath, desiredResume, StringComparison.Ordinal))
            {
                user.ResumePath = desiredResume;
                requiresUpdate = true;
            }

            if (requiresUpdate)
            {
                await userManager.UpdateAsync(user);
            }

            foreach (var role in roles)
            {
                if (!await userManager.IsInRoleAsync(user, role))
                {
                    await userManager.AddToRoleAsync(user, role);
                }
            }

            return user;
        }

        private record CompanySeed(
            string Email,
            string FullName,
            string Password,
            string CompanyName,
            string? Website,
            string? ContactEmail,
            string? ContactPhone,
            string? About);

        private record CandidateSeed(string Email, string FullName, string Password, string ResumePath);

        private record JobSeed(
            string Title,
            string CompanyEmail,
            string Description,
            Category Category,
            string Location,
            int? SalaryMin,
            int? SalaryMax,
            int PostedDaysAgo,
            bool Approved,
            bool IsArchived = false,
            string? ModerationReason = null);

        private record ApplicationSeed(
            string JobTitle,
            string CompanyEmail,
            string ApplicantEmail,
            Status Status,
            int AppliedDaysAgo);
    }
}
