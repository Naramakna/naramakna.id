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
import { AdminArticles } from './AdminArticles';
import { AnalyticsReports } from './AnalyticsReports';
import { AdminSettings } from './AdminSettings';
import ScheduledPosts from '../../components/organisms/ScheduledPosts/ScheduledPosts';
import ImageManager from '../../components/organisms/ImageManager/ImageManager';
import TikTokImageManager from '../../components/organisms/TikTokImageManager/TikTokImageManager';
import { AdPlaceholderManager } from '../../components/organisms/AdPlaceholderManager';
import { buildApiUrl } from '../../config/api';


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
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  const [trashedPosts, setTrashedPosts] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalWriters: 0,
    totalPosts: 0,
    totalCategories: 0,
    totalComments: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Placeholder visibility state
  const [placeholderSettings, setPlaceholderSettings] = useState<{[key: string]: boolean}>({
    'hero-banner': true,
    'header': true,
    'mid-content': true,
    'bottom-content': true,
    'popup': true,
    'regular': true,
    'sidebar': true,
    'article-top': true,
    'article-mid': true,
    'article-bottom': true,
    'article-final': true,
    'content-ad': true,
    'breaking-pre': true,
    'breaking-post': true
  });
  const [globalPlaceholder, setGlobalPlaceholder] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  
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
      const [usersRes, userStatsRes, contentStatsRes, categoriesRes, postsRes, pendingPostsRes, scheduledPostsRes] = await Promise.all([
        fetch(buildApiUrl('users'), {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }),
        fetch(buildApiUrl('users/stats'), {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }),
        fetch(buildApiUrl('content/stats'), {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }),
        fetch(buildApiUrl('content/categories?minCount=0'), {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }),
        fetch(buildApiUrl(`content/posts-with-views?limit=${pagination.itemsPerPage}&page=${pagination.currentPage}&${new URLSearchParams(
          Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ''))
        ).toString()}`), {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }),
        fetch(buildApiUrl('approval/pending'), {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }),
        fetch(buildApiUrl('scheduler/scheduled'), {
          method: 'GET',
          credentials: 'include',
          headers: {
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
      const scheduledPostsData = scheduledPostsRes.ok ? await scheduledPostsRes.json() : { success: false, data: { posts: [] } };

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

      // Set scheduled posts
      if (scheduledPostsData.success) {
        setScheduledPosts(scheduledPostsData.data.posts || []);
      }


    } catch (error) {
      console.error('Error fetching data:', error);
      // Set default values on error to prevent crashes
      setUsers([]);
      setAdmins([]);
      setPosts([]);
      setCategories([]);
      setPendingPosts([]);
      setScheduledPosts([]);
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

  // Fetch trashed posts
  const fetchTrashedPosts = useCallback(async () => {
    try {
      const response = await fetch(buildApiUrl('content/admin/articles/trash'), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTrashedPosts(data.data.articles);
        }
      }
    } catch (error) {
      console.error('Error fetching trashed posts:', error);
    }
  }, []);

  // Load placeholder settings
  const loadPlaceholderSettings = useCallback(async () => {
    try {
      const saved = localStorage.getItem('naramakna_placeholder_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        setPlaceholderSettings(settings.placements || placeholderSettings);
        setGlobalPlaceholder(settings.global !== undefined ? settings.global : true);
      }
    } catch (err) {
      console.error('Failed to load placeholder settings:', err);
    }
  }, []);

  // useEffect harus dipanggil sebelum early returns
  useEffect(() => {
    if (isAuthenticated && user?.user_role === 'superadmin') {
      fetchData();
      loadPlaceholderSettings();
    }
  }, [isAuthenticated, user?.user_role, fetchData, loadPlaceholderSettings]);

  // Load trashed posts when trash tab is accessed
  useEffect(() => {
    if (activeTab === 'trash' && isAuthenticated && user?.user_role === 'superadmin') {
      fetchTrashedPosts();
    }
  }, [activeTab, isAuthenticated, user?.user_role, fetchTrashedPosts]);

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
            <p className="text-gray-600">You don't have permission to access the SuperAdmin Dashboard. SuperAdmin role required.</p>
          </div>
        </div>
      </div>
    );
  }



  const promoteToAdmin = async (userId: number) => {
    try {
      const response = await fetch(buildApiUrl(`users/${userId}`), {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_role: 'admin'
        })
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
      const response = await fetch(buildApiUrl(`admin/users/${userId}/suspend`), {
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
      const response = await fetch(buildApiUrl(`admin/users/${userId}/suspend`), {
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
      const response = await fetch(buildApiUrl(`admin/users/${userId}`), {
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

  const deleteArticle = async (articleId: number, permanent: boolean = false) => {
    const action = permanent ? 'permanently delete' : 'move to trash';
    const confirmed = window.confirm(`Are you sure you want to ${action} this article? ${permanent ? 'This action cannot be undone.' : 'You can restore it from trash later.'}`);
    
    if (!confirmed) return;

    try {
      const url = permanent 
        ? buildApiUrl(`content/admin/articles/${articleId}?force=true`)
        : buildApiUrl(`content/admin/articles/${articleId}`);
        
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || `Article ${permanent ? 'permanently deleted' : 'moved to trash'} successfully!`);
        fetchData(); // Refresh data
        if (activeTab === 'trash') fetchTrashedPosts(); // Refresh trash if viewing
      } else {
        const error = await response.json();
        alert(error.message || `Failed to ${action} article`);
      }
    } catch (error) {
      console.error(`Error ${action.replace(' ', 'ing')} article:`, error);
      alert(`Error ${action.replace(' ', 'ing')} article`);
    }
  };

  const bulkDeleteArticles = async (articleIds: number[], permanent: boolean = false) => {
    const action = permanent ? 'permanently delete' : 'move to trash';
    const confirmed = window.confirm(`Are you sure you want to ${action} ${articleIds.length} articles? ${permanent ? 'This action cannot be undone.' : 'You can restore them from trash later.'}`);
    
    if (!confirmed) return;

    try {
      const response = await fetch(buildApiUrl('content/admin/articles/bulk-delete'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleIds: articleIds,
          force: permanent
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || `${articleIds.length} articles ${permanent ? 'permanently deleted' : 'moved to trash'} successfully!`);
        fetchData(); // Refresh data
        if (activeTab === 'trash') fetchTrashedPosts(); // Refresh trash if viewing
      } else {
        const error = await response.json();
        alert(error.message || `Failed to ${action} articles`);
      }
    } catch (error) {
      console.error(`Error ${action.replace(' ', 'ing')} articles:`, error);
      alert(`Error ${action.replace(' ', 'ing')} articles`);
    }
  };

  const restoreArticle = async (articleId: number) => {
    try {
      const response = await fetch(buildApiUrl(`content/admin/articles/${articleId}/restore`), {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'Article restored successfully!');
        fetchData(); // Refresh data
        fetchTrashedPosts(); // Refresh trash
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to restore article');
      }
    } catch (error) {
      console.error('Error restoring article:', error);
      alert('Error restoring article');
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
              { id: 'overview', name: 'Overview' },
              { id: 'analytics-reports', name: 'Analytics Reports' },
              { id: 'users', name: 'Users', count: users.length },
              { id: 'admins', name: 'Admins', count: admins.length },
              { id: 'posts', name: 'Posts', count: systemStats.totalPosts },
              { id: 'categories', name: 'Categories', count: systemStats.totalCategories },
              { id: 'articles', name: 'Articles Manager' },
              { id: 'pending-posts', name: 'Pending', count: pendingPosts.length },
              { id: 'scheduled-posts', name: 'Scheduled', count: scheduledPosts.length },
              { id: 'trash', name: 'Trash' },
              { id: 'image-manager', name: 'Images' },
              { id: 'polling', name: 'Polling' },
              { id: 'ads', name: 'Ads' },
              { id: 'ad-placeholders', name: 'Ad Placeholders' },
              { id: 'google-ads', name: 'Google Ads' },
              { id: 'youtube', name: 'YouTube' },
              { id: 'tiktok', name: 'TikTok' },
              { id: 'analytics', name: 'Boost' },
              { id: 'settings', name: 'Settings' },
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

              {activeTab === 'analytics-reports' && (
                <AnalyticsReports />
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
                  users={users}
                  onFilterChange={handleFilterChange}
                  onResetFilters={resetFilters}
                  onToggleFilters={() => setShowFilters(!showFilters)}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  onDeletePost={deleteArticle}
                  onBulkDeletePosts={(postIds) => bulkDeleteArticles(postIds, false)}
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

              {activeTab === 'articles' && (
                <div className="p-6">
                  <AdminArticles />
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

              {activeTab === 'scheduled-posts' && (
                <ScheduledPosts
                  posts={scheduledPosts}
                  loading={loading}
                  onRefresh={fetchData}
                />
              )}

              {activeTab === 'image-manager' && (
                <ImageManager />
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

          {activeTab === 'google-ads' && (
            <div className="p-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Google Ads Management</h2>
                <p className="text-gray-600 mb-6">Manage Google Ads integration, sync campaigns, and configure automatic ad placement</p>
                <a
                  href="/superadmin/dashboard/google-ads"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span className="mr-2">📢</span>
                  Open Google Ads Dashboard
                </a>
              </div>
            </div>
          )}

          {activeTab === 'youtube' && (
            <div className="p-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">YouTube Management</h2>
                <p className="text-gray-600 mb-6">Manage YouTube integration, upload videos, and sync content</p>
                <a
                  href="/admin/youtube"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <span className="mr-2">📺</span>
                  Open YouTube Dashboard
                </a>
              </div>
            </div>
          )}

          {activeTab === 'tiktok' && (
            <div className="p-6">
              <TikTokImageManager />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="p-6">
              <AdminAnalytics />
            </div>
          )}
          {activeTab === 'ad-placeholders' && (
            <div className="p-6">
              <AdPlaceholderManager 
                placeholderSettings={placeholderSettings}
                globalPlaceholder={globalPlaceholder}
                savingSettings={savingSettings}
                onTogglePlacement={(placement) => {
                  setPlaceholderSettings(prev => ({
                    ...prev,
                    [placement]: !prev[placement]
                  }));
                }}
                onToggleGlobal={() => {
                  const newValue = !globalPlaceholder;
                  setGlobalPlaceholder(newValue);
                  const newSettings: {[key: string]: boolean} = {};
                  Object.keys(placeholderSettings).forEach(key => {
                    newSettings[key] = newValue;
                  });
                  setPlaceholderSettings(newSettings);
                }}
                onSaveSettings={async () => {
                  try {
                    setSavingSettings(true);
                    const settings = {
                      global: globalPlaceholder,
                      placements: placeholderSettings
                    };
                    
                    localStorage.setItem('naramakna_placeholder_settings', JSON.stringify(settings));
                    window.dispatchEvent(new CustomEvent('placeholderSettingsChanged', { detail: settings }));
                    
                    console.log('✅ Placeholder settings saved:', settings);
                    alert('Placeholder settings saved successfully!');
                  } catch (err) {
                    console.error('Failed to save placeholder settings:', err);
                    alert('Failed to save placeholder settings');
                  } finally {
                    setSavingSettings(false);
                  }
                }}
              />
            </div>
          )}
          
          {activeTab === 'trash' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Trash - Deleted Articles</h2>
                <p className="text-gray-600">Articles that have been moved to trash. You can restore them or permanently delete them.</p>
              </div>
              
              {trashedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg mb-2">Trash is empty</div>
                  <p className="text-gray-400">No articles have been deleted.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deleted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {trashedPosts.map((article: any) => (
                        <tr key={article.ID} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{article.post_title}</div>
                            <div className="text-sm text-gray-500">ID: {article.ID}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {article.author?.display_name || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{new Date(article.deleted_at).toLocaleDateString()}</div>
                            <div className="text-xs">{new Date(article.deleted_at).toLocaleTimeString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => restoreArticle(article.ID)}
                              className="text-green-600 hover:text-green-900"
                              title="Restore article"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => deleteArticle(article.ID, true)}
                              className="text-red-600 hover:text-red-900"
                              title="Permanently delete article"
                            >
                              Delete Forever
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={fetchTrashedPosts}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Refresh Trash
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="p-6">
              <AdminSettings />
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
