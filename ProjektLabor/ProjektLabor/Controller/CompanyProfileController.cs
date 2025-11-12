using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjektLabor.Data;
using ProjektLabor.Data.Entity;
using System.Security.Claims;

namespace ProjektLabor.Controller
{
    [ApiController]
    [Route("api/v1/company-profiles")]
    public class CompanyProfileController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CompanyProfileController(AppDbContext context)
        {
            _context = context;
        }

        public record CompanyProfileDto(int Id, string UserId, string Name, string? Website, string? ContactEmail, string? ContactPhone, string? About, DateTime UpdatedAt);
        public record UpdateCompanyProfileRequest(string? Name, string? Website, string? ContactEmail, string? ContactPhone, string? About);

        [HttpGet("me")]
        [Authorize(Roles = "Company,Admin")]
        public async Task<ActionResult<CompanyProfileDto>> GetMine()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            var cp = await _context.CompanyProfiles.FirstOrDefaultAsync(x => x.UserId == userId);
            if (cp == null)
            {
                // return an empty/default profile for convenience
                return Ok(new CompanyProfileDto(0, userId, string.Empty, null, null, null, null, DateTime.UtcNow));
            }
            return Ok(ToDto(cp));
        }

        [HttpPatch("me")]
        [Authorize(Roles = "Company,Admin")]
        public async Task<ActionResult<CompanyProfileDto>> UpdateMine([FromBody] UpdateCompanyProfileRequest req)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            var cp = await _context.CompanyProfiles.FirstOrDefaultAsync(x => x.UserId == userId);
            if (cp == null)
            {
                cp = new CompanyProfile { UserId = userId };
                _context.CompanyProfiles.Add(cp);
            }
            if (req.Name != null) cp.Name = req.Name;
            if (req.Website != null) cp.Website = req.Website;
            if (req.ContactEmail != null) cp.ContactEmail = req.ContactEmail;
            if (req.ContactPhone != null) cp.ContactPhone = req.ContactPhone;
            if (req.About != null) cp.About = req.About;
            cp.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(ToDto(cp));
        }

        [HttpGet("{userId}")]
        [Authorize] // only visible when logged in per requirement
        public async Task<ActionResult<CompanyProfileDto>> GetPublic(string userId)
        {
            var cp = await _context.CompanyProfiles.FirstOrDefaultAsync(x => x.UserId == userId);
            if (cp == null) return NotFound();
            return Ok(ToDto(cp));
        }

        private static CompanyProfileDto ToDto(CompanyProfile cp) => new CompanyProfileDto(cp.Id, cp.UserId, cp.Name, cp.Website, cp.ContactEmail, cp.ContactPhone, cp.About, cp.UpdatedAt);
    }
}
