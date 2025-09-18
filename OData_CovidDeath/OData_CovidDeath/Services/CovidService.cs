using OData_CovidDeath.Models;
using OData_CovidDeath.Repositories;

namespace OData_CovidDeath.Services
{
    public class CovidService : ICovidService
    {
        private readonly ICovidRepository _repository;

        public CovidService(ICovidRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<CovidDataDto>> GetAllCovidDataAsync()
        {
            return await _repository.GetAllCovidDataAsync();
        }

        public async Task<IEnumerable<CovidDataDto>> GetCovidDataByDateAsync(DateTime date)
        {
            return await _repository.GetCovidDataByDateAsync(date);
        }

        public async Task<IEnumerable<CovidDataDto>> GetCovidDataByCountryAsync(string country)
        {
            return await _repository.GetCovidDataByCountryAsync(country);
        }

        public async Task<IEnumerable<CountrySummaryDto>> GetCountrySummariesAsync()
        {
            var summaries = await _repository.GetCountrySummariesAsync();
            return await CalculateDailyIncreasesAsync(summaries);
        }

        public async Task<IEnumerable<CountrySummaryDto>> GetCountrySummariesByDateAsync(DateTime date)
        {
            var summaries = await _repository.GetCountrySummariesByDateAsync(date);
            return await CalculateDailyIncreasesAsync(summaries);
        }

        public async Task<Dictionary<string, CountrySummaryDto>> GetCountrySummariesAsDictionaryAsync()
        {
            var summaries = await GetCountrySummariesAsync();
            return summaries.ToDictionary(s => s.Country, s => s);
        }

        public async Task<Dictionary<string, CountrySummaryDto>> GetCountrySummariesByDateAsDictionaryAsync(DateTime date)
        {
            var summaries = await GetCountrySummariesByDateAsync(date);
            return summaries.ToDictionary(s => s.Country, s => s);
        }

        private async Task<IEnumerable<CountrySummaryDto>> CalculateDailyIncreasesAsync(IEnumerable<CountrySummaryDto> summaries)
        {
            var summariesList = summaries.ToList();
            var previousDate = await GetPreviousDateAsync();
            var previousSummaries = await _repository.GetCountrySummariesByDateAsync(previousDate);
            var previousDict = previousSummaries.ToDictionary(s => s.Country, s => s);

            foreach (var summary in summariesList)
            {
                if (previousDict.TryGetValue(summary.Country, out var previousSummary))
                {
                    summary.DailyIncrease = Math.Max(0, summary.Confirmed - previousSummary.Confirmed);
                }
                else
                {
                    summary.DailyIncrease = summary.Confirmed; // First day data
                }
            }

            return summariesList;
        }

        private async Task<DateTime> GetPreviousDateAsync()
        {
            var latestDate = DateTime.Today;
            var covidData = await _repository.GetAllCovidDataAsync();
            if (covidData.Any())
            {
                latestDate = covidData.Max(d => d.Date).Date;
            }
            return latestDate.AddDays(-1);
        }
    }
}
