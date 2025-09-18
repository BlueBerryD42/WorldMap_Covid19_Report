using Microsoft.AspNetCore.Mvc;
using OData_CovidDeath.Models;
using OData_CovidDeath.Services;

namespace OData_CovidDeath.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CovidDataController : ControllerBase
    {
        private readonly ICovidService _covidService;

        public CovidDataController(ICovidService covidService)
        {
            _covidService = covidService;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var data = await _covidService.GetAllCovidDataAsync();
            return Ok(data);
        }

        [HttpGet("by-date/{date}")]
        public async Task<IActionResult> GetByDate(DateTime date)
        {
            var data = await _covidService.GetCovidDataByDateAsync(date);
            return Ok(data);
        }

        [HttpGet("by-country/{country}")]
        public async Task<IActionResult> GetByCountry(string country)
        {
            var data = await _covidService.GetCovidDataByCountryAsync(country);
            return Ok(data);
        }

        [HttpGet("summaries")]
        public async Task<IActionResult> GetCountrySummaries()
        {
            var summaries = await _covidService.GetCountrySummariesAsync();
            return Ok(summaries);
        }

        [HttpGet("summaries/by-date/{date}")]
        public async Task<IActionResult> GetCountrySummariesByDate(DateTime date)
        {
            var summaries = await _covidService.GetCountrySummariesByDateAsync(date);
            return Ok(summaries);
        }

        [HttpGet("summaries/dictionary")]
        public async Task<IActionResult> GetCountrySummariesAsDictionary()
        {
            var summaries = await _covidService.GetCountrySummariesAsDictionaryAsync();
            return Ok(summaries);
        }

        [HttpGet("summaries/dictionary/by-date/{date}")]
        public async Task<IActionResult> GetCountrySummariesByDateAsDictionary(DateTime date)
        {
            var summaries = await _covidService.GetCountrySummariesByDateAsDictionaryAsync(date);
            return Ok(summaries);
        }

        [HttpGet("debug/countries")]
        public async Task<IActionResult> GetCountriesDebug()
        {
            var summaries = await _covidService.GetCountrySummariesAsDictionaryAsync();
            var countryNames = summaries.Keys.ToList();
            return Ok(new { countries = countryNames, count = countryNames.Count });
        }

        [HttpGet("debug/raw-data")]
        public async Task<IActionResult> GetRawDataDebug()
        {
            var rawData = await _covidService.GetAllCovidDataAsync();
            var sampleData = rawData.Take(5).Select(d => new { 
                d.Country, 
                d.Province, 
                d.Confirmed, 
                d.Deaths, 
                d.Recovered, 
                d.Active, 
                d.Date 
            });
            return Ok(new { sampleData = sampleData, totalRecords = rawData.Count() });
        }

        // Separate endpoints for each data type (faster queries)
        [HttpGet("confirmed")]
        public async Task<IActionResult> GetConfirmedData()
        {
            var summaries = await _covidService.GetConfirmedDataAsDictionaryAsync();
            var confirmedData = summaries.ToDictionary(
                kvp => kvp.Key, 
                kvp => new { country = kvp.Key, value = kvp.Value.Confirmed }
            );
            return Ok(confirmedData);
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveData()
        {
            var summaries = await _covidService.GetActiveDataAsDictionaryAsync();
            var activeData = summaries.ToDictionary(
                kvp => kvp.Key, 
                kvp => new { country = kvp.Key, value = kvp.Value.Active }
            );
            return Ok(activeData);
        }

        [HttpGet("recovered")]
        public async Task<IActionResult> GetRecoveredData()
        {
            var summaries = await _covidService.GetRecoveredDataAsDictionaryAsync();
            var recoveredData = summaries.ToDictionary(
                kvp => kvp.Key, 
                kvp => new { country = kvp.Key, value = kvp.Value.Recovered }
            );
            return Ok(recoveredData);
        }

        [HttpGet("deaths")]
        public async Task<IActionResult> GetDeathsData()
        {
            var summaries = await _covidService.GetDeathsDataAsDictionaryAsync();
            var deathsData = summaries.ToDictionary(
                kvp => kvp.Key, 
                kvp => new { country = kvp.Key, value = kvp.Value.Deaths }
            );
            return Ok(deathsData);
        }

        [HttpGet("daily")]
        public async Task<IActionResult> GetDailyData()
        {
            var summaries = await _covidService.GetDailyIncreaseDataAsDictionaryAsync();
            var dailyData = summaries.ToDictionary(
                kvp => kvp.Key, 
                kvp => new { country = kvp.Key, value = kvp.Value.DailyIncrease }
            );
            return Ok(dailyData);
        }

        [HttpGet("debug/country/{country}")]
        public async Task<IActionResult> GetCountryDebug(string country)
        {
            var rawData = await _covidService.GetCovidDataByCountryAsync(country);
            var sampleData = rawData.Take(10).Select(d => new { 
                d.Country, 
                d.Province, 
                d.Confirmed, 
                d.Deaths, 
                d.Recovered, 
                d.Active, 
                d.Date 
            });
            return Ok(new { 
                country = country, 
                sampleData = sampleData, 
                totalRecords = rawData.Count(),
                maxRecovered = rawData.Max(d => d.Recovered),
                maxConfirmed = rawData.Max(d => d.Confirmed)
            });
        }
    }
}
