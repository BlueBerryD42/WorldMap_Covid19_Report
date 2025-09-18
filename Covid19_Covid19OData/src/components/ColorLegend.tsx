import React from 'react';
import type { CountrySummaryDto } from '../services/covidApiService';

interface ColorLegendProps {
  dataType: 'confirmed' | 'active' | 'recovered' | 'deaths' | 'daily';
  covidData: Record<string, CountrySummaryDto>;
  getColorForValue: (value: number, dataType: string) => string;
}

const ColorLegend: React.FC<ColorLegendProps> = ({ dataType, covidData, getColorForValue }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      minWidth: '120px',
      maxWidth: '150px',
      padding: '15px',
      backgroundColor: '#f9f9f9',
      borderRadius: '10px',
      border: '1px solid #ddd',
      height: 'fit-content',
      flexShrink: 0
    }}>
      <h3 style={{ 
        margin: '0 0 10px 0', 
        fontSize: '14px', 
        color: '#333',
        textAlign: 'center'
      }}>
        {dataType.charAt(0).toUpperCase() + dataType.slice(1)} Cases
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        {/* No Data */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: '#d3d3d3',
            border: '1px solid #999',
            borderRadius: '3px'
          }}></div>
          <span style={{ fontSize: '12px', color: '#666' }}>No Data</span>
        </div>

        {/* Color Scale */}
        {(() => {
          // Ensure covidData is not empty before calculating maxValue
          const hasData = Object.keys(covidData).length > 0;
          const maxValue = hasData 
            ? Math.max(...Object.values(covidData).map((data: CountrySummaryDto) => {
                switch (dataType) {
                  case 'confirmed': return data.confirmed;
                  case 'deaths': return data.deaths;
                  case 'recovered': return data.recovered;
                  case 'active': return data.active;
                  case 'daily': return data.dailyIncrease;
                  default: return 0;
                }
              }))
            : 0;
          const steps = 5;
          const stepValue = maxValue / steps;
          
          return hasData ? Array.from({ length: steps }, (_, i) => {
            const value = Math.round(stepValue * (i + 1));
            const color = getColorForValue(value, dataType);
            
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  backgroundColor: color,
                  border: '1px solid #999',
                  borderRadius: '3px'
                }}></div>
                <span style={{ fontSize: '12px', color: '#333' }}>
                  {value.toLocaleString()}+
                </span>
              </div>
            );
          }) : null;
        })()}
      </div>
    </div>
  );
};

export default ColorLegend;