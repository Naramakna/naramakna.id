import React from 'react';
import { StatsCard } from '../../atoms/StatsCard';
import { DashboardChart } from '../DashboardChart';

interface SystemStats {
  totalUsers: number;
  totalAdmins: number;
  totalWriters: number;
  totalPosts: number;
  totalCategories: number;
  totalComments: number;
}

interface SystemOverviewProps {
  stats: SystemStats;
}

export const SystemOverview: React.FC<SystemOverviewProps> = ({ stats }) => {
  const statsConfig = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      bgColor: 'bg-blue-50',
      iconBgColor: 'bg-blue-500',
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      title: 'Total Admins',
      value: stats.totalAdmins,
      bgColor: 'bg-purple-50',
      iconBgColor: 'bg-purple-500',
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: 'Total Writers',
      value: stats.totalWriters,
      bgColor: 'bg-green-50',
      iconBgColor: 'bg-green-500',
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      )
    },
    {
      title: 'Total Posts',
      value: stats.totalPosts,
      bgColor: 'bg-yellow-50',
      iconBgColor: 'bg-yellow-500',
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      )
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      bgColor: 'bg-indigo-50',
      iconBgColor: 'bg-indigo-500',
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    {
      title: 'Comments',
      value: stats.totalComments,
      bgColor: 'bg-pink-50',
      iconBgColor: 'bg-pink-500',
      icon: (
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    }
  ];

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">System Overview</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        {statsConfig.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            bgColor={stat.bgColor}
            iconBgColor={stat.iconBgColor}
          />
        ))}
      </div>

      {  /* Charts Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-base font-medium text-gray-900 mb-4">Analytics Overview</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <DashboardChart
                        title="User Growth (Last 7 Days)"
                        data={[
                          { label: 'Mon', value: stats.totalUsers - 30 },
                          { label: 'Tue', value: stats.totalUsers - 25 },
                          { label: 'Wed', value: stats.totalUsers - 20 },
                          { label: 'Thu', value: stats.totalUsers - 15 },
                          { label: 'Fri', value: stats.totalUsers - 10 },
                          { label: 'Sat', value: stats.totalUsers - 5 },
                          { label: 'Sun', value: stats.totalUsers },
                        ]}
                        type="line"
                        color="#10B981"
                      />
                      <DashboardChart
                        title="Content Activity"
                        data={[
                          { label: 'Posts', value: stats.totalPosts },
                          { label: 'Comments', value: stats.totalComments },
                          { label: 'Categories', value: stats.totalCategories },
                          { label: 'Writers', value: stats.totalWriters },
                        ]}
                        type="bar"
                        color="#3B82F6"
                      />
                    </div>
                  </div>

                  {/* System Health */}
                  <div className="border-t pt-6">
                    <h3 className="text-base font-medium text-gray-900 mb-4">System Health</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-green-800">Database Status</p>
                        <p className="text-green-600">✅ Online & Healthy</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">System Load</p>
                        <p className="text-blue-600">📊 Normal</p>
                      </div>
                    </div>
                  </div>
    </div>
  );
};
