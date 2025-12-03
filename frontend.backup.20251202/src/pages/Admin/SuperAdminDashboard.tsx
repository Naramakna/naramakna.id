import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { Navbar } from '../../components/organisms/Navbar/Navbar';
import { DashboardTabs } from '../../components/molecules/DashboardTabs';
import { SystemOverview } from '../../components/organisms/SystemOverview';
import { PostsManagement } from '../../components/organisms/PostsManagement';
import { UserManagement } from '../../components/organisms/UserManagement';
import { AdminAnalytics } from './Analytics';
import { AdminPolling } from './AdminPolling';
import { AdminAds } from './AdminAds';


interface User {
  ID: number;
  user_login: string;
  user_email: string;
  user_role: string;
  user_status: string; // Changed from number to string
  user_registered: string;
  display_name: string;
}



interface Post {
  ID?: number;
  id?: number;
  title?: string;
  post_title?: string;
  excerpt?: string;
  post_excerpt?: string;
  status?: string;
  post_status?: string;
  date?: string;
  post_date?: string;
  post_author?: number;
  author_login?: string;
  author?: {
    ID: number;
    display_name: string;
    user_login: string;
    user_email: string;
  };
  post_content?: string;
  content?: string;
  comment_count?: number;
  view_count?: number;
  views?: number;
}

interface Category {
  term_id: number;
  name: string;
  slug: string;
  count: number;
  taxonomy: string;
}

interface PendingPost {
  ID: number;
  post_title: string;
  post_date: string;
  author: {
    display_name: string;
  };
}

interface Admin {
  ID: number;
  user_login: string;
  user_email: string;
  user_role: string;
  user_status: string;
  display_name: string;
  user_registered: string;
}

interface SystemStats {
  totalUsers: number;
  totalAdmins: number;
  totalWriters: number;
  totalPosts: number;
  totalCategories: number;
  totalComments: number;
}

const SuperAdminDashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const token = localStorage.getItem('token');
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalWriters: 0,
    totalPosts: 0,
    totalCategories: 0,
    totalComments: 0
  });
  const [loading, setLoading] = useState(true);

  
  // Filtering states
  const [filters, setFilters] = useState({
    author: '',
    status: '',
    year: '',
    month: '',
    minViews: '',
    maxViews: '',
    sortBy: 'date',
    sortOrder: 'DESC'
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Definisikan fetchData menggunakan useCallback
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [usersRes, userStatsRes, contentStatsRes, categoriesRes, postsRes, pendingPostsRes] = await Promise.all([
        fetch('http://dev.naramakna.id/api/users', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://dev.naramakna.id/api/users/stats', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://dev.naramakna.id/api/content/stats', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://dev.naramakna.id/api/content/categories?minCount=0', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`http://dev.naramakna.id/api/content/posts-with-views?limit=${pagination.itemsPerPage}&page=${pagination.currentPage}&${new URLSearchParams(
          Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ''))
        ).toString()}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://dev.naramakna.id/api/approval/pending', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      // Parse responses with error handling
      const usersData = usersRes.ok ? await usersRes.json() : { success: false, data: [] };
      const userStatsData = userStatsRes.ok ? await userStatsRes.json() : { success: false, data: {} };
      const contentStatsData = contentStatsRes.ok ? await contentStatsRes.json() : { success: false, data: {} };
      const categoriesData = categoriesRes.ok ? await categoriesRes.json() : { success: false, data: [] };
      const postsData = postsRes.ok ? await postsRes.json() : { success: false, data: { posts: [] } };
      const pendingPostsData = pendingPostsRes.ok ? await pendingPostsRes.json() : { success: false, data: { pending_posts: [] } };

      console.log('API Responses:', { usersData, userStatsData, contentStatsData, categoriesData, postsData, pendingPostsData });

      // Set users data
      if (usersData.success) {
        setUsers(usersData.data.users);
        // Filter admins from users
        const adminUsers = usersData.data.users.filter((user: User) => 
          user.user_role === 'admin' || user.user_role === 'superadmin'
        );
        setAdmins(adminUsers);
      }

      // Set system stats from user stats, content stats, and categories
      if (userStatsData.success && contentStatsData.success && categoriesData.success) {
        const userStats = userStatsData.data;
        const contentStats = contentStatsData.data;
        const categories = categoriesData.data;
        setSystemStats({
          totalUsers: userStats.roles.users + userStats.roles.writers + userStats.roles.admins + userStats.roles.superadmins,
          totalAdmins: userStats.roles.admins,
          totalWriters: userStats.roles.writers,
          totalPosts: contentStats.total_published || contentStats.articles || 0,
          totalCategories: categories.total || 0,
          totalComments: 0 // TODO: Will get from comments API if needed
        });
      }

      // Set posts data (view counts already included from API)
      if (postsData.success) {
        setPosts(postsData.data.posts || []);
        if (postsData.data.pagination) {
          setPagination(postsData.data.pagination);
        }
      }

      // Set categories data
      if (categoriesData.success) {
        setCategories(categoriesData.data.categories || categoriesData.data);
      }

      // Set pending posts
      if (pendingPostsData.success) {
        setPendingPosts(pendingPostsData.data.pending_posts || []);
      }


    } catch (error) {
      console.error('Error fetching data:', error);
      // Set default values on error to prevent crashes
      setUsers([]);
      setAdmins([]);
      setPosts([]);
      setCategories([]);
      setPendingPosts([]);
      setSystemStats({
        totalUsers: 0,
        totalAdmins: 0,
        totalWriters: 0,
        totalPosts: 0,
        totalCategories: 0,
        totalComments: 0
      });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.itemsPerPage]);

  // Filter handling functions
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  const resetFilters = () => {
    setFilters({
      author: '',
      status: '',
      year: '',
      month: '',
      minViews: '',
      maxViews: '',
      sortBy: 'date',
      sortOrder: 'DESC'
    });
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  // Pagination functions
  const handlePageChange = (page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage,
      currentPage: 1
    }));
  };

  // useEffect harus dipanggil sebelum early returns
  useEffect(() => {
    if (isAuthenticated && user?.user_role === 'superadmin') {
      fetchData();
    }
  }, [isAuthenticated, user?.user_role, fetchData]);

  // Check access permission
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.user_role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access the Super Admin Dashboard.</p>
          </div>
        </div>
      </div>
    );
  }



  const promoteToAdmin = async (userId: number) => {
    try {
      const response = await fetch(`/api/superadmin/promote-admin/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('User promoted to Admin successfully!');
        fetchData(); // Refresh data
      } else {
        alert('Failed to promote user');
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('Error promoting user');
    }
  };

  const demoteAdmin = async (userId: number) => {
    try {
      const response = await fetch(`/api/superadmin/demote-admin/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Admin demoted to User successfully!');
        fetchData(); // Refresh data
      } else {
        alert('Failed to demote admin');
      }
    } catch (error) {
      console.error('Error demoting admin:', error);
      alert('Error demoting admin');
    }
  };

  const suspendUser = async (userId: number) => {
    try {
      const response = await fetch(`http://dev.naramakna.id/api/admin/users/${userId}/suspend`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ suspend: true })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'User suspended successfully!');
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to suspend user');
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Error suspending user');
    }
  };

  const unsuspendUser = async (userId: number) => {
    try {
      const response = await fetch(`http://dev.naramakna.id/api/admin/users/${userId}/suspend`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ suspend: false })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'User unsuspended successfully!');
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to unsuspend user');
      }
    } catch (error) {
      console.error('Error unsuspending user:', error);
      alert('Error unsuspending user');
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      const response = await fetch(`http://dev.naramakna.id/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'User deleted successfully!');
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const deleteArticle = async (articleId: number) => {
    try {
      const response = await fetch(`http://dev.naramakna.id/api/content/admin/articles/${articleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'Article deleted successfully!');
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Error deleting article');
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
                <p className="text-gray-600">Complete system control and management</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {user.user_role}
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <DashboardTabs
            tabs={[
              { id: 'overview', name: 'System Overview' },
              { id: 'users', name: 'All Users', count: users.length },
              { id: 'admins', name: 'Admin Management', count: admins.length },
              { id: 'posts', name: 'Posts Management', count: systemStats.totalPosts },
              { id: 'categories', name: 'Categories Management', count: systemStats.totalCategories },
              { id: 'pending-posts', name: 'Pending Posts', count: pendingPosts.length },
              { id: 'polling', name: '📊 Polling Management' },
              { id: 'ads', name: '🎯 Ads Management' },
              { id: 'analytics', name: 'Analytics & Boost' },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="superadmin"
          />
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading dashboard data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <SystemOverview stats={systemStats} />
              )}

              {activeTab === 'users' && (
                <UserManagement
                  users={users}
                  loading={loading}
                  currentUserRole={user?.user_role || ''}
                  onPromoteToAdmin={promoteToAdmin}
                  onSuspendUser={suspendUser}
                  onUnsuspendUser={unsuspendUser}
                  onDeleteUser={deleteUser}
                  title="All Users Management"
                  showActions={true}
                />
              )}

              {activeTab === 'admins' && (
                <UserManagement
                  users={admins}
                  loading={loading}
                  currentUserRole={user?.user_role || ''}
                  onDemoteAdmin={demoteAdmin}
                  onSuspendUser={suspendUser}
                  onUnsuspendUser={unsuspendUser}
                  onDeleteUser={deleteUser}
                  title="Admin Management"
                  showActions={true}
                />
              )}



              {activeTab === 'posts' && (
                <PostsManagement
                  posts={posts}
                  loading={loading}
                  filters={filters}
                  showFilters={showFilters}
                  pagination={pagination}
                  onFilterChange={handleFilterChange}
                  onResetFilters={resetFilters}
                  onToggleFilters={() => setShowFilters(!showFilters)}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  onDeletePost={deleteArticle}
                  currentUserRole={user?.user_role || ''}
                />
              )}

              {activeTab === 'categories' && (
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Categories Management</h2>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading categories...</p>
                    </div>
                  ) : categories.length === 0 ? (
                    <p className="text-gray-500">No categories found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posts Count</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {categories.map((category) => (
                            <tr key={category.term_id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {category.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {category.slug}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  category.taxonomy === 'category' ? 'bg-blue-100 text-blue-800' :
                                  category.taxonomy === 'newstopic' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {category.taxonomy}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {category.count}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => window.open(`/categories/${category.term_id}/edit`, '_blank')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Edit
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'pending-posts' && (
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Pending Post Reviews</h2>
                  {pendingPosts.length === 0 ? (
                    <p className="text-gray-500">No posts pending review.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {pendingPosts.map(post => (
                            <tr key={post.ID}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{post.post_title}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{post.author.display_name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(post.post_date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                                                <a
                                  href={`/tulis?edit=${post.ID}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium inline-block"
                                >
                                  Edit & Review
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
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

          {activeTab === 'analytics' && (
            <div className="p-6">
              <AdminAnalytics />
            </div>
          )}
            </>
          )}
        </div>
      </div>


    </div>
  );
};

export default SuperAdminDashboard;
