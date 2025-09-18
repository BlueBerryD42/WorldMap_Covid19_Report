using OData_CovidDeath.Models;

namespace OData_CovidDeath.Services
{
    public interface ICovidService
    {
        Task<IEnumerable<CovidDataDto>> GetAllCovidDataAsync();
        Task<IEnumerable<CovidDataDto>> GetCovidDataByDateAsync(DateTime date);
        Task<IEnumerable<CovidDataDto>> GetCovidDataByCountryAsync(string country);
        Task<IEnumerable<CountrySummaryDto>> GetCountrySummariesAsync();
        Task<IEnumerable<CountrySummaryDto>> GetCountrySummariesByDateAsync(DateTime date);
        Task<Dictionary<string, CountrySummaryDto>> GetCountrySummariesAsDictionaryAsync();
        Task<Dictionary<string, CountrySummaryDto>> GetCountrySummariesByDateAsDictionaryAsync(DateTime date);
        
        // Separate methods for each data type (faster queries)
        Task<Dictionary<string, CountrySummaryDto>> GetConfirmedDataAsDictionaryAsync();
        Task<Dictionary<string, CountrySummaryDto>> GetDeathsDataAsDictionaryAsync();
        Task<Dictionary<string, CountrySummaryDto>> GetRecoveredDataAsDictionaryAsync();
        Task<Dictionary<string, CountrySummaryDto>> GetActiveDataAsDictionaryAsync();
        Task<Dictionary<string, CountrySummaryDto>> GetDailyIncreaseDataAsDictionaryAsync();
    }
}
