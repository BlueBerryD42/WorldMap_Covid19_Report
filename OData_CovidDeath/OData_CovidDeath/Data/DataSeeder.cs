using Microsoft.EntityFrameworkCore;
using OData_CovidDeath.Models;

namespace OData_CovidDeath.Data
{
    public static class DataSeeder
    {
        public static async Task SeedDataAsync(CovidDbContext context)
        {
            // Check if data already exists
            if (await context.Locations.AnyAsync())
            {
                return; // Data already seeded
            }

            // Seed Locations
            var locations = new List<Location>
            {
                new Location { Country_Region = "US", Province_State = "California", Lat = 36.7783, Long = -119.4179, ISO3 = "USA" },
                new Location { Country_Region = "US", Province_State = "New York", Lat = 40.7128, Long = -74.0060, ISO3 = "USA" },
                new Location { Country_Region = "US", Province_State = "Texas", Lat = 31.9686, Long = -99.9018, ISO3 = "USA" },
                new Location { Country_Region = "China", Province_State = "Hubei", Lat = 30.5928, Long = 114.3055, ISO3 = "CHN" },
                new Location { Country_Region = "Italy", Province_State = "Lombardy", Lat = 45.4642, Long = 9.1900, ISO3 = "ITA" },
                new Location { Country_Region = "Spain", Province_State = "Madrid", Lat = 40.4168, Long = -3.7038, ISO3 = "ESP" },
                new Location { Country_Region = "Germany", Province_State = "Bavaria", Lat = 48.7904, Long = 11.4979, ISO3 = "DEU" },
                new Location { Country_Region = "France", Province_State = "Île-de-France", Lat = 48.8566, Long = 2.3522, ISO3 = "FRA" },
                new Location { Country_Region = "United Kingdom", Province_State = "England", Lat = 51.5074, Long = -0.1278, ISO3 = "GBR" },
                new Location { Country_Region = "Brazil", Province_State = "São Paulo", Lat = -23.5505, Long = -46.6333, ISO3 = "BRA" },
                new Location { Country_Region = "India", Province_State = "Maharashtra", Lat = 19.0760, Long = 72.8777, ISO3 = "IND" },
                new Location { Country_Region = "Russia", Province_State = "Moscow", Lat = 55.7558, Long = 37.6176, ISO3 = "RUS" },
                new Location { Country_Region = "Japan", Province_State = "Tokyo", Lat = 35.6762, Long = 139.6503, ISO3 = "JPN" },
                new Location { Country_Region = "South Korea", Province_State = "Seoul", Lat = 37.5665, Long = 126.9780, ISO3 = "KOR" },
                new Location { Country_Region = "Canada", Province_State = "Ontario", Lat = 43.6532, Long = -79.3832, ISO3 = "CAN" },
                new Location { Country_Region = "Australia", Province_State = "New South Wales", Lat = -33.8688, Long = 151.2093, ISO3 = "AUS" },
                new Location { Country_Region = "Mexico", Province_State = "Mexico City", Lat = 19.4326, Long = -99.1332, ISO3 = "MEX" },
                new Location { Country_Region = "Argentina", Province_State = "Buenos Aires", Lat = -34.6118, Long = -58.3960, ISO3 = "ARG" },
                new Location { Country_Region = "Chile", Province_State = "Santiago", Lat = -33.4489, Long = -70.6693, ISO3 = "CHL" },
                new Location { Country_Region = "Colombia", Province_State = "Bogotá", Lat = 4.7110, Long = -74.0721, ISO3 = "COL" }
            };

            context.Locations.AddRange(locations);
            await context.SaveChangesAsync();

            // Seed DailyMetrics for the last 30 days
            var random = new Random();
            var endDate = DateTime.Today;
            var startDate = endDate.AddDays(-30);

            var dailyMetrics = new List<DailyMetric>();

            foreach (var location in locations)
            {
                long confirmed = 0;
                long deaths = 0;
                long recovered = 0;

                for (var date = startDate; date <= endDate; date = date.AddDays(1))
                {
                    // Simulate realistic COVID data growth
                    var dailyConfirmed = random.Next(10, 1000);
                    var dailyDeaths = random.Next(0, (int)(dailyConfirmed * 0.02)); // 2% death rate
                    var dailyRecovered = random.Next(0, (int)(dailyConfirmed * 0.8)); // 80% recovery rate

                    confirmed += dailyConfirmed;
                    deaths += dailyDeaths;
                    recovered += dailyRecovered;

                    dailyMetrics.Add(new DailyMetric
                    {
                        LocationID = location.LocationID,
                        Date = date,
                        Confirmed = confirmed,
                        Deaths = deaths,
                        Recovered = recovered
                        // Active is calculated automatically by the database
                    });
                }
            }

            context.DailyMetrics.AddRange(dailyMetrics);
            await context.SaveChangesAsync();

            // Seed MetricsTypes
            var metricsTypes = new List<MetricsType>
            {
                new MetricsType { MetricName = "Confirmed" },
                new MetricsType { MetricName = "Deaths" },
                new MetricsType { MetricName = "Recovered" },
                new MetricsType { MetricName = "Active" },
                new MetricsType { MetricName = "Daily Increase" }
            };

            context.MetricsTypes.AddRange(metricsTypes);
            await context.SaveChangesAsync();
        }
    }
}
