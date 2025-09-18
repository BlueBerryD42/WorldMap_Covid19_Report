using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using OData_CovidDeath.Models;
using OData_CovidDeath.Services;

namespace OData_CovidDeath.Controllers
{
    [ApiController]
    [Route("odata")]
    public class CovidDataController : ODataController
    {
        private readonly ICovidService _covidService;

        public CovidDataController(ICovidService covidService)
        {
            _covidService = covidService;
        }

        // Main OData endpoint for CovidData
        [EnableQuery]
        [HttpGet("CovidData")]
        public async Task<IActionResult> GetCovidData()
        {
            var data = await _covidService.GetAllCovidDataAsync();
            return Ok(data);
        }

        // OData endpoint for Country Summaries
        [EnableQuery]
        [HttpGet("CountrySummaries")]
        public async Task<IActionResult> GetCountrySummaries()
        {
            var summaries = await _covidService.GetCountrySummariesAsync();
            return Ok(summaries);
        }

        // Separate OData endpoints for each data type (more efficient)
        [EnableQuery]
        [HttpGet("Confirmed")]
        public async Task<IActionResult> GetConfirmedData()
        {
            var data = await _covidService.GetConfirmedDataAsDictionaryAsync();
            return Ok(data);
        }

        [EnableQuery]
        [HttpGet("Active")]
        public async Task<IActionResult> GetActiveData()
        {
            var data = await _covidService.GetActiveDataAsDictionaryAsync();
            return Ok(data);
        }

        [EnableQuery]
        [HttpGet("Recovered")]
        public async Task<IActionResult> GetRecoveredData()
        {
            var data = await _covidService.GetRecoveredDataAsDictionaryAsync();
            return Ok(data);
        }

        [EnableQuery]
        [HttpGet("Deaths")]
        public async Task<IActionResult> GetDeathsData()
        {
            var data = await _covidService.GetDeathsDataAsDictionaryAsync();
            return Ok(data);
        }

        [EnableQuery]
        [HttpGet("Daily")]
        public async Task<IActionResult> GetDailyData()
        {
            var data = await _covidService.GetDailyIncreaseDataAsDictionaryAsync();
            return Ok(data);
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
