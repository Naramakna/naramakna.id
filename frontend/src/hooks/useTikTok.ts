import { useState, useEffect, useCallback } from 'react';
import { tiktokAPI } from '../services/api/tiktok';
import type { TikTokVideo, TikTokConnectionStatus, TikTokUploadRequest, TikTokAnalytics } from '../services/api/tiktok';

// Hook for TikTok connection management
export const useTikTokConnection = () => {
  const [status, setStatus] = useState<TikTokConnectionStatus>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tiktokAPI.getConnectionStatus();
      
      if (response.success && response.data) {
        setStatus(response.data);
      } else {
        setError(response.message || 'Failed to check connection');
        setStatus({ connected: false });
      }
    } catch (err) {
      console.error('Error checking TikTok connection:', err);
      setError('Network error while checking connection');
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      setError(null);
      
      const response = await tiktokAPI.getAuthUrl();
      
      if (response.success && response.data) {
        // Open TikTok auth in new window
        const authWindow = window.open(
          response.data.auth_url,
          'tiktok-auth',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );
        
        // Listen for auth completion
        const checkClosed = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkClosed);
            // Recheck connection after auth window closes
            setTimeout(checkConnection, 1000);
          }
        }, 1000);
        
        return true;
      } else {
        setError(response.message || 'Failed to get authorization URL');
        return false;
      }
    } catch (err) {
      console.error('Error connecting to TikTok:', err);
      setError('Network error while connecting');
      return false;
    }
  }, [checkConnection]);

  const disconnect = useCallback(async () => {
    try {
      setError(null);
      
      const response = await tiktokAPI.disconnect();
      
      if (response.success) {
        setStatus({ connected: false });
        return true;
      } else {
        setError(response.message || 'Failed to disconnect');
        return false;
      }
    } catch (err) {
      console.error('Error disconnecting TikTok:', err);
      setError('Network error while disconnecting');
      return false;
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

// Hook for TikTok video upload
export const useTikTokUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [publishId, setPublishId] = useState<string | null>(null);

  const uploadVideo = useCallback(async (file: File, uploadData: TikTokUploadRequest) => {
    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);
      
      // Validate file first
      const validation = await import('../services/api/tiktok').then(m => m.tiktokUtils.validateVideoFile(file));
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      const response = await tiktokAPI.uploadVideo(file, uploadData);
      
      if (response.success && response.data) {
        setPublishId(response.data.publish_id);
        setUploadProgress(100);
        return response.data;
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Error uploading video:', err);
      setError(err.message || 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  const checkUploadStatus = useCallback(async (publishId: string) => {
    try {
      const response = await tiktokAPI.getUploadStatus(publishId);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to check status');
      }
    } catch (err: any) {
      console.error('Error checking upload status:', err);
      setError(err.message || 'Failed to check status');
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setUploading(false);
    setUploadProgress(0);
    setError(null);
    setPublishId(null);
  }, []);

  return {
    uploading,
    uploadProgress,
    error,
    publishId,
    uploadVideo,
    checkUploadStatus,
    reset
  };
};

// Hook for fetching TikTok videos
export const useTikTokVideos = (isAdmin: boolean = false) => {
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    limit: 1000, // Set to high number to load all videos
    offset: 0,
    total: 0
  });

  const fetchVideos = useCallback(async (params?: {
    limit?: number;
    offset?: number;
    status?: string;
    search?: string;
    category?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = isAdmin 
        ? await tiktokAPI.getAdminVideos(params)
        : await tiktokAPI.getVideos(params);
      
      if (response.success && response.data) {
        setVideos(response.data.videos);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setError(response.message || 'Failed to fetch videos');
        setVideos([]);
      }
    } catch (err) {
      console.error('Error fetching TikTok videos:', err);
      setError('Network error while fetching videos');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const loadMore = useCallback(async () => {
    if (loading || videos.length >= pagination.total) return;
    
    try {
      const response = isAdmin 
        ? await tiktokAPI.getAdminVideos({
            limit: pagination.limit,
            offset: videos.length
          })
        : await tiktokAPI.getVideos({
            limit: pagination.limit,
            offset: videos.length
          });
      
      if (response.success && response.data) {
        setVideos(prev => [...prev, ...response.data!.videos]);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (err) {
      console.error('Error loading more videos:', err);
      setError('Failed to load more videos');
    }
  }, [loading, videos.length, pagination, isAdmin]);

  const refresh = useCallback(() => {
    fetchVideos({ limit: pagination.limit, offset: 0 });
  }, [fetchVideos, pagination.limit]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return {
    videos,
    loading,
    error,
    pagination,
    fetchVideos,
    loadMore,
    refresh
  };
};

// Hook for TikTok video sync (Superadmin only)
export const useTikTokSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<{
    total_fetched: number;
    new_videos: number;
    updated_videos: number;
  } | null>(null);

  const syncVideos = useCallback(async (limit: number = 20) => {
    try {
      setSyncing(true);
      setError(null);
      
      const response = await tiktokAPI.syncVideos(limit);
      
      if (response.success && response.data) {
        setLastSyncResult(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Sync failed');
      }
    } catch (err: any) {
      console.error('Error syncing videos:', err);
      setError(err.message || 'Sync failed');
      throw err;
    } finally {
      setSyncing(false);
    }
  }, []);

  return {
    syncing,
    error,
    lastSyncResult,
    syncVideos
  };
};

// Hook for TikTok analytics
export const useTikTokAnalytics = () => {
  const [analytics, setAnalytics] = useState<TikTokAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (params?: {
    start_date?: string;
    end_date?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tiktokAPI.getAnalytics(params);
      
      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        setError(response.message || 'Failed to fetch analytics');
        setAnalytics(null);
      }
    } catch (err) {
      console.error('Error fetching TikTok analytics:', err);
      setError('Network error while fetching analytics');
      setAnalytics(null);
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
    fetchAnalytics,
    refresh
  };
};

// Hook for tracking video views
export const useVideoViewTracking = () => {
  const trackView = useCallback(async (
    videoId: number,
    viewData: {
      view_duration?: number;
      view_percentage?: number;
      device_type?: 'desktop' | 'mobile' | 'tablet';
    }
  ) => {
    try {
      await tiktokAPI.trackView(videoId, viewData);
    } catch (err) {
      console.error('Error tracking view:', err);
      // Don't throw error for view tracking to avoid disrupting user experience
    }
  }, []);

  return { trackView };
};