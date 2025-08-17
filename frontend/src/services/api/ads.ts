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
  placement_type: 'header' | 'regular' | 'sidebar' | 'inline' | 'footer' | 'popup' | 'hero-banner' | 'mid-content' | 'bottom-content' | 'article-top' | 'article-mid' | 'article-bottom' | 'article-final' | 'content-ad' | 'breaking-pre' | 'breaking-post';
  advertiser?: string;
  start_date: string;
  end_date: string;
  budget?: number;
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

// Mapping function untuk menerjemahkan placement frontend ke backend
const mapPlacementToBackend = (frontendPlacement: string): string => {
  const placementMap: { [key: string]: string } = {
    'hero-banner': 'header',
    'mid-content': 'regular', 
    'bottom-content': 'regular',
    'article-top': 'header',
    'article-mid': 'inline',
    'article-final': 'regular',
    'article-bottom': 'regular',
    'content-ad': 'inline',
    'content-middle': 'inline',
    'breaking-pre': 'header',
    'breaking-post': 'regular',
    'sidebar': 'sidebar',
    'header': 'header',
    'regular': 'regular',
    'inline': 'inline',
    'footer': 'footer',
    'popup': 'popup'
  };
  
  // Dynamic index-list placements (index-list-1, index-list-2, etc.)
  if (frontendPlacement.startsWith('index-list-')) {
    return 'regular';
  }
  
  return placementMap[frontendPlacement] || 'regular';
};

export const adsAPI = {
  // Fetch ads for specific placement
  async getAds(placement: string = 'regular', limit: number = 5): Promise<AdsResponse> {
    const backendPlacement = mapPlacementToBackend(placement);
    console.log(`🎯 Mapping placement: "${placement}" -> "${backendPlacement}"`);
    
    const queryParams = new URLSearchParams({
      placement: backendPlacement,
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
  },

  // Update advertisement (admin only)
  async updateAd(adId: string, adData: CreateAdRequest): Promise<CreateAdResponse> {
    const token = localStorage.getItem('token');
    const response = await fetch(buildApiUrl(`ads/${adId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(adData)
    });
    return response.json();
  },

  // Upload ad image (admin only)
  async uploadAdImage(file: File): Promise<{success: boolean; data?: {fullUrl: string; imageUrl: string; filename: string}; message?: string}> {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('adImage', file);
    
    const response = await fetch(buildApiUrl('ads/upload'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return response.json();
  }
};


