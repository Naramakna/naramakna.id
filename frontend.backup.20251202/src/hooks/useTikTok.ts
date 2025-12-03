// Custom hook untuk TikTok API integration
import { useState, useEffect, useCallback } from 'react';
import { tiktokAPI } from '../services/api/tiktok';
import type {
  TikTokProfile,
  TikTokVideo,
  TikTokContent,
  UseTikTokOptions,
  UseTikTokReturn
} from '../types/tiktok';

export const useTikTok = (options: UseTikTokOptions = {}): UseTikTokReturn => {
  const { autoSync = false, syncInterval = 3600000 } = options; // Default 1 hour

  // State
  const [profile, setProfile] = useState<TikTokProfile | null>(null);
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [content, setContent] = useState<TikTokContent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authURL, setAuthURL] = useState<string | null>(null);
  const [stats, setStats] = useState({
    rateLimitRemaining: 0,
    lastSync: undefined as Date | undefined
  });

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get connection status
  const refreshStatus = useCallback(async () => {
    try {
      clearError();
      const statusResponse = await tiktokAPI.getStatus();
      
      setIsConnected(statusResponse.connected);
      setStats(prev => ({
        ...prev,
        rateLimitRemaining: statusResponse.rateLimitRemaining
      }));

      if (statusResponse.connected) {
        // Get profile if connected
        try {
          const profileResponse = await tiktokAPI.getProfile();
          setProfile(profileResponse.profile);
        } catch (profileError) {
          console.warn('Failed to get TikTok profile:', profileError);
        }
      }
    } catch (err: any) {
      // Handle 403/401 errors gracefully (user not authenticated)
      if (err.message.includes('403') || err.message.includes('401') || err.message.includes('Forbidden')) {
        setIsConnected(false);
        setProfile(null);
        // Don't set this as an error since it's expected behavior
        console.info('TikTok not connected - authentication required');
      } else {
        setError(err.message);
      }
      setIsConnected(false);
    }
  }, [clearError]);

  // Connect to TikTok
  const connect = useCallback(async () => {
    try {
      clearError();
      setIsLoading(true);
      
      const authResponse = await tiktokAPI.getAuthURL();
      setAuthURL(authResponse.authURL || null);
      
      if (authResponse.authURL) {
        // Open auth URL in new window
        window.open(authResponse.authURL, 'tiktok-auth', 'width=600,height=700');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  // Disconnect from TikTok
  const disconnect = useCallback(async () => {
    try {
      clearError();
      setIsLoading(true);
      
      await tiktokAPI.disconnect();
      
      // Clear state
      setProfile(null);
      setVideos([]);
      setIsConnected(false);
      setAuthURL(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  // Sync content
  const syncContent = useCallback(async () => {
    if (!isConnected) {
      setError('TikTok not connected');
      return;
    }

    try {
      clearError();
      setIsLoading(true);
      
      const syncResponse = await tiktokAPI.syncContent();
      
      if (syncResponse.success) {
        setStats(prev => ({
          ...prev,
          lastSync: new Date()
        }));
        
        // Refresh content after sync
        await loadContent();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, clearError]);

  // Get videos
  const getVideos = useCallback(async (cursor?: string) => {
    if (!isConnected) {
      setError('TikTok not connected');
      return;
    }

    try {
      clearError();
      setIsLoading(true);
      
      const videosResponse = await tiktokAPI.getVideos(cursor);
      
      if (cursor) {
        // Append to existing videos (pagination)
        setVideos(prev => [...prev, ...videosResponse.videos]);
      } else {
        // Replace videos (fresh load)
        setVideos(videosResponse.videos);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, clearError]);

  // Load content from database
  const loadContent = useCallback(async (limit = 10, offset = 0) => {
    try {
      clearError();
      
      const contentResponse = await tiktokAPI.getContent(limit, offset);
      
      if (offset === 0) {
        setContent(contentResponse.content || []);
      } else {
        setContent(prev => [...prev, ...(contentResponse.content || [])]);
      }
    } catch (err: any) {
      // Handle authentication errors gracefully for content endpoint
      if (err.message.includes('403') || err.message.includes('401') || err.message.includes('Forbidden')) {
        console.info('TikTok content not available - authentication may be required');
        setContent([]); // Set empty array instead of error
      } else {
        setError(err.message);
      }
    }
  }, [clearError]);

  // Handle OAuth callback
  const handleOAuthCallback = useCallback(async (code: string, state: string) => {
    try {
      clearError();
      setIsLoading(true);
      
      const callbackResponse = await tiktokAPI.handleCallback(code, state);
      
      if (callbackResponse.success && callbackResponse.profile) {
        setIsConnected(true);
        setProfile(callbackResponse.profile as any);
        setAuthURL(null);
        
        // Load initial content
        await loadContent();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [clearError, loadContent]);

  // Auto sync effect
  useEffect(() => {
    if (!autoSync || !isConnected) return;

    const interval = setInterval(() => {
      syncContent();
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSync, isConnected, syncInterval, syncContent]);

  // Initial status check
  useEffect(() => {
    refreshStatus();
    loadContent(); // Load content regardless of connection status
  }, [refreshStatus, loadContent]);

  // Listen for OAuth callback (if using postMessage)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'TIKTOK_OAUTH_SUCCESS') {
        const { code, state } = event.data;
        handleOAuthCallback(code, state);
      } else if (event.data.type === 'TIKTOK_OAUTH_ERROR') {
        setError(event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleOAuthCallback]);

  return {
    // State
    profile,
    videos,
    content,
    isConnected,
    isLoading,
    error,
    authURL,
    stats,
    
    // Actions
    connect,
    disconnect,
    syncContent,
    getVideos,
    refreshStatus
  };
};
