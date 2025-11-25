using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjektLabor.Data;
using ProjektLabor.Data.Entity;
using System.Security.Claims;

namespace ProjektLabor.Controller
{
    [ApiController]
    [Route("api/v1/company-requests")]
    public class CompanyRequestController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public CompanyRequestController(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public record CreateRequestDto(string CompanyName, string? Website, string? Message);
        public record RequestDto(int Id, string UserId, string Email, string CompanyName, string? Website, string? Message, CompanyRequestStatus Status, DateTime CreatedAt, DateTime? DecidedAt, string? DecisionNote);
        public record DecideDto(CompanyRequestStatus Status, string? Note);

    [HttpPost]
    [Authorize(Roles = "JobSeeker")]
        public async Task<ActionResult<RequestDto>> Create([FromBody] CreateRequestDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            // Only one pending at a time per user
            var existingPending = await _context.CompanyRequests.FirstOrDefaultAsync(r => r.UserId == userId && r.Status == CompanyRequestStatus.Pending);
            if (existingPending != null)
                return Conflict("Már van folyamatban lévő cégkérelem");

            var req = new CompanyRequest
            {
                UserId = userId,
                CompanyName = dto.CompanyName,
                Website = dto.Website,
                Message = dto.Message,
                Status = CompanyRequestStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };
            _context.CompanyRequests.Add(req);
            await _context.SaveChangesAsync();

            var user = await _userManager.FindByIdAsync(userId);
            var email = user?.Email ?? string.Empty;
            return CreatedAtAction(nameof(GetById), new { id = req.Id }, new RequestDto(req.Id, req.UserId, email, req.CompanyName, req.Website, req.Message, req.Status, req.CreatedAt, req.DecidedAt, req.DecisionNote));
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> List([FromQuery] CompanyRequestStatus? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var q = _context.CompanyRequests.AsQueryable();
            if (status.HasValue) q = q.Where(r => r.Status == status);
            var total = await q.CountAsync();
            var items = await q.OrderBy(r => r.Status).ThenByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new RequestDto(
                    r.Id,
                    r.UserId,
                    _context.Users.Where(u => u.Id == r.UserId).Select(u => u.Email!).FirstOrDefault() ?? string.Empty,
                    r.CompanyName,
                    r.Website,
                    r.Message,
                    r.Status,
                    r.CreatedAt,
                    r.DecidedAt,
                    r.DecisionNote
                ))
                .ToListAsync();
            return Ok(new { items, total, page, pageSize });
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<RequestDto>> GetById(int id)
        {
            var r = await _context.CompanyRequests.FindAsync(id);
            if (r == null) return NotFound();
            var email = await _context.Users.Where(u => u.Id == r.UserId).Select(u => u.Email!).FirstOrDefaultAsync() ?? string.Empty;
            return Ok(new RequestDto(r.Id, r.UserId, email, r.CompanyName, r.Website, r.Message, r.Status, r.CreatedAt, r.DecidedAt, r.DecisionNote));
        }

        [HttpPatch("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Decide(int id, [FromBody] DecideDto dto)
        {
            var r = await _context.CompanyRequests.FindAsync(id);
            if (r == null) return NotFound();
            if (r.Status != CompanyRequestStatus.Pending)
                return BadRequest("A kérelem már el lett bírálva");

            r.Status = dto.Status;
            r.DecisionNote = dto.Note;
            r.DecidedAt = DateTime.UtcNow;
            r.DecidedByUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await _context.SaveChangesAsync();

            if (dto.Status == CompanyRequestStatus.Approved)
            {
                var user = await _userManager.FindByIdAsync(r.UserId);
                if (user != null)
                {
                    // Switch role from 'JobSeeker' to 'Company' (preserve other roles like 'Admin')
                    var roles = await _userManager.GetRolesAsync(user);

                    if (roles.Contains("JobSeeker"))
                    {
                        await _userManager.RemoveFromRoleAsync(user, "JobSeeker");
                    }

                    if (!roles.Contains("Company"))
                    {
                        await _userManager.AddToRoleAsync(user, "Company");
                    }
                }
            }
            return NoContent();
        }
    }
}
