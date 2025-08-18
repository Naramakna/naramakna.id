import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../../config/api';

interface TikTokVideo {
  id: number;
  tiktok_video_id: string;
  title: string;
  cover_image_url: string;
  tiktok_created_at: string;
}

interface CacheResult {
  cached: number;
  errors: number;
  total: number;
}

const TikTokImageManager: React.FC = () => {
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [caching, setCaching] = useState(false);
  const [lastCacheResult, setLastCacheResult] = useState<CacheResult | null>(null);
  const [stats, setStats] = useState<{ total: number; expired: number; cached: number }>({
    total: 0,
    expired: 0,
    cached: 0
  });

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const response = await fetch(buildApiUrl('tiktok/admin/videos?limit=100'), {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to load videos');

      const data = await response.json();
      if (data.success) {
        const videoList = data.data.videos;
        setVideos(videoList);
        
        // Calculate stats
        const total = videoList.length;
        const expired = videoList.filter((v: TikTokVideo) => 
          v.cover_image_url && v.cover_image_url.includes('x-expires=')
        ).length;
        const cached = videoList.filter((v: TikTokVideo) => 
          v.cover_image_url && v.cover_image_url.includes('benarmak.naramakna.id')
        ).length;
        
        setStats({ total, expired, cached });
      }
    } catch (error) {
      console.error('Error loading videos:', error);
      alert('Error loading TikTok videos');
    }
    setLoading(false);
  };

  const cacheImages = async () => {
    if (!confirm('Cache TikTok images locally? This will download expired images and store them on the server.')) {
      return;
    }

    setCaching(true);
    try {
      const response = await fetch(buildApiUrl('tiktok/cache-images'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to cache images');

      const data = await response.json();
      if (data.success) {
        setLastCacheResult(data.data);
        alert(`✅ Cached ${data.data.cached} images successfully! Errors: ${data.data.errors}`);
        
        // Reload videos to see updated URLs
        setTimeout(() => {
          loadVideos();
        }, 1000);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error caching images:', error);
      alert('Error caching TikTok images: ' + error.message);
    }
    setCaching(false);
  };

  const refreshFromApi = async () => {
    if (!confirm('Refresh TikTok videos from API? This will sync latest videos and get fresh image URLs.')) {
      return;
    }

    setCaching(true);
    try {
      const response = await fetch(buildApiUrl('tiktok/auto-sync'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 50 })
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ Synced ${data.data.new_videos} new videos! Total: ${data.data.total_videos}`);
        loadVideos();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error syncing videos:', error);
      alert('Error syncing TikTok videos: ' + error.message);
    }
    setCaching(false);
  };

  const isExpired = (imageUrl: string) => {
    if (!imageUrl || !imageUrl.includes('x-expires=')) return false;
    
    try {
      const urlParams = new URLSearchParams(imageUrl.split('?')[1]);
      const expires = parseInt(urlParams.get('x-expires') || '0');
      return expires > 0 && expires < Date.now() / 1000;
    } catch {
      return false;
    }
  };

  const isCached = (imageUrl: string) => {
    return imageUrl && imageUrl.includes('benarmak.naramakna.id');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">TikTok Image Manager</h2>
          <p className="text-gray-600">Manage TikTok cover images and handle expired CDN URLs</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadVideos}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '🔄 Loading...' : '🔄 Refresh'}
          </button>
          <button
            onClick={refreshFromApi}
            disabled={caching}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {caching ? '📥 Syncing...' : '📥 Sync from TikTok'}
          </button>
          <button
            onClick={cacheImages}
            disabled={caching}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {caching ? '💾 Caching...' : '💾 Cache Images'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900">Total Videos</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="font-medium text-red-900">Expired Images</h3>
          <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium text-green-900">Cached Locally</h3>
          <p className="text-2xl font-bold text-green-600">{stats.cached}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-medium text-yellow-900">External CDN</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.total - stats.cached}</p>
        </div>
      </div>

      {/* Last Cache Result */}
      {lastCacheResult && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Last Cache Operation</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-green-600 font-medium">Cached: {lastCacheResult.cached}</span>
            </div>
            <div>
              <span className="text-red-600 font-medium">Errors: {lastCacheResult.errors}</span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Total: {lastCacheResult.total}</span>
            </div>
          </div>
        </div>
      )}

      {/* Video List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">TikTok Videos</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No TikTok videos found. Try syncing from TikTok API first.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {videos.slice(0, 20).map((video) => (
              <div key={video.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start space-x-4">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden relative">
                      {video.cover_image_url ? (
                        <>
                          <img
                            src={video.cover_image_url}
                            alt={video.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          {/* Status indicators */}
                          <div className="absolute top-1 right-1">
                            {isExpired(video.cover_image_url) && (
                              <span className="bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                                Expired
                              </span>
                            )}
                            {isCached(video.cover_image_url) && (
                              <span className="bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                                Cached
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {video.title || `Video ${video.tiktok_video_id}`}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {video.tiktok_video_id}
                    </p>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(video.tiktok_created_at).toLocaleDateString()}
                    </p>
                    
                    {/* URL status */}
                    <div className="mt-2">
                      {video.cover_image_url ? (
                        <div className="text-xs">
                          {isCached(video.cover_image_url) ? (
                            <span className="text-green-600">✅ Cached locally</span>
                          ) : isExpired(video.cover_image_url) ? (
                            <span className="text-red-600">❌ Expired CDN URL</span>
                          ) : (
                            <span className="text-yellow-600">⏳ External CDN</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No cover image</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 About TikTok Images</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• <strong>External CDN</strong>: Images hosted on TikTok's CDN (may expire)</p>
          <p>• <strong>Expired</strong>: CDN URLs that are no longer accessible</p>
          <p>• <strong>Cached</strong>: Images downloaded and stored locally (permanent)</p>
          <p>• Use <strong>"Cache Images"</strong> to download and store images permanently</p>
          <p>• Use <strong>"Sync from TikTok"</strong> to get latest videos with fresh URLs</p>
        </div>
      </div>
    </div>
  );
};

export default TikTokImageManager;