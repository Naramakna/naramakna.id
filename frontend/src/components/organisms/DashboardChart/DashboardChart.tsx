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
import { Line, Bar } from 'react-chartjs-2';

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

interface DashboardChartData {
  label: string;
  value: number;
  date?: string;
}

interface DashboardChartProps {
  data: DashboardChartData[];
  title: string;
  type?: 'line' | 'bar';
  color?: string;
  height?: string;
}

export const DashboardChart: React.FC<DashboardChartProps> = ({
  data,
  title,
  type = 'line',
  color = '#3B82F6',
  height = '200px'
}) => {
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [{
      label: title,
      data: data.map(item => item.value),
      borderColor: color,
      backgroundColor: type === 'bar' ? `${color}40` : `${color}10`,
      borderWidth: 2,
      fill: type === 'line',
      tension: 0.4,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 10,
          }
        }
      },
      x: {
        grid: {
          color: '#F3F4F6',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 10,
          }
        }
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h4 className="text-sm font-medium text-gray-900 mb-3">{title}</h4>
      <div style={{ height }}>
        {type === 'bar' ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
};
