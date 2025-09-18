
import React, { useState } from 'react';
import { Treemap, ResponsiveContainer } from 'recharts';
import rawData from '../data/confirmed.json';
import Dialog from './Dialog';

interface CountryData {
  name: string;
  size: number;
}

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

  const processData = (): CountryData[] => {
    const countryCases: { [key: string]: number } = {};

    rawData.forEach((record) => {
      const country = record['Country/Region'];
      const dates = Object.keys(record).filter((key) => key.match(/\d+\/\d+\/\d+/));
      const latestDate = dates[dates.length - 1];
      const cases = parseInt(record[latestDate as keyof typeof record] as string, 10);

      if (!isNaN(cases)) {
        if (countryCases[country]) {
          countryCases[country] += cases;
        } else {
          countryCases[country] = cases;
        }
      }
    });

    const totalCases = Object.values(countryCases).reduce((acc, val) => acc + val, 0);

    const processedData = Object.keys(countryCases)
      .map((country) => ({
        name: country,
        size: countryCases[country],
        percentage: (countryCases[country] / totalCases) * 100,
      }))
      .filter((country) => country.size > 0)
      .sort((a, b) => b.size - a.size);

    return processedData.map((country) => ({
      name: `${country.name} - ${country.size.toLocaleString()} (${country.percentage.toFixed(2)}%)`,
      size: country.size,
    }));
  };

  const data = processData();

  const handleTreemapClick = (data: any) => {
    if (data) {
      setSelectedCountry(data);
    }
  };

  return (
    <>
      <ResponsiveContainer width="100%" height={400}>
        <Treemap
          data={data}
          dataKey="size"
          ratio={4 / 3}
          stroke="#fff"
          fill="#8884d8"
          content={<CustomizedContent />}
          onClick={handleTreemapClick}
          isAnimationActive={false}
        />
      </ResponsiveContainer>

      <Dialog isOpen={!!selectedCountry} onClose={() => setSelectedCountry(null)}>
        {selectedCountry && (
          <div className="selected-country-details">
            <h3>{selectedCountry.name.split('-')[0].trim()}</h3>
            <p>Total Cases: {selectedCountry.size.toLocaleString()}</p>
            <p>Percentage of Worldwide Cases: {selectedCountry.name.match(/\((.*)\)/)?.[1]}</p>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default TreemapChart;
