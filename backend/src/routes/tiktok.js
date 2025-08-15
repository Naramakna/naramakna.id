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

// Authentication required routes
router.use(authenticate);

// OAuth routes - Admin/Superadmin only
router.get('/auth-url', requireRole(['admin', 'superadmin']), TikTokController.getAuthUrl);
router.get('/callback', requireRole(['admin', 'superadmin']), TikTokController.handleCallback);

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

// Admin video management routes
router.get('/admin/videos', requireRole(['admin', 'superadmin']), async (req, res) => {
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
    
    let whereClause = "WHERE 1=1";
    let params = [];
    
    if (status) {
      whereClause += " AND tv.publish_status = ?";
      params.push(status);
    }
    
    if (search) {
      whereClause += " AND (tv.title LIKE ? OR tv.description LIKE ? OR tv.tiktok_username LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    params.push(parseInt(limit), parseInt(offset));
    
    const [videos] = await connection.query(`
      SELECT 
        tv.*,
        u.username as uploaded_by_username,
        (tv.tiktok_like_count + tv.tiktok_share_count + tv.tiktok_comment_count) as total_engagement,
        CASE 
          WHEN tv.tiktok_view_count > 0 THEN 
            ((tv.tiktok_like_count + tv.tiktok_share_count + tv.tiktok_comment_count) / tv.tiktok_view_count * 100)
          ELSE 0 
        END as engagement_rate,
        (SELECT COUNT(*) FROM tiktok_video_views tvv 
         WHERE tvv.video_id = tv.id AND tvv.viewed_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as views_last_24h
      FROM tiktok_videos tv
      LEFT JOIN users u ON tv.uploaded_by = u.ID
      ${whereClause}
      ORDER BY tv.created_at DESC
      LIMIT ? OFFSET ?
    `, params);
    
    // Get total count
    const [countResult] = await connection.query(`
      SELECT COUNT(*) as total
      FROM tiktok_videos tv
      LEFT JOIN users u ON tv.uploaded_by = u.ID
      ${whereClause.replace('LIMIT ? OFFSET ?', '')}
    `, params.slice(0, -2));
    
    await connection.end();
    
    res.json({
      success: true,
      data: {
        videos: videos,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: countResult[0].total
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

// Get TikTok connection status
router.get('/connection-status', requireRole(['admin', 'superadmin']), async (req, res) => {
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
    
    const [tokens] = await connection.query(`
      SELECT 
        tiktok_username, tiktok_display_name, tiktok_avatar_url,
        can_upload, can_read_profile, expires_at, last_used_at,
        CASE 
          WHEN expires_at IS NULL OR expires_at > NOW() THEN TRUE 
          ELSE FALSE 
        END as is_valid
      FROM tiktok_tokens 
      WHERE user_id = ? AND is_active = TRUE
      ORDER BY created_at DESC LIMIT 1
    `, [userId]);
    
    await connection.end();
    
    if (tokens.length > 0) {
      res.json({
        success: true,
        data: {
          connected: true,
          account: tokens[0]
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          connected: false
        }
      });
    }
    
  } catch (error) {
    console.error('Error checking TikTok connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check connection status',
      error: error.message
    });
  }
});

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