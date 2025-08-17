import React, { useState, useEffect } from 'react';

export const AdminSettings: React.FC = () => {
  const [showAnalyticsButton, setShowAnalyticsButton] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch current setting
  useEffect(() => {
    const fetchAnalyticsButtonSetting = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/admin/settings/analytics-button', {
          credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success) {
          setShowAnalyticsButton(result.data.show_analytics_button);
        }
      } catch (error) {
        console.error('Error fetching analytics button setting:', error);
        setMessage('Error loading settings');
      }
    };

    fetchAnalyticsButtonSetting();
  }, []);

  // Toggle analytics button setting
  const handleToggleAnalyticsButton = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/admin/settings/analytics-button/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

      {/* Additional Settings can be added here */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">More Settings</h3>
        <p className="text-gray-600">Additional system settings will be available here in future updates.</p>
      </div>
    </div>
  );
};