import { buildApiUrl } from '../../config/api';

// YouTube API interfaces
export interface YouTubeVideo {
  id: number;
  youtube_video_id?: string;
  youtube_channel_id?: string;
  youtube_channel_name?: string;
  title?: string;
  description?: string;
  duration?: number;
  thumbnail_url?: string;
  watch_url?: string;
  embed_url?: string;
  youtube_view_count: number;
  youtube_like_count: number;
  youtube_comment_count: number;
  local_view_count: number;
  tags?: string[];
  category?: string;
  source: 'uploaded' | 'synced' | 'manual';
  publish_status: 'pending' | 'processing' | 'published' | 'failed';
  privacy_status: 'private' | 'public' | 'unlisted';
  youtube_published_at?: string;
  created_at: string;
  total_engagement?: number;
  engagement_rate?: number;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  subscriber_count?: number;
  video_count?: number;
  view_count?: number;
  custom_url?: string;
}

export interface YouTubeUploadRequest {
  file?: File;
  title: string;
  description?: string;
  tags?: string[];
  category_id?: string;
  privacy_status: 'private' | 'public' | 'unlisted';
  thumbnail?: File;
}

export interface YouTubeConnectionStatus {
  connected: boolean;
  channel?: YouTubeChannel;
  access_token?: {
    token: string;
    expires_at: string;
    scope: string[];
    last_used_at?: string;
  };
  error?: string;
  details?: string;
  code?: string;
}

