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

        public ApplicationService(AppDbContext context)
        {
            _context = context;
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

            return new ApplicationDto
            {
                Id = application.Id,
                JobId = application.JobId,
                UserId = application.UserId,
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
                    UserId = a.UserId,
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
                    UserId = a.UserId,
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

            application.Status = newStatus;
            await _context.SaveChangesAsync();

            return new ApplicationDto
            {
                Id = application.Id,
                JobId = application.JobId,
                UserId = application.UserId,
                ResumeId = application.ResumeId,
                AppliedAt = application.AppliedAt,
                Status = application.Status
            };
        }
    }
}