using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ProjektLabor.Data;
using ProjektLabor.Data.Dto;
using ProjektLabor.Data.Entity;

namespace ProjektLabor.Services
{
    public interface IApplicationService
    {
        Task<ApplicationDto> CreateApplicationAsync(int jobId, string userId, string? resumeId);
        Task<(List<ApplicationDto> Items, int Total)> GetApplicationsForJobAsync(int jobId, int page, int pageSize, string companyId, bool isAdmin);
        Task<(List<ApplicationDto> Items, int Total)> GetApplicationsForUserAsync(string userId, int page, int pageSize);
        Task<ApplicationDto?> UpdateApplicationStatusAsync(int id, string status, string companyId, bool isAdmin);
    }

    public class ApplicationService : IApplicationService
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService; 
        private readonly UserManager<ApplicationUser> _userManager; 
        
        public ApplicationService(
            AppDbContext context,
            IEmailService emailService, 
            UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _emailService = emailService;
            _userManager = userManager;
        }

        public async Task<ApplicationDto> CreateApplicationAsync(int jobId, string userId, string? resumeId)
        {
            var application = new Application
            {
                JobId = jobId,
                UserId = userId,
                ResumeId = resumeId,
                AppliedAt = DateTime.UtcNow,
                Status = Status.Received
            };
            _context.Applications.Add(application);
            await _context.SaveChangesAsync();

            var job = await _context.Jobs.FindAsync(jobId);
            if (job != null)
            {
                var companyUser = await _userManager.FindByIdAsync(job.CompanyId);
                var applicantUser = await _userManager.FindByIdAsync(userId);

                if (companyUser != null && !string.IsNullOrEmpty(companyUser.Email))
                {
                    var subject = $"Új jelentkező: {job.Title}";
                    var body = $@"
                        <h1>Új jelentkezés érkezett</h1>
                        <p>A(z) <b>{job.Title}</b> álláshirdetésre új jelentkezés érkezett.</p>
                        <p>Jelentkező: {applicantUser?.FullName ?? "Névtelen"} ({applicantUser?.Email})</p>
                        <p>Kérjük, jelentkezzen be az Álláshirdető portálra a részletekért.</p>
                    ";
                    await _emailService.SendEmailAsync(companyUser.Email, subject, body);
                }
            }
            
            var jobTitle = await _context.Jobs.Where(j => j.Id == application.JobId).Select(j => j.Title).FirstOrDefaultAsync();

            return new ApplicationDto
            {
                Id = application.Id,
                JobId = application.JobId,
                JobTitle = jobTitle,
                UserId = application.UserId,
                ApplicantName = _context.Users.Where(u => u.Id == application.UserId).Select(u => u.FullName).FirstOrDefault(),
                ApplicantEmail = _context.Users.Where(u => u.Id == application.UserId).Select(u => u.Email).FirstOrDefault(),
                ResumeId = application.ResumeId,
                AppliedAt = application.AppliedAt,
                Status = application.Status
            };
        }

        public async Task<(List<ApplicationDto> Items, int Total)> GetApplicationsForJobAsync(int jobId, int page, int pageSize, string companyId, bool isAdmin)
        {
            var job = await _context.Jobs.FindAsync(jobId);
            if (job == null)
            {
                return (new List<ApplicationDto>(), 0);

            }
            if (!isAdmin && job.CompanyId != companyId)
            {
                return (new List<ApplicationDto>(), 0);
            } 

            var query = _context.Applications.Where(a => a.JobId == jobId);

            int total = await query.CountAsync();
            var items = await query
                .OrderByDescending(a => a.AppliedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new ApplicationDto
                {
                    Id = a.Id,
                    JobId = a.JobId,
                    JobTitle = a.Job.Title,
                    UserId = a.UserId,
                    ApplicantName = _context.Users.Where(u => u.Id == a.UserId).Select(u => u.FullName).FirstOrDefault(),
                    ApplicantEmail = _context.Users.Where(u => u.Id == a.UserId).Select(u => u.Email).FirstOrDefault(),
                    ResumeId = a.ResumeId,
                    AppliedAt = a.AppliedAt,
                    Status = a.Status
                })
                .ToListAsync();

            return (items, total);
        }

        public async Task<(List<ApplicationDto> Items, int Total)> GetApplicationsForUserAsync(string userId, int page, int pageSize)
        {
            var query = _context.Applications.Where(a => a.UserId == userId);

            int total = await query.CountAsync();
            var items = await query
                .OrderByDescending(a => a.AppliedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new ApplicationDto
                {
                    Id = a.Id,
                    JobId = a.JobId,
                    JobTitle = a.Job.Title,
                    UserId = a.UserId,
                    ApplicantName = _context.Users.Where(u => u.Id == a.UserId).Select(u => u.FullName).FirstOrDefault(),
                    ApplicantEmail = _context.Users.Where(u => u.Id == a.UserId).Select(u => u.Email).FirstOrDefault(),
                    ResumeId = a.ResumeId,
                    AppliedAt = a.AppliedAt,
                    Status = a.Status
                })
                .ToListAsync();

            return (items, total);
        }

        public async Task<ApplicationDto?> UpdateApplicationStatusAsync(int id, string status, string companyId, bool isAdmin)
        {
            var application = await _context.Applications.Include(a => a.Job).FirstOrDefaultAsync(a => a.Id == id);
            if (application == null)
            {
                return null;
            }
            if (!isAdmin && application.Job.CompanyId != companyId)
            {
                return null;
            }

            if (!Enum.TryParse<Status>(status, true, out var newStatus))
            {
                return null;
            }
            
            bool statusChanged = application.Status != newStatus;
            application.Status = newStatus;
            await _context.SaveChangesAsync();

            if (statusChanged && (newStatus == Status.Accepted || newStatus == Status.Rejected))
            {
                var applicant = await _userManager.FindByIdAsync(application.UserId);
                if (applicant != null && !string.IsNullOrEmpty(applicant.Email))
                {
                    string statusHu = newStatus == Status.Accepted ? "Elfogadva" : "Elutasítva";
                    string color = newStatus == Status.Accepted ? "green" : "red";
                    
                    var subject = $"Jelentkezés állapota: {statusHu}";
                    var body = $@"
                        <h2>Tisztelt {applicant.FullName}!</h2>
                        <p>A(z) <b>{application.Job.Title}</b> állásra leadott jelentkezésének státusza megváltozott.</p>
                        <p>Új státusz: <b style='color:{color}'>{statusHu}</b></p>
                        <p>További információért keresse a céget vagy lépjen be az oldalra.</p>
                    ";
                    await _emailService.SendEmailAsync(applicant.Email, subject, body);
                }
            }
            
            return new ApplicationDto
            {
                Id = application.Id,
                JobId = application.JobId,
                UserId = application.UserId,
                ApplicantName = _context.Users.Where(u => u.Id == application.UserId).Select(u => u.FullName).FirstOrDefault(),
                ApplicantEmail = _context.Users.Where(u => u.Id == application.UserId).Select(u => u.Email).FirstOrDefault(),
                ResumeId = application.ResumeId,
                AppliedAt = application.AppliedAt,
                Status = application.Status
            };
        }
    }
}