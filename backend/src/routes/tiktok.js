const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const TikTokController = require('../controllers/tiktokController');
const { authenticate, requireRole } = require('../middleware/auth');

// Configure multer for video file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/tiktok/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit for TikTok videos
    fieldSize: 10 * 1024 * 1024  // 10MB for other fields
  },
  fileFilter: function (req, file, cb) {
    // Check if file is a video
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

// Public routes
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'TikTok routes working', 
    timestamp: new Date().toISOString() 
  });
});

// Get TikTok videos for public display
router.get('/videos', TikTokController.getVideos);

// Track video view (public - no auth required)
router.post('/track-view', TikTokController.trackView);

// OAuth auth-url - Public (needed for OAuth flow)
router.get('/auth-url', TikTokController.getAuthUrl);

// OAuth callback - Public (needed for OAuth flow) 
router.get('/callback', TikTokController.handleCallback);

// Connection status - Public (needed for frontend to check if connected)
router.get('/connection-status', async (req, res) => {
  try {
    // For development, always return not connected since we don't have proper user session
    // In production, this would check actual user tokens
    res.json({
      success: true,
      data: {
        connected: false,
        message: 'OAuth flow completed successfully, but no persistent session yet'
      }
    });
  } catch (error) {
    console.error('Error checking TikTok connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check connection status',
      error: error.message
    });
  }
});

// Auto-sync videos - Public for testing (will sync if token available)
router.post('/auto-sync', async (req, res) => {
  try {
    const { limit = 20 } = req.body;
    
    const mysql = require('mysql2/promise');
    const getDbConfig = () => ({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    const connection = await mysql.createConnection(getDbConfig());
    
    // Get latest valid TikTok token (any user)
    const [tokenRows] = await connection.query(`
      SELECT * FROM tiktok_tokens 
      WHERE is_active = TRUE AND access_token IS NOT NULL
      AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC LIMIT 1
    `);
    
    if (tokenRows.length === 0) {
      await connection.end();
      return res.json({
        success: false,
        message: 'No valid TikTok token found. Please connect TikTok account first.',
        data: { new_videos: 0, total_videos: 0 }
      });
    }
    
    const token = tokenRows[0];
    console.log('🔄 Starting TikTok auto-sync with token for user:', token.tiktok_username);
    
    // Fetch videos from TikTok API
    const TikTokController = require('../controllers/tiktokController');
    const videos = await TikTokController.fetchUserVideos(token.access_token, limit);
    
    console.log(`📥 Fetched ${videos.length} videos from TikTok API`);
    
    let syncedCount = 0;
    
    for (const video of videos) {
      try {
        // Check if video already exists
        const [existing] = await connection.query(
          'SELECT id FROM tiktok_videos WHERE tiktok_video_id = ?',
          [video.id]
        );
        
        if (existing.length === 0) {
          // Insert new video
          await connection.query(`
            INSERT INTO tiktok_videos (
              tiktok_video_id, title, description, duration,
              cover_image_url, share_url, 
              tiktok_view_count, tiktok_like_count, tiktok_comment_count, tiktok_share_count,
              tiktok_username, tiktok_created_at, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
          `, [
            video.id,
            video.title || '',
            video.video_description || '',
            video.duration || 0,
            video.cover_image_url || '',
            video.share_url || '',
            video.view_count || 0,
            video.like_count || 0,
            video.comment_count || 0,
            video.share_count || 0,
            token.tiktok_username,
            video.create_time ? new Date(video.create_time * 1000) : new Date()
          ]);
          
          syncedCount++;
          console.log(`✅ Synced video: ${video.title || video.id}`);
        } else {
          // Update existing video stats
          await connection.query(`
            UPDATE tiktok_videos SET
              tiktok_view_count = ?, tiktok_like_count = ?, 
              tiktok_comment_count = ?, tiktok_share_count = ?
            WHERE tiktok_video_id = ?
          `, [
            video.view_count || 0,
            video.like_count || 0,
            video.comment_count || 0,
            video.share_count || 0,
            video.id
          ]);
          console.log(`📊 Updated stats for: ${video.title || video.id}`);
        }
      } catch (videoError) {
        console.error(`❌ Error syncing video ${video.id}:`, videoError.message);
      }
    }
    
    // Get total count
    const [countResult] = await connection.query('SELECT COUNT(*) as total FROM tiktok_videos');
    
    await connection.end();
    
    res.json({
      success: true,
      message: `Sync completed! ${syncedCount} new videos added.`,
      data: {
        new_videos: syncedCount,
        total_videos: countResult[0].total,
        fetched_from_api: videos.length
      }
    });
    
  } catch (error) {
    console.error('Error in auto-sync:', error);
    res.status(500).json({
      success: false,
      message: 'Auto-sync failed',
      error: error.message
    });
  }
});

// Admin videos list - Public for now (frontend needs this)
router.get('/admin/videos', async (req, res) => {
  try {
    const { limit = 50, offset = 0, status, search } = req.query;
    
    const mysql = require('mysql2/promise');
    const getDbConfig = () => ({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    const connection = await mysql.createConnection(getDbConfig());
    
    let whereConditions = [];
    let queryParams = [];
    
    // For now, ignore status filter since upload_status column doesn't exist
    // if (status) {
    //   whereConditions.push('upload_status = ?');
    //   queryParams.push(status);
    // }
    
    if (search) {
      whereConditions.push('(title LIKE ? OR description LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    const [videos] = await connection.query(`
      SELECT 
        id, title, description, share_url, cover_image_url,
        tiktok_view_count, tiktok_like_count, tiktok_comment_count, tiktok_share_count,
        tiktok_created_at, created_at
      FROM tiktok_videos 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit.toString()), parseInt(offset.toString())]);
    
    const [countResult] = await connection.query(`
      SELECT COUNT(*) as total 
      FROM tiktok_videos 
      ${whereClause}
    `, queryParams);
    
    await connection.end();
    
    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          total: countResult[0].total,
          limit: parseInt(limit.toString()),
          offset: parseInt(offset.toString())
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching admin videos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch videos',
      error: error.message
    });
  }
});

// Authentication required routes
router.use(authenticate);

// Video upload - Admin/Superadmin only
router.post('/upload', 
  requireRole(['admin', 'superadmin']), 
  upload.single('video'), 
  TikTokController.uploadVideo
);

// Check upload status - Admin/Superadmin only
router.get('/upload-status/:publish_id', 
  requireRole(['admin', 'superadmin']), 
  TikTokController.getUploadStatus
);

// Sync videos from TikTok account - Superadmin only
router.post('/sync-videos', 
  requireRole(['superadmin']), 
  TikTokController.syncVideos
);

// NOTE: Admin video management moved to public routes above

// NOTE: TikTok connection status moved to public routes above

// Disconnect TikTok account
router.delete('/disconnect', requireRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const mysql = require('mysql2/promise');
    const getDbConfig = () => ({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    const connection = await mysql.createConnection(getDbConfig());
    
    await connection.query(`
      UPDATE tiktok_tokens 
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `, [userId]);
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'TikTok account disconnected successfully'
    });
    
  } catch (error) {
    console.error('Error disconnecting TikTok account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect account',
      error: error.message
    });
  }
});

