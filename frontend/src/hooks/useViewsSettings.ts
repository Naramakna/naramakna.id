/**
 * Hook for managing views display settings
 * Simple hook to handle view count display preferences
 */
import { useState, useEffect } from 'react';

interface ViewsSettings {
  showViewCount: boolean;
  abbreviateViews: boolean;
}

export const useViewsSettings = () => {
  const [settings, setSettings] = useState<ViewsSettings>({
    showViewCount: true,
    abbreviateViews: true
  });

  // You can add logic here to load settings from localStorage or API
  useEffect(() => {
    // For now, just use default settings
    // In the future, you can load from localStorage or user preferences
  }, []);

  const updateSettings = (newSettings: Partial<ViewsSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const formatViews = (viewCount: number): string => {
    if (!settings.abbreviateViews) {
      return viewCount.toString();
    }

    if (viewCount >= 1000000) {
      return `${(viewCount / 1000000).toFixed(1)}M`;
    } else if (viewCount >= 1000) {
      return `${(viewCount / 1000).toFixed(1)}K`;
    }
    return viewCount.toString();
  };

  return {
    ...settings,
    updateSettings,
    formatViews
  };
};