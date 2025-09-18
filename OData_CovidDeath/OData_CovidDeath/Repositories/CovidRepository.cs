using Microsoft.EntityFrameworkCore;
using OData_CovidDeath.Data;
using OData_CovidDeath.Models;

namespace OData_CovidDeath.Repositories
{
    public class CovidRepository : ICovidRepository
    {
        private readonly CovidDbContext _context;

        public CovidRepository(CovidDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CovidDataDto>> GetAllCovidDataAsync()
        {
            var query = from dm in _context.DailyMetrics
                        join l in _context.Locations on dm.LocationID equals l.LocationID
                        select new CovidDataDto
                        {
                            Id = dm.MetricID,
                            Country = l.Country_Region,
                            Province = l.Province_State,
                            Lat = l.Lat,
                            Long = l.Long,
                            ISO3 = l.ISO3,
                            Confirmed = dm.Confirmed,
                            Deaths = dm.Deaths,
                            Recovered = dm.Recovered,
                            Active = dm.Active,
                            Date = dm.Date
                        };

            return await query.ToListAsync();
        }

        public async Task<IEnumerable<CovidDataDto>> GetCovidDataByDateAsync(DateTime date)
        {
            var query = from dm in _context.DailyMetrics
                        join l in _context.Locations on dm.LocationID equals l.LocationID
                        where dm.Date.Date == date.Date
                        select new CovidDataDto
                        {
                            Id = dm.MetricID,
                            Country = l.Country_Region,
                            Province = l.Province_State,
                            Lat = l.Lat,
                            Long = l.Long,
                            ISO3 = l.ISO3,
                            Confirmed = dm.Confirmed,
                            Deaths = dm.Deaths,
                            Recovered = dm.Recovered,
                            Active = dm.Active,
                            Date = dm.Date
                        };

            return await query.ToListAsync();
        }

        public async Task<IEnumerable<CovidDataDto>> GetCovidDataByCountryAsync(string country)
        {
            var query = from dm in _context.DailyMetrics
                        join l in _context.Locations on dm.LocationID equals l.LocationID
                        where l.Country_Region.ToLower().Contains(country.ToLower())
                        select new CovidDataDto
                        {
                            Id = dm.MetricID,
                            Country = l.Country_Region,
                            Province = l.Province_State,
                            Lat = l.Lat,
                            Long = l.Long,
                            ISO3 = l.ISO3,
                            Confirmed = dm.Confirmed,
                            Deaths = dm.Deaths,
                            Recovered = dm.Recovered,
                            Active = dm.Active,
                            Date = dm.Date
                        };

            return await query.ToListAsync();
        }

        public async Task<IEnumerable<CountrySummaryDto>> GetCountrySummariesAsync()
        {
            // Get latest date data for each country (fast query)
            var latestDate = await _context.DailyMetrics.MaxAsync(dm => dm.Date);
            
            var query = from dm in _context.DailyMetrics
                        join l in _context.Locations on dm.LocationID equals l.LocationID
                        where dm.Date.Date == latestDate.Date
                        group dm by l.Country_Region into g
                        select new CountrySummaryDto
                        {
                            Country = g.Key,
                            Confirmed = g.Max(x => x.Confirmed),
                            Deaths = g.Max(x => x.Deaths),
                            Recovered = g.Max(x => x.Recovered),
                            Active = g.Max(x => x.Active),
                            DailyIncrease = 0 // Will be calculated separately
                        };

            return await query.ToListAsync();
        }

        public async Task<IEnumerable<CountrySummaryDto>> GetConfirmedDataAsync()
        {
            // Get the latest confirmed values for each country
            var latestDate = await _context.DailyMetrics.MaxAsync(dm => dm.Date);
            
            var query = from dm in _context.DailyMetrics
                        join l in _context.Locations on dm.LocationID equals l.LocationID
                        where dm.Date == latestDate
                        group dm by l.Country_Region into g
                        select new CountrySummaryDto
                        {
                            Country = g.Key,
                            Confirmed = g.Sum(x => x.Confirmed), // Sum across provinces for same country
                            Deaths = 0,
                            Recovered = 0,
                            Active = 0,
                            DailyIncrease = 0
                        };

            var results = await query.ToListAsync();
            
            // Filter out countries with zero confirmed cases on the client side
            return results.Where(r => r.Confirmed > 0);
        }

        public async Task<IEnumerable<CountrySummaryDto>> GetDeathsDataAsync()
        {
            // Get the latest deaths values for each country
            var latestDate = await _context.DailyMetrics.MaxAsync(dm => dm.Date);
            
            var query = from dm in _context.DailyMetrics
                        join l in _context.Locations on dm.LocationID equals l.LocationID
                        where dm.Date == latestDate
                        group dm by l.Country_Region into g
                        select new CountrySummaryDto
                        {
                            Country = g.Key,
                            Confirmed = 0,
                            Deaths = g.Sum(x => x.Deaths), // Sum across provinces for same country
                            Recovered = 0,
                            Active = 0,
                            DailyIncrease = 0
                        };

            var results = await query.ToListAsync();
            
            // Filter out countries with zero deaths on the client side
            return results.Where(r => r.Deaths > 0);
        }

        public async Task<IEnumerable<CountrySummaryDto>> GetRecoveredDataAsync()
        {
            // Get the maximum recovered values for each country
            var query = from dm in _context.DailyMetrics
                        join l in _context.Locations on dm.LocationID equals l.LocationID
                        group dm by l.Country_Region into g
                        select new CountrySummaryDto
                        {
                            Country = g.Key,
                            Confirmed = 0,
                            Deaths = 0,
                            Recovered = g.Max(x => x.Recovered), // Maximum recovered value
                            Active = 0,
                            DailyIncrease = 0
                        };

            var results = await query.ToListAsync();
            
            // Filter out countries with zero recovered cases on the client side
            return results.Where(r => r.Recovered > 0);
        }

        public async Task<IEnumerable<CountrySummaryDto>> GetActiveDataAsync()
        {
            // Get the latest active values for each country
            var latestDate = await _context.DailyMetrics.MaxAsync(dm => dm.Date);
            
            var query = from dm in _context.DailyMetrics
                        join l in _context.Locations on dm.LocationID equals l.LocationID
                        where dm.Date == latestDate
                        group dm by l.Country_Region into g
                        select new CountrySummaryDto
                        {
                            Country = g.Key,
                            Confirmed = 0,
                            Deaths = 0,
                            Recovered = 0,
                            Active = g.Sum(x => x.Active), // Sum across provinces for same country
                            DailyIncrease = 0
                        };

            var results = await query.ToListAsync();
            
            // Filter out countries with zero active cases on the client side
            return results.Where(r => r.Active > 0);
        }

        public async Task<IEnumerable<CountrySummaryDto>> GetDailyIncreaseDataAsync()
        {
            // Get all data grouped by country for daily increase calculation
            var countryData = await (from dm in _context.DailyMetrics
                                   join l in _context.Locations on dm.LocationID equals l.LocationID
                                   group dm by l.Country_Region into g
                                   select new
                                   {
                                       Country = g.Key,
                                       DailyMetrics = g.OrderBy(x => x.Date).ToList()
                                   }).ToListAsync();

            var result = new List<CountrySummaryDto>();

            foreach (var country in countryData)
            {
                var metrics = country.DailyMetrics;
                
                // Calculate daily increases (current day - previous day)
                var dailyIncreases = new List<long>();
                for (int i = 1; i < metrics.Count; i++)
                {
                    var currentDay = metrics[i].Confirmed;
                    var previousDay = metrics[i - 1].Confirmed;
                    var dailyIncrease = Math.Max(0, currentDay - previousDay);
                    dailyIncreases.Add(dailyIncrease);
                }

                // Calculate average daily increase
                var averageDailyIncrease = dailyIncreases.Count > 0 ? 
                    (long)dailyIncreases.Average() : 0;
                
                // Only add countries with actual daily increase data
                if (averageDailyIncrease > 0)
                {
                    result.Add(new CountrySummaryDto
                    {
                        Country = country.Country,
                        Confirmed = 0,
                        Deaths = 0,
                        Recovered = 0,
                        Active = 0,
                        DailyIncrease = averageDailyIncrease
                    });
                }
            }

            return result;
        }

        public async Task<IEnumerable<CountrySummaryDto>> GetCountrySummariesByDateAsync(DateTime date)
        {
            var query = from dm in _context.DailyMetrics
                        join l in _context.Locations on dm.LocationID equals l.LocationID
                        where dm.Date.Date == date.Date
                        group dm by l.Country_Region into g
                        select new CountrySummaryDto
                        {
                            Country = g.Key,
                            Confirmed = g.Sum(x => x.Confirmed),
                            Deaths = g.Sum(x => x.Deaths),
                            Recovered = g.Sum(x => x.Recovered),
                            Active = g.Sum(x => x.Active),
                            DailyIncrease = 0 // Will be calculated in service layer
                        };

            return await query.ToListAsync();
        }

        public async Task<Location?> GetLocationByCountryAsync(string country)
        {
            return await _context.Locations
                .FirstOrDefaultAsync(l => l.Country_Region.ToLower().Contains(country.ToLower()));
        }

        public async Task<IEnumerable<Location>> GetAllLocationsAsync()
        {
            return await _context.Locations.ToListAsync();
        }

        public async Task<IEnumerable<DailyMetric>> GetDailyMetricsByLocationAsync(int locationId)
        {
            return await _context.DailyMetrics
                .Where(dm => dm.LocationID == locationId)
                .OrderBy(dm => dm.Date)
                .ToListAsync();
        }

        public async Task<IEnumerable<DailyMetric>> GetDailyMetricsByDateAsync(DateTime date)
        {
            return await _context.DailyMetrics
                .Where(dm => dm.Date.Date == date.Date)
                .ToListAsync();
        }
    }
}
