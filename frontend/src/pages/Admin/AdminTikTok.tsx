import React, { useState, useEffect } from 'react';
import { useTikTokConnection, useTikTokUpload, useTikTokVideos, useTikTokSync, useTikTokAnalytics } from '../../hooks/useTikTok';
import { tiktokUtils } from '../../services/api/tiktok';
import { useAuth } from '../../contexts/AuthContext/AuthContext';

export const AdminTikTok: React.FC = () => {
  const { user } = useAuth();
  const { 
    status: connectionStatus, 
    loading: connectionLoading, 
    error: connectionError,
    connect,
    disconnect 
  } = useTikTokConnection();
  
  const {
    uploading,
    uploadProgress,
    error: uploadError,
    uploadVideo,
    reset: resetUpload
  } = useTikTokUpload();

  const {
    videos,
    loading: videosLoading,
    error: videosError,
    refresh: refreshVideos
  } = useTikTokVideos(true); // Admin mode

  const {
    syncing,
    error: syncError,
    lastSyncResult,
    syncVideos
  } = useTikTokSync();

  const {
    analytics,
    loading: analyticsLoading,
    error: analyticsError
  } = useTikTokAnalytics();

  // Form states
  const [activeTab, setActiveTab] = useState<'overview' | 'upload' | 'videos' | 'analytics'>('overview');
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    privacy_level: 'PUBLIC_TO_EVERYONE' as const,
    disable_comment: false,
    disable_duet: false,
    disable_stitch: false
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = tiktokUtils.validateVideoFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Handle upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select a video file');
      return;
    }
    
    if (!uploadForm.title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    try {
      await uploadVideo(selectedFile, uploadForm);
      
      // Reset form
      setUploadForm({
        title: '',
        description: '',
        privacy_level: 'PUBLIC_TO_EVERYONE',
        disable_comment: false,
        disable_duet: false,
        disable_stitch: false
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Refresh videos list
      refreshVideos();
      
      alert('Video uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  // Handle sync
  const handleSync = async () => {
    if (!user || user.role !== 'superadmin') {
      alert('Only superadmin can sync videos');
      return;
    }
    
    try {
      await syncVideos(20);
      refreshVideos();
      alert(`Sync completed! ${lastSyncResult?.new_videos || 0} new videos added.`);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (connectionLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading TikTok settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">TikTok Management</h1>
        <p className="mt-2 text-gray-600">
          Manage TikTok integration, upload videos, and track performance
        </p>
      </div>

      {/* Connection Status */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">TikTok Account Connection</h2>
        
        {connectionError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {connectionError}
          </div>
        )}
        
        {connectionStatus.connected ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {connectionStatus.account?.tiktok_avatar_url && (
                <img 
                  src={connectionStatus.account.tiktok_avatar_url} 
                  alt="TikTok Avatar"
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-green-600">✅ Connected</p>
                <p className="text-sm text-gray-600">
                  @{connectionStatus.account?.tiktok_username} ({connectionStatus.account?.tiktok_display_name})
                </p>
                <div className="flex space-x-4 text-xs text-gray-500">
                  <span>Upload: {connectionStatus.account?.can_upload ? '✅' : '❌'}</span>
                  <span>Read Profile: {connectionStatus.account?.can_read_profile ? '✅' : '❌'}</span>
                  <span>Valid: {connectionStatus.account?.is_valid ? '✅' : '❌'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={disconnect}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">No TikTok account connected</p>
            <button
              onClick={connect}
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
            >
              Connect TikTok Account
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'upload', label: 'Upload Video' },
              { id: 'videos', label: 'Manage Videos' },
              { id: 'analytics', label: 'Analytics' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Total Videos</h3>
            <p className="text-3xl font-bold text-blue-600">{videos.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Total Views</h3>
            <p className="text-3xl font-bold text-green-600">
              {analytics?.overview ? tiktokUtils.formatViewCount(analytics.overview.total_tiktok_views) : '0'}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Total Likes</h3>
            <p className="text-3xl font-bold text-red-600">
              {analytics?.overview ? tiktokUtils.formatViewCount(analytics.overview.total_likes) : '0'}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Avg Engagement</h3>
            <p className="text-3xl font-bold text-purple-600">
              {analytics?.overview ? `${analytics.overview.avg_engagement_rate.toFixed(1)}%` : '0%'}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'upload' && connectionStatus.connected && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Upload Video to TikTok</h2>
          
          {uploadError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {uploadError}
            </div>
          )}
          
          <form onSubmit={handleUpload} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video File
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Preview */}
            {previewUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <video
                  src={previewUrl}
                  controls
                  className="max-w-xs max-h-64 rounded-lg"
                />
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter video title..."
                maxLength={150}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {uploadForm.title.length}/150 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Enter video description..."
                maxLength={2200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {uploadForm.description.length}/2200 characters
              </p>
            </div>

            {/* Privacy Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Privacy Level
              </label>
              <select
                value={uploadForm.privacy_level}
                onChange={(e) => setUploadForm({ ...uploadForm, privacy_level: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="PUBLIC_TO_EVERYONE">Public to Everyone</option>
                <option value="MUTUAL_FOLLOW_FRIENDS">Friends Only</option>
                <option value="SELF_ONLY">Private</option>
              </select>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={uploadForm.disable_comment}
                    onChange={(e) => setUploadForm({ ...uploadForm, disable_comment: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Disable Comments</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={uploadForm.disable_duet}
                    onChange={(e) => setUploadForm({ ...uploadForm, disable_duet: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Disable Duets</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={uploadForm.disable_stitch}
                    onChange={(e) => setUploadForm({ ...uploadForm, disable_stitch: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Disable Stitch</span>
                </label>
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div>
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                  <p>Uploading... {uploadProgress}%</p>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload to TikTok'}
              </button>
              
              {(uploadError || selectedFile) && (
                <button
                  type="button"
                  onClick={resetUpload}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Manage Videos</h2>
            <div className="flex space-x-2">
              {user?.role === 'superadmin' && (
                <button
                  onClick={handleSync}
                  disabled={syncing || !connectionStatus.connected}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {syncing ? 'Syncing...' : 'Sync from TikTok'}
                </button>
              )}
              <button
                onClick={refreshVideos}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>
          </div>

          {syncError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {syncError}
            </div>
          )}

          {videosError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {videosError}
            </div>
          )}

          {videosLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">Loading videos...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No videos found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Video</th>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Stats</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Source</th>
                    <th className="px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => (
                    <tr key={video.id} className="border-b">
                      <td className="px-4 py-2">
                        {video.cover_image_url && (
                          <img
                            src={video.cover_image_url}
                            alt={video.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <div>
                          <p className="font-medium">{video.title}</p>
                          {video.tiktok_username && (
                            <p className="text-sm text-gray-500">@{video.tiktok_username}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-sm">
                          <p>👁️ {tiktokUtils.formatViewCount(video.tiktok_view_count)}</p>
                          <p>❤️ {tiktokUtils.formatViewCount(video.tiktok_like_count)}</p>
                          <p>💬 {tiktokUtils.formatViewCount(video.tiktok_comment_count)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          video.publish_status === 'published' ? 'bg-green-100 text-green-800' :
                          video.publish_status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          video.publish_status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {video.publish_status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          video.source === 'uploaded' ? 'bg-blue-100 text-blue-800' :
                          video.source === 'synced' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {video.source}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {new Date(video.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {analyticsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">Loading analytics...</p>
            </div>
          ) : analyticsError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {analyticsError}
            </div>
          ) : analytics ? (
            <div>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500">Total Videos</h3>
                  <p className="text-2xl font-bold">{analytics.overview.total_videos}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500">TikTok Views</h3>
                  <p className="text-2xl font-bold">{tiktokUtils.formatViewCount(analytics.overview.total_tiktok_views)}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500">Local Views</h3>
                  <p className="text-2xl font-bold">{tiktokUtils.formatViewCount(analytics.overview.total_local_views)}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-500">Engagement Rate</h3>
                  <p className="text-2xl font-bold">{analytics.overview.avg_engagement_rate.toFixed(1)}%</p>
                </div>
              </div>

              {/* Top Videos */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Top Performing Videos</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left">Title</th>
                        <th className="px-4 py-2 text-left">Views</th>
                        <th className="px-4 py-2 text-left">Likes</th>
                        <th className="px-4 py-2 text-left">Engagement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.top_videos.slice(0, 5).map((video) => (
                        <tr key={video.id} className="border-b">
                          <td className="px-4 py-2 font-medium">{video.title}</td>
                          <td className="px-4 py-2">{tiktokUtils.formatViewCount(video.tiktok_view_count)}</td>
                          <td className="px-4 py-2">{tiktokUtils.formatViewCount(video.tiktok_like_count)}</td>
                          <td className="px-4 py-2">{video.total_engagement}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
