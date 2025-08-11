import { buildApiUrl } from '../../config/api';

export interface Advertisement {
  id: string;
  campaign_name: string;
  media_type: 'image' | 'gif' | 'video' | 'html' | 'google_ads';
  media_url?: string;
  image_url?: string; // Legacy support
  target_url?: string;
  ad_content?: string;
  google_ads_code?: string;
  placement_type: 'header' | 'regular' | 'sidebar' | 'inline' | 'footer' | 'popup';
  advertiser?: string;
  start_date: string;
  end_date: string;
  impressions: number;
  clicks: number;
  status: 'pending' | 'active' | 'paused' | 'finished' | 'rejected';
}

export interface AdsResponse {
  success: boolean;
  data: {
    placement: string;
    ads: Advertisement[];
  };
  message?: string;
}

export interface CreateAdRequest {
  advertiser_id: string;
  campaign_name: string;
  start_date: string;
  end_date: string;
  budget?: number;
  placement_type: string;
  media_type: string;
  media_url?: string;
  target_url?: string;
  ad_content?: string;
  google_ads_code?: string;
}

export interface CreateAdResponse {
  success: boolean;
  data: {
    id: string;
    campaign_name: string;
    status: string;
    placement_type: string;
  };
  message?: string;
}

export const adsAPI = {
  // Fetch ads for specific placement
  async getAds(placement: string = 'regular', limit: number = 5): Promise<AdsResponse> {
    const queryParams = new URLSearchParams({
      placement,
      limit: limit.toString()
    });
    
    const response = await fetch(buildApiUrl(`ads/serve?${queryParams}`));
    return response.json();
  },

  // Create new advertisement
  async createAd(adData: CreateAdRequest): Promise<CreateAdResponse> {
    const token = localStorage.getItem('token');
    const response = await fetch(buildApiUrl('ads'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(adData)
    });
    return response.json();
  },

  // Track ad click
  async trackClick(adId: string): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(buildApiUrl(`ads/${adId}/click`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  // Get all ads (admin only)
  async getAllAds(params?: {
    page?: number;
    limit?: number;
    status?: string;
    placement?: string;
  }): Promise<{
    success: boolean;
    data: {
      ads: Advertisement[];
      total: number;
      page: number;
      totalPages: number;
    };
    message?: string;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.placement) queryParams.append('placement', params.placement);

    const token = localStorage.getItem('token');
    
    const response = await fetch(buildApiUrl(`ads?${queryParams}`), {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    return result;
  },

  // Update ad status (admin only)
  async updateAdStatus(adId: string, status: string): Promise<{ success: boolean; message?: string }> {
    const token = localStorage.getItem('token');
    const response = await fetch(buildApiUrl(`ads/${adId}/status`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    return response.json();
  }
};

// Explicit type exports for better compatibility
export type { Advertisement, AdsResponse, CreateAdRequest, CreateAdResponse };
