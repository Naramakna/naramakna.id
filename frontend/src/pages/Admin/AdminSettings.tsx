import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../config/api';

export const AdminSettings: React.FC = () => {
  const [showAnalyticsButton, setShowAnalyticsButton] = useState(false);
  const [enablePolling, setEnablePolling] = useState(false);
  const [showViewsCount, setShowViewsCount] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isPollingLoading, setIsPollingLoading] = useState(false);
  const [isTrendingLoading, setIsTrendingLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [pollingMessage, setPollingMessage] = useState('');
  const [trendingMessage, setTrendingMessage] = useState('');

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const [analyticsResponse, pollingResponse, publicSettingsResponse] = await Promise.all([
          fetch(buildApiUrl('admin/settings/analytics-button'), {
            credentials: 'include',
            headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
          }),
          fetch(buildApiUrl('admin/settings/polling'), {
            credentials: 'include',
            headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
          }),
          fetch(buildApiUrl('settings/public'))
        ]);

        const analyticsResult = await analyticsResponse.json();
        const pollingResult = await pollingResponse.json();
        const publicSettingsResult = await publicSettingsResponse.json();

        if (analyticsResult.success) {
          setShowAnalyticsButton(analyticsResult.data.show_analytics_button);
        } else {
          console.error('Analytics settings error:', analyticsResult.message);
        }

        if (pollingResult.success) {
          setEnablePolling(pollingResult.data.enable_polling);
        } else {
          console.error('Polling settings error:', pollingResult.message);
          // Keep current state, don't change to default
        }

        if (publicSettingsResult.success) {
          setShowViewsCount(publicSettingsResult.data.show_views_count);
        } else {
          console.error('Views count settings error:', publicSettingsResult.message);
          setShowViewsCount(true); // Default fallback
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        setMessage('Error loading settings');
        // Don't change state values on error - keep existing values
      }
    };

    fetchSettings();
  }, []);

  // Toggle analytics button setting
  const handleToggleAnalyticsButton = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('admin/settings/analytics-button/toggle'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({
          enabled: !showAnalyticsButton
        })
      });

      const result = await response.json();

      if (result.success) {
        setShowAnalyticsButton(result.data.show_analytics_button);
        setMessage(`Analytics button ${result.data.show_analytics_button ? 'enabled' : 'disabled'} successfully`);
      } else {
        setMessage(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error toggling analytics button:', error);
      setMessage('Error updating setting');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle views count setting
  const handleToggleViewsCount = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('settings/toggle-views-count'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({
          enabled: !showViewsCount
        })
      });

      const result = await response.json();

      if (result.success) {
        setShowViewsCount(result.data.views_count_enabled);
        setMessage(`Views count ${result.data.views_count_enabled ? 'enabled' : 'disabled'} successfully`);
      } else {
        setMessage(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error toggling views count:', error);
      setMessage('Error updating setting');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle polling setting
  const handleTogglePolling = async () => {
    setIsPollingLoading(true);
    setPollingMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('admin/settings/polling/toggle'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({
          enabled: !enablePolling
        })
      });

      const result = await response.json();

      if (result.success) {
        setEnablePolling(result.data.enable_polling);
        setPollingMessage(`Polling ${result.data.enable_polling ? 'enabled' : 'disabled'} successfully`);
      } else {
        setPollingMessage(`Error: ${result.message}`);
        // Don't change the toggle state if there's an error
      }
    } catch (error) {
      console.error('Error toggling polling:', error);
      setPollingMessage('Error updating polling setting');
      // Don't change the toggle state if there's an error
    } finally {
      setIsPollingLoading(false);
      // Clear message after 5 seconds
      setTimeout(() => setPollingMessage(''), 5000);
    }
  };

  // Manual trending update
  const handleManualTrendingUpdate = async () => {
    setIsTrendingLoading(true);
    setTrendingMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('trending/admin/update'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setTrendingMessage('Trending topics updated successfully! The update may take a few moments to reflect on the site.');
      } else {
        setTrendingMessage(`Error: ${result.message || 'Failed to update trending topics'}`);
      }
    } catch (error) {
      console.error('Error updating trending topics:', error);
      setTrendingMessage('Error updating trending topics. Please try again.');
    } finally {
      setIsTrendingLoading(false);
      // Clear message after 5 seconds
      setTimeout(() => setTrendingMessage(''), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">⚙️ System Settings</h2>
        <p className="text-gray-600">Manage global system settings and configurations.</p>
      </div>

      {/* Analytics Button Setting */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Button Visibility</h3>
            <p className="text-gray-600 mb-4">
              Control whether the Analytics button is shown in article headers or replaced with view count.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Current Behavior:</h4>
              {showAnalyticsButton ? (
                <div className="flex items-center text-green-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Analytics button is visible to users</span>
                </div>
              ) : (
                <div className="flex items-center text-blue-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>View count is displayed instead of analytics button</span>
                </div>
              )}
            </div>
          </div>

          <div className="ml-6 flex flex-col items-center space-y-4">
            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showAnalyticsButton}
                onChange={handleToggleAnalyticsButton}
                disabled={isLoading}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            
            <span className={`text-sm font-medium ${showAnalyticsButton ? 'text-green-600' : 'text-gray-500'}`}>
              {showAnalyticsButton ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mt-4 p-4 rounded-lg ${
            message.includes('Error') 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="mt-4 flex items-center text-blue-600">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Updating setting...
          </div>
        )}
      </div>

      {/* Polling Setting */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">🗳️ Polling System</h3>
            <p className="text-gray-600 mb-4">
              Control whether polling is enabled across all pages. When disabled, no polls will be shown to users.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Current Status:</h4>
              {enablePolling ? (
                <div className="flex items-center text-green-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Polling is enabled - users can see and vote on polls</span>
                </div>
              ) : (
                <div className="flex items-center text-red-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Polling is disabled - no polls shown to users</span>
                </div>
              )}
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-amber-800 text-sm font-medium">SuperAdmin Only</p>
                  <p className="text-amber-700 text-sm mt-1">
                    This setting can only be modified by SuperAdmin users. Regular admin users cannot change polling settings.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="ml-6 flex flex-col items-center space-y-4">
            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enablePolling}
                onChange={handleTogglePolling}
                disabled={isPollingLoading}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>

            <span className={`text-sm font-medium ${enablePolling ? 'text-green-600' : 'text-gray-500'}`}>
              {enablePolling ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        {/* Polling Message */}
        {pollingMessage && (
          <div className={`mt-4 p-4 rounded-lg ${
            pollingMessage.includes('Error')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {pollingMessage}
          </div>
        )}

        {/* Loading indicator */}
        {isPollingLoading && (
          <div className="mt-4 flex items-center text-orange-600">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Updating polling setting...
          </div>
        )}
      </div>

      {/* Views Count Setting */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Views Count Display</h3>
            <p className="text-gray-600 mb-4">
              Control whether view counts are displayed on articles across all pages.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Current Behavior:</h4>
              {showViewsCount ? (
                <div className="flex items-center text-green-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Views count is visible to all users</span>
                </div>
              ) : (
                <div className="flex items-center text-red-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L9 9m.878.878l-.428.428M9 9l.878.878m7.242 7.242L15 15m2.12-2.12l-2.12 2.12M21 3L3 21" />
                  </svg>
                  <span>Views count is hidden from all users</span>
                </div>
              )}
            </div>
          </div>

          <div className="ml-6 flex flex-col items-center space-y-4">
            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showViewsCount}
                onChange={handleToggleViewsCount}
                disabled={isLoading}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            
            <span className={`text-sm font-medium ${showViewsCount ? 'text-green-600' : 'text-gray-500'}`}>
              {showViewsCount ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Trending Topics Management */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">🔥 Trending Topics Management</h3>
            <p className="text-gray-600 mb-4">
              Manually update trending topics cache when the cronjob is having issues (RTO/timeout). 
              This will refresh trending topics data immediately.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-sm text-yellow-800 font-medium">Note:</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Use this button only when the automatic cronjob is not working properly. 
                    Normal trending updates happen automatically every hour.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="ml-6 flex flex-col items-center space-y-4">
            <button
              onClick={handleManualTrendingUpdate}
              disabled={isTrendingLoading}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isTrendingLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Update Trending
                </>
              )}
            </button>
          </div>
        </div>

        {/* Trending Message */}
        {trendingMessage && (
          <div className={`mt-4 p-4 rounded-lg ${
            trendingMessage.includes('Error') 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {trendingMessage}
          </div>
        )}
      </div>

      {/* Additional Settings can be added here */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">More Settings</h3>
        <p className="text-gray-600">Additional system settings will be available here in future updates.</p>
      </div>
    </div>
  );
};
