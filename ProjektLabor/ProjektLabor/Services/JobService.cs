using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using ProjektLabor.Data;
using ProjektLabor.Data.Dto;
using ProjektLabor.Data.Entity;

namespace ProjektLabor.Services
{
    public interface IJobService
    {
        Task<(List<JobDto> Items, int Total)> GetJobsAsync(string? q, string? location, string? type, int page, int pageSize);
        Task<JobDto?> GetJobByIdAsync(int id);
        Task<CreateJobDto> CreateJobAsync(CreateJobDto dto, string companyId);
        Task<JobDto?> UpdateJobAsync(int id, JobDto dto, string userId, bool isAdmin);
        Task<bool> DeleteJobAsync(int id, string userId, bool isAdmin);
        Task<JobDto?> ModerateJobAsync(int id, bool approved, string? reason);
    }

    public class JobService : IJobService
    {
        private readonly AppDbContext _context;

        public JobService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<(List<JobDto> Items, int Total)> GetJobsAsync(string? q, string? location, string? type, int page, int pageSize)
        {
            var query = _context.Jobs.AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
                query = query.Where(j => j.Title.Contains(q) || j.Description.Contains(q));
            if (!string.IsNullOrWhiteSpace(location))
                query = query.Where(j => j.Location == location);
            if (!string.IsNullOrWhiteSpace(type))
                query = query.Where(j => j.Category == type);

            int total = await query.CountAsync();

            var items = await query
                .OrderByDescending(j => j.PostedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(j => new JobDto
                {
                    Id = j.Id,
                    Title = j.Title,
                    Company = j.Company,
                    Location = j.Location,
                    Description = j.Description,
                    SalaryMin = j.SalaryMin,
                    SalaryMax = j.SalaryMax,
                    Category = j.Category,
                    PostedAt = j.PostedAt,
                    Approved = j.Approved,
                    ModerationReason = j.ModerationReason
                })
                .ToListAsync();

            return (items, total);
        }

        public async Task<JobDto?> GetJobByIdAsync(int id)
        {
            return await _context.Jobs
                .Where(j => j.Id == id)
                .Select(j => new JobDto
                {
                    Id = j.Id,
                    Title = j.Title,
                    Company = j.Company,
                    Location = j.Location,
                    Description = j.Description,
                    SalaryMin = j.SalaryMin,
                    SalaryMax = j.SalaryMax,
                    Category = j.Category,
                    PostedAt = j.PostedAt,
                    Approved = j.Approved,
                    ModerationReason = j.ModerationReason
                })
                .FirstOrDefaultAsync();
        }

        public async Task<CreateJobDto> CreateJobAsync(CreateJobDto dto, string companyId)
        {
            var job = new Job
            {
                Title = dto.Title,
                Description = dto.Description,
                Company = dto.Company,
                Location = dto.Location,
                SalaryMin = dto.SalaryMin,
                SalaryMax = dto.SalaryMax,
                Category = dto.Category,
                PostedAt = DateTime.UtcNow,
                CompanyId = companyId,
                Approved = false
            };
            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();

            return dto;
        }

        public async Task<JobDto?> UpdateJobAsync(int id,  JobDto dto, string userId, bool isAdmin)
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null)
            {
                return null;
            }
            ;
            if (!isAdmin && job.CompanyId != userId)
            {
                return null;
            }

            job.Title = dto.Title;
            job.Company = dto.Company;
            job.Location = dto.Location;
            job.Description = dto.Description;
            job.SalaryMin = dto.SalaryMin;
            job.SalaryMax = dto.SalaryMax;
            job.Category = dto.Category;

            await _context.SaveChangesAsync();

            return new JobDto
            {
                Id = job.Id,
                Title = job.Title,
                Company = job.Company,
                Location = job.Location,
                Description = job.Description,
                SalaryMin = job.SalaryMin,
                SalaryMax = job.SalaryMax,
                Category = job.Category,
                PostedAt = job.PostedAt,
                Approved = job.Approved,
                ModerationReason = job.ModerationReason
            };
        }

        public async Task<bool> DeleteJobAsync(int id, string userId, bool isAdmin)
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null) return false;
            if (!isAdmin && job.CompanyId != userId) return false;

            _context.Jobs.Remove(job);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<JobDto?> ModerateJobAsync(int id, bool approved, string? reason)
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null) return null;

            job.Approved = approved;
            job.ModerationReason = reason;
            await _context.SaveChangesAsync();

            return new JobDto
            {
                Id = job.Id,
                Title = job.Title,
                Company = job.Company,
                Location = job.Location,
                Description = job.Description,
                SalaryMin = job.SalaryMin,
                SalaryMax = job.SalaryMax,
                Category = job.Category,
                PostedAt = job.PostedAt,
                Approved = job.Approved,
                ModerationReason = job.ModerationReason
            };
        }
    }
}
