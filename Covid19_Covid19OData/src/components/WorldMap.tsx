/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography
} from 'react-simple-maps';
import { covidApiService } from '../services/covidApiService';
import type { CountrySummaryDto } from '../services/covidApiService';

// World map topology data URL that includes Antarctica
const geoUrl = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

interface WorldMapProps {
  className?: string;
  dataType?: 'confirmed' | 'active' | 'recovered' | 'deaths' | 'daily';
  onDataReady?: (covidData: Record<string, any>, getColorForValue: (value: number, dataType: string) => string) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ dataType = 'confirmed', onDataReady }) => {
  const [tooltip, setTooltip] = useState<{
    country: string;
    x: number;
    y: number;
  } | null>(null);
  const [covidData, setCovidData] = useState<Record<string, CountrySummaryDto>>({});
  const [loading, setLoading] = useState(true);

  // Define getColorForValue function that can work with any data
  const getColorForValue = useCallback((value: number, dataType: string, dataSource?: Record<string, CountrySummaryDto>) => {
    // Return gray for no data or zero values
    if (value === 0 || value === null || value === undefined) return '#d3d3d3';
    
    const dataToUse = dataSource || covidData;
    if (Object.keys(dataToUse).length === 0) return '#d3d3d3';
    
    // Get max value for this data type across all countries (excluding zeros)
    const nonZeroValues = Object.values(dataToUse)
      .map((data: CountrySummaryDto) => {
        switch (dataType) {
          case 'confirmed': return data.confirmed;
          case 'deaths': return data.deaths;
          case 'recovered': return data.recovered;
          case 'active': return data.active;
          case 'daily': return data.dailyIncrease;
          default: return 0;
        }
      })
      .filter(val => val > 0);
    
    if (nonZeroValues.length === 0) return '#d3d3d3';
    
    const maxValue = Math.max(...nonZeroValues);
    
    // Use logarithmic scaling for better visibility of low values
    const logValue = Math.log10(value + 1);
    const logMaxValue = Math.log10(maxValue + 1);
    const intensity = Math.min(logValue / logMaxValue, 1);
    
    const hue = 240; // Blue hue
    const saturation = Math.max(60, 60 + intensity * 40); // 60% to 100% saturation
    const lightness = Math.max(35, 85 - intensity * 50); // 85% to 35% lightness (darker for higher values)
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }, [covidData]);

  // Fetch COVID-19 data from OData API based on data type
  useEffect(() => {
    const fetchCovidData = async () => {
      try {
        setLoading(true);
        
        // Fetch data based on the selected data type
        let dataResponse: Record<string, { country: string; value: number }> = {};
        
        switch (dataType) {
          case 'confirmed':
            dataResponse = await covidApiService.getConfirmedData();
            break;
          case 'active':
            dataResponse = await covidApiService.getActiveData();
            break;
          case 'recovered':
            dataResponse = await covidApiService.getRecoveredData();
            break;
          case 'deaths':
            dataResponse = await covidApiService.getDeathsData();
            break;
          case 'daily':
            dataResponse = await covidApiService.getDailyData();
            break;
          default:
            dataResponse = await covidApiService.getConfirmedData();
        }
        
        console.log(`API Response for ${dataType} - Total countries:`, Object.keys(dataResponse).length);
        console.log(`API Response for ${dataType} - Country names:`, Object.keys(dataResponse));
        console.log(`API Response for ${dataType} - US data:`, dataResponse['US']);
        console.log(`API Response for ${dataType} - Sample data:`, Object.entries(dataResponse).slice(0, 5));
        
        // Convert to the expected format
        const summaries: Record<string, CountrySummaryDto> = {};
        let hasData = false;
        
        Object.entries(dataResponse).forEach(([country, data]) => {
          const value = data.value;
          
          // Check if this country has actual data (not zero)
          if (value > 0) {
            hasData = true;
          }
          
          summaries[country] = {
            country: data.country,
            confirmed: dataType === 'confirmed' ? value : 0,
            active: dataType === 'active' ? value : 0,
            recovered: dataType === 'recovered' ? value : 0,
            deaths: dataType === 'deaths' ? value : 0,
            dailyIncrease: dataType === 'daily' ? value : 0
          };
        });
        
        // Log if no data is available
        if (!hasData) {
          console.log(`No data available for ${dataType} data type`);
          console.log('All values are zero or empty');
        } else {
          console.log(`Successfully loaded ${dataType} data with ${Object.keys(summaries).length} countries`);
          console.log(`Countries with data:`, Object.entries(summaries).filter(([_, data]) => {
            const value = dataType === 'confirmed' ? data.confirmed : 
                         dataType === 'active' ? data.active :
                         dataType === 'recovered' ? data.recovered :
                         dataType === 'deaths' ? data.deaths :
                         dataType === 'daily' ? data.dailyIncrease : 0;
            return value > 0;
          }).map(([country, _]) => country));
        }
        
        setCovidData(summaries);
        setLoading(false);
        
        // Debug: Check if Antarctica data exists (only log once)
        if (summaries['Antarctica'] || summaries['antarctica'] || summaries['ANTARCTICA']) {
          console.log('Antarctica data found:', summaries['Antarctica'] || summaries['antarctica'] || summaries['ANTARCTICA']);
        }
        
        // Notify parent component that data is ready
        if (onDataReady) {
          // Create a color function that uses the loaded data
          const colorFunction = (value: number, dataType: string) => getColorForValue(value, dataType, summaries);
          onDataReady(summaries, colorFunction);
        }
      } catch (error) {
        console.error(`Error fetching ${dataType} data from API:`, error);
        console.log(`Failed to load ${dataType} data - using empty data`);
        setLoading(false);
        
        // Fallback to empty data
        const emptyData: Record<string, CountrySummaryDto> = {};
        setCovidData(emptyData);
        
        if (onDataReady) {
          const colorFunction = (value: number, dataType: string) => getColorForValue(value, dataType, emptyData);
          onDataReady(emptyData, colorFunction);
        }
      }
    };
    
    fetchCovidData();
  }, [dataType]);

  const getCountryData = (countryName: string): CountrySummaryDto => {
    // Create a comprehensive list of variations to try
    const variations = [
      countryName,
      // Direct matches
      countryName.toLowerCase(),
      countryName.toUpperCase(),
      // US variations
      countryName === 'United States of America' ? 'US' : countryName,
      countryName === 'United States' ? 'US' : countryName,
      countryName === 'USA' ? 'US' : countryName,
      countryName === 'US' ? 'United States of America' : countryName,
      countryName === 'US' ? 'United States' : countryName,
      // UK variations
      countryName === 'United Kingdom' ? 'UK' : countryName,
      countryName === 'UK' ? 'United Kingdom' : countryName,
      // Korea variations
      countryName === 'South Korea' ? 'Korea, South' : countryName,
      countryName === 'Korea, South' ? 'South Korea' : countryName,
      // Myanmar/Burma variations
      countryName === 'Myanmar' ? 'Burma' : countryName,
      countryName === 'Burma' ? 'Myanmar' : countryName,
      // China variations
      countryName === 'China' ? 'China' : countryName,
      // Russia variations
      countryName === 'Russian Federation' ? 'Russia' : countryName,
      // Antarctica variations
      countryName.toLowerCase().includes('antarctica') ? 'Antarctica' : countryName,
      // Province/State mapping - map provinces to their parent countries
      countryName === 'Greenland' ? 'Denmark' : countryName,
      countryName === 'Reunion' ? 'France' : countryName,
      countryName === 'Guadeloupe' ? 'France' : countryName,
      countryName === 'Martinique' ? 'France' : countryName,
      countryName === 'Mayotte' ? 'France' : countryName,
      countryName === 'French Guiana' ? 'France' : countryName,
      countryName === 'New Caledonia' ? 'France' : countryName,
      countryName === 'French Polynesia' ? 'France' : countryName,
      countryName === 'Saint Barthelemy' ? 'France' : countryName,
      countryName === 'Saint Pierre and Miquelon' ? 'France' : countryName,
      countryName === 'St Martin' ? 'France' : countryName,
      countryName === 'Wallis and Futuna' ? 'France' : countryName,
      // Canadian provinces
      countryName === 'Alberta' ? 'Canada' : countryName,
      countryName === 'British Columbia' ? 'Canada' : countryName,
      countryName === 'Manitoba' ? 'Canada' : countryName,
      countryName === 'New Brunswick' ? 'Canada' : countryName,
      countryName === 'Newfoundland and Labrador' ? 'Canada' : countryName,
      countryName === 'Northwest Territories' ? 'Canada' : countryName,
      countryName === 'Nova Scotia' ? 'Canada' : countryName,
      countryName === 'Nunavut' ? 'Canada' : countryName,
      countryName === 'Ontario' ? 'Canada' : countryName,
      countryName === 'Prince Edward Island' ? 'Canada' : countryName,
      countryName === 'Quebec' ? 'Canada' : countryName,
      countryName === 'Saskatchewan' ? 'Canada' : countryName,
      countryName === 'Yukon' ? 'Canada' : countryName,
      countryName === 'Diamond Princess' ? 'Canada' : countryName,
      countryName === 'Grand Princess' ? 'Canada' : countryName,
      countryName === 'Repatriated Travellers' ? 'Canada' : countryName,
      // Australian states
      countryName === 'Australian Capital Territory' ? 'Australia' : countryName,
      countryName === 'New South Wales' ? 'Australia' : countryName,
      countryName === 'Northern Territory' ? 'Australia' : countryName,
      countryName === 'Queensland' ? 'Australia' : countryName,
      countryName === 'South Australia' ? 'Australia' : countryName,
      countryName === 'Tasmania' ? 'Australia' : countryName,
      countryName === 'Victoria' ? 'Australia' : countryName,
      countryName === 'Western Australia' ? 'Australia' : countryName,
      // Chinese provinces
      countryName === 'Anhui' ? 'China' : countryName,
      countryName === 'Beijing' ? 'China' : countryName,
      countryName === 'Chongqing' ? 'China' : countryName,
      countryName === 'Fujian' ? 'China' : countryName,
      countryName === 'Gansu' ? 'China' : countryName,
      countryName === 'Guangdong' ? 'China' : countryName,
      countryName === 'Guangxi' ? 'China' : countryName,
      countryName === 'Guizhou' ? 'China' : countryName,
      countryName === 'Hainan' ? 'China' : countryName,
      countryName === 'Hebei' ? 'China' : countryName,
      countryName === 'Heilongjiang' ? 'China' : countryName,
      countryName === 'Henan' ? 'China' : countryName,
      countryName === 'Hong Kong' ? 'China' : countryName,
      countryName === 'Hubei' ? 'China' : countryName,
      countryName === 'Hunan' ? 'China' : countryName,
      countryName === 'Inner Mongolia' ? 'China' : countryName,
      countryName === 'Jiangsu' ? 'China' : countryName,
      countryName === 'Jiangxi' ? 'China' : countryName,
      countryName === 'Jilin' ? 'China' : countryName,
      countryName === 'Liaoning' ? 'China' : countryName,
      countryName === 'Macau' ? 'China' : countryName,
      countryName === 'Ningxia' ? 'China' : countryName,
      countryName === 'Qinghai' ? 'China' : countryName,
      countryName === 'Shaanxi' ? 'China' : countryName,
      countryName === 'Shandong' ? 'China' : countryName,
      countryName === 'Shanghai' ? 'China' : countryName,
      countryName === 'Shanxi' ? 'China' : countryName,
      countryName === 'Sichuan' ? 'China' : countryName,
      countryName === 'Tianjin' ? 'China' : countryName,
      countryName === 'Tibet' ? 'China' : countryName,
      countryName === 'Unknown' ? 'China' : countryName,
      countryName === 'Xinjiang' ? 'China' : countryName,
      countryName === 'Yunnan' ? 'China' : countryName,
      countryName === 'Zhejiang' ? 'China' : countryName,
      // Danish territories
      countryName === 'Faroe Islands' ? 'Denmark' : countryName,
      // Other special cases
      countryName === 'Diamond Princess' ? 'Diamond Princess' : countryName,
      countryName === 'MS Zaandam' ? 'MS Zaandam' : countryName,
      countryName === 'Summer Olympics 2020' ? 'Summer Olympics 2020' : countryName,
      countryName === 'Winter Olympics 2022' ? 'Winter Olympics 2022' : countryName
    ];
    
    // Try each variation
    for (const variation of variations) {
      if (covidData[variation]) {
        console.log(`Found data for ${countryName} using variation: ${variation}`);
        return covidData[variation];
      }
    }
    
    // Special case for Antarctica - check if it exists in data with any name
    if (countryName.toLowerCase().includes('antarctica')) {
      const antarcticaData = covidData['Antarctica'] || covidData['antarctica'] || covidData['ANTARCTICA'];
      if (antarcticaData) {
        console.log(`Found Antarctica data for ${countryName}`);
        return antarcticaData;
      }
    }
    
    // Debug: Log unmatched countries and available data
    console.log(`No data found for country: ${countryName}`);
    console.log('Available countries:', Object.keys(covidData));
    
    return { 
      country: countryName, 
      confirmed: 0, 
      active: 0, 
      recovered: 0, 
      deaths: 0, 
      dailyIncrease: 0 
    };
  };

  const handleCountryHover = (geo: any, event: React.MouseEvent) => {
    const countryName = geo.properties.name || geo.properties.NAME || geo.properties.NAME_EN || geo.properties.COUNTRY || 'Unknown Country';
    setTooltip({
      country: countryName,
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '600px',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading COVID-19 data...
      </div>
    );
  }

  return (
    <>
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{
          scale: 120,
          center: [0, 0]
        }}
        width={800}
        height={500}
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "800px",
          maxHeight: "500px"
        }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const countryName = geo.properties.name || geo.properties.NAME || geo.properties.NAME_EN || geo.properties.COUNTRY || 'Unknown Country';
              const countryData = getCountryData(countryName);
              
              let dataValue = 0;
              switch (dataType) {
                case 'confirmed': dataValue = countryData.confirmed; break;
                case 'deaths': dataValue = countryData.deaths; break;
                case 'recovered': dataValue = countryData.recovered; break;
                case 'active': dataValue = countryData.active; break;
                case 'daily': dataValue = countryData.dailyIncrease; break;
                default: dataValue = 0;
              }
              
              // Antarctica should now be visible with better color scaling
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseMove={(event) => handleCountryHover(geo, event)}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    default: {
                      fill: getColorForValue(dataValue, dataType, covidData),
                      stroke: "#ffffff",
                      strokeWidth: 0.5,
                      outline: "none",
                      cursor: "default"
                    },
                    hover: {
                      fill: getColorForValue(dataValue, dataType, covidData),
                      stroke: "#ffffff",
                      strokeWidth: 1,
                      outline: "none",
                      cursor: "default"
                    }
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="map-tooltip"
          style={{
            position: 'fixed',
            left: tooltip.x + 10,
            top: tooltip.y - 30,
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {tooltip.country}
          </div>
          <div style={{ fontSize: '12px' }}>
            {dataType.charAt(0).toUpperCase() + dataType.slice(1)}: {
              (() => {
                const countryData = getCountryData(tooltip.country);
                let value = 0;
                switch (dataType) {
                  case 'confirmed': value = countryData.confirmed; break;
                  case 'deaths': value = countryData.deaths; break;
                  case 'recovered': value = countryData.recovered; break;
                  case 'active': value = countryData.active; break;
                  case 'daily': value = countryData.dailyIncrease; break;
                  default: value = 0;
                }
                return value.toLocaleString();
              })()
            }
          </div>
        </div>
      )}
    </>
  );
};

export default WorldMap;
