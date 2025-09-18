
import React, { useState, useEffect } from 'react';
import { Treemap, ResponsiveContainer } from 'recharts';
import { covidApiService } from '../services/covidApiService';
import Dialog from './Dialog';

interface CountryData {
  name: string;
  size: number;
}

type DataType = 'confirmed' | 'active' | 'recovered' | 'deaths' | 'daily';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const CustomizedContent = (props: any) => {
  const { depth, x, y, width, height, index, name } = props;
  const fontSize = 12;

  let truncatedText = name;
  const estimatedCharWidth = fontSize * 0.6;
  const maxChars = Math.floor(width / estimatedCharWidth);

  if (name.length > maxChars) {
    truncatedText = name.substring(0, maxChars - 3) + '...';
  }

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: COLORS[index % COLORS.length],
          stroke: '#fff',
          strokeWidth: 2,
          strokeOpacity: 1,
        }}
      />
      {width > 40 && height > 40 && (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={fontSize} style={{ pointerEvents: 'none' }}>
          {truncatedText}
        </text>
      )}
    </g>
  );
};


const TreemapChart = () => {
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [selectedDataType, setSelectedDataType] = useState<DataType>('confirmed');
  const [data, setData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);

  const dataTypes = [
    { key: 'confirmed', label: 'Confirmed', color: '#ff6b6b' },
    { key: 'active', label: 'Active', color: '#4ecdc4' },
    { key: 'recovered', label: 'Recovered', color: '#45b7d1' },
    { key: 'deaths', label: 'Deaths', color: '#96ceb4' },
    { key: 'daily', label: 'Daily Increase', color: '#feca57' }
  ] as const;

  const fetchData = async (dataType: DataType) => {
    try {
      setLoading(true);
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
      }
      
      const processedData = processData(dataResponse, dataType);
      setData(processedData);
    } catch (error) {
      console.error(`Error fetching ${dataType} data for tree map:`, error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const processData = (dataResponse: Record<string, { country: string; value: number }>, dataType: DataType): CountryData[] => {
    const countryCases: { [key: string]: number } = {};

    Object.entries(dataResponse).forEach(([country, item]) => {
      countryCases[country] = item.value;
    });

    const totalCases = Object.values(countryCases).reduce((acc, val) => acc + val, 0);

    const processedData = Object.keys(countryCases)
      .map((country) => ({
        name: country,
        size: countryCases[country],
        percentage: (countryCases[country] / totalCases) * 100,
      }))
      .filter((country) => country.size > 0)
      .sort((a, b) => b.size - a.size)
      .slice(0, 50); // Top 50 countries for better visualization

    return processedData.map((country) => ({
      name: `${country.name} - ${country.size.toLocaleString()} (${country.percentage.toFixed(2)}%)`,
      size: country.size,
    }));
  };

  useEffect(() => {
    fetchData(selectedDataType);
  }, [selectedDataType]);

  const handleTreemapClick = (data: any) => {
    if (data) {
      setSelectedCountry(data);
    }
  };

  const currentDataType = dataTypes.find(dt => dt.key === selectedDataType);

  return (
    <div className="treemap-chart-container">
      <div className="treemap-header">
        <h3>COVID-19 {currentDataType?.label} Data - Tree Map</h3>
        
        <div className="data-buttons">
          {dataTypes.map(({ key, label, color }) => (
            <button
              key={key}
              className={`data-button ${selectedDataType === key ? 'active' : ''}`}
              onClick={() => setSelectedDataType(key)}
              style={{ 
                borderColor: color,
                backgroundColor: selectedDataType === key ? color : 'white',
                color: selectedDataType === key ? 'white' : color
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading tree map data...</div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <Treemap
            data={data}
            dataKey="size"
            ratio={4 / 3}
            stroke="#fff"
            fill={currentDataType?.color || '#8884d8'}
            content={<CustomizedContent />}
            onClick={handleTreemapClick}
            isAnimationActive={false}
          />
        </ResponsiveContainer>
      )}

      <Dialog isOpen={!!selectedCountry} onClose={() => setSelectedCountry(null)}>
        {selectedCountry && (
          <div className="selected-country-details">
            <h3>{selectedCountry.name.split('-')[0].trim()}</h3>
            <p>Total {currentDataType?.label}: {selectedCountry.size.toLocaleString()}</p>
            <p>Percentage of Worldwide {currentDataType?.label}: {selectedCountry.name.match(/\((.*)\)/)?.[1]}</p>
          </div>
        )}
      </Dialog>

      <style jsx>{`
        .treemap-chart-container {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .treemap-header {
          margin-bottom: 20px;
          text-align: center;
        }
        
        .treemap-header h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 1.5em;
        }
        
        .data-buttons {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .data-button {
          padding: 8px 16px;
          border: 2px solid;
          background: white;
          border-radius: 5px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .data-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        .data-button.active {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
          font-size: 1.1em;
        }
      `}</style>
    </div>
  );
};

export default TreemapChart;
