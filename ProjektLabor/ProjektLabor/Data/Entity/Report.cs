using System.ComponentModel.DataAnnotations;

namespace ProjektLabor.Data.Entity
{
    public enum ReportTargetType
    {
        Job = 0,
        Application = 1,
        User = 2
    }

    public enum ReportStatus
    {
        Open = 0,
        Resolved = 1,
        Dismissed = 2
    }

    public class Report
    {
        public int Id { get; set; }
        public ReportTargetType TargetType { get; set; }
        [MaxLength(100)]
        public string TargetId { get; set; } = string.Empty; 
        [MaxLength(200)]
        public string Reason { get; set; } = string.Empty;
        public string? Details { get; set; }

        [MaxLength(450)]
        public string CreatedByUserId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ReportStatus Status { get; set; } = ReportStatus.Open;
        public DateTime? ResolvedAt { get; set; }
        [MaxLength(450)]
        public string? ResolverUserId { get; set; }
        public string? ResolutionNote { get; set; }
    }
}
