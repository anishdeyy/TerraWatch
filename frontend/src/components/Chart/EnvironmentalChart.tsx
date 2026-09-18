import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { MetricTrendPoint } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EnvironmentalChartProps {
  trends: MetricTrendPoint[];
  title?: string;
  chartType?: 'carbon' | 'biodiversity' | 'ndvi' | 'rainfall' | 'soil' | 'water';
  comparisonTrends?: MetricTrendPoint[];
  comparisonLabel?: string;
  siteName?: string;
}

export const EnvironmentalChart: React.FC<EnvironmentalChartProps> = ({
  trends = [],
  title,
  chartType = 'carbon',
  comparisonTrends,
  comparisonLabel = 'Comparative Site',
  siteName = 'Primary Site'
}) => {
  const [dateRange, setDateRange] = useState<'7D' | '30D' | '3M' | '6M' | '1Y' | 'ALL'>('1Y');

  // Filter trends according to dateRange
  const getFilteredTrends = () => {
    if (!trends || trends.length === 0) return [];
    switch (dateRange) {
      case '7D':
      case '30D':
        return trends.slice(-2);
      case '3M':
        return trends.slice(-3);
      case '6M':
        return trends.slice(-6);
      case '1Y':
        return trends.slice(-12);
      case 'ALL':
      default:
        return trends;
    }
  };

  const filtered = getFilteredTrends();
  const labels = filtered.map(t => t.date);

  // Configure Chart Data by chartType
  let data: any = { labels, datasets: [] };
  let yAxisLabel = '';

  if (chartType === 'carbon') {
    yAxisLabel = 'tC / ha';
    data = {
      labels,
      datasets: [
        {
          label: `${siteName} — Carbon Stock (tC/ha)`,
          data: filtered.map(t => t.carbon_stock),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: '#064e3b'
        },
        ...(comparisonTrends
          ? [
              {
                label: `${comparisonLabel} — Carbon Stock`,
                data: comparisonTrends.slice(-filtered.length).map(t => t.carbon_stock),
                borderColor: '#3b82f6',
                borderDash: [5, 5],
                fill: false,
                tension: 0.35
              }
            ]
          : [])
      ]
    };
  } else if (chartType === 'biodiversity') {
    yAxisLabel = 'Index (0-100)';
    data = {
      labels,
      datasets: [
        {
          label: 'Biodiversity Score (0 - 100)',
          data: filtered.map(t => t.biodiversity_score),
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: '#5b21b6'
        }
      ]
    };
  } else if (chartType === 'ndvi') {
    yAxisLabel = 'NDVI Index (-1.0 to +1.0)';
    data = {
      labels,
      datasets: [
        {
          label: 'Normalized Difference Vegetation Index (NDVI)',
          data: filtered.map(t => t.ndvi),
          borderColor: '#059669',
          backgroundColor: 'rgba(5, 150, 105, 0.15)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#065f46'
        }
      ]
    };
  } else if (chartType === 'rainfall') {
    yAxisLabel = 'Precipitation (mm)';
    data = {
      labels,
      datasets: [
        {
          type: 'bar' as const,
          label: 'Monthly Rainfall (mm)',
          data: filtered.map(t => t.rainfall),
          backgroundColor: 'rgba(59, 130, 246, 0.65)',
          borderColor: '#2563eb',
          borderRadius: 6
        },
        {
          type: 'line' as const,
          label: 'Temperature (°C)',
          data: filtered.map(t => t.temperature),
          borderColor: '#f59e0b',
          yAxisID: 'y1',
          tension: 0.4
        }
      ]
    };
  } else if (chartType === 'soil') {
    yAxisLabel = 'Soil Indices';
    data = {
      labels,
      datasets: [
        {
          label: 'Soil Organic Carbon (%)',
          data: filtered.map(t => t.soil_organic_carbon),
          borderColor: '#d97706',
          backgroundColor: 'rgba(217, 119, 6, 0.1)',
          tension: 0.3
        },
        {
          label: 'Soil Moisture (%)',
          data: filtered.map(t => t.soil_moisture),
          borderColor: '#0284c7',
          backgroundColor: 'rgba(2, 132, 199, 0.1)',
          tension: 0.3
        },
        {
          label: 'Soil pH',
          data: filtered.map(t => t.soil_ph),
          borderColor: '#6b7280',
          borderDash: [4, 4],
          tension: 0.2
        }
      ]
    };
  } else if (chartType === 'water') {
    yAxisLabel = 'Water Stress (%)';
    data = {
      labels,
      datasets: [
        {
          label: 'Water Stress Index (%)',
          data: filtered.map(t => t.water_stress),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: '#b91c1c'
        }
      ]
    };
  }

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          font: { family: 'Inter', size: 11, weight: '500' }
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: 'Inter', size: 12, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 11 },
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { family: 'Inter', size: 11 } }
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { family: 'Inter', size: 11 } },
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel,
          font: { family: 'Inter', size: 11, weight: '600' }
        }
      },
      ...(chartType === 'rainfall'
        ? {
            y1: {
              type: 'linear' as const,
              display: true,
              position: 'right' as const,
              grid: { drawOnChartArea: false },
              title: {
                display: true,
                text: 'Temperature (°C)',
                font: { family: 'Inter', size: 11, weight: '600' }
              }
            }
          }
        : {})
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="font-bold text-slate-800 text-sm">
          {title || `${chartType.toUpperCase()} Temporal Trajectory`}
        </h3>

        {/* Date Range Selector (Section 10) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-600 self-start sm:self-auto">
          {(['7D', '30D', '3M', '6M', '1Y', 'ALL'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-2 py-1 rounded-md transition-colors ${
                dateRange === range
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full">
        {chartType === 'rainfall' ? (
          <Bar data={data} options={options} />
        ) : (
          <Line data={data} options={options} />
        )}
      </div>
    </div>
  );
};
