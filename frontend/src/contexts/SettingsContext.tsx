import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { settingsAPI, PublicSettings } from '../services/api/settings';

interface SettingsContextType {
  settings: PublicSettings | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await settingsAPI.getPublicSettings();

      if (response.success) {
        setSettings(response.data);
      } else {
        setError(response.message || 'Failed to fetch settings');
        // Set safe defaults on API error
        setSettings({
          show_analytics_button: false,
          enable_polling: true
        });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Network error while fetching settings');
      // Set safe defaults on network error
      setSettings({
        show_analytics_button: false,
        enable_polling: true
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const value: SettingsContextType = {
    settings,
    loading,
    error,
    refetch: fetchSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};