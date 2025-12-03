import React, { useState, useEffect } from 'react';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { LoadingSpinner } from '../../components/atoms/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import type { Advertisement, CreateAdRequest } from '../../services/api';
import { adsAPI } from '../../services/api';

interface AdFormData {
  campaign_name: string;
  start_date: string;
  end_date: string;
  budget: string;
  placement_type: string;
  media_type: string;
  media_url: string;
  target_url: string;
  ad_content: string;
  google_ads_code: string;
}

export const AdminAds: React.FC = () => {
  // Auth check
  const { user, loading: authLoading } = useAuth();
  
  // State management
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<AdFormData>({
    campaign_name: '',
    start_date: '',
    end_date: '',
    budget: '',
    placement_type: 'regular',
    media_type: 'image',
    media_url: '',
    target_url: '',
    ad_content: '',
    google_ads_code: ''
  });

  // Fetch ads
  const fetchAds = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching ads...');
      const response = await adsAPI.getAllAds({ limit: 50 });
      console.log('🔍 API Response:', response);
      
      if (response.success) {
        setAds(response.data.ads);
        console.log('🔍 Ads loaded:', response.data.ads);
      } else {
        console.error('🔍 API Error:', response.message);
        setError(response.message || 'Failed to fetch ads');
      }
    } catch (err) {
      console.error('🔍 Fetch Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔍 Current user:', user);
    console.log('🔍 User role:', user?.user_role);
    
    if (!authLoading && user?.user_role === 'superadmin') {
      fetchAds();
    } else if (!authLoading && user?.user_role !== 'superadmin') {
      setError('Only superadmin can manage advertisements');
      setLoading(false);
    }
  }, [authLoading, user]);

  // Handle form input change
  const handleInputChange = (field: keyof AdFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Create new ad
  const createAd = async () => {
    if (!formData.campaign_name || !formData.start_date || !formData.end_date) {
      setError('Campaign name, start date, and end date are required');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      // Get current user ID from localStorage or auth context
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserId = user?.ID || '1';

      const createData: CreateAdRequest = {
        advertiser_id: currentUserId.toString(),
        campaign_name: formData.campaign_name,
        start_date: formData.start_date,
        end_date: formData.end_date,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        placement_type: formData.placement_type,
        media_type: formData.media_type,
        media_url: formData.media_url,
        target_url: formData.target_url,
        ad_content: formData.ad_content,
        google_ads_code: formData.google_ads_code
      };

      const response = await adsAPI.createAd(createData);
      
      if (response.success) {
        // Reset form
        setFormData({
          campaign_name: '',
          start_date: '',
          end_date: '',
          budget: '',
          placement_type: 'regular',
          media_type: 'image',
          media_url: '',
          target_url: '',
          ad_content: '',
          google_ads_code: ''
        });
        setShowCreateForm(false);
        
        // Refresh ads list
        await fetchAds();
      } else {
        setError(response.message || 'Failed to create ad');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setCreating(false);
    }
  };

  // Update ad status
  const updateAdStatus = async (adId: string, status: string) => {
    try {
      const response = await adsAPI.updateAdStatus(adId, status);
      if (response.success) {
        await fetchAds(); // Refresh list
      } else {
        setError(response.message || 'Failed to update ad status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Show loading while auth is loading
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show error if not superadmin
  if (user?.user_role !== 'superadmin') {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">Only superadmin can manage advertisements</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advertisement Management</h2>
          <p className="text-gray-600">Create and manage advertisement campaigns</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant="primary"
          size="sm"
        >
          {showCreateForm ? '✕ Cancel' : '+ Create Ad'}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">{ads.length}</div>
          <div className="text-gray-600">Total Ads</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {ads.filter(ad => ad.status === 'active').length}
          </div>
          <div className="text-gray-600">Active Ads</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">
            {ads.filter(ad => ad.status === 'pending').length}
          </div>
          <div className="text-gray-600">Pending Ads</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">
            {ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0).toLocaleString()}
          </div>
          <div className="text-gray-600">Total Impressions</div>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Create New Advertisement</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campaign Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Name *
              </label>
              <Input
                value={formData.campaign_name}
                onChange={(e) => handleInputChange('campaign_name', e.target.value)}
                placeholder="Enter campaign name"
              />
            </div>

            {/* Placement Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placement Type
              </label>
              <select
                value={formData.placement_type}
                onChange={(e) => handleInputChange('placement_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="header">Header (970x250)</option>
                <option value="regular">Regular (728x90)</option>
                <option value="sidebar">Sidebar</option>
                <option value="inline">Inline</option>
                <option value="footer">Footer</option>
              </select>
            </div>

            {/* Media Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Media Type
              </label>
              <select
                value={formData.media_type}
                onChange={(e) => handleInputChange('media_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="image">Image</option>
                <option value="gif">GIF</option>
                <option value="video">Video</option>
                <option value="html">HTML Content</option>
                <option value="google_ads">Google Ads</option>
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget (IDR)
              </label>
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                placeholder="1000000"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Media URL */}
            {(formData.media_type === 'image' || formData.media_type === 'gif' || formData.media_type === 'video') && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Media URL
                </label>
                <Input
                  value={formData.media_url}
                  onChange={(e) => handleInputChange('media_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            )}

            {/* Target URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target URL
              </label>
              <Input
                value={formData.target_url}
                onChange={(e) => handleInputChange('target_url', e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            {/* HTML Content */}
            {formData.media_type === 'html' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HTML Content
                </label>
                <textarea
                  value={formData.ad_content}
                  onChange={(e) => handleInputChange('ad_content', e.target.value)}
                  placeholder="<div>Your HTML content here</div>"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
            )}

            {/* Google Ads Code */}
            {formData.media_type === 'google_ads' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Ads Code
                </label>
                <textarea
                  value={formData.google_ads_code}
                  onChange={(e) => handleInputChange('google_ads_code', e.target.value)}
                  placeholder="Paste your Google AdSense code here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={() => setShowCreateForm(false)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={createAd}
              disabled={creating}
              size="sm"
            >
              {creating ? '⏳ Creating...' : '✅ Create Ad'}
            </Button>
          </div>
        </div>
      )}

      {/* Ads Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Advertisement Campaigns</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Placement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ads.map((ad) => (
                <tr key={ad.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      {/* Ad Preview */}
                      {ad.media_url && (
                        <div className="flex-shrink-0">
                          <img 
                            src={ad.media_url} 
                            alt={ad.campaign_name}
                            className="w-16 h-10 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{ad.campaign_name}</div>
                        <div className="text-sm text-gray-500">
                          {ad.advertiser && <span>By {ad.advertiser}</span>}
                        </div>
                        {ad.target_url && (
                          <div className="text-xs text-blue-600 truncate max-w-xs">
                            → {ad.target_url}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{ad.media_type}</div>
                    <div className="text-sm text-gray-500 capitalize">{ad.placement_type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{new Date(ad.start_date).toLocaleDateString()}</div>
                    <div className="text-gray-500">to {new Date(ad.end_date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{ad.impressions || 0} impressions</div>
                    <div className="text-gray-500">{ad.clicks || 0} clicks</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ad.status === 'active' ? 'bg-green-100 text-green-800' :
                      ad.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      ad.status === 'paused' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {ad.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {ad.status === 'active' && (
                      <button
                        onClick={() => updateAdStatus(ad.id, 'paused')}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        ⏸️ Pause
                      </button>
                    )}
                    {ad.status === 'paused' && (
                      <button
                        onClick={() => updateAdStatus(ad.id, 'active')}
                        className="text-green-600 hover:text-green-900"
                      >
                        ▶️ Resume
                      </button>
                    )}
                    {ad.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateAdStatus(ad.id, 'active')}
                          className="text-green-600 hover:text-green-900"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => updateAdStatus(ad.id, 'rejected')}
                          className="text-red-600 hover:text-red-900"
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {ads.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No advertisements found</div>
              <Button
                onClick={() => setShowCreateForm(true)}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                Create Your First Ad
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
