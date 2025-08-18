import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { 
  useYouTubeConnection, 
  useYouTubeUpload, 
  useYouTubeVideos, 
  useYouTubeSync 
} from '../../hooks/useYouTube';
import { youtubeAPI } from '../../services/api/youtube';
import { AlertMessage } from '../../components/atoms/AlertMessage';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { LoadingSpinner } from '../../components/atoms/LoadingSpinner';

export const AdminYouTube: React.FC = () => {
  const authResult = useAuth();
  const user = authResult?.user;
  const [activeTab, setActiveTab] = useState<'connection' | 'upload' | 'videos' | 'sync' | 'analytics'>('connection');

  // YouTube hooks
  const { status: connectionStatus, loading: connectionLoading, error: connectionError, disconnect, refresh: refreshConnection } = useYouTubeConnection();
  const { uploading, progress, error: uploadError, success: uploadSuccess, uploadVideo, reset: resetUpload } = useYouTubeUpload();
  const { videos, loading: videosLoading, error: videosError, refresh: refreshVideos } = useYouTubeVideos(true);
  const { syncing, error: syncError, success: syncSuccess, syncVideos, reset: resetSync } = useYouTubeSync();

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    tags: '',
    privacy_status: 'public' as 'private' | 'public' | 'unlisted',
    category_id: '25' // News & Politics
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  
  // OAuth Modal state
  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const [oauthStatus, setOAuthStatus] = useState<'waiting' | 'processing' | 'success' | 'error'>('waiting');
  const [oauthMessage, setOAuthMessage] = useState('');

  // Check user permission
  useEffect(() => {
    if (user && user.user_role !== 'superadmin' && user.user_role !== 'admin') {
      window.location.href = '/admin';
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'video') {
        setVideoFile(file);
      } else {
        setThumbnailFile(file);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile) {
      alert('Please select a video file');
      return;
    }

    if (!connectionStatus.connected) {
      alert('Please connect your YouTube account first');
      return;
    }

    try {
      const uploadData = {
        file: videoFile,
        title: uploadForm.title,
        description: uploadForm.description,
        tags: uploadForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        privacy_status: uploadForm.privacy_status,
        category_id: uploadForm.category_id,
        thumbnail: thumbnailFile || undefined
      };

      await uploadVideo(uploadData);
      
      // Reset form on success
      setUploadForm({
        title: '',
        description: '',
        tags: '',
        privacy_status: 'public',
        category_id: '25'
      });
      setVideoFile(null);
      setThumbnailFile(null);
      
      // Refresh videos list
      refreshVideos();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleSync = async () => {
    if (!connectionStatus.connected) {
      alert('Please connect your YouTube account first');
      return;
    }

    try {
      await syncVideos({
        sync_type: 'latest',
        max_results: 20
      });
      refreshVideos();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const handleOAuthConnect = async () => {
    try {
      setShowOAuthModal(true);
      setOAuthStatus('waiting');
      setOAuthMessage('Getting authorization URL...');
      
      const response = await youtubeAPI.getAuthUrl();
      
      if (response.success && response.data?.auth_url) {
        setOAuthMessage('Opening Google OAuth window...');
        
        // Open OAuth in popup
        const popup = window.open(
          response.data.auth_url, 
          'youtube-oauth', 
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );
        
        setOAuthStatus('processing');
        setOAuthMessage('Complete authorization in the popup window. This will auto-detect when done.');
        
        // Poll for connection status every 3 seconds
        const pollInterval = setInterval(async () => {
          try {
            console.log('🔄 Polling YouTube connection status...');
            const statusResponse = await youtubeAPI.getConnectionStatus();
            console.log('📊 Poll response:', statusResponse);
            
            if (statusResponse.success && statusResponse.data?.connected) {
              console.log('✅ Connection detected via polling!');
              clearInterval(pollInterval);
              setOAuthStatus('success');
              setOAuthMessage(`✅ Connected to ${statusResponse.data.channel?.title}!`);
              
              // Update connection status
              refreshConnection();
              
              // Try to close popup (may fail due to CORS but that's ok)
              try {
                if (popup && !popup.closed) {
                  popup.close();
                }
              } catch (e) {
                // Ignore CORS errors when trying to close popup
              }
              
              // Close modal after 3 seconds
              setTimeout(() => {
                setShowOAuthModal(false);
              }, 3000);
            } else {
              console.log('⏳ Still not connected, continuing polling...');
            }
          } catch (error) {
            console.error('Polling error:', error);
          }
        }, 3000);
        
        // Stop polling after 10 minutes and show timeout
        setTimeout(() => {
          clearInterval(pollInterval);
          setOAuthStatus('error');
          setOAuthMessage('Authorization timed out. Please try again. If you completed authorization, it may still be processing.');
        }, 600000);
        
        // Add postMessage listener for popup communication
        const handlePostMessage = (event: MessageEvent) => {
          console.log('🔔 Received postMessage:', event.data, 'from origin:', event.origin);
          console.log('🔔 Current window origin:', window.location.origin);
          
          if (event.origin !== window.location.origin) {
            console.log('❌ Origin mismatch, ignoring message');
            return;
          }
          
          if (event.data === 'youtube-oauth-success') {
            console.log('✅ OAuth success message received!');
            clearInterval(pollInterval);
            setOAuthStatus('success');
            setOAuthMessage('✅ Authorization completed! Checking connection...');
            
            // Check status immediately
            setTimeout(async () => {
              try {
                console.log('🔍 Checking connection status...');
                const statusResponse = await youtubeAPI.getConnectionStatus();
                console.log('📊 Status response:', statusResponse);
                
                if (statusResponse.success && statusResponse.data?.connected) {
                  setOAuthMessage(`✅ Connected to ${statusResponse.data.channel?.title}!`);
                  refreshConnection();
                  setTimeout(() => setShowOAuthModal(false), 2000);
                } else {
                  setOAuthMessage('⏳ Connection not detected yet, continuing to poll...');
                  setOAuthStatus('processing');
                }
              } catch (error) {
                console.error('Status check error:', error);
                setOAuthMessage('❌ Error checking status, continuing to poll...');
                setOAuthStatus('processing');
              }
            }, 1000);
          }
        };
        
        window.addEventListener('message', handlePostMessage);
        
        // Cleanup on unmount
        return () => {
          window.removeEventListener('message', handlePostMessage);
          clearInterval(pollInterval);
        };
        
      } else {
        setOAuthStatus('error');
        setOAuthMessage(response.error || 'Failed to get authorization URL');
      }
    } catch (error) {
      setOAuthStatus('error');
      setOAuthMessage('Connection failed. Please try again.');
      console.error('OAuth error:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show loading if auth is not ready
  if (!authResult || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading YouTube Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">YouTube Management</h1>
          <p className="mt-2 text-gray-600">Manage YouTube integration and video uploads</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'connection', label: 'Connection', icon: '🔗' },
                { id: 'upload', label: 'Upload Video', icon: '📤' },
                { id: 'videos', label: 'Video Library', icon: '📺' },
                { id: 'sync', label: 'Sync Videos', icon: '🔄' },
                { id: 'analytics', label: 'Analytics', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-naramakna-gold text-naramakna-gold'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Connection Tab */}
          {activeTab === 'connection' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">YouTube Account Connection</h2>
              
              {connectionLoading && <LoadingSpinner />}
              
              {connectionError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">❌</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-red-800">Connection Failed</h3>
                      <p className="mt-1 text-sm text-red-700">{connectionError}</p>
                      {connectionError.includes('not configured') && (
                        <div className="mt-3 text-sm text-red-700">
                          <p className="font-medium">Required Setup:</p>
                          <ul className="mt-1 list-disc list-inside space-y-1">
                            <li>Create YouTube API credentials in Google Cloud Console</li>
                            <li>Configure OAuth 2.0 client ID and secret</li>
                            <li>Set proper redirect URI: <code className="bg-red-100 px-1 rounded">[API_BASE_URL]/youtube/callback</code></li>
                            <li>Update environment variables in backend/.env</li>
                          </ul>
                          <p className="mt-2">
                            <a 
                              href="https://developers.google.com/youtube/v3/getting-started" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-red-600 underline hover:text-red-800"
                            >
                              YouTube API Setup Guide →
                            </a>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {connectionStatus.connected ? (
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">✅</span>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-lg font-medium text-green-800">Connected to YouTube</h3>
                      {connectionStatus.channel && (
                        <div className="mt-2 text-sm text-green-700">
                          <p><strong>Channel:</strong> {connectionStatus.channel.title}</p>
                          <p><strong>Subscribers:</strong> {connectionStatus.channel.subscriber_count?.toLocaleString()}</p>
                          <p><strong>Videos:</strong> {connectionStatus.channel.video_count?.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={disconnect}
                      variant="outline"
                      size="sm"
                      className="ml-4"
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-lg font-medium text-yellow-800">YouTube Not Connected</h3>
                      <p className="mt-1 text-sm text-yellow-700">
                        Connect your YouTube account to upload and manage videos
                      </p>
                    </div>
                    <Button
                      onClick={handleOAuthConnect}
                      className="ml-4"
                      disabled={connectionLoading}
                    >
                      {connectionLoading ? 'Connecting...' : 'Connect YouTube'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Upload Video to YouTube</h2>
              
              {!connectionStatus.connected && (
                <AlertMessage 
                  type="error" 
                  message="Please connect your YouTube account first" 
                />
              )}

              {uploadError && (
                <AlertMessage type="error" message={uploadError} />
              )}

              {uploadSuccess && (
                <AlertMessage type="success" message={uploadSuccess} />
              )}

              <form onSubmit={handleUploadSubmit} className="space-y-6">
                {/* Video File */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video File *
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, 'video')}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-naramakna-gold file:text-white hover:file:bg-naramakna-gold/80"
                    required
                  />
                  {videoFile && (
                    <p className="mt-1 text-sm text-gray-600">
                      Selected: {videoFile.name} ({formatFileSize(videoFile.size)})
                    </p>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter video title"
                    maxLength={100}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">{uploadForm.title.length}/100 characters</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter video description"
                    rows={4}
                    maxLength={5000}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-naramakna-gold focus:ring-naramakna-gold"
                  />
                  <p className="mt-1 text-xs text-gray-500">{uploadForm.description.length}/5000 characters</p>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <Input
                    type="text"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Enter tags separated by commas"
                  />
                  <p className="mt-1 text-xs text-gray-500">Separate tags with commas</p>
                </div>

                {/* Privacy Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Privacy Status
                  </label>
                  <select
                    value={uploadForm.privacy_status}
                    onChange={(e) => setUploadForm(prev => ({ 
                      ...prev, 
                      privacy_status: e.target.value as 'private' | 'public' | 'unlisted'
                    }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-naramakna-gold focus:ring-naramakna-gold"
                  >
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={uploadForm.category_id}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, category_id: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-naramakna-gold focus:ring-naramakna-gold"
                  >
                    <option value="25">News & Politics</option>
                    <option value="24">Entertainment</option>
                    <option value="22">People & Blogs</option>
                    <option value="27">Education</option>
                    <option value="28">Science & Technology</option>
                    <option value="10">Music</option>
                    <option value="17">Sports</option>
                    <option value="19">Travel & Events</option>
                  </select>
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Thumbnail (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'thumbnail')}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                  />
                  {thumbnailFile && (
                    <p className="mt-1 text-sm text-gray-600">
                      Selected: {thumbnailFile.name} ({formatFileSize(thumbnailFile.size)})
                    </p>
                  )}
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-naramakna-gold h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={uploading || !connectionStatus.connected}
                    className="flex-1"
                  >
                    {uploading ? 'Uploading...' : 'Upload to YouTube'}
                  </Button>
                  
                  {(uploadError || uploadSuccess) && (
                    <Button
                      type="button"
                      onClick={resetUpload}
                      variant="outline"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Video Library</h2>
                <Button onClick={refreshVideos} variant="outline" size="sm">
                  🔄 Refresh
                </Button>
              </div>

              {videosLoading && <LoadingSpinner />}
              
              {videosError && (
                <AlertMessage type="error" message={videosError} />
              )}

              {videos.length === 0 && !videosLoading && (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-4 block">📹</span>
                  <p>No videos found. Upload some videos or sync from YouTube.</p>
                </div>
              )}

              {videos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video) => (
                    <div key={video.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {/* Thumbnail */}
                      <div className="aspect-video bg-gray-100 relative">
                        {video.thumbnail_url ? (
                          <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl text-gray-400">📹</span>
                          </div>
                        )}
                        {video.duration && (
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                            {formatDuration(video.duration)}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                          {video.title}
                        </h3>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Channel: {video.youtube_channel_name || 'Unknown'}</p>
                          <p>Views: {video.youtube_view_count?.toLocaleString() || 0}</p>
                          <p>Status: <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            video.publish_status === 'published' 
                              ? 'bg-green-100 text-green-800' 
                              : video.publish_status === 'processing'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {video.publish_status}
                          </span></p>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex space-x-2">
                          {video.watch_url && (
                            <a
                              href={video.watch_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                            >
                              Watch on YouTube
                            </a>
                          )}
                          <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors">
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sync Tab */}
          {activeTab === 'sync' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Sync Videos from YouTube</h2>
              
              {!connectionStatus.connected && (
                <AlertMessage 
                  type="error" 
                  message="Please connect your YouTube account first" 
                />
              )}

              {syncError && (
                <AlertMessage type="error" message={syncError} />
              )}

              {syncSuccess && (
                <AlertMessage type="success" message={syncSuccess} />
              )}

              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">About Video Sync</h3>
                  <p className="text-sm text-blue-800">
                    This will fetch your latest videos from your connected YouTube channel 
                    and add them to your website's video library.
                  </p>
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={handleSync}
                    disabled={syncing || !connectionStatus.connected}
                  >
                    {syncing ? 'Syncing...' : 'Sync Latest Videos'}
                  </Button>
                  
                  {(syncError || syncSuccess) && (
                    <Button
                      onClick={resetSync}
                      variant="outline"
                    >
                      Reset
                    </Button>
                  )}
                </div>

                {syncing && (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner />
                    <span className="text-sm text-gray-600">Syncing videos from YouTube...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">YouTube Analytics</h2>
              
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-4 block">📊</span>
                <p>Analytics dashboard coming soon...</p>
                <p className="text-sm mt-2">This will show video performance metrics and insights.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* OAuth Modal */}
      {showOAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                YouTube OAuth Connection
              </h3>
              
              <div className="mb-4">
                {oauthStatus === 'waiting' && (
                  <div className="text-blue-600">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  </div>
                )}
                
                {oauthStatus === 'processing' && (
                  <div className="text-blue-600">
                    <div className="animate-pulse text-2xl mb-2">🔄</div>
                  </div>
                )}
                
                {oauthStatus === 'success' && (
                  <div className="text-green-600">
                    <div className="text-4xl mb-2">✅</div>
                  </div>
                )}
                
                {oauthStatus === 'error' && (
                  <div className="text-red-600">
                    <div className="text-4xl mb-2">❌</div>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                {oauthMessage}
              </p>
              
              <div className="flex gap-2 justify-center">
                {(oauthStatus === 'error' || oauthStatus === 'success') && (
                  <Button
                    onClick={() => setShowOAuthModal(false)}
                    variant="outline"
                    size="sm"
                  >
                    Close
                  </Button>
                )}
                
                {oauthStatus === 'processing' && (
                  <>
                    <Button
                      onClick={async () => {
                        console.log('🔍 Manual status check...');
                        try {
                          const statusResponse = await youtubeAPI.getConnectionStatus();
                          console.log('📊 Manual check response:', statusResponse);
                          
                          if (statusResponse.success && statusResponse.data?.connected) {
                            setOAuthStatus('success');
                            setOAuthMessage(`✅ Connected to ${statusResponse.data.channel?.title}!`);
                            refreshConnection();
                            setTimeout(() => setShowOAuthModal(false), 2000);
                          } else {
                            setOAuthMessage('❌ Still not connected. Please complete authorization in popup.');
                          }
                        } catch (error) {
                          console.error('Manual check error:', error);
                          setOAuthMessage('❌ Error checking status. Please try again.');
                        }
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Check Status
                    </Button>
                    
                    <Button
                      onClick={() => setShowOAuthModal(false)}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
