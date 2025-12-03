// Routes untuk integrasi TikTok API
const express = require('express');
const tiktokService = require('../services/tiktokService');
const ContentHelpers = require('../models/ContentHelpers');
const { requireAuth, requireRole } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   GET /api/tiktok/auth
 * @desc    Get TikTok OAuth authorization URL
 * @access  Private (Admin/Writer)
 */
router.get('/auth', requireAuth, requireRole(['admin', 'writer']), (req, res) => {
  try {
    const state = `tiktok_auth_${req.user.ID}_${Date.now()}`;
    const authURL = tiktokService.getAuthURL(state);
    
    // Store state in session or cache for verification
    req.session.tiktokAuthState = state;
    
    res.json({
      success: true,
      authURL,
      message: 'TikTok authorization URL generated'
    });
  } catch (error) {
    logger.error('TikTok auth URL generation failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate TikTok authorization URL',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/tiktok/callback
 * @desc    Handle TikTok OAuth callback
 * @access  Private (Admin/Writer)
 */
router.post('/callback', requireAuth, requireRole(['admin', 'writer']), async (req, res) => {
  try {
    const { code, state } = req.body;
    
    // Verify state parameter
    if (!state || state !== req.session.tiktokAuthState) {
      return res.status(400).json({
        success: false,
        message: 'Invalid state parameter'
      });
    }
    
    // Exchange code for access token
    const tokenData = await tiktokService.getAccessToken(code);
    
    // Get user profile to verify connection
    tiktokService.setAccessToken(tokenData.access_token);
    const profile = await tiktokService.getUserProfile();
    
    // Store token securely (implement your own token storage logic)
    // For now, just set it in service for current session
    
    // Clear auth state
    delete req.session.tiktokAuthState;
    
    res.json({
      success: true,
      message: 'TikTok account connected successfully',
      profile: {
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        follower_count: profile.follower_count,
        video_count: profile.video_count
      }
    });
    
    logger.info(`TikTok account connected for user ${req.user.user_login}: ${profile.display_name}`);
  } catch (error) {
    logger.error('TikTok callback failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to connect TikTok account',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/tiktok/profile
 * @desc    Get connected TikTok profile information
 * @access  Private (Admin/Writer)
 */
router.get('/profile', requireAuth, requireRole(['admin', 'writer']), async (req, res) => {
  try {
    if (!tiktokService.isTokenValid()) {
      return res.status(401).json({
        success: false,
        message: 'TikTok not connected or token expired'
      });
    }
    
    const profile = await tiktokService.getUserProfile();
    
    res.json({
      success: true,
      profile
    });
  } catch (error) {
    logger.error('Failed to get TikTok profile:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get TikTok profile',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/tiktok/videos
 * @desc    Get TikTok user videos
 * @access  Private (Admin/Writer)
 */
router.get('/videos', requireAuth, requireRole(['admin', 'writer']), async (req, res) => {
  try {
    if (!tiktokService.isTokenValid()) {
      return res.status(401).json({
        success: false,
        message: 'TikTok not connected or token expired'
      });
    }
    
    const { cursor, maxId } = req.query;
    const result = await tiktokService.getUserVideos(cursor, maxId);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Failed to get TikTok videos:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get TikTok videos',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/tiktok/sync
 * @desc    Manually trigger TikTok content sync
 * @access  Private (Admin/Writer)
 */
router.post('/sync', requireAuth, requireRole(['admin', 'writer']), async (req, res) => {
  try {
    if (!tiktokService.isTokenValid()) {
      return res.status(401).json({
        success: false,
        message: 'TikTok not connected or token expired'
      });
    }
    
    const syncResult = await tiktokService.syncUserContent();
    
    // Process and save videos to database
    let savedCount = 0;
    const errors = [];
    
    for (const video of syncResult.videos) {
      try {
        // Convert TikTok video to our post format
        const videoData = {
          videoId: video.id,
          description: video.video_description || video.title || '',
          username: syncResult.profile.display_name,
          displayName: syncResult.profile.display_name,
          createdTime: new Date(video.create_time * 1000),
          playCount: video.view_count || 0,
          likeCount: video.like_count || 0,
          shareCount: video.share_count || 0,
          commentCount: video.comment_count || 0,
          coverUrl: video.cover_image_url,
          shareUrl: video.share_url,
          embedHtml: video.embed_html,
          embedLink: video.embed_link,
          duration: video.duration,
          width: video.width,
          height: video.height
        };
        
        await ContentHelpers.createTikTokVideo(videoData, req.user.ID);
        savedCount++;
      } catch (error) {
        errors.push({
          videoId: video.id,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: `TikTok sync completed successfully`,
      stats: {
        totalFetched: syncResult.totalFetched,
        totalFiltered: syncResult.totalFiltered,
        savedCount,
        errorCount: errors.length
      },
      errors: errors.length > 0 ? errors : undefined
    });
    
    logger.info(`TikTok sync completed for user ${req.user.user_login}: ${savedCount} videos saved`);
  } catch (error) {
    logger.error('TikTok sync failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'TikTok sync failed',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/tiktok/status
 * @desc    Get TikTok integration status
 * @access  Private (Admin/Writer)
 */
router.get('/status', requireAuth, requireRole(['admin', 'writer']), (req, res) => {
  try {
    const isConnected = tiktokService.isTokenValid();
    
    res.json({
      success: true,
      connected: isConnected,
      rateLimitRemaining: tiktokService.rateLimitRemaining,
      message: isConnected ? 'TikTok is connected' : 'TikTok not connected'
    });
  } catch (error) {
    logger.error('Failed to get TikTok status:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get TikTok status',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/tiktok/disconnect
 * @desc    Disconnect TikTok account
 * @access  Private (Admin/Writer)
 */
router.delete('/disconnect', requireAuth, requireRole(['admin', 'writer']), (req, res) => {
  try {
    // Clear stored tokens
    tiktokService.setAccessToken(null, null);
    
    res.json({
      success: true,
      message: 'TikTok account disconnected successfully'
    });
    
    logger.info(`TikTok account disconnected for user ${req.user.user_login}`);
  } catch (error) {
    logger.error('Failed to disconnect TikTok:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect TikTok account',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/tiktok/content
 * @desc    Get TikTok content from database
 * @access  Public
 */
router.get('/content', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const tiktokContent = await ContentHelpers.getContentByType(
      ContentHelpers.CONTENT_TYPES.TIKTOK_VIDEO,
      { limit: parseInt(limit), offset: parseInt(offset) }
    );
    
    res.json({
      success: true,
      content: tiktokContent
    });
  } catch (error) {
    logger.error('Failed to get TikTok content:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get TikTok content',
      error: error.message
    });
  }
});

module.exports = router;
