using System.ComponentModel.DataAnnotations;

namespace ProjektLabor.Data.Entity
{
    public enum CompanyRequestStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2
    }

    public class CompanyRequest
    {
        public int Id { get; set; }
        [MaxLength(450)]
        public string UserId { get; set; } = string.Empty;
        [MaxLength(150)]
        public string CompanyName { get; set; } = string.Empty;
        [MaxLength(200)]
        public string? Website { get; set; }
        [MaxLength(500)]
        public string? Message { get; set; }
        public CompanyRequestStatus Status { get; set; } = CompanyRequestStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? DecidedAt { get; set; }
        [MaxLength(450)]
        public string? DecidedByUserId { get; set; }
        public string? DecisionNote { get; set; }
    }
}
