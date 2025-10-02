using System.Runtime.Serialization;

namespace ProjektLabor.Data.Entity
{
    public enum Status
    {
        [EnumMember(Value = "received")]
        Received,
        [EnumMember(Value = "inReview")]
        InReview,
        [EnumMember(Value = "rejected")]
        Rejected,
        [EnumMember(Value = "accepted")]
        Accepted
    }


    public class Application
    {
        public int Id { get; set; }
        public int JobId { get; set; }
        public Job Job { get; set; } = null!;
        public string UserId { get; set; } = string.Empty;
        public string? ResumeId { get; set; }
        public DateTime AppliedAt { get; set; }
        public Status Status { get; set; }
    }
}
