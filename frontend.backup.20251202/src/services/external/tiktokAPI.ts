// Service untuk direct TikTok API calls
import type { TikTokContent } from '../../types/tiktok';

/**
 * External TikTok API service for public operations
 * This handles operations that don't require authentication
 */
class TikTokExternalAPI {
  /**
   * Get TikTok oEmbed data
   */
  async getOEmbedData(videoUrl: string): Promise<any> {
    try {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`;
      const response = await fetch(oembedUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch oEmbed data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('TikTok oEmbed API error:', error);
      throw error;
    }
  }

  /**
   * Generate TikTok embed iframe HTML
   */
  generateEmbedHTML(videoId: string, options?: {
    width?: number;
    height?: number;
    cite?: string;
  }): string {
    const width = options?.width || 325;
    const height = options?.height || 738;
    const cite = options?.cite || '';

    return `
      <blockquote 
        class="tiktok-embed" 
        cite="${cite}"
        data-video-id="${videoId}" 
        style="max-width: ${width}px; min-width: 325px;"
      >
        <section>
          <a 
            target="_blank" 
            title="TikTok Video" 
            href="https://www.tiktok.com/video/${videoId}"
          >
            Video TikTok
          </a>
        </section>
      </blockquote>
    `;
  }

  /**
   * Load TikTok embed script
   */
  loadEmbedScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script already loaded
      if (window.tiktokEmbedLoaded) {
        resolve();
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="tiktok.com/embed"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          window.tiktokEmbedLoaded = true;
          resolve();
        });
        return;
      }

      // Create and load script
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      
      script.onload = () => {
        window.tiktokEmbedLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load TikTok embed script'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Extract video ID from various TikTok URL formats
   */
  extractVideoId(url: string): string | null {
    const patterns = [
      // Standard URLs
      /tiktok\.com\/@[^\/]+\/video\/(\d+)/,
      /tiktok\.com\/video\/(\d+)/,
      // Short URLs
      /vm\.tiktok\.com\/(\w+)/,
      /vt\.tiktok\.com\/(\w+)/,
      // Mobile URLs
      /m\.tiktok\.com\/v\/(\d+)/,
      // Direct video ID
      /^(\d{19})$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Validate TikTok URL
   */
  isValidTikTokURL(url: string): boolean {
    const tiktokDomains = [
      'tiktok.com',
      'vm.tiktok.com', 
      'vt.tiktok.com',
      'm.tiktok.com'
    ];

    try {
      const urlObj = new URL(url);
      return tiktokDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  }

  /**
   * Format TikTok content for display
   */
  formatContentForDisplay(content: TikTokContent): {
    title: string;
    description: string;
    thumbnail: string;
    url: string;
    stats: {
      views: number;
      likes: number;
      shares: number;
      comments: number;
    };
    author: {
      username: string;
      displayName: string;
    };
  } {
    return {
      title: content.post_title || 'TikTok Video',
      description: content.post_content || '',
      thumbnail: content.metadata?.tiktok_cover_url || '',
      url: content.metadata?.source_url || content.guid,
      stats: {
        views: parseInt(content.metadata?.tiktok_play_count || '0'),
        likes: parseInt(content.metadata?.tiktok_like_count || '0'),
        shares: parseInt(content.metadata?.tiktok_share_count || '0'),
        comments: parseInt(content.metadata?.tiktok_comment_count || '0')
      },
      author: {
        username: content.metadata?.tiktok_author_username || '',
        displayName: content.metadata?.tiktok_author_display_name || ''
      }
    };
  }

  /**
   * Format number for display (e.g., 1.2K, 1.5M)
   */
  formatNumber(num: number): string {
    if (num < 1000) {
      return num.toString();
    } else if (num < 1000000) {
      return `${(num / 1000).toFixed(1)}K`;
    } else if (num < 1000000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else {
      return `${(num / 1000000000).toFixed(1)}B`;
    }
  }

  /**
   * Check if TikTok embeds are supported in current browser
   */
  isEmbedSupported(): boolean {
    // Basic checks for embed support
    return typeof window !== 'undefined' && 
           'postMessage' in window && 
           'addEventListener' in window;
  }

  /**
   * Get video thumbnail from TikTok URL using oEmbed
   */
  async getVideoThumbnail(videoUrl: string): Promise<string | null> {
    try {
      const oembedData = await this.getOEmbedData(videoUrl);
      return oembedData.thumbnail_url || null;
    } catch (error) {
      console.error('Failed to get TikTok thumbnail:', error);
      return null;
    }
  }

  /**
   * Preload TikTok video data
   */
  async preloadVideo(videoId: string): Promise<void> {
    try {
      const videoUrl = `https://www.tiktok.com/video/${videoId}`;
      await this.getOEmbedData(videoUrl);
    } catch (error) {
      console.error('Failed to preload TikTok video:', error);
    }
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    tiktokEmbedLoaded?: boolean;
  }
}

// Create singleton instance
export const tiktokExternalAPI = new TikTokExternalAPI();
