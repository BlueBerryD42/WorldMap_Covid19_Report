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
            var latestDate = await _context.DailyMetrics.MaxAsync(dm => dm.Date);
            return await GetCountrySummariesByDateAsync(latestDate);
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