// TikTok analytics routes
router.get('/analytics', requireRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const { 
      start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date = new Date().toISOString().split('T')[0] 
    } = req.query;
    
    const mysql = require('mysql2/promise');
    const getDbConfig = () => ({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    const connection = await mysql.createConnection(getDbConfig());
    
    // Overall stats
    const [overallStats] = await connection.query(`
      SELECT 
        COUNT(*) as total_videos,
        SUM(tiktok_view_count) as total_tiktok_views,
        SUM(local_view_count) as total_local_views,
        SUM(tiktok_like_count) as total_likes,
        SUM(tiktok_share_count) as total_shares,
        SUM(tiktok_comment_count) as total_comments,
        AVG(CASE 
          WHEN tiktok_view_count > 0 THEN 
            ((tiktok_like_count + tiktok_share_count + tiktok_comment_count) / tiktok_view_count * 100)
          ELSE 0 
        END) as avg_engagement_rate
      FROM tiktok_videos 
      WHERE publish_status = 'published'
        AND created_at BETWEEN ? AND ?
    `, [start_date, end_date]);
    
    // Daily view trends
    const [dailyViews] = await connection.query(`
      SELECT 
        DATE(viewed_at) as date,
        COUNT(*) as views,
        COUNT(DISTINCT ip_address) as unique_viewers
      FROM tiktok_video_views
      WHERE viewed_at BETWEEN ? AND ?
      GROUP BY DATE(viewed_at)
      ORDER BY date
    `, [start_date, end_date]);
    
    // Top performing videos
    const [topVideos] = await connection.query(`
      SELECT 
        id, title, tiktok_video_id, tiktok_view_count, local_view_count,
        tiktok_like_count, tiktok_share_count, tiktok_comment_count,
        (tiktok_like_count + tiktok_share_count + tiktok_comment_count) as total_engagement
      FROM tiktok_videos 
      WHERE publish_status = 'published'
        AND created_at BETWEEN ? AND ?
      ORDER BY total_engagement DESC
      LIMIT 10
    `, [start_date, end_date]);
    
    await connection.end();
    
    res.json({
      success: true,
      data: {
        overview: overallStats[0],
        daily_trends: dailyViews,
        top_videos: topVideos,
        date_range: {
          start_date,
          end_date
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching TikTok analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 500MB.'
      });
    }
  }
  
  if (error.message === 'Only video files are allowed') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

module.exports = router;