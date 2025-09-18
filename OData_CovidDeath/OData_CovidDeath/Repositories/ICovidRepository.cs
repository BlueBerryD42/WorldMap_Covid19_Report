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
        
        // Separate methods for each data type (faster queries)
        Task<IEnumerable<CountrySummaryDto>> GetConfirmedDataAsync();
        Task<IEnumerable<CountrySummaryDto>> GetDeathsDataAsync();
        Task<IEnumerable<CountrySummaryDto>> GetRecoveredDataAsync();
        Task<IEnumerable<CountrySummaryDto>> GetActiveDataAsync();
        Task<IEnumerable<CountrySummaryDto>> GetDailyIncreaseDataAsync();
        
        Task<Location?> GetLocationByCountryAsync(string country);
        Task<IEnumerable<Location>> GetAllLocationsAsync();
        Task<IEnumerable<DailyMetric>> GetDailyMetricsByLocationAsync(int locationId);
        Task<IEnumerable<DailyMetric>> GetDailyMetricsByDateAsync(DateTime date);
    }
}
