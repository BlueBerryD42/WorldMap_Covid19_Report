using OData_CovidDeath.Models;

namespace OData_CovidDeath.Repositories
{
    public interface ICovidRepository
    {
        Task<IEnumerable<CovidDataDto>> GetAllCovidDataAsync();
        Task<IEnumerable<CovidDataDto>> GetCovidDataByDateAsync(DateTime date);
        Task<IEnumerable<CovidDataDto>> GetCovidDataByCountryAsync(string country);
        Task<IEnumerable<CountrySummaryDto>> GetCountrySummariesAsync();
        Task<IEnumerable<CountrySummaryDto>> GetCountrySummariesByDateAsync(DateTime date);
        Task<Location?> GetLocationByCountryAsync(string country);
        Task<IEnumerable<Location>> GetAllLocationsAsync();
        Task<IEnumerable<DailyMetric>> GetDailyMetricsByLocationAsync(int locationId);
        Task<IEnumerable<DailyMetric>> GetDailyMetricsByDateAsync(DateTime date);
    }
}
