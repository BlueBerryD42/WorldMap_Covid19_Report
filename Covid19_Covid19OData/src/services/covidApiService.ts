// OData API service for COVID data
const API_BASE_URL = 'http://localhost:5236/api'; // Update this to match your API URL

export interface CovidDataDto {
  country: string;
  province?: string;
  lat?: number;
  long?: number;
  iso3?: string;
  confirmed: number;
  deaths: number;
  recovered: number;
  active: number;
  date: string;
}

export interface CountrySummaryDto {
  country: string;
  confirmed: number;
  deaths: number;
  recovered: number;
  active: number;
  dailyIncrease: number;
}

class CovidApiService {
  private async fetchWithErrorHandling<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.value || data; // OData returns data in 'value' property
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  async getAllCovidData(): Promise<CovidDataDto[]> {
    const url = `${API_BASE_URL}/CovidData/all`;
    return this.fetchWithErrorHandling<CovidDataDto[]>(url);
  }

  async getCovidDataByDate(date: string): Promise<CovidDataDto[]> {
    const url = `${API_BASE_URL}/CovidData/by-date/${date}`;
    return this.fetchWithErrorHandling<CovidDataDto[]>(url);
  }

  async getCovidDataByCountry(country: string): Promise<CovidDataDto[]> {
    const url = `${API_BASE_URL}/CovidData/by-country/${encodeURIComponent(country)}`;
    return this.fetchWithErrorHandling<CovidDataDto[]>(url);
  }

  async getCountrySummaries(): Promise<CountrySummaryDto[]> {
    const url = `${API_BASE_URL}/CovidData/summaries`;
    return this.fetchWithErrorHandling<CountrySummaryDto[]>(url);
  }

  async getCountrySummariesByDate(date: string): Promise<CountrySummaryDto[]> {
    const url = `${API_BASE_URL}/CovidData/summaries/by-date/${date}`;
    return this.fetchWithErrorHandling<CountrySummaryDto[]>(url);
  }

  async getCountrySummariesAsDictionary(): Promise<Record<string, CountrySummaryDto>> {
    const url = `${API_BASE_URL}/CovidData/summaries/dictionary`;
    return this.fetchWithErrorHandling<Record<string, CountrySummaryDto>>(url);
  }

  async getCountrySummariesByDateAsDictionary(date: string): Promise<Record<string, CountrySummaryDto>> {
    const url = `${API_BASE_URL}/CovidData/summaries/dictionary/by-date/${date}`;
    return this.fetchWithErrorHandling<Record<string, CountrySummaryDto>>(url);
  }

  // OData query methods
  async getCovidDataWithODataQuery(query: string): Promise<CovidDataDto[]> {
    const url = `${API_BASE_URL}/CovidData?${query}`;
    return this.fetchWithErrorHandling<CovidDataDto[]>(url);
  }

  async getCountrySummariesWithODataQuery(query: string): Promise<CountrySummaryDto[]> {
    const url = `${API_BASE_URL}/CovidData/summaries?${query}`;
    return this.fetchWithErrorHandling<CountrySummaryDto[]>(url);
  }
}

export const covidApiService = new CovidApiService();
