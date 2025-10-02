using ProjektLabor.Data.Entity;

namespace ProjektLabor.Data.Dto
{
    public class ApplicationDto
    {
        public int Id { get; set; }
        public int JobId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string? ResumeId { get; set; }
        public DateTime AppliedAt { get; set; }
        public Status Status { get; set; }
    }
}
