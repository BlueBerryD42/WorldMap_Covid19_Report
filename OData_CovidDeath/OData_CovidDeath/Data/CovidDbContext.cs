using Microsoft.EntityFrameworkCore;
using OData_CovidDeath.Models;

namespace OData_CovidDeath.Data
{
    public class CovidDbContext : DbContext
    {
        public CovidDbContext(DbContextOptions<CovidDbContext> options) : base(options)
        {
        }

        public DbSet<Location> Locations { get; set; }
        public DbSet<DailyMetric> DailyMetrics { get; set; }
        public DbSet<MetricsType> MetricsTypes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Location entity
            modelBuilder.Entity<Location>(entity =>
            {
                entity.HasKey(e => e.LocationID);
                entity.HasIndex(e => new { e.Province_State, e.Country_Region })
                    .IsUnique()
                    .HasDatabaseName("UQ_Locations_Province_Country");
            });

            // Configure DailyMetric entity
            modelBuilder.Entity<DailyMetric>(entity =>
            {
                entity.HasKey(e => e.MetricID);
                entity.HasIndex(e => new { e.LocationID, e.Date })
                    .IsUnique()
                    .HasDatabaseName("UQ_DailyMetrics_Location_Date");
                entity.HasIndex(e => e.Date)
                    .HasDatabaseName("idx_daily_metrics_date");
                entity.HasIndex(e => new { e.LocationID, e.Date })
                    .HasDatabaseName("idx_daily_metrics_location_date");

                entity.HasOne(d => d.Location)
                    .WithMany(p => p.DailyMetrics)
                    .HasForeignKey(d => d.LocationID)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure MetricsType entity
            modelBuilder.Entity<MetricsType>(entity =>
            {
                entity.HasKey(e => e.TypeID);
                entity.HasIndex(e => e.MetricName)
                    .IsUnique();
            });
        }
    }
}
