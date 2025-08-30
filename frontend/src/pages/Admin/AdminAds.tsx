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
  start_time: string;
  end_date: string;
  end_time: string;
  duration_hours: string;
  duration_type: 'date' | 'hours' | 'datetime'; // 'datetime' for date+time picker
  rotation_mode: 'global' | 'manual'; // Use global settings or manual duration
  rotation_duration: string; // Duration in minutes for ad rotation (only for manual mode)
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
    start_time: '',
    end_date: '',
    end_time: '',
    duration_hours: '',
    duration_type: 'datetime',
    rotation_mode: 'global', // Default to global settings
    rotation_duration: '30', // Default 30 minutes for manual mode
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
  
  // Filter state
  const [placementFilter, setPlacementFilter] = useState<string>('all');
  
  // Global settings state
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [selectedPlacements, setSelectedPlacements] = useState<string[]>([]);
  const [globalToggleMode, setGlobalToggleMode] = useState<'enable' | 'disable'>('enable');

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
    if (!formData.campaign_name) {
      setError('Campaign name is required');
      return;
    }
    
    if (formData.duration_type === 'datetime') {
      if (!formData.start_date) {
        setError('Start date is required');
        return;
      }
      if (!formData.start_time) {
        setError('Start time is required');
        return;
      }
      if (!formData.end_date) {
        setError('End date is required');
        return;
      }
      if (!formData.end_time) {
        setError('End time is required');
        return;
      }
    } else if (formData.duration_type === 'date' && !formData.start_date) {
      setError('Start date is required when using date duration');
      return;
    } else if (formData.duration_type === 'date' && !formData.end_date) {
      setError('End date is required when using date duration');
      return;
    } else if (formData.duration_type === 'hours' && !formData.duration_hours) {
      setError('Duration in hours is required when using hourly duration');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      // Get current user ID from localStorage or auth context
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserId = user?.ID || '1';

      // Calculate start and end dates for datetime mode
      let finalStartDate, finalEndDate;
      
      if (formData.duration_type === 'datetime') {
        // Combine date and time for WIB timezone
        finalStartDate = `${formData.start_date}T${formData.start_time}:00+07:00`;
        finalEndDate = `${formData.end_date}T${formData.end_time}:00+07:00`;
      } else {
        finalStartDate = formData.duration_type === 'hours' ? '' : formData.start_date;
        finalEndDate = formData.duration_type === 'date' ? formData.end_date : undefined;
      }

      const createData: CreateAdRequest = {
        advertiser_id: currentUserId.toString(),
        campaign_name: formData.campaign_name,
        start_date: finalStartDate,
        end_date: finalEndDate,
        duration_hours: formData.duration_type === 'hours' ? parseInt(formData.duration_hours) : undefined,
        rotation_duration: formData.rotation_mode === 'manual' ? parseInt(formData.rotation_duration) || 30 : null,
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
          start_time: '',
          end_date: '',
          end_time: '',
          duration_hours: '',
          duration_type: 'datetime',
          rotation_mode: 'global',
          rotation_duration: '30',
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
    
    // Parse existing dates for edit form
    const startDateObj = new Date(ad.start_date);
    const endDateObj = new Date(ad.end_date);
    
    // Convert UTC to WIB for display in form
    const startWIB = new Date(startDateObj.getTime() + (7 * 60 * 60 * 1000));
    const endWIB = new Date(endDateObj.getTime() + (7 * 60 * 60 * 1000));
    
    // Extract date and time parts
    const startDateStr = startWIB.toISOString().split('T')[0];
    const startTimeStr = startWIB.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format
    const endDateStr = endWIB.toISOString().split('T')[0];
    const endTimeStr = endWIB.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format
    
    // Determine duration type based on existing data
    let durationType = 'datetime'; // Default to datetime mode
    if (ad.duration_hours) {
      durationType = 'hours';
    } else if (!startTimeStr || startTimeStr === '00:00') {
      durationType = 'date'; // Legacy date-only format
    }
    
    setFormData({
      campaign_name: ad.campaign_name,
      start_date: startDateStr,
      start_time: startTimeStr,
      end_date: endDateStr,
      end_time: endTimeStr,
      duration_hours: ad.duration_hours?.toString() || '',
      duration_type: durationType,
      rotation_mode: (ad as any).rotation_duration ? 'manual' : 'global', // Auto-detect based on existing data
      rotation_duration: (ad as any).rotation_duration?.toString() || '30',
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
    
    // Validation similar to create
    if (formData.duration_type === 'datetime') {
      if (!formData.start_date) {
        setError('Start date is required');
        return;
      }
      if (!formData.start_time) {
        setError('Start time is required');
        return;
      }
      if (!formData.end_date) {
        setError('End date is required');
        return;
      }
      if (!formData.end_time) {
        setError('End time is required');
        return;
      }
    }
    
    try {
      setCreating(true);
      setError(null);
      
      // Calculate start and end dates for datetime mode
      let finalStartDate, finalEndDate;
      
      if (formData.duration_type === 'datetime') {
        // Combine date and time for WIB timezone
        finalStartDate = `${formData.start_date}T${formData.start_time}:00+07:00`;
        finalEndDate = `${formData.end_date}T${formData.end_time}:00+07:00`;
      } else {
        finalStartDate = formData.start_date;
        finalEndDate = formData.end_date;
      }
      
      const response = await adsAPI.updateAd(editingAdId, {
        advertiser_id: user?.ID?.toString() || '',
        campaign_name: formData.campaign_name,
        start_date: finalStartDate,
        end_date: finalEndDate,
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
          start_time: '',
          end_date: '',
          end_time: '',
          duration_hours: '',
          duration_type: 'datetime',
          rotation_mode: 'global',
          rotation_duration: '30',
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

  // Bulk update rotation mode for selected placements
  const bulkUpdateRotationMode = async (mode: 'enable' | 'disable') => {
    try {
      setError(null);
      
      if (selectedPlacements.length === 0) {
        setError('Please select at least one placement');
        return;
      }

      // Filter ads that match selected placements
      const adsToUpdate = ads.filter(ad => selectedPlacements.includes(ad.placement_type));
      
      if (adsToUpdate.length === 0) {
        setError('No ads found for selected placements');
        return;
      }

      console.log(`🔄 Bulk updating ${adsToUpdate.length} ads to ${mode} global rotation for placements:`, selectedPlacements);
      
      // Update each ad's rotation mode
      const promises = adsToUpdate.map(ad => 
        adsAPI.updateAd(ad.id, {
          advertiser_id: ad.advertiser_id?.toString() || '1', // Default advertiser_id
          campaign_name: ad.campaign_name,
          start_date: ad.start_date,
          end_date: ad.end_date,
          duration_hours: ad.duration_hours,
          rotation_mode: mode === 'enable' ? 'global' : 'manual',
          rotation_duration: mode === 'disable' ? 30 : null, // Default 30 min for manual mode
          budget: ad.budget,
          placement_type: ad.placement_type,
          media_type: ad.media_type,
          media_url: ad.media_url || ad.image_url, // Support both fields
          target_url: ad.target_url,
          ad_content: ad.ad_content,
          google_ads_code: ad.google_ads_code
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      // Update local state
      setAds(prevAds => 
        prevAds.map(ad => {
          if (selectedPlacements.includes(ad.placement_type)) {
            return {
              ...ad,
              rotation_mode: mode === 'enable' ? 'global' : 'manual',
              rotation_duration: mode === 'disable' ? 30 : null
            } as Advertisement;
          }
          return ad;
        })
      );

      // Close modal and reset selections
      setShowGlobalSettings(false);
      setSelectedPlacements([]);

      if (failCount > 0) {
        setError(`Updated ${successCount} ads successfully, ${failCount} failed`);
      } else {
        console.log(`✅ Successfully updated ${successCount} ads to ${mode} global rotation`);
      }

      // Refresh ads list to ensure consistency
      await fetchAds();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk update failed');
      console.error('Bulk update error:', err);
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
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowGlobalSettings(true)}
            variant="outline"
            size="sm"
          >
            ⚙️ Global Settings
          </Button>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            variant="primary"
            size="sm"
          >
            {showCreateForm ? '✕ Cancel' : '+ Create Ad'}
          </Button>
        </div>
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

      {/* Global Settings Modal */}
      {showGlobalSettings && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">⚙️ Bulk Global Rotation Settings</h3>
          <p className="text-gray-600 mb-6">
            Enable or disable global rotation settings for multiple placements at once. 
            This will update all ads in the selected placements.
          </p>

          {/* Mode Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What would you like to do?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="toggle_mode"
                  value="enable"
                  checked={globalToggleMode === 'enable'}
                  onChange={(e) => setGlobalToggleMode(e.target.value as 'enable' | 'disable')}
                  className="text-blue-600"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">✅ Enable Global Settings</div>
                  <div className="text-xs text-gray-500">Use default rotation timing for all ads</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="toggle_mode"
                  value="disable"
                  checked={globalToggleMode === 'disable'}
                  onChange={(e) => setGlobalToggleMode(e.target.value as 'enable' | 'disable')}
                  className="text-blue-600"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">⚙️ Use Manual Settings</div>
                  <div className="text-xs text-gray-500">Set custom rotation duration (30 min default)</div>
                </div>
              </label>
            </div>
          </div>

          {/* Placement Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select placements to update:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {(() => {
                const uniquePlacements = Array.from(new Set(ads.map(ad => ad.placement_type)));
                const placementLabels = {
                  'hero-banner': '🏠 Homepage Banner',
                  'header': '📄 Header Banner',
                  'mid-content': '🏠 Homepage Mid',
                  'bottom-content': '🏠 Homepage Bottom',
                  'popup': '🎯 Homepage Popup',
                  'regular': '📝 Content Pages',
                  'sidebar': '📱 Sidebar Ads',
                  'article-top': '📰 Article Page Top',
                  'article-mid': '📰 Article Page Middle',
                  'article-bottom': '📰 Article Page Bottom',
                  'article-final': '📰 Article Page End',
                  'article-ads': '📍 Article Ads',
                  'breaking-pre': '⚡ Before Breaking News',
                  'breaking-post': '⚡ After Breaking News'
                };
                
                return uniquePlacements.map(placement => {
                  const adsInPlacement = ads.filter(ad => ad.placement_type === placement).length;
                  return (
                    <label key={placement} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedPlacements.includes(placement)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPlacements(prev => [...prev, placement]);
                          } else {
                            setSelectedPlacements(prev => prev.filter(p => p !== placement));
                          }
                        }}
                        className="text-blue-600"
                      />
                      <div className="text-sm">
                        <div className="font-medium">{placementLabels[placement as keyof typeof placementLabels] || placement}</div>
                        <div className="text-xs text-gray-500">{adsInPlacement} ads</div>
                      </div>
                    </label>
                  );
                });
              })()}
            </div>
            
            {/* Select All/None shortcuts */}
            <div className="flex space-x-2 mt-3">
              <button
                onClick={() => {
                  const allPlacements = Array.from(new Set(ads.map(ad => ad.placement_type)));
                  setSelectedPlacements(allPlacements);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Select All
              </button>
              <span className="text-xs text-gray-400">|</span>
              <button
                onClick={() => setSelectedPlacements([])}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Select None
              </button>
            </div>
          </div>

          {/* Preview */}
          {selectedPlacements.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                <strong>📊 Preview:</strong>
                <br />
                {(() => {
                  const affectedAds = ads.filter(ad => selectedPlacements.includes(ad.placement_type));
                  return `${affectedAds.length} ads in ${selectedPlacements.length} placements will be updated to ${globalToggleMode} global rotation settings.`;
                })()}
              </div>
              
              <div className="mt-2 text-xs text-blue-600">
                <strong>Selected placements:</strong> {selectedPlacements.join(', ')}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => {
                setShowGlobalSettings(false);
                setSelectedPlacements([]);
                setGlobalToggleMode('enable');
              }}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={() => bulkUpdateRotationMode(globalToggleMode)}
              disabled={selectedPlacements.length === 0}
              size="sm"
            >
              {globalToggleMode === 'enable' ? '✅ Enable Global' : '⚙️ Use Manual'} 
              {selectedPlacements.length > 0 && ` (${ads.filter(ad => selectedPlacements.includes(ad.placement_type)).length} ads)`}
            </Button>
          </div>
        </div>
      )}

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

            {/* Rotation Settings */}
            <div className="md:col-span-2">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-purple-800 mb-3">🔄 Ad Rotation Settings</h4>
                
                {/* Rotation Mode Choice */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rotation Mode *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="rotation_mode"
                        value="global"
                        checked={formData.rotation_mode === 'global'}
                        onChange={(e) => handleInputChange('rotation_mode', e.target.value)}
                        className="text-blue-600"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">🎛️ Use Global Settings</div>
                        <div className="text-xs text-gray-500">
                          {(() => {
                            const globalSettings = {
                              'hero-banner': '3 seconds',
                              'header': '5 seconds', 
                              'sidebar': '10 seconds',
                              'regular': '10 seconds',
                              'article-top': '10 seconds',
                              'article-mid': '10 seconds',
                              'article-bottom': '10 seconds',
                              'article-final': '10 seconds',
                              'article-ads': '10 seconds',
                              'mid-content': '5 seconds',
                              'bottom-content': '5 seconds',
                              'popup': '5 seconds',
                              'breaking-pre': '10 seconds',
                              'breaking-post': '10 seconds'
                            };
                            return globalSettings[formData.placement_type as keyof typeof globalSettings] || '10 seconds';
                          })()} per rotation
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="rotation_mode"
                        value="manual"
                        checked={formData.rotation_mode === 'manual'}
                        onChange={(e) => handleInputChange('rotation_mode', e.target.value)}
                        className="text-blue-600"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">⚙️ Custom Duration</div>
                        <div className="text-xs text-gray-500">Set specific rotation time for this ad</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Manual Duration Input - Show only when manual mode */}
                {formData.rotation_mode === 'manual' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custom Rotation Duration (Minutes) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={formData.rotation_duration}
                      onChange={(e) => handleInputChange('rotation_duration', e.target.value)}
                      placeholder="30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Berapa lama iklan ini tampil sebelum berganti ke iklan lain
                    </p>
                    <div className="text-xs text-blue-600 mt-1">
                      <strong>Contoh:</strong> 30 = Iklan tampil 30 menit, lalu ganti ke iklan berikutnya
                    </div>
                  </div>
                )}

                {/* Global Settings Preview */}
                {formData.rotation_mode === 'global' && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <div className="text-xs text-blue-800">
                      <strong>📊 Current Global Setting for {formData.placement_type}:</strong>
                      <br />
                      {(() => {
                        const globalSettings = {
                          'hero-banner': 'Homepage Banner: 3 seconds per rotation (high-traffic placement)',
                          'header': 'Header Banner: 5 seconds per rotation',
                          'sidebar': 'Sidebar: 10 seconds per rotation', 
                          'regular': 'Content Pages: 10 seconds per rotation',
                          'article-top': 'Article Top: 10 seconds per rotation',
                          'article-mid': 'Article Middle: 10 seconds per rotation',
                          'article-bottom': 'Article Bottom: 10 seconds per rotation',
                          'article-final': 'Article End: 10 seconds per rotation',
                          'article-ads': 'Article Ads: 10 seconds per rotation',
                          'mid-content': 'Homepage Mid: 5 seconds per rotation',
                          'bottom-content': 'Homepage Bottom: 5 seconds per rotation',
                          'popup': 'Popup: 5 seconds per rotation',
                          'breaking-pre': 'Before Breaking News: 10 seconds per rotation',
                          'breaking-post': 'After Breaking News: 10 seconds per rotation'
                        };
                        return globalSettings[formData.placement_type as keyof typeof globalSettings] || 'Default: 10 seconds per rotation';
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Duration Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Type *
              </label>
              <select
                value={formData.duration_type}
                onChange={(e) => handleInputChange('duration_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="datetime">📅 Set Date & Time (WIB)</option>
                <option value="hours">⏰ Duration in Hours</option>
                <option value="date">📆 Specific End Date Only</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                💡 Recommended: Use Date & Time for precise control
              </p>
            </div>

            {/* Date & Time Picker - Show for datetime mode */}
            {formData.duration_type === 'datetime' && (
              <div className="md:col-span-2">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-green-800 mb-3">📅 Start Schedule (WIB - Waktu Indonesia Barat)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => handleInputChange('start_time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Example: 15:00 (3:00 PM WIB)
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-800 mb-3">🏁 End Schedule (WIB - Waktu Indonesia Barat)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time *
                      </label>
                      <input
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => handleInputChange('end_time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Example: 18:00 (6:00 PM WIB)
                      </p>
                    </div>
                  </div>
                  
                  {/* Duration Preview */}
                  {formData.start_date && formData.start_time && formData.end_date && formData.end_time && (
                    <div className="mt-3 p-3 bg-blue-50 rounded border">
                      <div className="text-sm text-blue-800">
                        <strong>📊 Duration Preview:</strong>
                        {(() => {
                          const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
                          const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);
                          const diffMs = endDateTime.getTime() - startDateTime.getTime();
                          const diffHours = Math.round(diffMs / (1000 * 60 * 60));
                          const diffDays = Math.floor(diffHours / 24);
                          const remainingHours = diffHours % 24;
                          
                          if (diffMs <= 0) {
                            return <span className="text-red-600"> ❌ End time must be after start time</span>;
                          }
                          
                          let durationText = '';
                          if (diffDays > 0) {
                            durationText = `${diffDays} hari${remainingHours > 0 ? ` ${remainingHours} jam` : ''}`;
                          } else {
                            durationText = `${diffHours} jam`;
                          }
                          
                          return <span className="text-green-600"> ✅ {durationText} ({diffHours} total jam)</span>;
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Start Date - Show only if date type selected */}
            {formData.duration_type === 'date' && (
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
            )}

            {/* End Date - Show only if date type selected */}
            {formData.duration_type === 'date' && (
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
            )}

            {/* Duration Hours - Show only if hours type selected */}
            {formData.duration_type === 'hours' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (Hours) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="8760"
                  value={formData.duration_hours}
                  onChange={(e) => handleInputChange('duration_hours', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter hours (1-8760)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Examples: 1h, 24h (1 day), 168h (1 week), 720h (1 month)
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  💡 Ad will start immediately at current Indonesia time (WIB)
                </p>
              </div>
            )}

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

            {/* Rotation Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🔄 Rotation Duration (Minutes) *
              </label>
              <input
                type="number"
                min="1"
                max="1440"
                value={formData.rotation_duration}
                onChange={(e) => handleInputChange('rotation_duration', e.target.value)}
                placeholder="30"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Berapa lama iklan ini tampil sebelum berganti ke iklan lain di placement yang sama
              </p>
              <div className="text-xs text-blue-600 mt-1">
                <strong>Contoh:</strong> 30 = Iklan tampil 30 menit, lalu ganti ke iklan berikutnya
              </div>
            </div>

            {/* Duration Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Type *
              </label>
              <select
                value={formData.duration_type}
                onChange={(e) => handleInputChange('duration_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="datetime">📅 Set Date & Time (WIB)</option>
                <option value="hours">⏰ Duration in Hours</option>
                <option value="date">📆 Specific End Date Only</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                💡 Recommended: Use Date & Time for precise control
              </p>
            </div>

            {/* Date & Time Picker - Show for datetime mode */}
            {formData.duration_type === 'datetime' && (
              <div className="md:col-span-2">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-green-800 mb-3">📅 Start Schedule (WIB - Waktu Indonesia Barat)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => handleInputChange('start_time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Example: 15:00 (3:00 PM WIB)
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-800 mb-3">🏁 End Schedule (WIB - Waktu Indonesia Barat)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time *
                      </label>
                      <input
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => handleInputChange('end_time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Example: 18:00 (6:00 PM WIB)
                      </p>
                    </div>
                  </div>
                  
                  {/* Duration Preview */}
                  {formData.start_date && formData.start_time && formData.end_date && formData.end_time && (
                    <div className="mt-3 p-3 bg-blue-50 rounded border">
                      <div className="text-sm text-blue-800">
                        <strong>📊 Duration Preview:</strong>
                        {(() => {
                          const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
                          const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);
                          const diffMs = endDateTime.getTime() - startDateTime.getTime();
                          const diffHours = Math.round(diffMs / (1000 * 60 * 60));
                          const diffDays = Math.floor(diffHours / 24);
                          const remainingHours = diffHours % 24;
                          
                          if (diffMs <= 0) {
                            return <span className="text-red-600"> ❌ End time must be after start time</span>;
                          }
                          
                          let durationText = '';
                          if (diffDays > 0) {
                            durationText = `${diffDays} hari${remainingHours > 0 ? ` ${remainingHours} jam` : ''}`;
                          } else {
                            durationText = `${diffHours} jam`;
                          }
                          
                          return <span className="text-green-600"> ✅ {durationText} ({diffHours} total jam)</span>;
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Start Date - Show only if date type selected */}
            {formData.duration_type === 'date' && (
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
            )}

            {/* End Date - Show only if date type selected */}
            {formData.duration_type === 'date' && (
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
            )}

            {/* Duration Hours - Show only if hours type selected */}
            {formData.duration_type === 'hours' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (Hours) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="8760"
                  value={formData.duration_hours}
                  onChange={(e) => handleInputChange('duration_hours', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter hours (1-8760)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Examples: 1h, 24h (1 day), 168h (1 week), 720h (1 month)
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  💡 Ad will start immediately at current Indonesia time (WIB)
                </p>
              </div>
            )}
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
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Advertisement Campaigns</h3>
            
            {/* Placement Filter */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700">Filter by Placement:</label>
              <select
                value={placementFilter}
                onChange={(e) => setPlacementFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Placements ({ads.length})</option>
                {(() => {
                  const placementLabels = {
                    'hero-banner': '🏠 Homepage Banner',
                    'header': '📄 Header Banner', 
                    'mid-content': '🏠 Homepage Mid Section',
                    'bottom-content': '🏠 Homepage Bottom',
                    'popup': '🎯 Homepage Popup',
                    'regular': '📝 Content Pages',
                    'sidebar': '📱 Sidebar Ads',
                    'article-top': '📰 Article Page Top',
                    'article-ads': '📍 Article Ads',
                    'article-mid': '📰 Article Page Middle',
                    'article-bottom': '📰 Article Page Bottom',
                    'article-final': '📰 Article Page End',
                    'breaking-pre': '⚡ Before Breaking News',
                    'breaking-post': '⚡ After Breaking News'
                  };

                  const placementCounts = ads.reduce((acc, ad) => {
                    acc[ad.placement_type] = (acc[ad.placement_type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);

                  return Array.from(new Set(ads.map(ad => ad.placement_type)))
                    .sort((a, b) => (placementLabels[a as keyof typeof placementLabels] || a).localeCompare(placementLabels[b as keyof typeof placementLabels] || b))
                    .map(placement => (
                      <option key={placement} value={placement}>
                        {placementLabels[placement as keyof typeof placementLabels] || placement} ({placementCounts[placement] || 0})
                      </option>
                    ));
                })()}
              </select>
            </div>
          </div>
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
              {(() => {
                // Filter ads based on placement
                const filteredAds = ads.filter(ad => {
                  if (placementFilter === 'all') return true;
                  return ad.placement_type === placementFilter;
                });
                
                return filteredAds.map((ad) => (
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
                ));
              })()}
            </tbody>
          </table>
          
          {(() => {
            const filteredAds = ads.filter(ad => {
              if (placementFilter === 'all') return true;
              return ad.placement_type === placementFilter;
            });
            
            if (ads.length === 0) {
              return (
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
              );
            }
            
            if (filteredAds.length === 0) {
              return (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No advertisements found for "{placementFilter}" placement.
                  </p>
                  <button 
                    onClick={() => setPlacementFilter('all')}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Show all placements ({ads.length} total)
                  </button>
                </div>
              );
            }
            return null;
          })()}
        </div>
      </div>
    </div>
  );
};
