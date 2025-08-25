/**
 * Google Ads React Hooks
 * Custom hooks for Google Ads integration
 */

import { useState, useEffect, useCallback } from 'react';
import { googleAdsAPI, type GoogleAdsConfig, type GoogleAdsSyncStatus, type GoogleAdsCampaign, type GoogleAd, type GoogleAdsSyncResult } from '../services/api/googleAds';

/**
 * Hook for Google Ads configuration
 */
export const useGoogleAdsConfig = () => {
  const [config, setConfig] = useState<GoogleAdsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await googleAdsAPI.getConfig();
      setConfig(response.data);
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : 'Failed to get Google Ads config';
      
      // Check if error is due to authentication
      if (errorMessage.includes('401') || errorMessage.includes('Access token required') || errorMessage.includes('Unauthorized')) {
        errorMessage = 'Authentication required. Please login to access Google Ads configuration.';
        setError(errorMessage);
        return;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch config on mount
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return {
    config,
    loading,
    error,
    refresh: fetchConfig
  };
};

/**
 * Hook for Google Ads connection testing
 */
export const useGoogleAdsConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<{ connected: boolean; account: any | null; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await googleAdsAPI.testConnection();
      setConnectionStatus(response.data);
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : 'Connection test failed';
      
      // Check if error is due to authentication
      if (errorMessage.includes('401') || errorMessage.includes('Access token required') || errorMessage.includes('Unauthorized')) {
        errorMessage = 'Authentication required. Please login to test Google Ads connection.';
        setError(errorMessage);
        setConnectionStatus({ connected: false, account: null, error: errorMessage });
        return;
      }
      
      setError(errorMessage);
      setConnectionStatus({ connected: false, account: null, error: errorMessage });
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    connectionStatus,
    loading,
    error,
    testConnection
  };
};

/**
 * Hook for Google Ads sync status
 */
export const useGoogleAdsSyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState<GoogleAdsSyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await googleAdsAPI.getSyncStatus();
      setSyncStatus(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get sync status');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch status on mount
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    syncStatus,
    loading,
    error,
    refresh: fetchStatus
  };
};

/**
 * Hook for Google Ads campaigns
 */
export const useGoogleAdsCampaigns = () => {
  const [campaigns, setCampaigns] = useState<GoogleAdsCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await googleAdsAPI.getCampaigns();
      setCampaigns(response.data.campaigns);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get campaigns');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    campaigns,
    loading,
    error,
    fetchCampaigns
  };
};

/**
 * Hook for Google Ads
 */
export const useGoogleAds = () => {
  const [ads, setAds] = useState<GoogleAd[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAds = useCallback(async (campaignIds?: string[]) => {
    try {
      setLoading(true);
      setError(null);
      const response = await googleAdsAPI.getAds(campaignIds);
      setAds(response.data.ads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get ads');
      setAds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    ads,
    loading,
    error,
    fetchAds
  };
};

/**
 * Hook for Google Ads sync operations
 */
export const useGoogleAdsSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<GoogleAdsSyncResult | null>(null);

  const syncAds = useCallback(async () => {
    try {
      setSyncing(true);
      setError(null);
      const response = await googleAdsAPI.syncAds();
      setLastSyncResult(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sync failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSyncing(false);
    }
  }, []);

  const scheduleSync = useCallback(async (syncToken: string) => {
    try {
      setSyncing(true);
      setError(null);
      const response = await googleAdsAPI.scheduleSync(syncToken);
      setLastSyncResult(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Scheduled sync failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSyncing(false);
    }
  }, []);

  return {
    syncing,
    error,
    lastSyncResult,
    syncAds,
    scheduleSync
  };
};