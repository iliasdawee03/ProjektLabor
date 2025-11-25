using System.ComponentModel.DataAnnotations;

namespace ProjektLabor.Data.Entity
{
    public class CompanyProfile
    {
        public int Id { get; set; }
        [MaxLength(450)]
        public string UserId { get; set; } = string.Empty; // owner (Company user)
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;
        [MaxLength(200)]
        public string? Website { get; set; }
        [MaxLength(100)]
        public string? ContactEmail { get; set; }
        [MaxLength(50)]
        public string? ContactPhone { get; set; }
        public string? About { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
