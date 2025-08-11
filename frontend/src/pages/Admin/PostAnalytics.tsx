import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { Navbar } from '../../components/organisms/Navbar/Navbar';
import { AnalyticsChart } from '../../components/organisms/AnalyticsChart';

interface PostData {
  id: number;
  title: string;
  author: string;
  published_date: string;
  word_count: number;
  estimated_reading_time: number;
}

interface Overview {
  total_views: number;
  estimated_reading_time_minutes: number;
}

interface Demographics {
  countries: Array<{ country: string; views: number }>;
  cities: Array<{ city: string; region: string; views: number }>;
  gender: Array<{ gender: string; views: number }>;
  devices: Array<{ device_type: string; views: number }>;
}

interface Timeline {
  date: string;
  views: number;
}

interface AnalyticsData {
  post: PostData;
  period: {
    start: string;
    end: string;
    period_name: string;
  };
  overview: Overview;
  demographics: Demographics;
  timeline: Timeline[];
  engagement: Record<string, number>;
}

const PostAnalytics: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [postId, setPostId] = useState<string>('');

  // Get post ID from URL
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/posts\/(\d+)\/analytics/);
    if (match) {
      setPostId(match[1]);
    }
  }, []);

  // Fetch analytics data
  useEffect(() => {
    if (postId && isAuthenticated) {
      fetchAnalyticsData();
    }
  }, [postId, period, isAuthenticated]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/analytics/post/${postId}/detailed?period=${period}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setAnalyticsData(data.data);
      } else {
        console.error('Failed to fetch analytics:', data.message);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check access permission
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need to be logged in to view analytics.</p>
        </div>
      </div>
    );
  }

  // Check if user has permission (admin, superadmin, or post author)
  const hasPermission = ['admin', 'superadmin'].includes(user.user_role);

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to view post analytics.</p>
          </div>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Post Analytics</h1>
              {analyticsData && (
                <p className="mt-1 text-sm text-gray-600">
                  Analytics for "{analyticsData.post.title}" by {analyticsData.post.author}
                </p>
              )}
            </div>
            
            {/* Period Selector */}
            <div className="flex space-x-2">
              {['week', 'month', 'year'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    period === p
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        ) : analyticsData ? (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Views</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatNumber(analyticsData.overview.total_views)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Reading Time</p>
                    <p className="text-2xl font-semibold text-gray-900">{analyticsData.overview.estimated_reading_time_minutes} min</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Word Count</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatNumber(analyticsData.post.word_count)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Published</p>
                    <p className="text-lg font-semibold text-gray-900">{formatDate(analyticsData.post.published_date)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Demographics Charts */}
              <div className="space-y-6">
                <AnalyticsChart
                  title="Top Countries"
                  data={analyticsData.demographics.countries.map(country => ({
                    label: country.country || 'Unknown',
                    value: country.views
                  }))}
                  type="doughnut"
                  loading={loading}
                />

                <AnalyticsChart
                  title="Regional Distribution (Indonesia)"
                  data={analyticsData.demographics.cities.map(city => ({
                    label: `${city.city}${city.region && city.region !== 'Unknown' ? `, ${city.region}` : ''}`,
                    value: city.views
                  }))}
                  type="doughnut"
                  color="#F59E0B"
                  loading={loading}
                />
                
                <AnalyticsChart
                  title="Device Types"
                  data={analyticsData.demographics.devices.map(device => ({
                    label: device.device_type,
                    value: device.views
                  }))}
                  type="doughnut"
                  color="#10B981"
                  loading={loading}
                />
              </div>

              {/* Timeline Chart */}
              <AnalyticsChart
                title="Views Timeline"
                data={analyticsData.timeline.map(item => ({
                  date: item.date,
                  views: item.views
                }))}
                type="line"
                color="#EF4444"
                loading={loading}
              />
            </div>

            {/* Engagement */}
            {Object.keys(analyticsData.engagement).length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Engagement Metrics</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(analyticsData.engagement).map(([eventType, count]) => (
                      <div key={eventType} className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{formatNumber(count)}</div>
                        <div className="text-sm text-gray-600 capitalize">{eventType.replace('_', ' ')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No analytics data available for this post.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostAnalytics;
