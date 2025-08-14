import React, { useState, useEffect } from 'react';
import { tiktokAPI } from '../../../services/api/tiktok';
import type { TikTokStatusResponse, TikTokProfile } from '../../../types/tiktok';

interface TikTokIntegrationProps {
  className?: string;
}

export const TikTokIntegration: React.FC<TikTokIntegrationProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<TikTokStatusResponse | null>(null);
  const [profile, setProfile] = useState<TikTokProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const statusResult = await tiktokAPI.getStatus();
      setStatus(statusResult);

      // If connected, fetch profile
      if (statusResult.connected) {
        try {
          const profileResult = await tiktokAPI.getProfile();
          if (profileResult.success) {
            setProfile(profileResult.profile);
          }
        } catch (profileError) {
          console.warn('Could not fetch TikTok profile:', profileError);
        }
      }
    } catch (error) {
      console.error('Failed to fetch TikTok status:', error);
      setStatus({ success: false, connected: false, message: 'Failed to check status' });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const authResponse = await tiktokAPI.getAuthURL();
      
      if (authResponse.success && authResponse.authURL) {
        // Open TikTok auth in new window
        const authWindow = window.open(
          authResponse.authURL,
          'tiktok-auth',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        // Poll for auth completion
        const pollTimer = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(pollTimer);
            // Refresh status after auth window closes
            setTimeout(() => {
              fetchStatus();
              setConnecting(false);
            }, 1000);
          }
        }, 1000);

        // Cleanup timer after 5 minutes
        setTimeout(() => {
          clearInterval(pollTimer);
          setConnecting(false);
        }, 300000);
      }
    } catch (error) {
      console.error('Failed to initiate TikTok connection:', error);
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your TikTok account?')) {
      return;
    }

    try {
      await tiktokAPI.disconnect();
      setStatus({ success: true, connected: false, message: 'TikTok disconnected' });
      setProfile(null);
    } catch (error) {
      console.error('Failed to disconnect TikTok:', error);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const syncResult = await tiktokAPI.syncContent();
      
      if (syncResult.success) {
        alert(`Sync completed! ${syncResult.stats?.savedCount || 0} videos synced.`);
      } else {
        alert('Sync failed. Please try again.');
      }
    } catch (error) {
      console.error('Failed to sync TikTok content:', error);
      alert('Sync failed. Please check your connection and try again.');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.589 6.686a4.793 4.793 0 01-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 01-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 013.183-4.51v-3.5a6.329 6.329 0 00-6.374 6.329 6.372 6.372 0 0012.744 0V9.313a8.243 8.243 0 004.861 1.548v-3.4a4.797 4.797 0 01-1.998-.775z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">TikTok Integration</h2>
              <p className="text-sm text-gray-500">
                {status?.connected ? 'Connected and ready to sync' : 'Connect your TikTok account to sync videos'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              status?.connected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {status?.connected ? 'Connected' : 'Not Connected'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {status?.connected ? (
          <>
            {/* Connected State */}
            {profile && (
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  {profile.avatar_url && (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.display_name}
                      className="w-16 h-16 rounded-full border-2 border-white shadow-sm"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{profile.display_name}</h3>
                    <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">{profile.follower_count?.toLocaleString() || '0'}</span>
                        <p className="text-xs">Followers</p>
                      </div>
                      <div>
                        <span className="font-medium">{profile.video_count?.toLocaleString() || '0'}</span>
                        <p className="text-xs">Videos</p>
                      </div>
                      <div>
                        <span className="font-medium">{profile.likes_count?.toLocaleString() || '0'}</span>
                        <p className="text-xs">Likes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sync Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Content Sync</h4>
                  <p className="text-sm text-gray-500">Sync your latest TikTok videos to the website</p>
                </div>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {syncing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Syncing...
                    </>
                  ) : (
                    <>
                      <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Sync Now
                    </>
                  )}
                </button>
              </div>

              {/* Sync Settings */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Sync Settings</h5>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Only public videos will be synced</p>
                  <p>• Videos with minimum 1,000 views and 100 likes</p>
                  <p>• Maximum 50 videos per sync</p>
                  <p>• Auto-sync runs every 6 hours</p>
                </div>
              </div>
            </div>

            {/* Disconnect Button */}
            <div className="border-t pt-4">
              <button
                onClick={handleDisconnect}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Disconnect TikTok Account
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Not Connected State */}
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.589 6.686a4.793 4.793 0 01-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 01-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 013.183-4.51v-3.5a6.329 6.329 0 00-6.374 6.329 6.372 6.372 0 0012.744 0V9.313a8.243 8.243 0 004.861 1.548v-3.4a4.797 4.797 0 01-1.998-.775z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your TikTok Account</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Automatically sync your TikTok videos to display on your website. Only public videos that meet the criteria will be imported.
              </p>
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {connecting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.589 6.686a4.793 4.793 0 01-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 01-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 013.183-4.51v-3.5a6.329 6.329 0 00-6.374 6.329 6.372 6.372 0 0012.744 0V9.313a8.243 8.243 0 004.861 1.548v-3.4a4.797 4.797 0 01-1.998-.775z"/>
                    </svg>
                    Connect with TikTok
                  </>
                )}
              </button>
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Benefits of TikTok Integration</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Automatic video import from your TikTok account
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Display trending TikTok content on your website
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Increase engagement with multimedia content
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Analytics tracking for video performance
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
