import React from 'react';
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
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ChartData {
  date?: string;
  views?: number;
  label?: string;
  value?: number;
  country?: string;
  device_type?: string;
  gender?: string;
}

interface AnalyticsChartProps {
  data: ChartData[];
  title: string;
  loading?: boolean;
  type?: 'line' | 'bar' | 'doughnut';
  color?: string;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data,
  title,
  loading = false,
  type = 'line',
  color = '#3B82F6'
}) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  // Prepare data based on chart type
  const prepareChartData = () => {
    if (type === 'doughnut') {
      // For doughnut charts (demographics data)
      const colors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
      ];
      
      return {
        labels: data.map(item => 
          item.label || item.country || item.device_type || item.gender || 'Unknown'
        ),
        datasets: [{
          data: data.map(item => item.value || item.views || 0),
          backgroundColor: colors.slice(0, data.length),
          borderColor: colors.slice(0, data.length),
          borderWidth: 2,
        }]
      };
    } else {
      // For line and bar charts (timeline data)
      return {
        labels: data.map(item => {
          if (item.date) {
            return new Date(item.date).toLocaleDateString('id-ID', { 
              month: 'short', 
              day: 'numeric' 
            });
          }
          return item.label || 'Unknown';
        }),
        datasets: [{
          label: 'Views',
          data: data.map(item => item.views || item.value || 0),
          borderColor: color,
          backgroundColor: type === 'bar' ? `${color}20` : color,
          borderWidth: 2,
          fill: type === 'line',
          tension: 0.4,
        }]
      };
    }
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: type === 'doughnut' ? 'right' : 'top',
        display: type === 'doughnut',
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            if (type === 'doughnut') {
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((context.raw / total) * 100).toFixed(1);
              return `${context.label}: ${context.raw} (${percentage}%)`;
            }
            return `Views: ${context.raw}`;
          }
        }
      }
    },
    scales: type !== 'doughnut' ? {
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6',
        },
        ticks: {
          color: '#6B7280',
        }
      },
      x: {
        grid: {
          color: '#F3F4F6',
        },
        ticks: {
          color: '#6B7280',
        }
      }
    } : undefined
  };

  const chartData = prepareChartData();

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={chartOptions} />;
      default:
        return <Line data={chartData} options={chartOptions} />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        {renderChart()}
      </div>
    </div>
  );
};
