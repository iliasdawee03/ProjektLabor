namespace ProjektLabor.Data.Entity
{
    public enum Category
    {
        Informatika,
        Pénzügy,
        Értékesítés,
        Gyártás,
        Oktatás,
    }

    public class Job
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public int? SalaryMin { get; set; }
        public int? SalaryMax { get; set; }
        public Category Category { get; set; }
        public DateTime PostedAt { get; set; }
        public string CompanyId { get; set; } = string.Empty;
        public bool Approved { get; set; } = false;
        public string? ModerationReason { get; set; }
        public ICollection<Application> Applications { get; set; } = new List<Application>();
        public bool IsArchived { get; set; } = false;
    }
}
