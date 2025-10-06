namespace ProjektLabor.Data.Dto
{
    public class JobDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int? SalaryMin { get; set; }
        public int? SalaryMax { get; set; }
        public string Category { get; set; } = string.Empty;
        public DateTime PostedAt { get; set; }
        public bool Approved { get; set; }
        public string? ModerationReason { get; set; }
        public string CompanyId { get; set; } = string.Empty;
    }

    public class JobSearchDto
    {
        public string? Title { get; set; }
        public string? Company { get; set; }
        public string? Location { get; set; }
        public string? Category { get; set; }
        public string? EmploymentType { get; set; }
    }

    public class CreateJobDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int? SalaryMin { get; set; }
        public int? SalaryMax { get; set; }
        public string Category { get; set; } = string.Empty;
    }
}
