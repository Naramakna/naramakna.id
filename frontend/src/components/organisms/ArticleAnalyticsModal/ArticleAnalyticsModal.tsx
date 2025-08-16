import React, { useState, useEffect } from 'react';
import { AnalyticsChart } from '../AnalyticsChart';

interface AnalyticsData {
  totalViews: number;
  todayViews: number;
  weeklyViews: number;
  monthlyViews: number;
  viewsByDay: Array<{ date: string; views: number }>;
  countries: Array<{ country: string; views: number }>;
  devices: Array<{ device: string; views: number }>;
}

interface ArticleAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: string;
  articleTitle: string;
}

export const ArticleAnalyticsModal: React.FC<ArticleAnalyticsModalProps> = ({
  isOpen,
  onClose,
  articleId,
  articleTitle
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && articleId) {
      fetchAnalytics();
    }
  }, [isOpen, articleId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Mock data untuk demo - bisa diganti dengan API call
      setTimeout(() => {
        const mockData: AnalyticsData = {
          totalViews: Math.floor(Math.random() * 10000) + 500,
          todayViews: Math.floor(Math.random() * 100) + 10,
          weeklyViews: Math.floor(Math.random() * 1000) + 100,
          monthlyViews: Math.floor(Math.random() * 5000) + 500,
          viewsByDay: [
            { date: '2025-01-10', views: 45 },
            { date: '2025-01-11', views: 67 },
            { date: '2025-01-12', views: 89 },
            { date: '2025-01-13', views: 123 },
            { date: '2025-01-14', views: 98 },
            { date: '2025-01-15', views: 156 },
            { date: '2025-01-16', views: 134 }
          ],
          countries: [
            { country: 'Indonesia', views: 1234 },
            { country: 'Malaysia', views: 567 },
            { country: 'Singapore', views: 234 },
            { country: 'Thailand', views: 123 }
          ],
          devices: [
            { device: 'Mobile', views: 1567 },
            { device: 'Desktop', views: 891 },
            { device: 'Tablet', views: 234 }
          ]
        };
        setAnalyticsData(mockData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">📊 Analytics</h2>
            <p className="text-sm text-gray-600 mt-1">{articleTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading analytics...</p>
            </div>
          ) : analyticsData ? (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-blue-500 text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-600">Total Views</p>
                      <p className="text-lg font-bold text-gray-900">{analyticsData.totalViews.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-green-500 text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-600">Today</p>
                      <p className="text-lg font-bold text-gray-900">{analyticsData.todayViews.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-purple-500 text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-600">This Week</p>
                      <p className="text-lg font-bold text-gray-900">{analyticsData.weeklyViews.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-orange-500 text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-600">This Month</p>
                      <p className="text-lg font-bold text-gray-900">{analyticsData.monthlyViews.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Views Trend */}
                <AnalyticsChart
                  title="📈 Views Trend (Last 7 Days)"
                  data={analyticsData.viewsByDay.map(item => ({
                    date: item.date,
                    views: item.views
                  }))}
                  type="line"
                  color="#3B82F6"
                  loading={loading}
                />

                {/* Top Countries */}
                <AnalyticsChart
                  title="🌍 Views by Country"
                  data={analyticsData.countries.map(item => ({
                    label: item.country,
                    value: item.views
                  }))}
                  type="doughnut"
                  color="#10B981"
                  loading={loading}
                />
              </div>

              {/* Device Types */}
              <div className="w-full lg:w-1/2">
                <AnalyticsChart
                  title="📱 Device Types"
                  data={analyticsData.devices.map(item => ({
                    label: item.device,
                    value: item.views
                  }))}
                  type="doughnut"
                  color="#8B5CF6"
                  loading={loading}
                />
              </div>

              {/* Note */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Note:</span> Analytics data is simplified for public viewing. 
                  Advanced analytics are available for administrators and authors.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No analytics data available for this article.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
