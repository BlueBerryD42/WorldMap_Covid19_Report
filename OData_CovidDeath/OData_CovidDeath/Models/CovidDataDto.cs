using System.ComponentModel.DataAnnotations;

namespace OData_CovidDeath.Models
{
    public class CovidDataDto
    {
        [Key]
        public int Id { get; set; }
        public string Country { get; set; } = string.Empty;
        public string? Province { get; set; }
        public double? Lat { get; set; }
        public double? Long { get; set; }
        public string? ISO3 { get; set; }
        public long Confirmed { get; set; }
        public long Deaths { get; set; }
        public long Recovered { get; set; }
        public long Active { get; set; }
        public DateTime Date { get; set; }
    }

    public class CountrySummaryDto
    {
        [Key]
        public string Country { get; set; } = string.Empty;
        public long Confirmed { get; set; }
        public long Deaths { get; set; }
        public long Recovered { get; set; }
        public long Active { get; set; }
        public long DailyIncrease { get; set; }
    }
}
