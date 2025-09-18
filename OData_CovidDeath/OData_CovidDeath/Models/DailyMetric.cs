using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OData_CovidDeath.Models
{
    [Table("DailyMetrics")]
    public class DailyMetric
    {
        [Key]
        public int MetricID { get; set; }

        [Required]
        public int LocationID { get; set; }

        [Required]
        public DateTime Date { get; set; }

        public long Confirmed { get; set; } = 0;

        public long Deaths { get; set; } = 0;

        public long Recovered { get; set; } = 0;

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public long Active { get; set; }

        // Navigation property
        [ForeignKey("LocationID")]
        public virtual Location Location { get; set; } = null!;
    }
}