export interface YouTubeAnalytics {
  overview: {
    total_videos: number;
    total_youtube_views: number;
    total_local_views: number;
    total_likes: number;
    total_comments: number;
    total_subscribers: number;
    avg_engagement_rate: number;
  };
  daily_trends: Array<{
    date: string;
    views: number;
    likes: number;
    comments: number;
    subscribers_gained: number;
  }>;
  top_videos: Array<{
    video_id: string;
    title: string;
    views: number;
    engagement_rate: number;
  }>;
  channel_stats: {
    subscriber_growth: number;
    average_view_duration: number;
    click_through_rate: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface YouTubeVideosResponse {
  videos: YouTubeVideo[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface YouTubeUploadResponse {
  video_id: string;
  youtube_video_id?: string;
  status: 'uploaded' | 'processing' | 'published' | 'failed';
  message: string;
}

export interface YouTubeSyncRequest {
  channel_id?: string;
  max_results?: number;
  published_after?: string;
  sync_type: 'latest' | 'all' | 'custom';
}

export interface YouTubeSyncResponse {
  synced_videos: number;
  total_found: number;
  status: 'completed' | 'partial' | 'failed';
  message: string;
}

// YouTube API service
export const youtubeAPI = {
  /**
   * Get YouTube connection status
   */
  async getConnectionStatus(): Promise<ApiResponse<YouTubeConnectionStatus>> {
    const response = await fetch(buildApiUrl('/youtube/status'), {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  /**
   * Get YouTube OAuth authorization URL
   */
  async getAuthUrl(): Promise<ApiResponse<{ auth_url: string }>> {
    const response = await fetch(buildApiUrl('/youtube/auth-url'), {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  /**
   * Disconnect YouTube account
   */
  async disconnect(): Promise<ApiResponse> {
    const response = await fetch(buildApiUrl('/youtube/disconnect'), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    return response.json();
  },

  /**
   * Upload video to YouTube
   */
  async uploadVideo(data: YouTubeUploadRequest): Promise<ApiResponse<YouTubeUploadResponse>> {
    const formData = new FormData();
    
    if (data.file) {
      formData.append('video', data.file);
    }
    
    formData.append('title', data.title);
    
    if (data.description) {
      formData.append('description', data.description);
    }
    
    if (data.tags && data.tags.length > 0) {
      formData.append('tags', JSON.stringify(data.tags));
    }
    
    if (data.category_id) {
      formData.append('category_id', data.category_id);
    }
    
    formData.append('privacy_status', data.privacy_status);
    
    if (data.thumbnail) {
      formData.append('thumbnail', data.thumbnail);
    }

    const response = await fetch(buildApiUrl('/youtube/upload'), {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    return response.json();
  },

  /**
   * Sync videos from YouTube channel
   */
  async syncVideos(data: YouTubeSyncRequest): Promise<ApiResponse<YouTubeSyncResponse>> {
    const response = await fetch(buildApiUrl('/youtube/sync'), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  /**
   * Get YouTube videos (admin view)
   */
  async getVideos(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    source?: string;
  } = {}): Promise<ApiResponse<YouTubeVideosResponse>> {
    const query = new URLSearchParams();
    
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.source) query.append('source', params.source);

    const response = await fetch(buildApiUrl(`/youtube/videos?${query.toString()}`), {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    return response.json();
  },

  /**
   * Get public YouTube videos for frontend display
   */
  async getPublicVideos(params: {
    limit?: number;
    offset?: number;
    category?: string;
  } = {}): Promise<ApiResponse<YouTubeVideosResponse>> {
    const query = new URLSearchParams();
    
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.offset) query.append('offset', params.offset.toString());
    if (params.category) query.append('category', params.category);

    const response = await fetch(buildApiUrl(`/youtube/public?${query.toString()}`), {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  /**
   * Get YouTube analytics
   */
  async getAnalytics(params: {
    start_date?: string;
    end_date?: string;
    metrics?: string[];
  }): Promise<ApiResponse<YouTubeAnalytics>> {
    const query = new URLSearchParams();
    
    if (params.start_date) query.append('start_date', params.start_date);
    if (params.end_date) query.append('end_date', params.end_date);
    if (params.metrics) query.append('metrics', params.metrics.join(','));

    const response = await fetch(buildApiUrl(`/api/youtube/analytics?${query.toString()}`), {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  /**
   * Track video view
   */
  async trackView(videoId: string, viewData: {
    user_id?: string;
    ip_address?: string;
    user_agent?: string;
    referrer?: string;
    duration_watched?: number;
  }): Promise<ApiResponse> {
    const response = await fetch(buildApiUrl(`/youtube/videos/${videoId}/view`), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(viewData),
    });
    return response.json();
  },

  /**
   * Delete YouTube video
   */
  async deleteVideo(videoId: string): Promise<ApiResponse> {
    const response = await fetch(buildApiUrl(`/youtube/videos/${videoId}`), {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },

  /**
   * Update video metadata
   */
  async updateVideo(videoId: string, data: Partial<YouTubeUploadRequest>): Promise<ApiResponse> {
    const response = await fetch(buildApiUrl(`/youtube/videos/${videoId}`), {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }
};

// YouTube utilities
export const youtubeUtils = {
  /**
   * Extract video ID from YouTube URL
   */
  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  },

  /**
   * Generate YouTube embed URL
   */
  generateEmbedUrl(videoId: string, options?: {
    autoplay?: boolean;
    controls?: boolean;
    start?: number;
    end?: number;
  }): string {
    const params = new URLSearchParams();
    
    if (options?.autoplay) params.append('autoplay', '1');
    if (options?.controls === false) params.append('controls', '0');
    if (options?.start) params.append('start', options.start.toString());
    if (options?.end) params.append('end', options.end.toString());
    
    const queryString = params.toString();
    return `https://www.youtube.com/embed/${videoId}${queryString ? `?${queryString}` : ''}`;
  },

  /**
   * Generate YouTube watch URL
   */
  generateWatchUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`;
  },

  /**
   * Validate video file for YouTube upload
   */
  validateVideoFile(file: File): { valid: boolean; error?: string } {
    // YouTube supported formats
    const supportedFormats = [
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 
      'video/webm', 'video/mkv', 'video/3gpp'
    ];
    
    if (!supportedFormats.includes(file.type)) {
      return {
        valid: false,
        error: 'File format not supported. Please use MP4, AVI, MOV, WMV, FLV, WebM, MKV, or 3GP format.'
      };
    }
    
    // YouTube file size limit (256GB, but we'll be more conservative)
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File too large. Maximum size is 2GB.'
      };
    }
    
    // Duration check (YouTube max is 12 hours, but we'll check via video element if needed)
    
    return { valid: true };
  },

  /**
   * Format duration from seconds to HH:MM:SS
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  /**
   * Calculate engagement rate
   */
  calculateEngagementRate(likes: number, comments: number, views: number): number {
    if (views === 0) return 0;
    return ((likes + comments) / views) * 100;
  }
};