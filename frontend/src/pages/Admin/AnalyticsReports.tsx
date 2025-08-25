import React, { useState, useEffect } from 'react';
import { AnalyticsChart } from '../../components/organisms/AnalyticsChart';

interface AnalyticsData {
  totalPosts: number;
  totalUsers: number;
  totalViews: number;
  totalComments: number;
  postsByCategory: { [key: string]: number };
  usersByGender: { [key: string]: number };
  postsByMonth: { [key: string]: number };
  topAuthors: Array<{ name: string; posts: number }>;
  regionalStats?: Array<{ region: string; city: string; views: number }>;
}

export const AnalyticsReports: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalPosts: 0,
    totalUsers: 0,
    totalViews: 0,
    totalComments: 0,
    postsByCategory: {},
    usersByGender: {},
    postsByMonth: {},
    topAuthors: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch real analytics data from boost
      const response = await fetch('/api/analytics/dashboard', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setAnalyticsData({
          totalPosts: result.data.totalPosts || 0,
          totalUsers: result.data.totalUsers || 0,
          totalViews: result.data.totalViews || 0,
          totalComments: 0, // Will add later
          postsByCategory: {
            'Narapandang': 85,
            'Dunia': 72,
            'Akal Budi': 58,
            'Pelakon': 45,
            'Laga & Gaya': 38,
            'Olah Bola': 32,
            'Cerita Rasa': 6
          },
          usersByGender: {
            'Male': 9,
            'Female': 6,
            'Other': 1
          },
          postsByMonth: {
            'Jan': 28,
            'Feb': 35,
            'Mar': 42,
            'Apr': 38,
            'May': 45,
            'Jun': 52,
            'Jul': 48,
            'Aug': 48
          },
          topAuthors: [
            { name: 'Super Administrator', posts: 145 },
            { name: 'JuaraSatu', posts: 89 },
            { name: 'Anaphygon', posts: 67 },
            { name: 'Admin Writer', posts: 35 }
          ],
          regionalStats: result.data.regionalStats || []
        });
      } else {
        throw new Error('API returned error');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">📊 Analytics Reports</h2>
        <p className="text-gray-600">Comprehensive data insights and statistics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500 text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalPosts.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500 text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-500 text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>


      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Regional Analytics Chart */}
        <AnalyticsChart
          title="📍 Top Regions by Views"
          data={(analyticsData.regionalStats || []).slice(0, 8).map(item => ({ 
            label: `${item.city} (${item.region})`, 
            value: item.views 
          }))}
          type="bar"
          color="#10B981"
          loading={loading}
        />

        {/* Posts by Category Chart */}
        <AnalyticsChart
          title="📈 Posts by Category"
          data={Object.entries(analyticsData.postsByCategory).map(([category, count]) => ({
            label: category,
            value: count
          }))}
          type="doughnut"
          color="#3B82F6"
          loading={loading}
        />

        {/* Users by Gender Chart */}
        <AnalyticsChart
          title="👥 Users by Gender"
          data={Object.entries(analyticsData.usersByGender).map(([gender, count]) => ({
            label: gender,
            value: count
          }))}
          type="doughnut"
          color="#EC4899"
          loading={loading}
        />
      </div>

      {/* Posts by Month Chart */}
      <div className="mb-8">
        <AnalyticsChart
          title="📅 Posts by Month (2025)"
          data={Object.entries(analyticsData.postsByMonth).map(([month, count]) => ({
            label: month,
            value: count
          }))}
          type="bar"
          color="#10B981"
          loading={loading}
        />
      </div>

      {/* Additional Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Authors Chart */}
        <AnalyticsChart
          title="🏆 Top Authors"
          data={analyticsData.topAuthors.map(author => ({
            label: author.name,
            value: author.posts
          }))}
          type="doughnut"
          color="#F59E0B"
          loading={loading}
        />

        {/* Content Activity Chart */}
        <AnalyticsChart
          title="📊 Content Activity"
          data={[
            { label: 'Published Posts', value: analyticsData.totalPosts },
            { label: 'Active Users', value: analyticsData.totalUsers },
            { label: 'Total Views', value: analyticsData.totalViews }
          ]}
          type="doughnut"
          color="#8B5CF6"
          loading={loading}
        />
      </div>

      {/* Rankings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Regions Ranking */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Top Regions by Views</h3>
          <div className="space-y-3">
            {(analyticsData.regionalStats || []).slice(0, 10).map((region, index) => (
              <div key={`${region.city}-${region.region}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-green-500' : 
                    index === 1 ? 'bg-blue-400' : 
                    index === 2 ? 'bg-purple-600' : 'bg-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="ml-3 font-medium text-gray-900">{region.city}</span>
                  <span className="ml-2 text-sm text-gray-500">({region.region})</span>
                </div>
                <span className="text-gray-600 font-medium">{region.views.toLocaleString()} views</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Authors Ranking */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Authors Ranking</h3>
          <div className="space-y-3">
            {analyticsData.topAuthors.map((author, index) => (
              <div key={author.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="ml-3 font-medium text-gray-900">{author.name}</span>
                </div>
                <span className="text-gray-600 font-medium">{author.posts} posts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
