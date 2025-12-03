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

// Webhook endpoint for TikTok events - Public (TikTok needs to access this)
router.post('/webhook', TikTokController.handleWebhook);

// Connection status - Public (needed for frontend to check if connected)
router.get('/connection-status', async (req, res) => {
  try {
    const mysql = require('mysql2/promise');
    
    const getDbConfig = () => ({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4'
    });

    const connection = await mysql.createConnection(getDbConfig());
    
    // Check for valid active token
    const [tokens] = await connection.query(`
      SELECT user_id, tiktok_username, tiktok_display_name, tiktok_avatar_url, 
             can_upload, can_read_profile, expires_at, last_used_at
      FROM tiktok_tokens 
      WHERE is_active = 1 AND expires_at > NOW() 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    await connection.end();
    
    if (tokens.length > 0) {
      const token = tokens[0];
      res.json({
        success: true,
        data: {
          connected: true,
          account: {
            tiktok_username: token.tiktok_username,
            tiktok_display_name: token.tiktok_display_name,
            tiktok_avatar_url: token.tiktok_avatar_url,
            can_upload: Boolean(token.can_upload),
            can_read_profile: Boolean(token.can_read_profile),
            is_valid: new Date(token.expires_at) > new Date(),
            expires_at: token.expires_at,
            last_used_at: token.last_used_at
          }
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          connected: false,
          message: 'No valid TikTok token found'
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

// Download and cache TikTok images locally (with fresh URL sync)
router.post('/cache-images', async (req, res) => {
  try {
    const mysql = require('mysql2/promise');
    const axios = require('axios');
    const fs = require('fs').promises;
    const path = require('path');
    
    const getDbConfig = () => ({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    const connection = await mysql.createConnection(getDbConfig());
    
    console.log('🔄 Step 1: Syncing with TikTok API to get fresh URLs...');
    
    // First, sync with TikTok API to get fresh URLs
    const [tokenRows] = await connection.query(`
      SELECT * FROM tiktok_tokens LIMIT 1 
      WHERE is_active = TRUE AND access_token IS NOT NULL
      AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC LIMIT 1
    `);
    
    if (tokenRows.length > 0) {
      const token = tokenRows[0];
      const TikTokController = require('../controllers/tiktokController');
      
      try {
        const freshVideos = await TikTokController.fetchUserVideos(token.access_token, 50);
        console.log(`📥 Fetched ${freshVideos.length} fresh videos from TikTok API`);
        
        // Update existing videos with fresh image URLs
        for (const freshVideo of freshVideos) {
          await connection.query(`
            UPDATE tiktok_videos 
            SET cover_image_url = ? 
            WHERE tiktok_video_id = ? AND cover_image_url != ?
          `, [freshVideo.cover_image_url, freshVideo.id, freshVideo.cover_image_url]);
        }
        
        console.log('✅ Updated image URLs with fresh data from TikTok API');
      } catch (apiError) {
        console.warn('⚠️ Could not sync with TikTok API:', apiError.message);
        console.log('📦 Proceeding with existing URLs...');
      }
    } else {
      console.warn('⚠️ No active TikTok token found, using existing URLs');
    }
    
    // Create tiktok cache directory if it doesn't exist (in project root public)
    const cacheDir = path.join(__dirname, '../../../public/uploads/tiktok-cache');
    try {
      await fs.mkdir(cacheDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
    
    console.log('📦 Step 2: Caching images locally...');
    
    // Get TikTok videos with external CDN images (prioritize non-expired ones)
    const [videos] = await connection.query(`
      SELECT id, tiktok_video_id, cover_image_url, title, tiktok_created_at
      FROM tiktok_videos 
      WHERE cover_image_url LIKE 'https://p16-sign%'
      AND cover_image_url NOT LIKE '%benarmak.naramakna.id%'
      ORDER BY tiktok_created_at DESC
      LIMIT 20
    `);
    
    console.log(`📥 Found ${videos.length} TikTok videos with external images to cache`);
    
    let cachedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    for (const video of videos) {
      try {
        const imageUrl = video.cover_image_url;
        if (!imageUrl || !imageUrl.startsWith('http')) {
          skippedCount++;
          continue;
        }
        
        // Check if URL appears to be expired
        const isLikelyExpired = imageUrl.includes('x-expires=') && (() => {
          try {
            const match = imageUrl.match(/x-expires=([0-9]+)/);
            if (match) {
              const expires = parseInt(match[1]);
              return expires < Date.now() / 1000;
            }
          } catch (e) {}
          return false;
        })();
        
        if (isLikelyExpired) {
          console.log(`⏭️ Skipping expired URL for: ${video.title?.substring(0, 50) || video.tiktok_video_id}`);
          skippedCount++;
          continue;
        }
        
        // Generate local filename
        const ext = '.jpg'; // TikTok covers are usually JPEG
        const filename = `tiktok-${video.tiktok_video_id}-${Date.now()}${ext}`;
        const localPath = path.join(cacheDir, filename);
        const publicUrl = `${process.env.UPLOADS_URL || 'https://api.naramakna.id/uploads'}/tiktok-cache/${filename}`;
        
        // Download image with timeout
        console.log(`📥 Downloading: ${video.title?.substring(0, 50) || video.tiktok_video_id}`);
        
        const response = await axios({
          method: 'GET',
          url: imageUrl,
          responseType: 'stream',
          timeout: 15000, // 15 second timeout
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (response.status !== 200) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        // Save to local file
        const writer = require('fs').createWriteStream(localPath);
        response.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
        
        // Verify file was created and has content
        const stats = await fs.stat(localPath);
        if (stats.size < 1000) { // Less than 1KB is probably an error
          throw new Error('Downloaded file too small');
        }
        
        // Update database with local URL
        await connection.query(
          'UPDATE tiktok_videos SET cover_image_url = ? WHERE id = ?',
          [publicUrl, video.id]
        );
        
        cachedCount++;
        console.log(`✅ Cached: ${filename} (${Math.round(stats.size/1024)}KB)`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error caching image for ${video.tiktok_video_id}:`, error.message);
      }
    }
    
    await connection.end();
    
    const message = cachedCount > 0 
      ? `Successfully cached ${cachedCount} TikTok images locally`
      : skippedCount > 0 
      ? `No fresh URLs available to cache. Try syncing with TikTok API first.`
      : `No external images found to cache`;
    
    res.json({
      success: true,
      message,
      data: {
        cached: cachedCount,
        errors: errorCount,
        skipped: skippedCount,
        total: videos.length
      }
    });
    
  } catch (error) {
    console.error('Error caching TikTok images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cache TikTok images',
      error: error.message
    });
  }
});

