const { google } = require('googleapis');
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');

class YouTubeController {
  constructor() {
    this.youtube = google.youtube('v3');
    this.analytics = google.youtubeAnalytics('v2');
    
    // Check if YouTube credentials are properly configured
    this.isConfigured = this.checkConfiguration();
    
    if (this.isConfigured) {
      this.oauth2Client = new google.auth.OAuth2(
        process.env.YOUTUBE_CLIENT_ID,
        process.env.YOUTUBE_CLIENT_SECRET,
        process.env.YOUTUBE_REDIRECT_URI
      );
      this.apiKey = process.env.YOUTUBE_API_KEY;
    }
  }

  checkConfiguration() {
    const requiredVars = [
      'YOUTUBE_CLIENT_ID',
      'YOUTUBE_CLIENT_SECRET', 
      'YOUTUBE_REDIRECT_URI',
      'YOUTUBE_API_KEY'
    ];
    
    for (const varName of requiredVars) {
      const value = process.env[varName];
      if (!value || value.includes('your_youtube_') || value.includes('_here')) {
        console.warn(`⚠️  YouTube ${varName} not properly configured`);
        return false;
      }
    }
    return true;
  }

  // Get database connection
  async getConnection() {
    return mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4'
    });
  }

  // Test endpoint
  async test(req, res) {
    res.json({
      success: true,
      message: 'YouTube routes working',
      timestamp: new Date().toISOString()
    });
  }

  // Test YouTube API with sample search
  async testYouTubeAPI(req, res) {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          success: false,
          error: 'YouTube API key not configured'
        });
      }

      // Create fresh YouTube instance
      const youtube = google.youtube('v3');

      // Test search for news videos
      const searchResponse = await youtube.search.list({
        key: apiKey,
        part: ['snippet'],
        q: 'indonesia news today',
        type: 'video',
        maxResults: 5,
        order: 'relevance',
        publishedAfter: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Last 24 hours
      });

      const videos = searchResponse.data.items || [];
      
      res.json({
        success: true,
        message: 'YouTube API test successful',
        data: {
          total_results: videos.length,
          videos: videos.map(video => ({
            id: video.id.videoId,
            title: video.snippet.title,
            channel: video.snippet.channelTitle,
            published: video.snippet.publishedAt,
            thumbnail: video.snippet.thumbnails?.medium?.url
          }))
        }
      });
    } catch (error) {
      console.error('YouTube API test error:', error);
      res.status(500).json({
        success: false,
        error: 'YouTube API test failed',
        details: error.message
      });
    }
  }

  // Get YouTube OAuth authorization URL
  async getAuthUrl(req, res) {
    try {
      // Check if YouTube is properly configured
      if (!this.isConfigured) {
        return res.status(503).json({
          success: false,
          error: 'YouTube integration not configured',
          details: 'YouTube API credentials are missing or invalid. Please contact administrator.',
          code: 'YOUTUBE_NOT_CONFIGURED'
        });
      }

      const scopes = [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/yt-analytics.readonly'
      ];

      const authUrl = this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
      });

      res.json({
        success: true,
        data: { auth_url: authUrl }
      });
    } catch (error) {
      console.error('YouTube auth URL error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate authorization URL',
        details: error.message || 'Unknown error occurred',
        code: 'AUTH_URL_GENERATION_FAILED'
      });
    }
  }

  // Handle OAuth callback
  async handleCallback(req, res) {
    try {
      const { code, state } = req.query;
      
      if (!code) {
        return res.status(400).json({
          success: false,
          error: 'Authorization code not provided'
        });
      }

      // Exchange code for tokens
      const { tokens } = await this.oauth2Client.getAccessToken(code);
      this.oauth2Client.setCredentials(tokens);

      // Get channel information
      const channelResponse = await this.youtube.channels.list({
        auth: this.oauth2Client,
        part: ['snippet', 'statistics'],
        mine: true
      });

      if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No YouTube channel found for this account'
        });
      }

      const channel = channelResponse.data.items[0];
      const channelId = channel.id;
      const channelInfo = channel.snippet;
      const channelStats = channel.statistics;

      // Save tokens to database
      const connection = await this.getConnection();
      
      const userId = req.user?.id; // From auth middleware
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      await connection.execute(`
        INSERT INTO youtube_tokens (
          user_id, access_token, refresh_token, token_type, expires_at, scope,
          channel_id, channel_title, channel_description, channel_thumbnail,
          subscriber_count, video_count, view_count, last_used_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          access_token = VALUES(access_token),
          refresh_token = COALESCE(VALUES(refresh_token), refresh_token),
          expires_at = VALUES(expires_at),
          scope = VALUES(scope),
          channel_title = VALUES(channel_title),
          channel_description = VALUES(channel_description),
          channel_thumbnail = VALUES(channel_thumbnail),
          subscriber_count = VALUES(subscriber_count),
          video_count = VALUES(video_count),
          view_count = VALUES(view_count),
          last_used_at = NOW(),
          updated_at = NOW()
      `, [
        userId,
        tokens.access_token,
        tokens.refresh_token,
        tokens.token_type || 'Bearer',
        tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        tokens.scope,
        channelId,
        channelInfo.title,
        channelInfo.description,
        channelInfo.thumbnails?.default?.url,
        parseInt(channelStats.subscriberCount || 0),
        parseInt(channelStats.videoCount || 0),
        parseInt(channelStats.viewCount || 0)
      ]);

      await connection.end();

      // Redirect to success page or close popup
      res.send(`
        <html>
          <body>
            <script>
              window.opener?.postMessage({ type: 'YOUTUBE_AUTH_SUCCESS' }, '*');
              window.close();
            </script>
            <p>YouTube account connected successfully! You can close this window.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('YouTube callback error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to complete authorization'
      });
    }
  }

  // Get connection status
  async getConnectionStatus(req, res) {
    try {
      // Check if YouTube is properly configured first
      if (!this.isConfigured) {
        return res.json({
          success: true,
          data: { 
            connected: false,
            error: 'YouTube integration not configured',
            details: 'YouTube API credentials are missing or invalid. Please contact administrator.',
            code: 'YOUTUBE_NOT_CONFIGURED'
          }
        });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.json({
          success: true,
          data: { connected: false }
        });
      }

      const connection = await this.getConnection();
      
      const [rows] = await connection.execute(`
        SELECT * FROM youtube_tokens 
        WHERE user_id = ? AND is_active = TRUE 
        ORDER BY updated_at DESC LIMIT 1
      `, [userId]);

      await connection.end();

      if (rows.length === 0) {
        return res.json({
          success: true,
          data: { connected: false }
        });
      }

      const token = rows[0];
      const isExpired = token.expires_at && new Date(token.expires_at) < new Date();

      res.json({
        success: true,
        data: {
          connected: true,
          channel: {
            id: token.channel_id,
            title: token.channel_title,
            description: token.channel_description,
            thumbnail_url: token.channel_thumbnail,
            subscriber_count: token.subscriber_count,
            video_count: token.video_count,
            view_count: token.view_count
          },
          access_token: {
            expires_at: token.expires_at,
            scope: token.scope ? token.scope.split(' ') : [],
            last_used_at: token.last_used_at,
            is_expired: isExpired
          }
        }
      });
    } catch (error) {
      console.error('YouTube status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get connection status'
      });
    }
  }

  // Disconnect YouTube account
  async disconnect(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const connection = await this.getConnection();
      
      await connection.execute(`
        UPDATE youtube_tokens 
        SET is_active = FALSE, updated_at = NOW()
        WHERE user_id = ?
      `, [userId]);

      await connection.end();

      res.json({
        success: true,
        message: 'YouTube account disconnected successfully'
      });
    } catch (error) {
      console.error('YouTube disconnect error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to disconnect YouTube account'
      });
    }
  }

  // Upload video to YouTube (placeholder - will implement file upload)
  async uploadVideo(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // For now, return placeholder response
      res.json({
        success: true,
        message: 'YouTube upload endpoint ready - file upload implementation needed',
        data: {
          video_id: 'temp_id',
          status: 'pending'
        }
      });
    } catch (error) {
      console.error('YouTube upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload video'
      });
    }
  }

  // Sync videos from YouTube channel
  async syncVideos(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const { channel_id, max_results = 50, published_after, sync_type = 'latest' } = req.body;

      // Get user's YouTube tokens
      const connection = await this.getConnection();
      
      const [tokenRows] = await connection.execute(`
        SELECT * FROM youtube_tokens 
        WHERE user_id = ? AND is_active = TRUE 
        ORDER BY updated_at DESC LIMIT 1
      `, [userId]);

      if (tokenRows.length === 0) {
        await connection.end();
        return res.status(400).json({
          success: false,
          error: 'YouTube account not connected'
        });
      }

      const userToken = tokenRows[0];
      
      // Set up OAuth client with user's tokens
      this.oauth2Client.setCredentials({
        access_token: userToken.access_token,
        refresh_token: userToken.refresh_token
      });

      // Fetch videos from YouTube
      const searchParams = {
        auth: this.oauth2Client,
        part: ['snippet'],
        channelId: channel_id || userToken.channel_id,
        maxResults: Math.min(max_results, 50),
        order: 'date',
        type: 'video'
      };

      if (published_after) {
        searchParams.publishedAfter = new Date(published_after).toISOString();
      }

      const searchResponse = await this.youtube.search.list(searchParams);
      const videos = searchResponse.data.items || [];

      let syncedCount = 0;
      let totalFound = videos.length;

      // Process each video
      for (const video of videos) {
        try {
          const videoId = video.id.videoId;
          
          // Get detailed video information
          const videoResponse = await this.youtube.videos.list({
            auth: this.oauth2Client,
            part: ['snippet', 'statistics', 'status', 'contentDetails'],
            id: [videoId]
          });

          if (videoResponse.data.items && videoResponse.data.items.length > 0) {
            const videoData = videoResponse.data.items[0];
            const snippet = videoData.snippet;
            const statistics = videoData.statistics;
            const status = videoData.status;
            const contentDetails = videoData.contentDetails;

            // Parse duration (PT4M13S format)
            let duration = 0;
            if (contentDetails.duration) {
              const match = contentDetails.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
              if (match) {
                const hours = parseInt(match[1] || 0);
                const minutes = parseInt(match[2] || 0);
                const seconds = parseInt(match[3] || 0);
                duration = hours * 3600 + minutes * 60 + seconds;
              }
            }

            // Insert or update video in database
            await connection.execute(`
              INSERT INTO youtube_videos (
                user_id, youtube_video_id, youtube_channel_id, youtube_channel_name,
                title, description, duration, thumbnail_url, watch_url, embed_url,
                youtube_view_count, youtube_like_count, youtube_comment_count,
                tags, category_id, privacy_status, source, upload_status,
                youtube_published_at, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
              ON DUPLICATE KEY UPDATE
                title = VALUES(title),
                description = VALUES(description),
                duration = VALUES(duration),
                thumbnail_url = VALUES(thumbnail_url),
                youtube_view_count = VALUES(youtube_view_count),
                youtube_like_count = VALUES(youtube_like_count),
                youtube_comment_count = VALUES(youtube_comment_count),
                tags = VALUES(tags),
                updated_at = NOW()
            `, [
              userId,
              videoId,
              snippet.channelId,
              snippet.channelTitle,
              snippet.title,
              snippet.description,
              duration,
              snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
              `https://www.youtube.com/watch?v=${videoId}`,
              `https://www.youtube.com/embed/${videoId}`,
              parseInt(statistics.viewCount || 0),
              parseInt(statistics.likeCount || 0),
              parseInt(statistics.commentCount || 0),
              snippet.tags ? JSON.stringify(snippet.tags) : null,
              snippet.categoryId,
              status.privacyStatus,
              'synced',
              'published',
              new Date(snippet.publishedAt)
            ]);

            syncedCount++;
          }
        } catch (videoError) {
          console.error(`Error syncing video ${video.id.videoId}:`, videoError);
        }
      }

      await connection.end();

      res.json({
        success: true,
        message: `Successfully synced ${syncedCount} out of ${totalFound} videos`,
        data: {
          synced_videos: syncedCount,
          total_found: totalFound,
          status: syncedCount === totalFound ? 'completed' : 'partial'
        }
      });
    } catch (error) {
      console.error('YouTube sync error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to sync videos from YouTube'
      });
    }
  }

  // Get YouTube videos (admin)
  async getVideos(req, res) {
    try {
      const { page = 1, limit = 12, search, status, source } = req.query;
      const offset = (page - 1) * limit;

      const connection = await this.getConnection();
      
      let whereConditions = [];
      let queryParams = [];

      if (search) {
        whereConditions.push('(title LIKE ? OR description LIKE ?)');
        queryParams.push(`%${search}%`, `%${search}%`);
      }

      if (status) {
        whereConditions.push('upload_status = ?');
        queryParams.push(status);
      }

      if (source) {
        whereConditions.push('source = ?');
        queryParams.push(source);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Get total count
      const [countRows] = await connection.execute(`
        SELECT COUNT(*) as total FROM youtube_videos_with_stats ${whereClause}
      `, queryParams);

      const total = countRows[0].total;

      // Get videos
      const [videoRows] = await connection.execute(`
        SELECT * FROM youtube_videos_with_stats 
        ${whereClause}
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `, [...queryParams, parseInt(limit), parseInt(offset)]);

      await connection.end();

      res.json({
        success: true,
        data: {
          videos: videoRows,
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          has_more: (offset + videoRows.length) < total
        }
      });
    } catch (error) {
      console.error('YouTube get videos error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch YouTube videos'
      });
    }
  }

  // Get public YouTube videos
  async getPublicVideos(req, res) {
    try {
      const { limit = 12, offset = 0, category } = req.query;

      const connection = await this.getConnection();
      
      let whereConditions = ['upload_status = "published"', 'privacy_status = "public"'];
      let queryParams = [];

      if (category) {
        whereConditions.push('category_id = ?');
        queryParams.push(category);
      }

      const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

      // Get total count
      const [countRows] = await connection.execute(`
        SELECT COUNT(*) as total FROM youtube_videos_with_stats ${whereClause}
      `, queryParams);

      const total = countRows[0].total;

      // Get videos
      const [videoRows] = await connection.execute(`
        SELECT * FROM youtube_videos_with_stats 
        ${whereClause}
        ORDER BY youtube_published_at DESC 
        LIMIT ? OFFSET ?
      `, [...queryParams, parseInt(limit), parseInt(offset)]);

      await connection.end();

      res.json({
        success: true,
        data: {
          videos: videoRows,
          total,
          has_more: (parseInt(offset) + videoRows.length) < total
        }
      });
    } catch (error) {
      console.error('YouTube get public videos error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch public YouTube videos'
      });
    }
  }

  // Get YouTube analytics (placeholder)
  async getAnalytics(req, res) {
    try {
      // Placeholder analytics response
      res.json({
        success: true,
        message: 'YouTube analytics endpoint ready - implementation needed',
        data: {
          overview: {
            total_videos: 0,
            total_youtube_views: 0,
            total_local_views: 0,
            total_likes: 0,
            total_comments: 0,
            total_subscribers: 0,
            avg_engagement_rate: 0
          },
          daily_trends: [],
          top_videos: [],
          channel_stats: {
            subscriber_growth: 0,
            average_view_duration: 0,
            click_through_rate: 0
          }
        }
      });
    } catch (error) {
      console.error('YouTube analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch YouTube analytics'
      });
    }
  }

  // Track video view
  async trackView(req, res) {
    try {
      const { videoId } = req.params;
      const { user_id, duration_watched = 0 } = req.body;
      
      const ip_address = req.ip || req.connection.remoteAddress;
      const user_agent = req.get('User-Agent');
      const referrer = req.get('Referer');

      const connection = await this.getConnection();
      
      // Get video duration for percentage calculation
      const [videoRows] = await connection.execute(`
        SELECT duration FROM youtube_videos WHERE id = ?
      `, [videoId]);

      if (videoRows.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          error: 'Video not found'
        });
      }

      const videoDuration = videoRows[0].duration || 1;
      const watchPercentage = Math.min((duration_watched / videoDuration) * 100, 100);

      // Insert view record
      await connection.execute(`
        INSERT INTO youtube_video_views (
          video_id, user_id, ip_address, user_agent, referrer,
          duration_watched, watch_percentage, view_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())
      `, [videoId, user_id, ip_address, user_agent, referrer, duration_watched, watchPercentage]);

      // Update local view count
      await connection.execute(`
        UPDATE youtube_videos 
        SET local_view_count = local_view_count + 1 
        WHERE id = ?
      `, [videoId]);

      await connection.end();

      res.json({
        success: true,
        message: 'View tracked successfully'
      });
    } catch (error) {
      console.error('YouTube track view error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to track video view'
      });
    }
  }
}

module.exports = new YouTubeController();
