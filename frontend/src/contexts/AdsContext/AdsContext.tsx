import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { adsAPI } from '../../services/api';
import type { Advertisement } from '../../services/api';

interface AdsContextType {
  ads: { [placement: string]: Advertisement[] };
  loading: boolean;
  error: string | null;
  placeholderVisible: boolean;
  placeholderSettings: { [placement: string]: boolean };
  getAdsForPlacement: (placement: string) => Advertisement[];
  refreshAds: (placement?: string, forceRefresh?: boolean) => Promise<void>;
  forceRefreshAds: (placement?: string) => Promise<void>;
  trackClick: (adId: string) => Promise<void>;
  isPlaceholderVisible: (placement: string) => boolean;
}

const AdsContext = createContext<AdsContextType | undefined>(undefined);

interface AdsProviderProps {
  children: ReactNode;
}

export const AdsProvider: React.FC<AdsProviderProps> = ({ children }) => {
  const [ads, setAds] = useState<{ [placement: string]: Advertisement[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Placeholder visibility state
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [placeholderSettings, setPlaceholderSettings] = useState<{ [placement: string]: boolean }>({});

  // Cache duration in milliseconds (10 seconds for testing)
  const CACHE_DURATION = 10 * 1000;
  const [lastFetch, setLastFetch] = useState<{ [placement: string]: number }>({});

  const getAdsForPlacement = (placement: string): Advertisement[] => {
    return ads[placement] || [];
  };

  const isPlaceholderVisible = (placement: string): boolean => {
    // If global placeholder is off, no placeholders are visible
    if (!placeholderVisible) return false;
    
    // Check individual placement setting
    return placeholderSettings[placement] !== false;
  };

  // Load placeholder settings from localStorage
  const loadPlaceholderSettings = () => {
    try {
      const saved = localStorage.getItem('naramakna_placeholder_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        setPlaceholderVisible(settings.global !== undefined ? settings.global : true);
        setPlaceholderSettings(settings.placements || {});
        console.log('🎯 AdsContext: Loaded placeholder settings:', settings);
      }
    } catch (err) {
      console.error('🎯 AdsContext: Failed to load placeholder settings:', err);
    }
  };

  const shouldRefresh = (placement: string): boolean => {
    const lastFetchTime = lastFetch[placement];
    if (!lastFetchTime) return true;
    return Date.now() - lastFetchTime > CACHE_DURATION;
  };

  const refreshAds = async (placement?: string, forceRefresh: boolean = false) => {
    const placements = placement ? [placement] : ['header', 'regular', 'sidebar', 'hero-banner', 'mid-content', 'bottom-content', 'article-top', 'article-mid', 'article-bottom', 'article-final', 'article-ads', 'breaking-pre', 'breaking-post'];
    console.log('🎯 AdsContext: Refreshing ads for placements:', placements, 'forceRefresh:', forceRefresh);
    
    setLoading(true);
    setError(null);

    try {
      const fetchPromises = placements.map(async (p) => {
        if (!forceRefresh && !shouldRefresh(p) && ads[p]) {
          console.log(`🎯 AdsContext: Using cached ads for ${p}:`, ads[p]);
          return { placement: p, ads: ads[p] };
        }

        try {
          console.log(`🎯 AdsContext: Fetching fresh ads for ${p}`);
          const response = await adsAPI.getAds(p, 5);
          console.log(`🎯 AdsContext: Response for ${p}:`, response);
          
          if (response.success) {
            setLastFetch(prev => ({ ...prev, [p]: Date.now() }));
            console.log(`🎯 AdsContext: Found ${response.data.ads.length} ads for ${p}`);
            return { placement: p, ads: response.data.ads };
          } else {
            console.warn(`🎯 AdsContext: Failed to fetch ads for ${p}:`, response.message);
            return { placement: p, ads: [] };
          }
        } catch (err) {
          console.error(`🎯 AdsContext: Error fetching ads for ${p}:`, err);
          return { placement: p, ads: [] };
        }
      });

      const results = await Promise.all(fetchPromises);
      // console.log('🎯 AdsContext: All fetch results:', results);
      
      setAds(prevAds => {
        const newAds = { ...prevAds };
        results.forEach(({ placement: p, ads: placementAds }) => {
          newAds[p] = placementAds;
        });
        // console.log('🎯 AdsContext: Updated ads state:', newAds);
        return newAds;
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ads');
      console.error('Error refreshing ads:', err);
    } finally {
      setLoading(false);
    }
  };

  const trackClick = async (adId: string) => {
    try {
      await adsAPI.trackClick(adId);
      console.log(`Tracked click for ad ${adId}`);
    } catch (err) {
      console.error('Error tracking ad click:', err);
    }
  };

  const forceRefreshAds = async (placement?: string) => {
    console.log('🎯 AdsContext: Force refreshing ads...');
    setLastFetch({}); // Clear cache
    await refreshAds(placement, true);
  };

  // Initial load
  useEffect(() => {
    refreshAds();
    loadPlaceholderSettings();
    
    // Listen for placeholder settings changes
    const handlePlaceholderSettingsChange = (event: CustomEvent) => {
      const settings = event.detail;
      setPlaceholderVisible(settings.global !== undefined ? settings.global : true);
      setPlaceholderSettings(settings.placements || {});
      console.log('🎯 AdsContext: Placeholder settings updated:', settings);
    };
    
    window.addEventListener('placeholderSettingsChanged', handlePlaceholderSettingsChange as EventListener);
    
    // Add global debug function
    if (typeof window !== 'undefined') {
      (window as any).forceRefreshAds = forceRefreshAds;
      (window as any).clearAdsCache = () => {
        console.log('🎯 Clearing ads cache...');
        setLastFetch({});
        setAds({});
        forceRefreshAds();
      };
      (window as any).getAdsDebug = () => {
        console.log('🎯 Current ads state:', ads);
        console.log('🎯 Last fetch times:', lastFetch);
        console.log('🎯 Placeholder settings:', { placeholderVisible, placeholderSettings });
        return { ads, lastFetch, placeholderVisible, placeholderSettings };
      };
    }
    
    return () => {
      window.removeEventListener('placeholderSettingsChanged', handlePlaceholderSettingsChange as EventListener);
    };
  }, []);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAds();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const contextValue: AdsContextType = {
    ads,
    loading,
    error,
    placeholderVisible,
    placeholderSettings,
    getAdsForPlacement,
    refreshAds,
    forceRefreshAds,
    trackClick,
    isPlaceholderVisible
  };

  return (
    <AdsContext.Provider value={contextValue}>
      {children}
    </AdsContext.Provider>
  );
};

export const useAds = (): AdsContextType => {
  const context = useContext(AdsContext);
  if (!context) {
    console.error('useAds called outside AdsProvider! Stack trace:', new Error().stack);
    throw new Error('useAds must be used within an AdsProvider');
  }
  return context;
};
