using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OData_CovidDeath.Models
{
    [Table("MetricsTypes")]
    public class MetricsType
    {
        [Key]
        public int TypeID { get; set; }

        [Required]
        [MaxLength(50)]
        public string MetricName { get; set; } = string.Empty;
    }
}
