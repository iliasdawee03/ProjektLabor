using Microsoft.AspNetCore.Identity;

namespace ProjektLabor.Data
{
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; }
        public string ResumePath { get; set; }
    }
}