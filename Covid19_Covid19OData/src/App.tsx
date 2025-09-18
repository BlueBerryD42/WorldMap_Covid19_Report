import { useState, useCallback } from 'react'
import WorldMap from './components/WorldMap'
import ColorLegend from './components/ColorLegend'
import type { CountrySummaryDto } from './services/covidApiService'
import './App.css'

type DataType = 'confirmed' | 'active' | 'recovered' | 'deaths' | 'daily';

function App() {
  const [selectedDataType, setSelectedDataType] = useState<DataType>('confirmed');
  const [covidData, setCovidData] = useState<Record<string, CountrySummaryDto>>({});
  const [getColorForValue, setGetColorForValue] = useState<((value: number, dataType: string) => string) | null>(null);

  const dataTypes = [
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'active', label: 'Active' },
    { key: 'recovered', label: 'Recovered' },
    { key: 'deaths', label: 'Deaths' },
    { key: 'daily', label: 'Daily Increase' }
  ] as const;

  const handleDataReady = useCallback((data: Record<string, CountrySummaryDto>, colorFunction: (value: number, dataType: string) => string) => {
    setCovidData(data);
    setGetColorForValue(() => colorFunction);
  }, []);

  return (
    <div className="covid-dashboard">
      <div className="dashboard-container">
        <h1 className="dashboard-title"># of Cases World wide</h1>
        
        <div className="data-buttons">
          {dataTypes.map(({ key, label }) => (
            <button
              key={key}
              className={`data-button ${selectedDataType === key ? 'active' : ''}`}
              onClick={() => setSelectedDataType(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="main-content">
          <div className="map-section">
            <WorldMap dataType={selectedDataType} onDataReady={handleDataReady} />
          </div>
          
          {getColorForValue && Object.keys(covidData).length > 0 && (
            <div className="legend-section">
              <ColorLegend 
                dataType={selectedDataType} 
                covidData={covidData} 
                getColorForValue={getColorForValue} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
