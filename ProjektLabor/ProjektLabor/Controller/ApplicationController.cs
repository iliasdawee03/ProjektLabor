using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjektLabor.Data.Dto;
using ProjektLabor.Services;
using System.Security.Claims;

namespace ProjektLabor.Controller
{
    [ApiController]
    [Route("api/v1")]
    public class ApplicationController : ControllerBase
    {
        private readonly IApplicationService _applicationService;

        public ApplicationController(IApplicationService applicationService)
        {
            _applicationService = applicationService;
        }

        [HttpPost("jobs/{id}/applications")]
        [Authorize(Roles = "JobSeeker")]
        public async Task<ActionResult<ApplicationDto>> CreateApplication(int id, [FromBody] CreateApplicationRequest req)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var created = await _applicationService.CreateApplicationAsync(id, userId, req.ResumeId);
            return Created(string.Empty, created);
        }

        public class CreateApplicationRequest
        {
            public string? ResumeId { get; set; }
        }

        [HttpGet("applications/me")]
        [Authorize(Roles = "JobSeeker")]
        public async Task<ActionResult<object>> GetMyApplications([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var (items, total) = await _applicationService.GetApplicationsForUserAsync(userId, page, pageSize);
            return Ok(new { items, total });
        }

        [HttpGet("jobs/{id}/applications")]
        [Authorize(Roles = "Company,Admin")]
        public async Task<ActionResult<object>> GetApplicationsForJob(int id, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdmin = User.IsInRole("Admin");
            var (items, total) = await _applicationService.GetApplicationsForJobAsync(id, page, pageSize, userId, isAdmin);
            return Ok(new { items, total });
        }

        [HttpPatch("applications/{id}")]
        [Authorize(Roles = "Company,Admin")]
        public async Task<ActionResult<ApplicationDto>> UpdateApplicationStatus(int id, [FromBody] UpdateApplicationStatusRequest req)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdmin = User.IsInRole("Admin");
            var updated = await _applicationService.UpdateApplicationStatusAsync(id, req.Status, userId, isAdmin);
            if (updated == null)
            {
                return Forbid();
            }
            return Ok(updated);
        }

        public class UpdateApplicationStatusRequest
        {
            public string Status { get; set; } = string.Empty;
        }
    }
}
