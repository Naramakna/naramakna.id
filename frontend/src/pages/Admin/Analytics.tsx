import React, { useState, useEffect } from 'react';
import { AlertMessage } from '../../components/atoms/AlertMessage/AlertMessage';
import { Button } from '../../components/atoms/Button/Button';
import { StatsCard } from '../../components/atoms/StatsCard/StatsCard';
import { buildApiUrl } from '../../config/api';

interface AnalyticsOverview {
  event_stats: Array<{
    event_type: string;
    total_events: number;
    unique_posts: number;
  }>;
  top_posts: Array<{
    post_id: number;
    title: string;
    view_count: number;
  }>;
  total_published_posts: number;
}

interface BoostResult {
  posts_affected: number;
  total_views_added: number;
  target_views: number;
  clear_existing: boolean;
  final_stats: Array<{
    post_id: number;
    view_count: number;
  }>;
}

interface Post {
  id: number;
  title: string;
  date: string;
  current_views: number;
}



export const AdminAnalytics: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [boosting, setBoosting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'boost-all' | 'boost-individual'>('overview');
  
  // Form state for boost all views
  const [targetViews, setTargetViews] = useState(5000);
  const [clearExisting, setClearExisting] = useState(false);
  
  // State for individual post boost
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [singleTargetViews, setSingleTargetViews] = useState(1000);
  const [singleClearExisting, setSingleClearExisting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOverview = async () => {
    try {
      const response = await fetch(buildApiUrl('admin/analytics/overview'), {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setOverview(data.data);
      } else {
        setAlert({ type: 'error', message: data.message || 'Failed to load analytics' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to load analytics overview' });
    } finally {
      setLoading(false);
    }
  };

  const handleBoostViews = async () => {
    if (targetViews < 1 || targetViews > 1000000) {
      setAlert({ type: 'error', message: 'Target views must be between 1 and 1,000,000' });
      return;
    }

    setBoosting(true);
    setAlert(null);

    try {
      const response = await fetch(buildApiUrl('admin/analytics/boost-views'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target_views: targetViews,
          post_ids: 'all',
          clear_existing: clearExisting
        })
      });

      const data = await response.json();
      if (data.success) {
        const result: BoostResult = data.data;
        setAlert({ 
          type: 'success', 
          message: `Successfully boosted ${result.posts_affected} posts! Added ${result.total_views_added.toLocaleString()} views total.`
        });
        
        // Refresh the overview
        await fetchOverview();
      } else {
        setAlert({ type: 'error', message: data.message || 'Failed to boost views' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to boost views' });
    } finally {
      setBoosting(false);
    }
  };

  const fetchPosts = async (search = '') => {
    setPostsLoading(true);
    try {
      const response = await fetch(buildApiUrl(`admin/analytics/posts?search=${encodeURIComponent(search)}&limit=50`), {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setPosts(data.data.posts);
      } else {
        setAlert({
          type: 'error',
          message: data.message || 'Failed to fetch posts'
        });
      }
    } catch (error: any) {
      setAlert({
        type: 'error',
        message: error.message || 'Failed to fetch posts'
      });
    } finally {
      setPostsLoading(false);
    }
  };

  const handleBoostSinglePost = async () => {
    if (!selectedPost) {
      setAlert({
        type: 'error',
        message: 'Please select a post to boost'
      });
      return;
    }

    if (singleTargetViews < 1 || singleTargetViews > 100000) {
      setAlert({
        type: 'error',
        message: 'Target views must be between 1 and 100,000'
      });
      return;
    }

    setBoosting(true);
    setAlert(null);

    try {
      const response = await fetch(buildApiUrl('admin/analytics/boost-single'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          post_id: selectedPost.id,
          target_views: singleTargetViews,
          clear_existing: singleClearExisting
        })
      });

      const data = await response.json();
      if (data.success) {
        setAlert({
          type: 'success',
          message: data.message
        });
        await fetchOverview(); // Refresh overview data
        await fetchPosts(searchTerm); // Refresh posts list
        setSelectedPost(null); // Clear selection
      } else {
        setAlert({
          type: 'error',
          message: data.message || 'Failed to boost post views'
        });
      }
    } catch (error: any) {
      setAlert({
        type: 'error',
        message: error.message || 'Failed to boost post views'
      });
    } finally {
      setBoosting(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'boost-individual') {
      fetchPosts(searchTerm);
    }
  }, [activeTab, searchTerm]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const viewStats = overview?.event_stats.find(stat => stat.event_type === 'view');
  const avgViewsPerPost = viewStats ? Math.round(viewStats.total_events / viewStats.unique_posts) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Analytics Management
        </h1>
        <Button 
          onClick={fetchOverview}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Refresh Data
        </Button>
      </div>

      {alert && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('boost-all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'boost-all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🚀 Boost All Posts
          </button>
          <button
            onClick={() => setActiveTab('boost-individual')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'boost-individual'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🎯 Boost Individual Post
          </button>
        </nav>
      </div>

      {/* Overview Stats */}
      {activeTab === 'overview' && (
      <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Posts"
          value={overview?.total_published_posts.toLocaleString() || '0'}
          icon="📄"
          bgColor="bg-blue-50"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title="Total Views"
          value={viewStats?.total_events.toLocaleString() || '0'}
          icon="👁️"
          bgColor="bg-green-50"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title="Posts with Views"
          value={viewStats?.unique_posts.toLocaleString() || '0'}
          icon="📊"
          bgColor="bg-purple-50"
          iconBgColor="bg-purple-100"
        />
        <StatsCard
          title="Avg Views/Post"
          value={avgViewsPerPost.toLocaleString()}
          icon="📈"
          bgColor="bg-orange-50"
          iconBgColor="bg-orange-100"
        />
      </div>

      {/* Event Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">
          Analytics by Event Type
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {overview?.event_stats.map(stat => (
            <div key={stat.event_type} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium capitalize">{stat.event_type}</span>
                <span className="text-2xl">
                  {stat.event_type === 'view' ? '👁️' : 
                   stat.event_type === 'like' ? '❤️' : 
                   stat.event_type === 'share' ? '🔗' : '💬'}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <div>Total Events: <span className="font-semibold">{stat.total_events.toLocaleString()}</span></div>
                <div>Unique Posts: <span className="font-semibold">{stat.unique_posts.toLocaleString()}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Posts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">
          Top 10 Posts by Views
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3">#</th>
                <th className="text-left py-2 px-3">Post ID</th>
                <th className="text-left py-2 px-3">Title</th>
                <th className="text-right py-2 px-3">Views</th>
              </tr>
            </thead>
            <tbody>
              {overview?.top_posts.map((post, index) => (
                <tr key={post.post_id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3">{index + 1}</td>
                  <td className="py-2 px-3">{post.post_id}</td>
                  <td className="py-2 px-3">
                    <div className="max-w-md truncate">{post.title}</div>
                  </td>
                  <td className="py-2 px-3 text-right font-semibold">
                    {post.view_count.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Boost All Posts Tab */}
      {activeTab === 'boost-all' && (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">
          Boost All Posts Views
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="targetViews" className="block text-sm font-medium text-gray-700 mb-2">
              Target Views per Post
            </label>
            <input
              type="number"
              id="targetViews"
              min="1"
              max="1000000"
              value={targetViews}
              onChange={(e) => setTargetViews(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5000"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="clearExisting"
              checked={clearExisting}
              onChange={(e) => setClearExisting(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="clearExisting" className="text-sm font-medium text-gray-700">
              Clear existing views first
            </label>
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleBoostViews}
              disabled={boosting || targetViews < 1}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            >
              {boosting ? 'Boosting...' : 'Boost All Posts'}
            </Button>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Warning:</strong> This will boost ALL published posts to have exactly <strong>{targetViews.toLocaleString()}</strong> views.
            Posts with more views won't be affected unless "Clear existing views" is checked.
          </p>
        </div>
      </div>
      )}

      {/* Boost Individual Post Tab */}
      {activeTab === 'boost-individual' && (
      <div className="space-y-6">
        {/* Post Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">
            Select Post to Boost
          </h2>
          
          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search posts by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Posts List */}
          {postsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {posts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No posts found</p>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPost?.id === post.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {post.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Published: {new Date(post.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <span className="text-sm font-semibold text-blue-600">
                          {post.current_views.toLocaleString()} views
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Boost Form */}
        {selectedPost && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">
              Boost "{selectedPost.title}"
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="singleTargetViews" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Views
                </label>
                <input
                  type="number"
                  id="singleTargetViews"
                  min="1"
                  max="100000"
                  value={singleTargetViews}
                  onChange={(e) => setSingleTargetViews(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1000"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="singleClearExisting"
                  checked={singleClearExisting}
                  onChange={(e) => setSingleClearExisting(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="singleClearExisting" className="text-sm font-medium text-gray-700">
                  Clear existing views
                </label>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleBoostSinglePost}
                  disabled={boosting || singleTargetViews < 1}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {boosting ? 'Boosting...' : 'Boost This Post'}
                </Button>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                <strong>Current views:</strong> {selectedPost.current_views.toLocaleString()}<br/>
                <strong>Target views:</strong> {singleTargetViews.toLocaleString()}<br/>
                <strong>Views to add:</strong> {Math.max(0, singleTargetViews - (singleClearExisting ? 0 : selectedPost.current_views)).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
      )}


    </div>
  );
};
