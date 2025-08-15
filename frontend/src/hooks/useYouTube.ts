import { useState, useEffect, useCallback } from 'react';
import { youtubeAPI } from '../services/api/youtube';
import type { YouTubeVideo, YouTubeConnectionStatus, YouTubeUploadRequest, YouTubeAnalytics } from '../services/api/youtube';

// Hook for YouTube connection management
export const useYouTubeConnection = () => {
  const [status, setStatus] = useState<YouTubeConnectionStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await youtubeAPI.getConnectionStatus();
      
      if (response.success && response.data) {
        setStatus(response.data);
      } else {
        setError(response.error || 'Failed to check connection status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await youtubeAPI.getAuthUrl();
      
      if (response.success && response.data?.auth_url) {
        // Open YouTube OAuth in new window
        window.open(response.data.auth_url, '_blank', 'width=600,height=700');
        
        // Poll for connection status changes
        const pollInterval = setInterval(async () => {
          const statusResponse = await youtubeAPI.getConnectionStatus();
          if (statusResponse.success && statusResponse.data?.connected) {
            setStatus(statusResponse.data);
            clearInterval(pollInterval);
            setLoading(false);
          }
        }, 2000);
        
        // Stop polling after 5 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          setLoading(false);
        }, 300000);
      } else {
        setError(response.error || 'Failed to get authorization URL');
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await youtubeAPI.disconnect();
      
      if (response.success) {
        setStatus({ connected: false });
      } else {
        setError(response.error || 'Failed to disconnect');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    status,
    loading,
    error,
    connect,
    disconnect,
    refresh: checkConnection
  };
};

// Hook for YouTube video upload
export const useYouTubeUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const uploadVideo = useCallback(async (data: YouTubeUploadRequest) => {
    try {
      setUploading(true);
      setProgress(0);
      setError(null);
      setSuccess(null);

      // Simulate upload progress (YouTube API doesn't provide real-time progress)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 10, 90));
      }, 500);

      const response = await youtubeAPI.uploadVideo(data);
      
      clearInterval(progressInterval);
      setProgress(100);

      if (response.success) {
        setSuccess(response.message || 'Video uploaded successfully!');
        return response.data;
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setSuccess(null);
  }, []);

  return {
    uploading,
    progress,
    error,
    success,
    uploadVideo,
    reset
  };
};

// Hook for fetching YouTube videos
export const useYouTubeVideos = (isAdmin: boolean = false) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchVideos = useCallback(async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    source?: string;
    category?: string;
    refresh?: boolean;
  } = {}) => {
    try {
      if (params.refresh || params.page === 1) {
        setLoading(true);
      }
      setError(null);

      const response = isAdmin 
        ? await youtubeAPI.getVideos({
            page: params.page,
            limit: params.limit,
            search: params.search,
            status: params.status,
            source: params.source
          })
        : await youtubeAPI.getPublicVideos({
            limit: params.limit,
            offset: params.page ? (params.page - 1) * (params.limit || 12) : 0,
            category: params.category
          });

      if (response.success && response.data) {
        const newVideos = response.data.videos || [];
        
        if (params.page === 1 || params.refresh) {
          setVideos(newVideos);
        } else {
          setVideos(prev => [...prev, ...newVideos]);
        }
        
        setTotal(response.data.total || 0);
        setHasMore(response.data.has_more || false);
      } else {
        setError(response.error || 'Failed to fetch videos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const refresh = useCallback(() => {
    fetchVideos({ page: 1, refresh: true });
  }, [fetchVideos]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const currentPage = Math.ceil(videos.length / 12) + 1;
      fetchVideos({ page: currentPage });
    }
  }, [loading, hasMore, videos.length, fetchVideos]);

  useEffect(() => {
    fetchVideos({ page: 1 });
  }, [fetchVideos]);

  return {
    videos,
    loading,
    error,
    hasMore,
    total,
    refresh,
    loadMore,
    search: (query: string) => fetchVideos({ page: 1, search: query, refresh: true })
  };
};

// Hook for YouTube sync functionality
export const useYouTubeSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const syncVideos = useCallback(async (params: {
    channel_id?: string;
    max_results?: number;
    published_after?: string;
    sync_type: 'latest' | 'all' | 'custom';
  }) => {
    try {
      setSyncing(true);
      setError(null);
      setSuccess(null);

      const response = await youtubeAPI.syncVideos(params);

      if (response.success) {
        setSuccess(response.message || 'Videos synced successfully!');
        return response.data;
      } else {
        throw new Error(response.error || 'Sync failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
      throw err;
    } finally {
      setSyncing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setSyncing(false);
    setError(null);
    setSuccess(null);
  }, []);

  return {
    syncing,
    error,
    success,
    syncVideos,
    reset
  };
};

// Hook for YouTube analytics
export const useYouTubeAnalytics = () => {
  const [analytics, setAnalytics] = useState<YouTubeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (params: {
    start_date?: string;
    end_date?: string;
    metrics?: string[];
  } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await youtubeAPI.getAnalytics(params);

      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        setError(response.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refresh,
    fetchAnalytics
  };
};

// Hook for video view tracking
export const useVideoViewTracking = () => {
  const trackView = useCallback(async (videoId: string, viewData: {
    user_id?: string;
    duration_watched?: number;
  } = {}) => {
    try {
      await youtubeAPI.trackView(videoId, {
        ...viewData,
        ip_address: 'auto', // Backend will detect IP
        user_agent: navigator.userAgent,
        referrer: document.referrer
      });
    } catch (err) {
      console.warn('Failed to track video view:', err);
    }
  }, []);

  return { trackView };
};