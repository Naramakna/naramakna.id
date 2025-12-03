import { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api/settings';
import type { PublicSettings } from '../services/api/settings';

export const useSettings = () => {
  const [settings, setSettings] = useState<PublicSettings>({
    show_analytics_button: false,
    enable_polling: true,
    show_views_count: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await settingsAPI.getPublicSettings();

        if (response.success) {
          setSettings(response.data);
        } else {
          setError(response.message || 'Failed to fetch settings');
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Network error while fetching settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error
  };
};