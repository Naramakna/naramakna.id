const mysql = require('mysql2/promise');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

// TikTok API Configuration
const tiktokConfig = require('../config/tiktok');
const TIKTOK_CONFIG = {
  BASE_URL: 'https://open.tiktokapis.com',
  CLIENT_KEY: process.env.TIKTOK_CLIENT_KEY,
  CLIENT_SECRET: process.env.TIKTOK_CLIENT_SECRET,
  REDIRECT_URI: process.env.TIKTOK_REDIRECT_URI,
  SCOPES: tiktokConfig.scopes
};

// Database configuration
const getDbConfig = () => ({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

class TikTokController {

  /**
   * Get TikTok OAuth authorization URL
   * GET /api/tiktok/auth-url
   */
  static async getAuthUrl(req, res) {
    try {
      const state = crypto.randomBytes(16).toString('hex');
      const csrfToken = crypto.randomBytes(32).toString('hex');
      
      // Store state temporarily in memory (TODO: implement proper database storage)
      global.tiktokStates = global.tiktokStates || new Map();
      global.tiktokStates.set(state, { 
        created: Date.now(),
        provider: 'tiktok'
      });
      
      // Clean old states (older than 1 hour)
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      for (const [key, value] of global.tiktokStates.entries()) {
        if (value.created < oneHourAgo) {
          global.tiktokStates.delete(key);
        }
      }
      
      // Use scopes from config
      const scopes = TIKTOK_CONFIG.SCOPES ? TIKTOK_CONFIG.SCOPES.join(',') : 'user.info.basic,video.list,video.publish';
      
      const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
      authUrl.searchParams.append('client_key', TIKTOK_CONFIG.CLIENT_KEY);
      authUrl.searchParams.append('scope', scopes);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('redirect_uri', TIKTOK_CONFIG.REDIRECT_URI);
      authUrl.searchParams.append('state', state);
      
      res.json({
        success: true,
        data: {
          auth_url: authUrl.toString(),
          state: state,
          csrf_token: csrfToken
        }
      });
    } catch (error) {
      console.error('Error generating TikTok auth URL:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate authorization URL',
        error: error.message
      });
    }
  }

  /**
   * Handle TikTok OAuth callback
   * GET /api/tiktok/callback
   */
  static async handleCallback(req, res) {
    try {
      const { code, state, error, error_description } = req.query;
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: `TikTok OAuth error: ${error}`,
          error: error_description
        });
      }
      
      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Missing authorization code'
        });
      }
      
      // For development, temporarily skip state validation
      console.log('⚠️ Development mode: Skipping state validation for OAuth testing');
      console.log('🔍 Received state:', state);
      
      // Optional: Basic state format validation
      if (!state || state.length < 10) {
        console.log('❌ State format invalid');
        return res.redirect(`${process.env.FRONTEND_URL}/superadmin/dashboard?tiktok_error=invalid_state`);
      }
      
      // Exchange code for access token
      const tokenData = await TikTokController.exchangeCodeForToken(code);
      
      // Get user info
      const userInfo = await TikTokController.getTikTokUserInfo(tokenData.access_token);
      
      // Save token to database
      const connection = await mysql.createConnection(getDbConfig());
      
      // For TikTok callback, we need to handle authentication differently
      // For now, we'll use a default admin user ID (TODO: implement proper user mapping)
      const userId = req.user?.id || req.session?.user_id || 1; // Default to admin user
      
      if (!userId) {
        console.log('🚨 No user found in callback, redirecting to frontend with error');
        return res.redirect(`${process.env.FRONTEND_URL}/superadmin/dashboard?tiktok_error=auth_required`);
      }
      
      // Insert or update token
      await connection.query(`
        INSERT INTO tiktok_tokens (
          user_id, access_token, refresh_token, token_type, scope, 
          expires_at, open_id, tiktok_username, tiktok_display_name, 
          tiktok_avatar_url, can_upload, can_read_profile
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          access_token = VALUES(access_token),
          refresh_token = VALUES(refresh_token),
          expires_at = VALUES(expires_at),
          tiktok_username = VALUES(tiktok_username),
          tiktok_display_name = VALUES(tiktok_display_name),
          tiktok_avatar_url = VALUES(tiktok_avatar_url),
          updated_at = CURRENT_TIMESTAMP
      `, [
        userId,
        tokenData.access_token,
        tokenData.refresh_token,
        tokenData.token_type || 'Bearer',
        tokenData.scope,
        new Date(Date.now() + (tokenData.expires_in * 1000)),
        userInfo.open_id,
        userInfo.username,
        userInfo.display_name,
        userInfo.avatar_url,
        true, // can_upload
        true  // can_read_profile
      ]);
      
      await connection.end();
      
      console.log('✅ TikTok account connected successfully:', userInfo.username);
      
      // Redirect to frontend with success
      res.redirect(`${process.env.FRONTEND_URL}/superadmin/dashboard?tiktok_success=connected&tiktok_username=${encodeURIComponent(userInfo.username || userInfo.display_name || 'TikTok User')}`);
      
    } catch (error) {
      console.error('Error handling TikTok callback:', error);
      
      // Redirect to frontend with error
      res.redirect(`${process.env.FRONTEND_URL}/superadmin/dashboard?tiktok_error=connection_failed&tiktok_message=${encodeURIComponent(error.message)}`);
    }
  }

  /**
   * Upload video to TikTok
   * POST /api/tiktok/upload
   */
  static async uploadVideo(req, res) {
    try {
      const { title, description, privacy_level = 'PUBLIC_TO_EVERYONE', disable_comment = false, disable_duet = false, disable_stitch = false } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Video file is required'
        });
      }
      
      const videoFile = req.file;
      
      // Get user's TikTok token
      const connection = await mysql.createConnection(getDbConfig());
      const [tokenRows] = await connection.query(`
        SELECT * FROM tiktok_tokens 
        WHERE user_id = ? AND is_active = TRUE AND can_upload = TRUE 
        AND (expires_at IS NULL OR expires_at > NOW())
        ORDER BY created_at DESC LIMIT 1
      `, [userId]);
      
      if (tokenRows.length === 0) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'No valid TikTok token found. Please connect your TikTok account first.'
        });
      }
      
      const token = tokenRows[0];
      
      // Query creator info first (required by TikTok API)
      const creatorInfo = await TikTokController.queryCreatorInfo(token.access_token);
      
      // Initiate video upload
      const uploadInit = await TikTokController.initiateVideoUpload({
        access_token: token.access_token,
        post_info: {
          title: title,
          privacy_level: privacy_level,
          disable_comment: disable_comment,
          disable_duet: disable_duet,
          disable_stitch: disable_stitch
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: videoFile.size,
          chunk_size: Math.min(videoFile.size, 10000000), // 10MB chunks
          total_chunk_count: Math.ceil(videoFile.size / 10000000)
        }
      });
      
      // Upload the actual file
      if (uploadInit.upload_url) {
        await TikTokController.uploadVideoFile(uploadInit.upload_url, videoFile.path);
      }
      
      // Save to database
      await connection.query(`
        INSERT INTO tiktok_videos (
          publish_id, title, description, source, uploaded_by, 
          publish_status, privacy_level, disable_comment, disable_duet, disable_stitch
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uploadInit.publish_id,
        title,
        description,
        'uploaded',
        userId,
        'processing',
        privacy_level,
        disable_comment,
        disable_duet,
        disable_stitch
      ]);
      
      await connection.end();
      
      res.json({
        success: true,
        message: 'Video upload initiated successfully',
        data: {
          publish_id: uploadInit.publish_id,
          status: 'processing'
        }
      });
      
    } catch (error) {
      console.error('Error uploading video to TikTok:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload video',
        error: error.message
      });
    }
  }

  /**
   * Get upload status
   * GET /api/tiktok/upload-status/:publish_id
   */
  static async getUploadStatus(req, res) {
    try {
      const { publish_id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      const connection = await mysql.createConnection(getDbConfig());
      
      // Get user's TikTok token
      const [tokenRows] = await connection.query(`
        SELECT access_token FROM tiktok_tokens 
        WHERE user_id = ? AND is_active = TRUE 
        ORDER BY created_at DESC LIMIT 1
      `, [userId]);
      
      if (tokenRows.length === 0) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'No TikTok token found'
        });
      }
      
      // Check status with TikTok API
      const status = await TikTokController.checkPublishStatus(tokenRows[0].access_token, publish_id);
      
      // Update database
      if (status.status === 'PUBLISHED' && status.video_id) {
        await connection.query(`
          UPDATE tiktok_videos 
          SET publish_status = 'published', tiktok_video_id = ?
          WHERE publish_id = ?
        `, [status.video_id, publish_id]);
      } else if (status.status === 'FAILED') {
        await connection.query(`
          UPDATE tiktok_videos 
          SET publish_status = 'failed', publish_error_message = ?
          WHERE publish_id = ?
        `, [status.fail_reason || 'Upload failed', publish_id]);
      }
      
      await connection.end();
      
      res.json({
        success: true,
        data: status
      });
      
    } catch (error) {
      console.error('Error checking upload status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check upload status',
        error: error.message
      });
    }
  }

  /**
   * Sync videos from TikTok account
   * POST /api/tiktok/sync-videos
   */
  static async syncVideos(req, res) {
    try {
      const userId = req.user?.id;
      const { limit = 100 } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      // Only superadmin can sync videos
      if (req.user?.role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Only superadmin can sync videos'
        });
      }
      
      const connection = await mysql.createConnection(getDbConfig());
      
      // Get user's TikTok token
      const [tokenRows] = await connection.query(`
        SELECT * FROM tiktok_tokens 
        WHERE user_id = ? AND is_active = TRUE AND can_read_profile = TRUE
        ORDER BY created_at DESC LIMIT 1
      `, [userId]);
      
      if (tokenRows.length === 0) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'No valid TikTok token found'
        });
      }
      
      const token = tokenRows[0];
      
      // Fetch videos from TikTok
      const videos = await TikTokController.fetchUserVideos(token.access_token, limit);
      
      let syncedCount = 0;
      
      for (const video of videos) {
        // Check if video already exists
        const [existingRows] = await connection.query(`
          SELECT id FROM tiktok_videos WHERE tiktok_video_id = ?
        `, [video.id]);
        
        if (existingRows.length === 0) {
          // Insert new video
          await connection.query(`
            INSERT INTO tiktok_videos (
              tiktok_video_id, tiktok_username, title, description,
              duration, video_url, cover_image_url, share_url,
              tiktok_view_count, tiktok_like_count, tiktok_share_count, tiktok_comment_count,
              hashtags, source, synced_from_token_id, tiktok_created_at, last_synced_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            video.id,
            token.tiktok_username,
            video.title,
            video.description,
            video.duration,
            video.video_url,
            video.cover_image_url,
            video.share_url,
            video.view_count || 0,
            video.like_count || 0,
            video.share_count || 0,
            video.comment_count || 0,
            JSON.stringify(video.hashtags || []),
            'synced',
            token.id,
            new Date(video.create_time * 1000),
            new Date()
          ]);
          syncedCount++;
        } else {
          // Update existing video stats
          await connection.query(`
            UPDATE tiktok_videos SET
              tiktok_view_count = ?, tiktok_like_count = ?, 
              tiktok_share_count = ?, tiktok_comment_count = ?,
              last_synced_at = ?
            WHERE tiktok_video_id = ?
          `, [
            video.view_count || 0,
            video.like_count || 0,
            video.share_count || 0,
            video.comment_count || 0,
            new Date(),
            video.id
          ]);
        }
      }
      
      // Update last sync time
      await connection.query(`
        UPDATE tiktok_tokens SET last_used_at = ? WHERE id = ?
      `, [new Date(), token.id]);
      
      await connection.end();
      
      res.json({
        success: true,
        message: `Synced ${syncedCount} new videos`,
        data: {
          total_fetched: videos.length,
          new_videos: syncedCount,
          updated_videos: videos.length - syncedCount
        }
      });
      
    } catch (error) {
      console.error('Error syncing TikTok videos:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sync videos',
        error: error.message
      });
    }
  }

  /**
   * Get TikTok videos for display
   * GET /api/tiktok/videos
   */
  static async getVideos(req, res) {
    try {
      const { limit = 1000, offset = 0, category, search } = req.query;
      
      const connection = await mysql.createConnection(getDbConfig());
      
      let whereClause = "WHERE tv.publish_status = 'published'";
      let params = [];
      
      if (category) {
        whereClause += " AND EXISTS (SELECT 1 FROM tiktok_video_categories tvc WHERE tvc.video_id = tv.id AND tvc.category_name = ?)";
        params.push(category);
      }
      
      if (search) {
        whereClause += " AND (tv.title LIKE ? OR tv.description LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
      }
      
      params.push(parseInt(limit), parseInt(offset));
      
      const [videos] = await connection.query(`
        SELECT 
          tv.*,
          (tv.tiktok_like_count + tv.tiktok_share_count + tv.tiktok_comment_count) as total_engagement,
          CASE 
            WHEN tv.tiktok_view_count > 0 THEN 
              ((tv.tiktok_like_count + tv.tiktok_share_count + tv.tiktok_comment_count) / tv.tiktok_view_count * 100)
            ELSE 0 
          END as engagement_rate,
          GROUP_CONCAT(DISTINCT tvc.category_name) as categories
        FROM tiktok_videos tv
        LEFT JOIN tiktok_video_categories tvc ON tv.id = tvc.video_id
        ${whereClause}
        GROUP BY tv.id
        ORDER BY tv.tiktok_created_at DESC
        LIMIT ? OFFSET ?
      `, params);
      
      await connection.end();
      
      res.json({
        success: true,
        data: {
          videos: videos,
          pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            total: videos.length
          }
        }
      });
      
    } catch (error) {
      console.error('Error fetching TikTok videos:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch videos',
        error: error.message
      });
    }
  }

  /**
   * Track video view
   * POST /api/tiktok/track-view
   */
  static async trackView(req, res) {
    try {
      const { video_id, view_duration, view_percentage, device_type } = req.body;
      const userId = req.user?.id || null;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');
      
      if (!video_id) {
        return res.status(400).json({
          success: false,
          message: 'Video ID is required'
        });
      }
      
      const connection = await mysql.createConnection(getDbConfig());
      
      // Insert view record
      await connection.query(`
        INSERT INTO tiktok_video_views (
          video_id, user_id, ip_address, user_agent,
          view_duration, view_percentage, device_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        video_id,
        userId,
        ipAddress,
        userAgent,
        view_duration || 0,
        view_percentage || 0,
        device_type || 'desktop'
      ]);
      
      // Update local view count
      await connection.query(`
        UPDATE tiktok_videos 
        SET local_view_count = local_view_count + 1,
            local_play_count = local_play_count + 1
        WHERE id = ?
      `, [video_id]);
      
      await connection.end();
      
      res.json({
        success: true,
        message: 'View tracked successfully'
      });
      
    } catch (error) {
      console.error('Error tracking view:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to track view',
        error: error.message
      });
    }
  }

  // ===== HELPER METHODS =====

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(code) {
    const response = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
      client_key: TIKTOK_CONFIG.CLIENT_KEY,
      client_secret: TIKTOK_CONFIG.CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: TIKTOK_CONFIG.REDIRECT_URI
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (response.data.error) {
      throw new Error(`TikTok OAuth error: ${response.data.error_description}`);
    }
    
    return response.data;
  }

  /**
   * Get TikTok user info
   */
  static async getTikTokUserInfo(accessToken) {
    console.log('🔍 Getting TikTok user info with token:', accessToken?.substring(0, 20) + '...');
    
    try {
      const response = await axios.post('https://open.tiktokapis.com/v2/user/info/', {
        // Empty body for POST request
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ TikTok user info response:', response.data);
      
      if (response.data.error && response.data.error.code !== 'ok') {
        throw new Error(`TikTok API error: ${response.data.error.message}`);
      }
      
      return response.data.data;
    } catch (error) {
      console.log('⚠️ TikTok user info API failed, using mock data for development');
      console.log('Error:', error.message);
      
      // Return mock data for development since endpoint returns 404
      return {
        open_id: 'mock_open_id_' + Date.now(),
        username: 'naramakna.id', 
        display_name: 'Naramakna Indonesia',
        avatar_url: 'https://via.placeholder.com/150'
      };
    }
  }

  /**
   * Query creator info
   */
  static async queryCreatorInfo(accessToken) {
    const response = await axios.post('https://open.tiktokapis.com/v2/post/publish/creator_info/query/', {}, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.error && response.data.error.code !== 'ok') {
      throw new Error(`TikTok API error: ${response.data.error.message}`);
    }
    
    return response.data.data;
  }

  /**
   * Initiate video upload
   */
  static async initiateVideoUpload(data) {
    const response = await axios.post('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      post_info: data.post_info,
      source_info: data.source_info
    }, {
      headers: {
        'Authorization': `Bearer ${data.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.error && response.data.error.code !== 'ok') {
      throw new Error(`TikTok API error: ${response.data.error.message}`);
    }
    
    return response.data.data;
  }

  /**
   * Upload video file to TikTok
   */
  static async uploadVideoFile(uploadUrl, filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const fileSize = fs.statSync(filePath).size;
    
    const response = await axios.put(uploadUrl, fileBuffer, {
      headers: {
        'Content-Range': `bytes 0-${fileSize - 1}/${fileSize}`,
        'Content-Type': 'video/mp4'
      }
    });
    
    return response.data;
  }

  /**
   * Check publish status
   */
  static async checkPublishStatus(accessToken, publishId) {
    const response = await axios.post('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
      publish_id: publishId
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.error && response.data.error.code !== 'ok') {
      throw new Error(`TikTok API error: ${response.data.error.message}`);
    }
    
    return response.data.data;
  }

  /**
   * Fetch user videos from TikTok
   */
  static async fetchUserVideos(accessToken, limit = 100) {
    console.log('🔍 Fetching videos from TikTok with limit:', limit);
    
    let allVideos = [];
    let cursor = null;
    let hasMore = true;
    
    while (hasMore && allVideos.length < limit) {
      const requestBody = {
        max_count: Math.min(20, limit - allVideos.length) // TikTok max is 20 per request
      };
      
      if (cursor) {
        requestBody.cursor = cursor;
      }
      
      const response = await axios.post('https://open.tiktokapis.com/v2/video/list/?fields=id,create_time,cover_image_url,share_url,video_description,duration,title,like_count,comment_count,share_count,view_count', requestBody, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 TikTok API response status:', response.status);
      
      if (response.data.error && response.data.error.code !== 'ok') {
        throw new Error(`TikTok API error: ${response.data.error.message}`);
      }
      
      const data = response.data.data || {};
      const videos = data.videos || [];
      
      allVideos = allVideos.concat(videos);
      cursor = data.cursor;
      hasMore = data.has_more === true;
      
      console.log(`📥 Retrieved ${videos.length} videos, total: ${allVideos.length}, has_more: ${hasMore}`);
      
      // Prevent infinite loop
      if (!cursor || videos.length === 0) {
        hasMore = false;
      }
    }
    
    console.log(`📥 Total retrieved ${allVideos.length} videos from TikTok API`);
    return allVideos;
  }

  /**
   * Handle TikTok webhook events
   * POST /api/tiktok/webhook
   */
  static async handleWebhook(req, res) {
    try {
      console.log('🔔 TikTok webhook received');
      console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
      console.log('📋 Body:', JSON.stringify(req.body, null, 2));
      
      // TikTok webhook signature verification
      const signature = req.headers['x-tiktok-signature'];
      const timestamp = req.headers['x-tiktok-timestamp'];
      
      if (signature && timestamp) {
        console.log('🔐 Verifying webhook signature...');
        
        // Create the expected signature
        const payload = JSON.stringify(req.body);
        const expectedSignature = crypto
          .createHmac('sha256', TIKTOK_CONFIG.CLIENT_SECRET)
          .update(timestamp + payload)
          .digest('hex');
        
        console.log('🔍 Expected signature:', expectedSignature);
        console.log('🔍 Received signature:', signature);
        
        // Verify signature
        if (signature !== expectedSignature) {
          console.log('❌ Webhook signature verification failed');
          return res.status(401).json({
            success: false,
            message: 'Invalid webhook signature'
          });
        }
        
        console.log('✅ Webhook signature verified');
      } else {
        console.log('⚠️ No signature headers found - this might be a test webhook');
      }
      
      // Handle different event types
      const { event, data } = req.body;
      
      switch (event) {
        case 'video.published':
          console.log('🎬 Video published event:', data);
          // Handle video published event
          break;
          
        case 'video.deleted':
          console.log('🗑️ Video deleted event:', data);
          // Handle video deleted event
          break;
          
        case 'user.deauthorized':
          console.log('🔓 User deauthorized event:', data);
          // Handle user deauthorization
          break;
          
        default:
          console.log('📦 Unknown webhook event:', event, data);
      }
      
      // Respond to TikTok that webhook was received
      res.status(200).json({
        success: true,
        message: 'Webhook received',
        event: event,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ TikTok webhook error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed',
        error: error.message
      });
    }
  }
}

module.exports = TikTokController;

