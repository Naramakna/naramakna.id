import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardTabs } from '../../components/molecules/DashboardTabs';
import { UserManagement } from '../../components/organisms/UserManagement';
import { DataTable } from '../../components/organisms/DataTable';
import { AdminPolling } from './AdminPolling';
import { AdminAds } from './AdminAds';



interface User {
  ID: number;
  user_login: string;
  user_email: string;
  user_role: string;
  user_status: string;
  display_name: string;
  user_registered: string;
}

interface Post {
  ID: number;
  post_title: string;
  post_author: number;
  post_status: string;
  post_date: string;
  author: {
    display_name: string;
    user_login: string;
  };
}

const AdminDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [pendingWriters, setPendingWriters] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');


  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, pendingPostsRes, pendingWritersRes] = await Promise.all([
        fetch('http://dev.naramakna.id/api/users', {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        }),
        fetch('http://dev.naramakna.id/api/approval/pending', {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        }),
        fetch('http://dev.naramakna.id/api/users/pending-writers', {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        })
      ]);

      const usersData = await usersRes.json();
      const pendingPostsData = await pendingPostsRes.json();
      const pendingWritersData = await pendingWritersRes.json();

      if (usersData.success) setUsers(usersData.data.users);
      if (pendingPostsData.success) setPendingPosts(pendingPostsData.data.pending_posts);
      if (pendingWritersData.success) setPendingWriters(pendingWritersData.data.pending_writers);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveWriter = async (userId: number, approved: boolean) => {
    try {
      const response = await fetch(`http://dev.naramakna.id/api/users/${userId}/approve-writer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ approved })
      });

      if (response.ok) {
        fetchData(); // Refresh data
        alert(`Writer ${approved ? 'approved' : 'rejected'} successfully!`);
      }
    } catch (error) {
      alert('Error updating writer status');
    }
  };



  // Check if user has admin access
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || (user.user_role !== 'admin' && user.user_role !== 'superadmin')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Akses Ditolak</h2>
            <p className="text-gray-600 mb-4">Anda tidak memiliki akses ke halaman admin.</p>
            <a 
              href="/" 
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Kembali ke Beranda
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user.display_name}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {user.user_role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <DashboardTabs
              tabs={[
                { id: 'overview', name: 'Overview' },
                { id: 'users', name: 'Users', count: users.length },
                { id: 'pending-writers', name: 'Pending Writers', count: pendingWriters.length },
                { id: 'pending-posts', name: 'Pending Posts', count: pendingPosts.length },
                { id: 'polling', name: '📊 Polling Management' },
                { id: 'ads', name: '🎯 Ads Management' },
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              variant="admin"
            />
          </div>

          {activeTab === 'overview' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">System Overview</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Users</p>
                      <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending Writers</p>
                      <p className="text-2xl font-semibold text-orange-600">{pendingWriters.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending Posts</p>
                      <p className="text-2xl font-semibold text-red-600">{pendingPosts.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Active Users</p>
                      <p className="text-2xl font-semibold text-green-600">
                        {users.filter(u => u.user_status === 'active').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <UserManagement
              users={users}
              loading={loading}
              title="All Users"
            />
          )}

          {activeTab === 'pending-writers' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Pending Writer Approvals</h2>
              <DataTable
                columns={[
                  { key: 'user_login', label: 'Username' },
                  { key: 'user_email', label: 'Email' },
                  { key: 'display_name', label: 'Display Name' },
                  {
                    key: 'user_registered',
                    label: 'Registered',
                    render: (date: string) => new Date(date).toLocaleDateString()
                  },
                  {
                    key: 'actions',
                    label: 'Actions',
                    render: (_: any, writer: User) => (
                      <div className="text-sm space-x-2">
                        <button 
                          onClick={() => approveWriter(writer.ID, true)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => approveWriter(writer.ID, false)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    )
                  }
                ]}
                data={pendingWriters}
                loading={loading}
                emptyMessage="No pending writer approvals."
              />
            </div>
          )}

          {activeTab === 'pending-posts' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Pending Post Reviews</h2>
              <DataTable
                columns={[
                  { key: 'post_title', label: 'Title' },
                  {
                    key: 'author',
                    label: 'Author',
                    render: (_: any, post: Post) => post.author.display_name
                  },
                  {
                    key: 'post_date',
                    label: 'Date',
                    render: (date: string) => new Date(date).toLocaleDateString()
                  },
                  {
                    key: 'actions',
                    label: 'Actions',
                    render: (_: any, post: Post) => (
                      <div className="text-sm space-x-2">
                                                      <a
                                href={`/tulis?edit=${post.ID}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium inline-block"
                              >
                                Edit & Review
                              </a>
                      </div>
                    )
                  }
                ]}
                data={pendingPosts}
                loading={loading}
                emptyMessage="No posts pending review."
              />
                        </div>
          )}

          {activeTab === 'polling' && (
            <div className="p-6">
              <AdminPolling />
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="p-6">
              <AdminAds />
            </div>
          )}


    </div>
      </div>


    </div>
  );
};

export default AdminDashboard;