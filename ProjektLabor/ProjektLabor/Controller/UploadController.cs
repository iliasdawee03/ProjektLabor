using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ProjektLabor.Data;
using System.IO;
using System.Threading.Tasks;
using System;

namespace ProjektLabor.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> UploadFile(IFormFile file, [FromServices] UserManager<ApplicationUser> userManager)
        {
            if (file == null)
                return BadRequest();

            var user = await userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var result = new UploadHandler().Upload(file);

            user.ResumePath = result;
            await userManager.UpdateAsync(user);

            return Ok(new { filename = result });
        }

        [HttpGet("{filename}")]
        [Authorize]
        public async Task<IActionResult> DownloadFile(
            string filename,
            [FromServices] UserManager<ApplicationUser> userManager,
            [FromServices] AppDbContext db)
        {
            var currentUser = await userManager.GetUserAsync(User);
            if (currentUser == null)
                return Unauthorized();

            bool allowed = false;
            // 1) Saját önéletrajz
            if (currentUser.ResumePath == filename)
            {
                allowed = true;
            }
            else if (User.IsInRole("Admin"))
            {
                // 2) Admin mindig hozzáférhet
                allowed = true;
            }
            else if (User.IsInRole("Company"))
            {
                // 3) Cég: akkor fér hozzá, ha a fájl egy olyan jelentkezéshez tartozik,
                // amely az ő álláshirdetésére érkezett
                var app = db.Applications
                    .Where(a => a.ResumeId == filename)
                    .Select(a => new { a.JobId, CompanyId = a.Job.CompanyId })
                    .FirstOrDefault();
                if (app != null && app.CompanyId == currentUser.Id)
                {
                    allowed = true;
                }
            }

            if (!allowed)
                return Forbid();

            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
            var filePath = Path.Combine(uploadsPath, filename);
            if (!System.IO.File.Exists(filePath))
                return NotFound();

            var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
            return File(stream, "application/pdf", filename);
        }

        [HttpGet("meta/{filename}")]
        [Authorize]
        public async Task<IActionResult> GetFileMeta(string filename, [FromServices] UserManager<ApplicationUser> userManager)
        {
            var user = await userManager.GetUserAsync(User);
            if (user == null || user.ResumePath != filename)
                return Forbid();

            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
            var filePath = Path.Combine(uploadsPath, filename);
            if (!System.IO.File.Exists(filePath))
                return NotFound();

            var fileInfo = new FileInfo(filePath);
            return Ok(new {
                filename = fileInfo.Name,
                size = fileInfo.Length,
                uploadedAt = fileInfo.CreationTimeUtc
            });
        }
    }
}
