using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjektLabor.Data.Dto;
using ProjektLabor.Data.Entity;
using ProjektLabor.Services;
using System.Security.Claims;

namespace ProjektLabor.Controller
{
    [ApiController]
    [Route("api/v1/jobs")]
    public class JobController : ControllerBase
    {
        private readonly IJobService _jobService;

        public JobController(IJobService jobService)
        {
            _jobService = jobService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<object>> GetJobs(
            [FromQuery] string? q,
            [FromQuery] string? location,
            [FromQuery] Category? type,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var (items, total) = await _jobService.GetJobsAsync(q, location, type, page, pageSize);
            return Ok(new { items, total });
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<JobDto>> GetJobById(int id)
        {
            var job = await _jobService.GetJobByIdAsync(id);
            if (job == null)
            {
                return NotFound();
            }
            return Ok(job);
        }

        [HttpPost]
        [Authorize(Roles = "Company")]
        public async Task<ActionResult<JobDto>> CreateJob([FromBody] CreateJobDto dto)
        {
            var companyId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var created = await _jobService.CreateJobAsync(dto, companyId);
            return CreatedAtAction(nameof(GetJobById), new { id = created.Id }, created);
        }

        [HttpPatch("{id}")]
        [Authorize(Roles = "Company,Admin")]
        public async Task<ActionResult<JobDto>> UpdateJob(int id, [FromBody] JobDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdmin = User.IsInRole("Admin");
            var updated = await _jobService.UpdateJobAsync(id, dto, userId, isAdmin);
            if (updated == null)
            {
                return NotFound();
            }
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Company,Admin")]
        public async Task<IActionResult> DeleteJob(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdmin = User.IsInRole("Admin");
            var success = await _jobService.DeleteJobAsync(id, userId, isAdmin);
            if (!success)
            {
                return NotFound();
            }
            return NoContent();
        }

        [HttpPatch("{id}/moderate")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<JobDto>> ModerateJob(int id, [FromBody] ModerateJobRequest req)
        {
            var updated = await _jobService.ModerateJobAsync(id, req.Approved, req.Reason);
            if (updated == null)
            {
                return NotFound();
            }
            return Ok(updated);
        }

        public class ModerateJobRequest
        {
            public bool Approved { get; set; }
            public string? Reason { get; set; }
        }
    }
}
