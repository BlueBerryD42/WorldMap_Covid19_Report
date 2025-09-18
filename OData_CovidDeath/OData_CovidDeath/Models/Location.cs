using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OData_CovidDeath.Models
{
    [Table("Locations")]
    public class Location
    {
        [Key]
        public int LocationID { get; set; }

        [MaxLength(255)]
        public string? Province_State { get; set; }

        [Required]
        [MaxLength(255)]
        public string Country_Region { get; set; } = string.Empty;

        public double? Lat { get; set; }

        public double? Long { get; set; }

        [MaxLength(3)]
        public string? ISO3 { get; set; }

        // Navigation property
        public virtual ICollection<DailyMetric> DailyMetrics { get; set; } = new List<DailyMetric>();
    }
}
