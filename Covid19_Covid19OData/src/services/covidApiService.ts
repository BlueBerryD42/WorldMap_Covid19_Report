// OData API service for COVID data
const API_BASE_URL = 'http://localhost:5236/odata'; // Update this to match your API URL

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
      console.log("Data Retived sucessfully:", data);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  async getAllCovidData(): Promise<CovidDataDto[]> {
    const url = `${API_BASE_URL}/CovidData`;
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
    const url = `${API_BASE_URL}/CountrySummaries`;
    return this.fetchWithErrorHandling<CountrySummaryDto[]>(url);
  }

  async getCountrySummariesByDate(date: string): Promise<CountrySummaryDto[]> {
    const url = `${API_BASE_URL}/CountrySummaries?$filter=Date eq '${date}'`;
    return this.fetchWithErrorHandling<CountrySummaryDto[]>(url);
  }

  async getCountrySummariesAsDictionary(): Promise<Record<string, CountrySummaryDto>> {
    const data = await this.getCountrySummaries();
    return data.reduce((dict, item) => {
      dict[item.country] = item;
      return dict;
    }, {} as Record<string, CountrySummaryDto>);
  }

  async getCountrySummariesByDateAsDictionary(date: string): Promise<Record<string, CountrySummaryDto>> {
    const data = await this.getCountrySummariesByDate(date);
    return data.reduce((dict, item) => {
      dict[item.country] = item;
      return dict;
    }, {} as Record<string, CountrySummaryDto>);
  }

  // Individual data type endpoints (separate OData endpoints for efficiency)
  async getConfirmedData(): Promise<Record<string, { country: string; value: number }>> {
    const url = `${API_BASE_URL}/Confirmed`;
    const data = await this.fetchWithErrorHandling<Record<string, CountrySummaryDto>>(url);
    return this.convertDictionaryToApiFormat(data, 'confirmed');
  }

  async getActiveData(): Promise<Record<string, { country: string; value: number }>> {
    const url = `${API_BASE_URL}/Active`;
    const data = await this.fetchWithErrorHandling<Record<string, CountrySummaryDto>>(url);
    return this.convertDictionaryToApiFormat(data, 'active');
  }

  async getRecoveredData(): Promise<Record<string, { country: string; value: number }>> {
    const url = `${API_BASE_URL}/Recovered`;
    const data = await this.fetchWithErrorHandling<Record<string, CountrySummaryDto>>(url);
    return this.convertDictionaryToApiFormat(data, 'recovered');
  }

  async getDeathsData(): Promise<Record<string, { country: string; value: number }>> {
    const url = `${API_BASE_URL}/Deaths`;
    const data = await this.fetchWithErrorHandling<Record<string, CountrySummaryDto>>(url);
    return this.convertDictionaryToApiFormat(data, 'deaths');
  }

  async getDailyData(): Promise<Record<string, { country: string; value: number }>> {
    const url = `${API_BASE_URL}/Daily`;
    const data = await this.fetchWithErrorHandling<Record<string, CountrySummaryDto>>(url);
    return this.convertDictionaryToApiFormat(data, 'dailyIncrease');
  }

  private convertToApiFormat(data: CountrySummaryDto[], dataType: string): Record<string, { country: string; value: number }> {
    const result: Record<string, { country: string; value: number }> = {};
    
    data.forEach(item => {
      let value = 0;
      switch (dataType) {
        case 'confirmed': value = item.confirmed; break;
        case 'active': value = item.active; break;
        case 'recovered': value = item.recovered; break;
        case 'deaths': value = item.deaths; break;
        case 'dailyIncrease': value = item.dailyIncrease; break;
      }
      
      result[item.country] = {
        country: item.country,
        value: value
      };
    });
    
    return result;
  }

  private convertDictionaryToApiFormat(data: Record<string, CountrySummaryDto>, dataType: string): Record<string, { country: string; value: number }> {
    const result: Record<string, { country: string; value: number }> = {};
    
    Object.entries(data).forEach(([country, item]) => {
      let value = 0;
      switch (dataType) {
        case 'confirmed': value = item.confirmed; break;
        case 'active': value = item.active; break;
        case 'recovered': value = item.recovered; break;
        case 'deaths': value = item.deaths; break;
        case 'dailyIncrease': value = item.dailyIncrease; break;
      }
      
      result[country] = {
        country: country,
        value: value
      };
    });
    
    return result;
  }

  // OData query methods
  async getCovidDataWithODataQuery(query: string): Promise<CovidDataDto[]> {
    const url = `${API_BASE_URL}/CovidData?${query}`;
    return this.fetchWithErrorHandling<CovidDataDto[]>(url);
  }

  async getCountrySummariesWithODataQuery(query: string): Promise<CountrySummaryDto[]> {
    const url = `${API_BASE_URL}/CountrySummaries?${query}`;
    return this.fetchWithErrorHandling<CountrySummaryDto[]>(url);
  }
}

export const covidApiService = new CovidApiService();
