using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjektLabor.Data;
using ProjektLabor.Data.Entity;
using System.Security.Claims;

namespace ProjektLabor.Controller
{
    [ApiController]
    [Route("api/v1/reports")]
    public class ReportController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ReportController(AppDbContext context)
        {
            _context = context;
        }

        public record CreateReportRequest(ReportTargetType TargetType, string TargetId, string Reason, string? Details);
        public record ReportDto(int Id, ReportTargetType TargetType, string TargetId, string Reason, string? Details, string CreatedByUserId, DateTime CreatedAt, ReportStatus Status, DateTime? ResolvedAt, string? ResolverUserId, string? ResolutionNote);
        public record UpdateReportStatusRequest(ReportStatus Status, string? Note);

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ReportDto>> Create([FromBody] CreateReportRequest req)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var report = new Report
            {
                TargetType = req.TargetType,
                TargetId = req.TargetId,
                Reason = req.Reason,
                Details = req.Details,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow,
                Status = ReportStatus.Open
            };
            _context.Reports.Add(report);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = report.Id }, ToDto(report));
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> List([FromQuery] ReportStatus? status, [FromQuery] ReportTargetType? targetType, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var q = _context.Reports.AsQueryable();
            if (status.HasValue) q = q.Where(r => r.Status == status);
            if (targetType.HasValue) q = q.Where(r => r.TargetType == targetType);
            var total = await q.CountAsync();
            var items = await q.OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => ToDto(r))
                .ToListAsync();
            return Ok(new { items, total, page, pageSize });
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ReportDto>> GetById(int id)
        {
            var r = await _context.Reports.FindAsync(id);
            if (r == null) return NotFound();
            return Ok(ToDto(r));
        }

        [HttpPatch("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateReportStatusRequest req)
        {
            var r = await _context.Reports.FindAsync(id);
            if (r == null) return NotFound();
            var resolverId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            r.Status = req.Status;
            r.ResolutionNote = req.Note;
            r.ResolverUserId = resolverId;
            r.ResolvedAt = (req.Status == ReportStatus.Open) ? null : DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static ReportDto ToDto(Report r) => new ReportDto(r.Id, r.TargetType, r.TargetId, r.Reason, r.Details, r.CreatedByUserId, r.CreatedAt, r.Status, r.ResolvedAt, r.ResolverUserId, r.ResolutionNote);
    }
}