// Refresh TikTok images - Public for admin use  
router.post('/refresh-images', async (req, res) => {
  try {
    const mysql = require('mysql2/promise');
    const getDbConfig = () => ({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    const connection = await mysql.createConnection(getDbConfig());
    
    // Get latest valid TikTok token
    const [tokenRows] = await connection.query(`
      SELECT * FROM tiktok_tokens LIMIT 1 
      WHERE is_active = TRUE AND access_token IS NOT NULL
      AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC LIMIT 1
    `);
    
    if (tokenRows.length === 0) {
      await connection.end();
      return res.json({
        success: false,
        message: 'No valid TikTok token found. Please reconnect TikTok account.',
        data: { refreshed: 0, total: 0 }
      });
    }
    
    const token = tokenRows[0];
    console.log('🔄 Refreshing TikTok images with token for user:', token.tiktok_username);
    
    // Get all TikTok videos that need image refresh
    const [videos] = await connection.query(`
      SELECT id, tiktok_video_id, cover_image_url, title
      FROM tiktok_videos 
      WHERE cover_image_url IS NOT NULL 
      ORDER BY tiktok_created_at DESC
    `);
    
    console.log(`🖼️ Found ${videos.length} TikTok videos to refresh images`);
    
    // Fetch fresh video data from TikTok API
    const TikTokController = require('../controllers/tiktokController');
    const freshVideos = await TikTokController.fetchUserVideos(token.access_token, 50);
    
    let refreshedCount = 0;
    
    for (const localVideo of videos) {
      try {
        // Find matching fresh video data
        const freshVideo = freshVideos.find(fv => fv.id === localVideo.tiktok_video_id);
        
        if (freshVideo && freshVideo.cover_image_url) {
          // Update with fresh cover image URL
          await connection.query(
            'UPDATE tiktok_videos SET cover_image_url = ? WHERE id = ?',
            [freshVideo.cover_image_url, localVideo.id]
          );
          
          refreshedCount++;
          console.log(`✅ Refreshed image for: ${localVideo.title || localVideo.tiktok_video_id}`);
        }
      } catch (error) {
        console.error(`❌ Error refreshing image for video ${localVideo.tiktok_video_id}:`, error.message);
      }
    }
    
    await connection.end();
    
    res.json({
      success: true,
      message: `Refreshed ${refreshedCount} TikTok images`,
      data: {
        refreshed: refreshedCount,
        total: videos.length,
        fresh_videos_fetched: freshVideos.length
      }
    });
    
  } catch (error) {
    console.error('Error refreshing TikTok images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh TikTok images',
      error: error.message
    });
  }
});

// Auto-sync videos - Public for testing (will sync if token available)
router.post('/auto-sync', async (req, res) => {
  try {
    const { limit = 50 } = req.body;
    
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
      SELECT * FROM tiktok_tokens LIMIT 1 
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
    const { limit = 1000, offset = 0, status, search } = req.query;
    
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