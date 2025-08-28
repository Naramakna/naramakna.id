/**
 * Admin Google Ads Page
 * Manage Google Ads integration and sync
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import {
  useGoogleAdsConfig,
  useGoogleAdsConnection,
  useGoogleAdsSyncStatus,
  useGoogleAdsCampaigns,
  useGoogleAds,
  useGoogleAdsSync
} from '../../hooks/useGoogleAds';

export const AdminGoogleAds: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'ads' | 'config'>('overview');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [googleAuthUrl, setGoogleAuthUrl] = useState<string | null>(null);

  // Hooks
  const { config, loading: configLoading } = useGoogleAdsConfig();
  const { connectionStatus, loading: connectionLoading, testConnection } = useGoogleAdsConnection();
  const { syncStatus, loading: syncLoading, refresh: refreshSync } = useGoogleAdsSyncStatus();
  const { campaigns, loading: campaignsLoading, fetchCampaigns } = useGoogleAdsCampaigns();
  const { ads, loading: adsLoading, fetchAds } = useGoogleAds();
  const { syncing, error: syncError, lastSyncResult, syncAds } = useGoogleAdsSync();

  // Auto-test connection when config is available
  useEffect(() => {
    if (config?.configured && !connectionStatus) {
      testConnection();
    }
  }, [config, connectionStatus, testConnection]);

  // Check URL parameters for success/error messages
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get('connected');
    const error = urlParams.get('error');
    
    if (connected === 'true') {
      // Show success message and test connection
      alert('✅ Google Ads authorization successful! Testing connection...');
      testConnection();
      // Clean up URL
      window.history.replaceState({}, '', '/superadmin/dashboard/google-ads');
    } else if (error === 'auth_failed') {
      alert('❌ Google Ads authorization failed. Please try again.');
      // Clean up URL
      window.history.replaceState({}, '', '/superadmin/dashboard/google-ads');
    }
  }, [testConnection]);

  // Fetch Google Admin Auth URL
  const fetchGoogleAuthUrl = async () => {
    try {
      const response = await fetch('https://naramakna.id/api/auth/google/admin');
      const data = await response.json();
      if (data.success && data.data.auth_url) {
        setGoogleAuthUrl(data.data.auth_url);
        // Open in new tab
        window.open(data.data.auth_url, '_blank');
      } else {
        alert('Failed to get Google Admin auth URL');
      }
    } catch (error) {
      console.error('Error fetching Google auth URL:', error);
      alert('Failed to get Google Admin auth URL');
    }
  };

  // Handle sync
  const handleSync = async () => {
    if (!user || user.role !== 'superadmin') {
      alert('Only superadmin can sync ads');
      return;
    }

    try {
      const result = await syncAds();
      alert(`Sync completed! ${result.synced} ads synced from ${result.campaigns} campaigns.`);
      refreshSync();
    } catch (error) {
      console.error('Sync failed:', error);
      alert(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle campaign selection for ads
  const handleCampaignToggle = (campaignId: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId) 
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  // Fetch ads for selected campaigns
  const handleFetchAds = () => {
    if (selectedCampaigns.length > 0) {
      fetchAds(selectedCampaigns);
    } else {
      fetchAds();
    }
  };

  // Auth loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Auth check - show message instead of redirect
  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Authentication Required</h2>
          <p className="text-yellow-700 mb-4">Please login to access Google Ads integration.</p>
          <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Login
          </a>
        </div>
      </div>
    );
  }

  // Role check - show message instead of redirect  
  if (user?.user_role !== 'superadmin') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-700">You don't have permission to access Google Ads integration. SuperAdmin role required.</p>
        </div>
      </div>
    );
  }

  // Loading state for config
  if (configLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading Google Ads configuration...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Google Ads Integration</h1>
        <p className="mt-2 text-gray-600">
          Automatically sync Google Ads campaigns into your advertisement system
        </p>
      </div>

      {/* Configuration Status */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Configuration Status</h2>
        
        {!config?.configured ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="font-medium text-yellow-800">Google Ads API Not Configured</span>
            </div>
            <p className="text-yellow-700 mb-4">
              To enable Google Ads integration, you need to set up the following environment variables:
            </p>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• GOOGLE_ADS_CLIENT_ID {config?.has_client_id ? '✅' : '❌'}</li>
              <li>• GOOGLE_ADS_CLIENT_SECRET {config?.has_client_secret ? '✅' : '❌'}</li>
              <li>• GOOGLE_ADS_REFRESH_TOKEN {config?.has_refresh_token ? '✅' : '❌'}</li>
              <li>• GOOGLE_ADS_DEVELOPER_TOKEN {config?.has_developer_token ? '✅' : '❌'}</li>
              <li>• GOOGLE_ADS_CUSTOMER_ID {config?.customer_id ? '✅' : '❌'}</li>
            </ul>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium text-green-800">Google Ads API Configured</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={testConnection}
                  disabled={connectionLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {connectionLoading ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
            </div>
            {connectionStatus && (
              <div className="mt-3">
                {connectionStatus.connected ? (
                  <div className="text-green-700">
                    <p className="font-medium">✅ Connected to: {connectionStatus.account?.descriptive_name}</p>
                    <p className="text-sm">Customer ID: {connectionStatus.account?.id}</p>
                    <p className="text-sm">Currency: {connectionStatus.account?.currency_code}</p>
                  </div>
                ) : (
                  <div className="text-red-700">
                    <p className="font-medium">❌ Connection failed: {connectionStatus.error}</p>
                    {connectionStatus.error?.includes('Authentication required') && (
                      <div className="mt-2 text-sm">
                        <p>Please check Google Ads credentials in server configuration.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sync Status */}
      {config?.configured && (
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Sync Status</h2>
            <div className="flex space-x-2">
              {user?.role === 'superadmin' && (
                <button
                  onClick={handleSync}
                  disabled={syncing || !connectionStatus?.connected}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </button>
              )}
              <button
                onClick={refreshSync}
                disabled={syncLoading}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
              >
                {syncLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {syncError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {syncError}
            </div>
          )}

          {syncStatus && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-blue-600">Local Google Ads</p>
                <p className="text-2xl font-bold text-blue-800">{syncStatus.local_google_ads}</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <p className="text-sm text-green-600">Active Ads</p>
                <p className="text-2xl font-bold text-green-800">{syncStatus.active_google_ads}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <p className="text-sm text-purple-600">Connection Status</p>
                <p className="text-lg font-bold text-purple-800">
                  {syncStatus.connected ? '✅ Connected' : '❌ Disconnected'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">Last Sync</p>
                <p className="text-sm font-medium text-gray-800">
                  {syncStatus.last_sync ? new Date(syncStatus.last_sync).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
          )}

          {lastSyncResult && (
            <div className="mt-4 bg-gray-50 rounded p-4">
              <h3 className="font-medium mb-2">Last Sync Result:</h3>
              <p className="text-sm text-gray-600">
                Synced {lastSyncResult.synced} ads from {lastSyncResult.campaigns} campaigns 
                (Total: {lastSyncResult.total_ads} ads processed)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      {config?.configured && connectionStatus?.connected && (
        <>
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'campaigns', label: 'Campaigns' },
                  { id: 'ads', label: 'Ads Preview' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'campaigns' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Google Ads Campaigns</h3>
                <button
                  onClick={fetchCampaigns}
                  disabled={campaignsLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {campaignsLoading ? 'Loading...' : 'Fetch Campaigns'}
                </button>
              </div>

              {campaignsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2">Loading campaigns...</p>
                </div>
              ) : campaigns.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCampaigns(campaigns.map(c => c.id));
                              } else {
                                setSelectedCampaigns([]);
                              }
                            }}
                            checked={selectedCampaigns.length === campaigns.length}
                          />
                        </th>
                        <th className="px-4 py-2 text-left">Campaign Name</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Budget</th>
                        <th className="px-4 py-2 text-left">Performance</th>
                        <th className="px-4 py-2 text-left">Dates</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign) => (
                        <tr key={campaign.id} className="border-b">
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={selectedCampaigns.includes(campaign.id)}
                              onChange={() => handleCampaignToggle(campaign.id)}
                            />
                          </td>
                          <td className="px-4 py-2 font-medium">{campaign.name}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              campaign.status === 'ENABLED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="px-4 py-2">Rp {campaign.budget.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-2 text-sm">
                            <div>👁️ {campaign.impressions.toLocaleString()}</div>
                            <div>🖱️ {campaign.clicks.toLocaleString()} ({(campaign.ctr * 100).toFixed(2)}%)</div>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <div>{campaign.start_date}</div>
                            <div>{campaign.end_date}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No campaigns found. Click "Fetch Campaigns" to load data from Google Ads.
                </div>
              )}
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Ads Preview</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleFetchAds}
                    disabled={adsLoading || selectedCampaigns.length === 0}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {adsLoading ? 'Loading...' : 'Preview Selected'}
                  </button>
                  <button
                    onClick={() => fetchAds()}
                    disabled={adsLoading}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
                  >
                    {adsLoading ? 'Loading...' : 'Preview All'}
                  </button>
                </div>
              </div>

              {selectedCampaigns.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
                  <p className="text-yellow-800">Select campaigns from the "Campaigns" tab to preview their ads.</p>
                </div>
              )}

              {adsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2">Loading ads...</p>
                </div>
              ) : ads.length > 0 ? (
                <div className="space-y-4">
                  {ads.map((ad) => (
                    <div key={ad.google_ad_id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{ad.name}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ad.status === 'ENABLED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ad.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Campaign: {ad.campaign_name} | Ad Group: {ad.ad_group_name}
                      </p>
                      <div className="bg-gray-50 rounded p-3 mb-2">
                        <div dangerouslySetInnerHTML={{ __html: ad.ad_content }} />
                        {ad.media_url && (
                          <img src={ad.media_url} alt="Ad media" className="mt-2 max-w-xs rounded" />
                        )}
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Type: {ad.type}</span>
                        <span>👁️ {ad.impressions.toLocaleString()} | 🖱️ {ad.clicks.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No ads found. Select campaigns and click "Preview Selected" to see ads.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};