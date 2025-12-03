// API service untuk TikTok integration endpoints
import { buildApiUrl } from '../../config/api';
import type {
  TikTokAuthResponse,
  TikTokProfile,
  TikTokVideoListResponse,
  TikTokSyncResponse,
  TikTokStatusResponse,
  TikTokContentResponse,
  TikTokAPIService
} from '../../types/tiktok';

class TikTokAPI implements TikTokAPIService {

  /**
   * Get TikTok OAuth authorization URL
   */
  async getAuthURL(): Promise<TikTokAuthResponse> {
    try {
      const response = await fetch(buildApiUrl('tiktok/auth'), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get TikTok auth URL');
      }
      
      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get TikTok auth URL');
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(code: string, state: string): Promise<TikTokAuthResponse> {
    try {
      const response = await fetch(buildApiUrl('tiktok/callback'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, state })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'TikTok authentication failed');
      }
      
      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'TikTok authentication failed');
    }
  }

  /**
   * Get connected TikTok profile
   */
  async getProfile(): Promise<{ success: boolean; profile: TikTokProfile }> {
    try {
      const response = await fetch(buildApiUrl('tiktok/profile'), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get TikTok profile');
      }
      
      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get TikTok profile');
    }
  }

  /**
   * Get TikTok videos
   */
  async getVideos(cursor?: string, maxId?: string): Promise<{ success: boolean } & TikTokVideoListResponse> {
    try {
      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);
      if (maxId) params.append('maxId', maxId);

      const response = await fetch(buildApiUrl(`tiktok/videos?${params.toString()}`), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get TikTok videos');
      }
      
      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get TikTok videos');
    }
  }

  /**
   * Trigger manual sync
   */
  async syncContent(): Promise<TikTokSyncResponse> {
    try {
      const response = await fetch(buildApiUrl('tiktok/sync'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'TikTok sync failed');
      }
      
      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'TikTok sync failed');
    }
  }

  /**
   * Get TikTok integration status
   */
  async getStatus(): Promise<TikTokStatusResponse> {
    try {
      const response = await fetch(buildApiUrl('tiktok/status'), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get TikTok status');
      }
      
      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get TikTok status');
    }
  }

  /**
   * Disconnect TikTok account
   */
  async disconnect(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(buildApiUrl('tiktok/disconnect'), {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to disconnect TikTok');
      }
      
      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to disconnect TikTok');
    }
  }

  /**
   * Get TikTok content from database
   */
  async getContent(limit = 10, offset = 0): Promise<TikTokContentResponse> {
    try {
      const response = await fetch(buildApiUrl(`tiktok/content?limit=${limit}&offset=${offset}`), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get TikTok content');
      }
      
      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get TikTok content');
    }
  }

  /**
   * Generate TikTok video embed URL
   */
  generateEmbedURL(videoId: string, options?: { 
    width?: number; 
    height?: number; 
    autoplay?: boolean 
  }): string {
    const params = new URLSearchParams();
    
    if (options?.width) params.append('width', options.width.toString());
    if (options?.height) params.append('height', options.height.toString());
    if (options?.autoplay) params.append('autoplay', '1');

    const query = params.toString();
    return `https://www.tiktok.com/embed/v2/${videoId}${query ? `?${query}` : ''}`;
  }

  /**
   * Get TikTok video URL from video ID
   */
  getVideoURL(videoId: string, username?: string): string {
    if (username) {
      return `https://www.tiktok.com/@${username}/video/${videoId}`;
    }
    return `https://www.tiktok.com/video/${videoId}`;
  }

  /**
   * Format TikTok content for trending section
   */
  formatForTrending(content: any[]): any[] {
    return content.map(item => ({
      id: item.metadata?.external_id || item.ID.toString(),
      title: item.post_title || 'TikTok Video',
      source: item.metadata?.tiktok_author_display_name || 'TikTok',
      timeAgo: this.formatTimeAgo(item.post_date),
      imageSrc: item.metadata?.tiktok_cover_url,
      href: item.metadata?.source_url || item.guid,
      type: 'tiktok',
      metadata: {
        likes: parseInt(item.metadata?.tiktok_like_count || '0'),
        views: parseInt(item.metadata?.tiktok_play_count || '0'),
        author: item.metadata?.tiktok_author_username || '',
        duration: 0 // Duration not stored in current structure
      }
    }));
  }

  /**
   * Format date for display
   */
  private formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Baru saja';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} menit`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} jam`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} hari`;
    } else {
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }

  /**
   * Check if video ID is valid TikTok format
   */
  isValidVideoId(videoId: string): boolean {
    // TikTok video IDs are typically 19-digit numbers
    return /^\d{19}$/.test(videoId);
  }

  /**
   * Extract video ID from TikTok URL
   */
  extractVideoId(url: string): string | null {
    const patterns = [
      /tiktok\.com\/@[^\/]+\/video\/(\d+)/,
      /tiktok\.com\/video\/(\d+)/,
      /vm\.tiktok\.com\/(\w+)/,
      /vt\.tiktok\.com\/(\w+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }
}

// Create singleton instance
export const tiktokAPI = new TikTokAPI();
