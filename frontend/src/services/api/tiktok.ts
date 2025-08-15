import { buildApiUrl } from '../../config/api';

// TikTok API interfaces
export interface TikTokVideo {
  id: number;
  tiktok_video_id?: string;
  tiktok_username?: string;
  title?: string;
  description?: string;
  duration?: number;
  video_url?: string;
  cover_image_url?: string;
  web_video_url?: string;
  share_url?: string;
  tiktok_view_count: number;
  tiktok_like_count: number;
  tiktok_share_count: number;
  tiktok_comment_count: number;
  local_view_count: number;
  hashtags?: string[];
  source: 'uploaded' | 'synced' | 'manual';
  publish_status: 'pending' | 'processing' | 'published' | 'failed';
  privacy_level: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY';
  tiktok_created_at?: string;
  created_at: string;
  total_engagement?: number;
  engagement_rate?: number;
  categories?: string;
}

export interface TikTokUploadRequest {
  title: string;
  description?: string;
  privacy_level?: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY';
  disable_comment?: boolean;
  disable_duet?: boolean;
  disable_stitch?: boolean;
}

export interface TikTokConnectionStatus {
  connected: boolean;
  account?: {
    tiktok_username?: string;
    tiktok_display_name?: string;
    tiktok_avatar_url?: string;
    can_upload: boolean;
    can_read_profile: boolean;
    is_valid: boolean;
    expires_at?: string;
    last_used_at?: string;
  };
}

export interface TikTokAnalytics {
  overview: {
    total_videos: number;
    total_tiktok_views: number;
    total_local_views: number;
    total_likes: number;
    total_shares: number;
    total_comments: number;
    avg_engagement_rate: number;
  };
  daily_trends: Array<{
    date: string;
    views: number;
    unique_viewers: number;
  }>;
  top_videos: Array<TikTokVideo>;
  date_range: {
    start_date: string;
    end_date: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
}

export const tiktokAPI = {
  /**
   * Get TikTok authorization URL
   */
  async getAuthUrl(): Promise<ApiResponse<{ auth_url: string; state: string; csrf_token: string }>> {
    const token = localStorage.getItem('naramakna_token');
    
    const response = await fetch(buildApiUrl('tiktok/auth-url'), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.json();
  },

  /**
   * Get TikTok connection status
   */
  async getConnectionStatus(): Promise<ApiResponse<TikTokConnectionStatus>> {
    const token = localStorage.getItem('naramakna_token');
    
    const response = await fetch(buildApiUrl('tiktok/connection-status'), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.json();
  },

  /**
   * Disconnect TikTok account
   */
  async disconnect(): Promise<ApiResponse<null>> {
    const token = localStorage.getItem('naramakna_token');
    
    const response = await fetch(buildApiUrl('tiktok/disconnect'), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.json();
  },

  /**
   * Upload video to TikTok
   */
  async uploadVideo(videoFile: File, uploadData: TikTokUploadRequest): Promise<ApiResponse<{ publish_id: string; status: string }>> {
    const token = localStorage.getItem('naramakna_token');
    
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('title', uploadData.title);
    
    if (uploadData.description) {
      formData.append('description', uploadData.description);
    }
    
    if (uploadData.privacy_level) {
      formData.append('privacy_level', uploadData.privacy_level);
    }
    
    if (uploadData.disable_comment !== undefined) {
      formData.append('disable_comment', uploadData.disable_comment.toString());
    }
    
    if (uploadData.disable_duet !== undefined) {
      formData.append('disable_duet', uploadData.disable_duet.toString());
    }
    
    if (uploadData.disable_stitch !== undefined) {
      formData.append('disable_stitch', uploadData.disable_stitch.toString());
    }
    
    const response = await fetch(buildApiUrl('tiktok/upload'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: formData
    });
    
    return response.json();
  },

  /**
   * Get upload status
   */
  async getUploadStatus(publishId: string): Promise<ApiResponse<any>> {
    const token = localStorage.getItem('naramakna_token');
    
    const response = await fetch(buildApiUrl(`tiktok/upload-status/${publishId}`), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.json();
  },

  /**
   * Sync videos from TikTok account (Superadmin only)
   */
  async syncVideos(limit: number = 20): Promise<ApiResponse<{ total_fetched: number; new_videos: number; updated_videos: number }>> {
    const token = localStorage.getItem('naramakna_token');
    
    const response = await fetch(buildApiUrl('tiktok/sync-videos'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ limit })
    });
    
    return response.json();
  },

  /**
   * Get TikTok videos for public display
   */
  async getVideos(params?: {
    limit?: number;
    offset?: number;
    category?: string;
    search?: string;
  }): Promise<ApiResponse<{ videos: TikTokVideo[] }>> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    
    const response = await fetch(buildApiUrl(`tiktok/videos?${queryParams}`));
    return response.json();
  },

  /**
   * Get admin videos (Admin/Superadmin only)
   */
  async getAdminVideos(params?: {
    limit?: number;
    offset?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<{ videos: TikTokVideo[] }>> {
    const token = localStorage.getItem('naramakna_token');
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    
    const response = await fetch(buildApiUrl(`tiktok/admin/videos?${queryParams}`), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.json();
  },

  /**
   * Track video view
   */
  async trackView(videoId: number, viewData: {
    view_duration?: number;
    view_percentage?: number;
    device_type?: 'desktop' | 'mobile' | 'tablet';
  }): Promise<ApiResponse<null>> {
    const response = await fetch(buildApiUrl('tiktok/track-view'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_id: videoId,
        ...viewData
      })
    });
    
    return response.json();
  },

  /**
   * Get TikTok analytics (Admin/Superadmin only)
   */
  async getAnalytics(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<TikTokAnalytics>> {
    const token = localStorage.getItem('naramakna_token');
    const queryParams = new URLSearchParams();
    
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    
    const response = await fetch(buildApiUrl(`tiktok/analytics?${queryParams}`), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.json();
  }
};

// TikTok utility functions
export const tiktokUtils = {
  /**
   * Format view count for display
   */
  formatViewCount(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  },

  /**
   * Format duration for display (seconds to mm:ss)
   */
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  /**
   * Calculate engagement rate
   */
  calculateEngagementRate(video: TikTokVideo): number {
    if (video.tiktok_view_count === 0) return 0;
    
    const totalEngagement = video.tiktok_like_count + video.tiktok_share_count + video.tiktok_comment_count;
    return (totalEngagement / video.tiktok_view_count) * 100;
  },

  /**
   * Extract hashtags from text
   */
  extractHashtags(text: string): string[] {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
    return text.match(hashtagRegex) || [];
  },

  /**
   * Generate TikTok embed URL
   */
  generateEmbedUrl(videoId: string): string {
    return `https://www.tiktok.com/embed/${videoId}`;
  },

  /**
   * Validate video file for TikTok upload
   */
  validateVideoFile(file: File): { valid: boolean; error?: string } {
    // TikTok supported formats
    const supportedFormats = ['video/mp4', 'video/mov', 'video/avi'];
    
    if (!supportedFormats.includes(file.type)) {
      return {
        valid: false,
        error: 'File format not supported. Please use MP4, MOV, or AVI format.'
      };
    }
    
    // TikTok file size limit (500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File too large. Maximum size is 500MB.'
      };
    }
    
    return { valid: true };
  }
};