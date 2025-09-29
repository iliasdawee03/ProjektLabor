using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ProjektLabor.Data;

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
    }
}
