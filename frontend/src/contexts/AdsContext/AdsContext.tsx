import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adsAPI } from '../../services/api';
import type { Advertisement } from '../../services/api';

interface AdsContextType {
  ads: { [placement: string]: Advertisement[] };
  loading: boolean;
  error: string | null;
  getAdsForPlacement: (placement: string) => Advertisement[];
  refreshAds: (placement?: string) => Promise<void>;
  trackClick: (adId: string) => Promise<void>;
}

const AdsContext = createContext<AdsContextType | undefined>(undefined);

interface AdsProviderProps {
  children: ReactNode;
}

export const AdsProvider: React.FC<AdsProviderProps> = ({ children }) => {
  const [ads, setAds] = useState<{ [placement: string]: Advertisement[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;
  const [lastFetch, setLastFetch] = useState<{ [placement: string]: number }>({});

  const getAdsForPlacement = (placement: string): Advertisement[] => {
    return ads[placement] || [];
  };

  const shouldRefresh = (placement: string): boolean => {
    const lastFetchTime = lastFetch[placement];
    if (!lastFetchTime) return true;
    return Date.now() - lastFetchTime > CACHE_DURATION;
  };

  const refreshAds = async (placement?: string) => {
    const placements = placement ? [placement] : ['header', 'regular', 'sidebar', 'hero-banner', 'mid-content', 'bottom-content', 'article-top', 'article-mid', 'article-bottom', 'article-final', 'content-ad', 'breaking-pre', 'breaking-post'];
    // console.log('🎯 AdsContext: Refreshing ads for placements:', placements);
    
    setLoading(true);
    setError(null);

    try {
      const fetchPromises = placements.map(async (p) => {
        if (!shouldRefresh(p) && ads[p]) {
          // console.log(`🎯 AdsContext: Using cached ads for ${p}:`, ads[p]);
          return { placement: p, ads: ads[p] };
        }

        try {
          // console.log(`🎯 AdsContext: Fetching fresh ads for ${p}`);
          const response = await adsAPI.getAds(p, 5);
          // console.log(`🎯 AdsContext: Response for ${p}:`, response);
          
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

  // Initial load
  useEffect(() => {
    refreshAds();
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
    getAdsForPlacement,
    refreshAds,
    trackClick
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
    throw new Error('useAds must be used within an AdsProvider');
  }
  return context;
};
