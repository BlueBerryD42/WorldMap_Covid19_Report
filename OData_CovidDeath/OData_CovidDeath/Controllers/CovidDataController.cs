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
    }
}
