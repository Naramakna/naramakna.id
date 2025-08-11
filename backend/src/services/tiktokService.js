// Service untuk integrasi dengan TikTok API
const axios = require('axios');
const tiktokConfig = require('../config/tiktok');
const logger = require('../utils/logger');

class TikTokService {
  constructor() {
    this.config = tiktokConfig;
    this.accessToken = null;
    this.tokenExpiry = null;
    this.rateLimitRemaining = this.config.rateLimit.requestsPerMinute;
    this.lastReset = Date.now();
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthURL(state = null) {
    const params = new URLSearchParams({
      client_key: this.config.clientKey,
      scope: this.config.scopes.join(','),
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      state: state || 'random_state_' + Math.random().toString(36).substring(7)
    });

    return `${this.config.authURL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(authCode) {
    try {
      const response = await axios.post(this.config.tokenURL, {
        client_key: this.config.clientKey,
        client_secret: this.config.clientSecret,
        code: authCode,
        grant_type: 'authorization_code',
        redirect_uri: this.config.redirectUri
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.access_token) {
        this.accessToken = response.data.access_token;
        this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
        
        logger.info('TikTok access token obtained successfully');
        return {
          access_token: response.data.access_token,
          expires_in: response.data.expires_in,
          refresh_token: response.data.refresh_token,
          scope: response.data.scope
        };
      }

      throw new Error('No access token received');
    } catch (error) {
      logger.error('TikTok token exchange failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Set access token manually (for saved tokens)
   */
  setAccessToken(token, expiryTime = null) {
    this.accessToken = token;
    this.tokenExpiry = expiryTime;
  }

  /**
   * Check if access token is valid and not expired
   */
  isTokenValid() {
    return this.accessToken && (!this.tokenExpiry || Date.now() < this.tokenExpiry - 300000); // 5 min buffer
  }

  /**
   * Rate limiting check
   */
  checkRateLimit() {
    const now = Date.now();
    
    // Reset rate limit every minute
    if (now - this.lastReset >= 60000) {
      this.rateLimitRemaining = this.config.rateLimit.requestsPerMinute;
      this.lastReset = now;
    }

    if (this.rateLimitRemaining <= 0) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }

    this.rateLimitRemaining--;
  }

  /**
   * Make authenticated API request
   */
  async makeRequest(endpoint, method = 'GET', data = null) {
    if (!this.isTokenValid()) {
      throw new Error('Invalid or expired access token');
    }

    this.checkRateLimit();

    try {
      const config = {
        method,
        url: `${this.config.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      logger.error(`TikTok API request failed for ${endpoint}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile() {
    try {
      const response = await this.makeRequest('/v2/user/info/', 'POST', {
        fields: ['open_id', 'union_id', 'avatar_url', 'display_name', 'bio_description', 'profile_deep_link', 'is_verified', 'follower_count', 'following_count', 'likes_count', 'video_count']
      });

      return response.data?.user || response.data;
    } catch (error) {
      logger.error('Failed to get TikTok user profile:', error.message);
      throw error;
    }
  }

  /**
   * Get user videos
   */
  async getUserVideos(cursor = '', maxId = '') {
    try {
      const postData = {
        max_count: this.config.contentFilter.maxVideosPerSync || 20,
        fields: ['id', 'create_time', 'cover_image_url', 'share_url', 'video_description', 'duration', 'height', 'width', 'title', 'embed_html', 'embed_link', 'like_count', 'comment_count', 'share_count', 'view_count']
      };

      if (cursor) postData.cursor = cursor;
      if (maxId) postData.max_id = maxId;

      const response = await this.makeRequest('/v2/video/list/', 'POST', postData);
      
      return {
        videos: response.data?.videos || [],
        cursor: response.data?.cursor || '',
        has_more: response.data?.has_more || false
      };
    } catch (error) {
      logger.error('Failed to get TikTok user videos:', error.message);
      throw error;
    }
  }

  /**
   * Get video details by ID
   */
  async getVideoDetails(videoId) {
    try {
      const response = await this.makeRequest('/v2/video/query/', 'POST', {
        video_ids: [videoId],
        fields: ['id', 'create_time', 'cover_image_url', 'share_url', 'video_description', 'duration', 'height', 'width', 'title', 'embed_html', 'embed_link', 'like_count', 'comment_count', 'share_count', 'view_count']
      });

      return response.data?.videos?.[0] || null;
    } catch (error) {
      logger.error(`Failed to get TikTok video details for ID ${videoId}:`, error.message);
      throw error;
    }
  }

  /**
   * Filter videos based on criteria
   */
  filterVideos(videos) {
    const { minViews, minLikes, excludePrivate } = this.config.contentFilter;

    return videos.filter(video => {
      // Check minimum views
      if (minViews && video.view_count < minViews) return false;
      
      // Check minimum likes
      if (minLikes && video.like_count < minLikes) return false;
      
      // Check if private videos should be excluded
      if (excludePrivate && video.privacy_setting === 'private') return false;
      
      return true;
    });
  }

  /**
   * Sync user content - main method for fetching and processing videos
   */
  async syncUserContent() {
    try {
      if (!this.isTokenValid()) {
        throw new Error('TikTok access token required for content sync');
      }

      // Get user profile first
      const profile = await this.getUserProfile();
      logger.info(`Syncing content for TikTok user: ${profile.display_name}`);

      let allVideos = [];
      let cursor = '';
      let hasMore = true;

      // Fetch all videos with pagination
      while (hasMore) {
        const result = await this.getUserVideos(cursor);
        
        if (result.videos && result.videos.length > 0) {
          allVideos = allVideos.concat(result.videos);
        }

        cursor = result.cursor;
        hasMore = result.has_more;

        // Safety check to prevent infinite loops
        if (allVideos.length >= this.config.contentFilter.maxVideosPerSync) {
          break;
        }
      }

      // Filter videos based on criteria
      const filteredVideos = this.filterVideos(allVideos);

      logger.info(`TikTok sync completed: ${filteredVideos.length} videos processed`);
      
      return {
        profile,
        videos: filteredVideos,
        totalFetched: allVideos.length,
        totalFiltered: filteredVideos.length
      };
    } catch (error) {
      logger.error('TikTok content sync failed:', error.message);
      throw error;
    }
  }
}

const tiktokService = new TikTokService();
module.exports = tiktokService;
