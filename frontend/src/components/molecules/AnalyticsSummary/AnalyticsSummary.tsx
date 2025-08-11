import React from 'react';

interface SummaryData {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface AnalyticsSummaryProps {
  data: SummaryData[];
  title: string;
}

export const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({
  data,
  title
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map((item, index) => (
          <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
            {item.icon && (
              <div className="flex justify-center mb-2">
                {item.icon}
              </div>
            )}
            <div className="text-2xl font-bold text-gray-900">{item.value}</div>
            <div className="text-sm text-gray-600">{item.label}</div>
            {item.trend && (
              <div className={`text-xs mt-1 ${
                item.trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {item.trend.isPositive ? '↗' : '↘'} {Math.abs(item.trend.value)}%
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
