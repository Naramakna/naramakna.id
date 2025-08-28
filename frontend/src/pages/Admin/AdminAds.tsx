import React, { useState, useEffect } from 'react';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { LoadingSpinner } from '../../components/atoms/LoadingSpinner';
import { FileUpload } from '../../components/atoms/FileUpload/FileUpload';
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
  const { user, isLoading: authLoading } = useAuth();
  
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
  
  // Edit state
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  
  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

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
        setUploadedImageUrl(null);
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

  // Get placement description
  const getPlacementDescription = (placement: string) => {
    const descriptions: { [key: string]: string } = {
      'hero-banner': '🏠 Homepage Banner (970x250)',
      'header': '📄 Header Banner (970x250)', 
      'mid-content': '🏠 Homepage Mid Section',
      'bottom-content': '🏠 Homepage Bottom',
      'popup': '🎯 Homepage Popup (Fullscreen)',
      'regular': '📝 Content Pages (728x90)',
      'sidebar': '📱 Sidebar Ads',
      'article-top': '📰 Article Page Top',
      'article-mid': '📰 Article Page Middle',
      'article-bottom': '📰 Article Page Bottom',
      'article-final': '📰 Article Page End',
      'content-ad': '📰 In-Content Ads',
      'breaking-pre': '⚡ Before Breaking News',
      'breaking-post': '⚡ After Breaking News'
    };
    return descriptions[placement] || `📍 ${placement}`;
  };

  // Start editing an ad
  const startEdit = (ad: Advertisement) => {
    setEditingAdId(ad.id);
    setFormData({
      campaign_name: ad.campaign_name,
      start_date: ad.start_date.split('T')[0],
      end_date: ad.end_date.split('T')[0], 
      budget: ad.budget?.toString() || '',
      placement_type: ad.placement_type,
      media_type: ad.media_type,
      media_url: ad.media_url || '',
      target_url: ad.target_url || '',
      ad_content: ad.ad_content || '',
      google_ads_code: ad.google_ads_code || ''
    });
    setUploadedImageUrl(ad.media_url || null);
    setShowEditForm(true);
    setShowCreateForm(false);
  };

  // Update existing ad
  const updateAd = async () => {
    if (!editingAdId) return;
    
    try {
      setCreating(true);
      setError(null);
      
      const response = await adsAPI.updateAd(editingAdId, {
        advertiser_id: user?.ID?.toString() || '',
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
      });

      if (response.success) {
        setShowEditForm(false);
        setEditingAdId(null);
        // Update local state without full refresh
        setAds(prevAds => prevAds.map(ad => 
          ad.id === editingAdId 
            ? { 
                ...ad, 
                campaign_name: formData.campaign_name,
                start_date: formData.start_date,
                end_date: formData.end_date,
                budget: formData.budget ? parseFloat(formData.budget) : ad.budget,
                placement_type: formData.placement_type as Advertisement['placement_type'],
                media_type: formData.media_type as Advertisement['media_type'],
                media_url: formData.media_url,
                target_url: formData.target_url,
                ad_content: formData.ad_content,
                google_ads_code: formData.google_ads_code
              }
            : ad
        ));
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
        setUploadedImageUrl(null);
      } else {
        setError(response.message || 'Failed to update advertisement');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setCreating(false);
    }
  };

  // Handle file upload
  const handleFileSelect = (file: File) => {
    // File is handled directly in handleFileUpload
    console.log('📎 File selected:', file.name);
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      setError(null);
      
      const response = await adsAPI.uploadAdImage(file);
      
      if (response.success && response.data) {
        const imageUrl = response.data.fullUrl;
        setUploadedImageUrl(imageUrl);
        setFormData(prev => ({
          ...prev,
          media_url: imageUrl
        }));
        console.log('✅ Image uploaded successfully:', imageUrl);
      } else {
        setError(response.message || 'Failed to upload image');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Update ad status
  const updateAdStatus = async (adId: string, status: string) => {
    try {
      const response = await adsAPI.updateAdStatus(adId, status);
      if (response.success) {
        // Update local state without full refresh
        setAds(prevAds => prevAds.map(ad => 
          ad.id === adId ? { ...ad, status: status as any } : ad
        ));
        console.log(`✅ Ad ${adId} status updated to ${status}`);
      } else {
        setError(response.message || 'Failed to update ad status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Delete advertisement
  const deleteAd = async (adId: string, campaignName: string) => {
    // Confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete the ad campaign "${campaignName}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      const response = await adsAPI.deleteAd(adId);
      if (response.success) {
        // Remove from local state
        setAds(prevAds => prevAds.filter(ad => ad.id !== adId));
        console.log(`✅ Ad ${adId} deleted successfully`);
      } else {
        setError(response.message || 'Failed to delete ad');
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

      {/* Ad Rotation Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">⚙️ Ad Rotation Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              🏠 Homepage Banner (hero-banner)
            </label>
            <div className="text-xs text-gray-500 mb-2">
              Current: 3 seconds per rotation
            </div>
            <input
              type="number"
              min="1"
              max="30"
              defaultValue="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Seconds"
            />
            <div className="text-xs text-gray-500">
              Multiple ads will rotate in hero-banner placement
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              📄 Header Banner (header)
            </label>
            <div className="text-xs text-gray-500 mb-2">
              Current: 5 seconds per rotation
            </div>
            <input
              type="number"
              min="1"
              max="30"
              defaultValue="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Seconds"
            />
            <div className="text-xs text-gray-500">
              Multiple ads will rotate in header placement
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              📱 Other Placements
            </label>
            <div className="text-xs text-gray-500 mb-2">
              Current: 10 seconds per rotation
            </div>
            <input
              type="number"
              min="1"
              max="60"
              defaultValue="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Seconds"
            />
            <div className="text-xs text-gray-500">
              Sidebar, article, and other ad placements
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <div className="text-blue-500 text-sm">💡</div>
            <div className="text-sm text-blue-800">
              <strong>How it works:</strong> When multiple ads are assigned to the same placement (e.g., multiple ads in "hero-banner"), 
              they will automatically rotate at the specified interval. Each placement can have different rotation speeds.
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button
            onClick={() => {
              // Here you would implement saving rotation settings
              alert('Rotation settings updated! (Note: This is a demo - implement save functionality)');
            }}
            size="sm"
            variant="primary"
          >
            💾 Save Rotation Settings
          </Button>
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
                <option value="hero-banner">🏠 Homepage Banner (970x250)</option>
                <option value="header">📄 Header Banner (970x250)</option>
                <option value="mid-content">🏠 Homepage Mid Section</option>
                <option value="bottom-content">🏠 Homepage Bottom</option>
                <option value="popup">🎯 Homepage Popup (Fullscreen)</option>
                <option value="regular">📝 Content Pages (728x90)</option>
                <option value="sidebar">📱 Sidebar Ads (300x250)</option>
                <option value="article-top">📰 Article Page Top (970x250)</option>
                <option value="article-ads">📰 Article Page Ad (728x90)</option>
                <option value="article-mid">📰 Article Page Middle (728x90)</option>
                <option value="article-bottom">📰 Article Page Bottom (970x250)</option>
                <option value="article-final">📰 Article Page End (728x90)</option>
              </select>
              
              {/* URL Examples for each placement */}
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                <div className="text-xs font-medium text-gray-700 mb-1">📍 Where this ad will appear:</div>
                <div className="text-xs text-gray-600">
                  {(() => {
                    const placementExamples = {
                      'hero-banner': '• Homepage: https://naramakna.id/',
                      'header': '• Homepage: https://naramakna.id/',
                      'mid-content': '• Homepage: https://naramakna.id/',
                      'bottom-content': '• Homepage: https://naramakna.id/',
                      'popup': '• Homepage: https://naramakna.id/',
                      'regular': '• All content pages: https://naramakna.id/artikel/judul-artikel\n• Video pages: https://naramakna.id/video-story\n• Index pages: https://naramakna.id/index-berita',
                      'sidebar': '• All pages with sidebar content',
                      'article-top': '• Article pages: https://naramakna.id/artikel/judul-artikel',
                      'article-ads': '• Article pages: https://naramakna.id/artikel/judul-artikel',
                      'article-mid': '• Article pages: https://naramakna.id/artikel/judul-artikel',
                      'article-bottom': '• Article pages: https://naramakna.id/artikel/judul-artikel',
                      'article-final': '• Article pages: https://naramakna.id/artikel/judul-artikel'
                    };
                    return placementExamples[formData.placement_type as keyof typeof placementExamples] || 'Various pages';
                  })()}
                </div>
                
                {/* Additional context for specific placements */}
                {formData.placement_type === 'regular' && (
                  <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    <strong>Also appears on:</strong><br/>
                    • Category pages: https://naramakna.id/kategori/laga-gaya<br/>
                    • Video story: https://naramakna.id/video-story<br/>
                    • Index berita: https://naramakna.id/index-berita
                  </div>
                )}
                
                {(formData.placement_type === 'hero-banner' || formData.placement_type === 'header' || formData.placement_type === 'mid-content') && (
                  <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                    <strong>High visibility:</strong> Homepage banners get the most traffic and engagement
                  </div>
                )}
                
                {formData.placement_type.startsWith('article-') && (
                  <div className="mt-2 text-xs text-purple-600 bg-purple-50 p-2 rounded">
                    <strong>Contextual:</strong> Appears on all article detail pages for better content relevance
                  </div>
                )}
              </div>
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
                <option value="google_ads">Google Ads (Manual)</option>
                <option value="google_adsense">Google AdSense (Auto)</option>
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget (IDR)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                placeholder="1000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {/* Media Upload/URL - Hide for AdSense */}
            {(formData.media_type === 'image' || formData.media_type === 'gif' || formData.media_type === 'video') && (
              <div className="md:col-span-2 space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Media Upload or URL
                </label>
                
                {/* File Upload Section */}
                {(formData.media_type === 'image' || formData.media_type === 'gif' || formData.media_type === 'video') && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Upload new {formData.media_type}:</p>
                    <FileUpload
                      onFileSelect={handleFileSelect}
                      onUpload={handleFileUpload}
                      accept={formData.media_type === 'video' ? "video/*" : formData.media_type === 'image' || formData.media_type === 'gif' ? "image/*" : "image/*,video/*"}
                      preview={uploadedImageUrl || formData.media_url}
                      uploading={uploading}
                    />
                  </div>
                )}
                
                {/* Manual URL Input */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Or enter URL manually:</p>
                  <Input
                    value={formData.media_url}
                    onChange={(e) => handleInputChange('media_url', e.target.value)}
                    placeholder={formData.media_type === 'video' ? "https://example.com/video.mp4" : "https://example.com/image.jpg"}
                  />
                </div>
              </div>
            )}

            {/* Target URL - Optional for AdSense */}
            {formData.media_type !== 'google_adsense' && (
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
            )}

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

            {/* Google AdSense Auto */}
            {formData.media_type === 'google_adsense' && (
              <div className="md:col-span-2">
                <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <div className="text-blue-500 text-lg">🎯</div>
                    <div className="text-sm text-blue-900">
                      <strong className="text-lg text-green-600">Google AdSense - Auto Display Network</strong><br/>
                      <p className="mt-2 text-blue-800">
                        Iklan ini memungkinkan <strong>pengiklan dari luar</strong> memasang banner di website naramakna.id 
                        secara otomatis melalui Google AdSense Display Network tanpa harus kontak manual.
                      </p>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <strong className="text-green-700">💰 Cara Kerja Revenue:</strong>
                          <ul className="list-disc ml-4 mt-1 text-xs">
                            <li>Pengiklan bayar Google → Google bayar kita</li>
                            <li>Revenue share: 68% untuk publisher (kita)</li>
                            <li>Estimasi: Rp 3.000-8.000 per 1000 views</li>
                            <li>Otomatis masuk ke rekening Google AdSense</li>
                          </ul>
                        </div>
                        
                        <div>
                          <strong className="text-blue-700">🎯 Targeting Otomatis:</strong>
                          <ul className="list-disc ml-4 mt-1 text-xs">
                            <li>Google cocokkan iklan dengan konten</li>
                            <li>Target audience berdasarkan behavior</li>
                            <li>Iklan dari berbagai advertiser global</li>
                            <li>Optimasi real-time untuk CTR terbaik</li>
                          </ul>
                        </div>
                      </div>

                      <div className="mt-4 bg-white rounded p-3 border-l-4 border-green-400">
                        <strong className="text-gray-700">📍 Placement: {formData.placement_type}</strong><br/>
                        <div className="text-xs text-gray-600 mt-1">
                          {(() => {
                            const placementInfo = {
                              'hero-banner': 'Homepage banner 970x250 - High visibility, premium rates',
                              'header': 'Header banner 970x250 - Consistent visibility across pages',
                              'mid-content': 'Mid-content banner 970x250 - Good engagement rates',
                              'regular': 'Content pages 728x90 - Standard leaderboard format',
                              'sidebar': 'Sidebar ads 300x250 - Medium rectangle, good performance',
                              'article-top': 'Article top 970x250 - High reader engagement',
                              'article-mid': 'Article middle 728x90 - In-content placement',
                              'article-bottom': 'Article bottom 970x250 - End-of-content placement'
                            };
                            return placementInfo[formData.placement_type as keyof typeof placementInfo] || 'Standard placement';
                          })()}
                        </div>
                      </div>

                      <div className="mt-4 text-xs">
                        <strong>🔧 Requirements:</strong> AdSense Publisher ID harus dikonfigurasi di environment variables (.env)
                      </div>
                    </div>
                  </div>
                </div>
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

      {/* Edit Form */}
      {showEditForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Edit Advertisement</h3>
          
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
                <option value="hero-banner">🏠 Homepage Banner (970x250)</option>
                <option value="header">📄 Header Banner (970x250)</option>
                <option value="mid-content">🏠 Homepage Mid Section</option>
                <option value="bottom-content">🏠 Homepage Bottom</option>
                <option value="popup">🎯 Homepage Popup (Fullscreen)</option>
                <option value="regular">📝 Content Pages (728x90)</option>
                <option value="sidebar">📱 Sidebar Ads (300x250)</option>
                <option value="article-top">📰 Article Page Top (970x250)</option>
                <option value="article-ads">📰 Article Page Ad (728x90)</option>
                <option value="article-mid">📰 Article Page Middle (728x90)</option>
                <option value="article-bottom">📰 Article Page Bottom (970x250)</option>
                <option value="article-final">📰 Article Page End (728x90)</option>
              </select>
              
              {/* URL Examples for each placement */}
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                <div className="text-xs font-medium text-gray-700 mb-1">📍 Where this ad will appear:</div>
                <div className="text-xs text-gray-600">
                  {(() => {
                    const placementExamples = {
                      'hero-banner': '• Homepage: https://naramakna.id/',
                      'header': '• Homepage: https://naramakna.id/',
                      'mid-content': '• Homepage: https://naramakna.id/',
                      'bottom-content': '• Homepage: https://naramakna.id/',
                      'popup': '• Homepage: https://naramakna.id/',
                      'regular': '• All content pages: https://naramakna.id/artikel/judul-artikel\n• Video pages: https://naramakna.id/video-story\n• Index pages: https://naramakna.id/index-berita',
                      'sidebar': '• All pages with sidebar content',
                      'article-top': '• Article pages: https://naramakna.id/artikel/judul-artikel',
                      'article-ads': '• Article pages: https://naramakna.id/artikel/judul-artikel',
                      'article-mid': '• Article pages: https://naramakna.id/artikel/judul-artikel',
                      'article-bottom': '• Article pages: https://naramakna.id/artikel/judul-artikel',
                      'article-final': '• Article pages: https://naramakna.id/artikel/judul-artikel'
                    };
                    return placementExamples[formData.placement_type as keyof typeof placementExamples] || 'Various pages';
                  })()}
                </div>
                
                {/* Additional context for specific placements */}
                {formData.placement_type === 'regular' && (
                  <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    <strong>Also appears on:</strong><br/>
                    • Category pages: https://naramakna.id/kategori/laga-gaya<br/>
                    • Video story: https://naramakna.id/video-story<br/>
                    • Index berita: https://naramakna.id/index-berita
                  </div>
                )}
                
                {(formData.placement_type === 'hero-banner' || formData.placement_type === 'header' || formData.placement_type === 'mid-content') && (
                  <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                    <strong>High visibility:</strong> Homepage banners get the most traffic and engagement
                  </div>
                )}
                
                {formData.placement_type.startsWith('article-') && (
                  <div className="mt-2 text-xs text-purple-600 bg-purple-50 p-2 rounded">
                    <strong>Contextual:</strong> Appears on all article detail pages for better content relevance
                  </div>
                )}
              </div>
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
                <option value="google_ads">Google Ads (Manual)</option>
                <option value="google_adsense">Google AdSense (Auto)</option>
              </select>
            </div>

            {/* Media Upload/URL */}
            <div className="md:col-span-2 space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Media Upload or URL *
              </label>
              
              {/* File Upload Section */}
              {(formData.media_type === 'image' || formData.media_type === 'gif' || formData.media_type === 'video') && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Upload new {formData.media_type}:</p>
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    onUpload={handleFileUpload}
                    accept={formData.media_type === 'video' ? "video/*" : formData.media_type === 'image' || formData.media_type === 'gif' ? "image/*" : "image/*,video/*"}
                    preview={uploadedImageUrl || formData.media_url}
                    uploading={uploading}
                  />
                </div>
              )}
              
              {/* Manual URL Input */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Or enter URL manually:</p>
                <Input
                  value={formData.media_url}
                  onChange={(e) => handleInputChange('media_url', e.target.value)}
                  placeholder={formData.media_type === 'video' ? "https://example.com/video.mp4" : "Enter image/video URL"}
                />
              </div>
            </div>

            {/* Target URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target URL
              </label>
              <Input
                value={formData.target_url}
                onChange={(e) => handleInputChange('target_url', e.target.value)}
                placeholder="Enter link destination"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget (IDR)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                placeholder="Enter budget amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={() => {
                setShowEditForm(false);
                setEditingAdId(null);
              }}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={updateAd}
              disabled={creating}
              size="sm"
            >
              {creating ? '⏳ Updating...' : '✅ Update Ad'}
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
                          {ad.media_type === 'video' ? (
                            <video 
                              src={ad.media_url}
                              className="w-16 h-10 object-cover rounded"
                              muted
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <img 
                              src={ad.media_url} 
                              alt={ad.campaign_name}
                              className="w-16 h-10 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
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
                    <div className="text-xs text-blue-600 mt-1">
                      {getPlacementDescription(ad.placement_type)}
                    </div>
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
                    <button
                      onClick={() => startEdit(ad)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      ✏️ Edit
                    </button>
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
                    <button
                      onClick={() => deleteAd(ad.id, ad.campaign_name)}
                      className="text-red-600 hover:text-red-900 ml-2"
                      title="Delete Advertisement"
                    >
                      🗑️ Delete
                    </button>
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
