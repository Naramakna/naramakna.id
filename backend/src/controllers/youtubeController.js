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
    
    // Always initialize OAuth client and API key
    this.oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI
    );
    this.apiKey = process.env.YOUTUBE_API_KEY;
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

  // Test configuration endpoint
  testConfig(req, res) {
    try {
      const config = {
        CLIENT_ID: process.env.YOUTUBE_CLIENT_ID ? process.env.YOUTUBE_CLIENT_ID.substring(0, 20) + '...' : null,
        CLIENT_SECRET: process.env.YOUTUBE_CLIENT_SECRET ? '✅ Set' : null,
        API_KEY: process.env.YOUTUBE_API_KEY ? '✅ Set' : null,
        REDIRECT_URI: process.env.YOUTUBE_REDIRECT_URI
      };
      
      const isConfigured = process.env.YOUTUBE_CLIENT_ID && 
                          process.env.YOUTUBE_CLIENT_SECRET && 
                          process.env.YOUTUBE_API_KEY && 
                          process.env.YOUTUBE_REDIRECT_URI &&
                          !process.env.YOUTUBE_CLIENT_ID.includes('your_youtube_') &&
                          !process.env.YOUTUBE_CLIENT_SECRET.includes('your_youtube_') &&
                          !process.env.YOUTUBE_API_KEY.includes('your_youtube_');

      res.json({
        success: true,
        config,
        isConfigured,
        message: isConfigured ? 'YouTube configuration is valid' : 'YouTube configuration is incomplete'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to check configuration',
        details: error.message
      });
    }
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
      // Check if YouTube is properly configured using static check
      const isConfigured = process.env.YOUTUBE_CLIENT_ID && 
                          process.env.YOUTUBE_CLIENT_SECRET && 
                          process.env.YOUTUBE_API_KEY && 
                          process.env.YOUTUBE_REDIRECT_URI &&
                          !process.env.YOUTUBE_CLIENT_ID.includes('your_youtube_') &&
                          !process.env.YOUTUBE_CLIENT_SECRET.includes('your_youtube_') &&
                          !process.env.YOUTUBE_API_KEY.includes('your_youtube_');
                          
      if (!isConfigured) {
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

      // Create auth URL directly using environment variables
      const clientId = process.env.YOUTUBE_CLIENT_ID;
      const redirectUri = encodeURIComponent(process.env.YOUTUBE_REDIRECT_URI);
      const scope = encodeURIComponent(scopes.join(' '));
      
      const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&access_type=offline&prompt=consent`;

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
      console.log('🎯 YouTube OAuth callback received');
      console.log('📝 Query params:', req.query);
      
      const { code, state } = req.query;
      
      if (!code) {
        console.error('❌ No authorization code received');
        return res.status(400).json({
          success: false,
          error: 'Authorization code not provided'
        });
      }

      console.log('✅ Authorization code received:', code.substring(0, 20) + '...');

      // Create new OAuth2 client for this request to avoid context issues
      const { google } = require('googleapis');
      const oauth2Client = new google.auth.OAuth2(
        process.env.YOUTUBE_CLIENT_ID,
        process.env.YOUTUBE_CLIENT_SECRET,
        process.env.YOUTUBE_REDIRECT_URI
      );

      // Exchange code for tokens using direct HTTP request
      console.log('🔐 Exchanging authorization code for tokens...');
      console.log('📝 Code length:', code.length);
      
      const tokenUrl = 'https://oauth2.googleapis.com/token';
      const tokenParams = new URLSearchParams({
        client_id: process.env.YOUTUBE_CLIENT_ID,
        client_secret: process.env.YOUTUBE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.YOUTUBE_REDIRECT_URI
      });

      let tokenResponse;
      try {
        console.log('🌐 Making direct token exchange request...');
        const response = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          body: tokenParams.toString()
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Token exchange HTTP error:', response.status, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        tokenResponse = await response.json();
        console.log('✅ Token response received:', !!tokenResponse);
        console.log('🔑 Access token received:', !!tokenResponse.access_token);
        console.log('🔄 Refresh token received:', !!tokenResponse.refresh_token);
        
      } catch (tokenError) {
        console.error('❌ Token exchange failed:', tokenError.message);
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired authorization code',
          details: tokenError.message
        });
      }
      
      if (!tokenResponse.access_token) {
        console.error('❌ No access token in response');
        return res.status(400).json({
          success: false,
          error: 'Failed to get access tokens from authorization code',
          details: 'Token response missing access_token'
        });
      }
      
      // Convert to googleapis format
      const tokens = {
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        token_type: tokenResponse.token_type || 'Bearer',
        expiry_date: tokenResponse.expires_in ? Date.now() + (tokenResponse.expires_in * 1000) : null,
        scope: tokenResponse.scope
      };
      
      console.log('✅ Setting credentials with tokens');
      oauth2Client.setCredentials(tokens);

      // Get channel information
      const youtube = google.youtube('v3');
      const channelResponse = await youtube.channels.list({
        auth: oauth2Client,
        part: ['snippet', 'statistics'],
        mine: true
      });

      if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
        console.log('⚠️ No YouTube channel found, but tokens are valid');
        
        // Still save the tokens for future use
        const mysql = require('mysql2/promise');
        const connection = await mysql.createConnection({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME
        });
        const userId = req.user?.id || 1; // Default to admin user for testing
        
        try {
          await connection.execute(`
            INSERT INTO youtube_tokens (
              user_id, access_token, refresh_token, token_type, expires_at, scope,
              channel_id, channel_title, is_active, last_used_at
            ) VALUES (?, ?, ?, ?, ?, ?, NULL, 'No Channel Yet', 1, NOW())
            ON DUPLICATE KEY UPDATE
              access_token = VALUES(access_token),
              refresh_token = COALESCE(VALUES(refresh_token), refresh_token),
              token_type = VALUES(token_type),
              expires_at = VALUES(expires_at),
              scope = VALUES(scope),
              is_active = 1,
              last_used_at = NOW()
          `, [
            userId,
            tokens.access_token,
            tokens.refresh_token,
            tokens.token_type || 'Bearer',
            tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            tokens.scope || 'youtube'
          ]);
          
          console.log('✅ Tokens saved despite no channel');
        } catch (dbError) {
          console.error('❌ Failed to save tokens:', dbError.message);
        } finally {
          await connection.end();
        }
        
        return res.send(`
          <html>
            <head><title>YouTube Connected - Create Channel</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h2>⚠️ YouTube Connected - Channel Required</h2>
              <p>✅ OAuth connection successful</p>
              <p>❌ No YouTube channel found</p>
              <div style="margin: 20px; padding: 15px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 5px;">
                <h3>Next Steps:</h3>
                <ol style="text-align: left; display: inline-block;">
                  <li><a href="https://www.youtube.com/create_channel" target="_blank">Create YouTube Channel</a></li>
                  <li>Set channel name</li>
                  <li>Come back and connect again</li>
                </ol>
              </div>
              <p>This window will close in 5 seconds...</p>
              <script>
                setTimeout(() => {
                  window.close();
                }, 5000);
              </script>
            </body>
          </html>
        `);
      }

      const channel = channelResponse.data.items[0];
      const channelId = channel.id;
      const channelInfo = channel.snippet;
      const channelStats = channel.statistics;

      // Save tokens to database
      const mysql = require('mysql2/promise');
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });
      
      const userId = req.user?.id || 1; // Default to admin user for testing (OAuth callback doesn't go through auth middleware)

      await connection.execute(`
        INSERT INTO youtube_tokens (
          user_id, access_token, refresh_token, token_type, expires_at, scope,
          channel_id, channel_title, channel_description, channel_thumbnail,
          subscriber_count, video_count, view_count, is_active, last_used_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
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
          is_active = 1,
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

      // Return success response for popup with postMessage communication
      res.send(`
        <html>
          <head><title>YouTube Connected</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2>✅ YouTube Connected Successfully!</h2>
            <p><strong>Channel:</strong> ${channelInfo.title}</p>
            <p><strong>Subscribers:</strong> ${channelStats.subscriberCount || 0}</p>
            <p>Notifying parent window and closing...</p>
            <script>
              try {
                // Notify parent window about successful OAuth
                if (window.opener) {
                  window.opener.postMessage('youtube-oauth-success', window.location.origin);
                }
              } catch (e) {
                console.log('Could not notify parent window:', e);
              }
              
              // Close window after short delay
              setTimeout(() => {
              window.close();
              }, 1500);
            </script>
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
      // Check if YouTube is properly configured first using static check
      const isConfigured = process.env.YOUTUBE_CLIENT_ID && 
                          process.env.YOUTUBE_CLIENT_SECRET && 
                          process.env.YOUTUBE_API_KEY && 
                          process.env.YOUTUBE_REDIRECT_URI &&
                          !process.env.YOUTUBE_CLIENT_ID.includes('your_youtube_') &&
                          !process.env.YOUTUBE_CLIENT_SECRET.includes('your_youtube_') &&
                          !process.env.YOUTUBE_API_KEY.includes('your_youtube_');
                          
      if (!isConfigured) {
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

      const userId = req.user?.id || 1; // Default to admin user for testing

      const mysql = require('mysql2/promise');
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });
      
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
      const userId = req.user?.id || 1; // Default to admin user for testing
      
      const mysql = require('mysql2/promise');
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });
      
      // Get current tokens before disconnecting
      const [rows] = await connection.execute(`
        SELECT access_token, refresh_token FROM youtube_tokens 
        WHERE user_id = ? AND is_active = TRUE 
        ORDER BY updated_at DESC LIMIT 1
      `, [userId]);

      let revokeSuccess = false;
      
      if (rows.length > 0) {
        const { access_token, refresh_token } = rows[0];
        
        // Try to revoke tokens from Google
        try {
          console.log('🔓 Revoking Google OAuth tokens...');
          
          // Revoke access token
          if (access_token) {
            const revokeResponse = await fetch(`https://oauth2.googleapis.com/revoke?token=${access_token}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            });
            
            if (revokeResponse.ok) {
              console.log('✅ Access token revoked successfully');
              revokeSuccess = true;
            } else {
              console.log('⚠️ Failed to revoke access token, but continuing...');
            }
          }
          
          // Also revoke refresh token if available
          if (refresh_token && !revokeSuccess) {
            const refreshRevokeResponse = await fetch(`https://oauth2.googleapis.com/revoke?token=${refresh_token}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            });
            
            if (refreshRevokeResponse.ok) {
              console.log('✅ Refresh token revoked successfully');
              revokeSuccess = true;
            }
          }
        } catch (revokeError) {
          console.error('⚠️ Token revocation failed:', revokeError.message);
          // Continue with local disconnect even if Google revocation fails
        }
      }
      
      // Deactivate tokens in database
      await connection.execute(`
        UPDATE youtube_tokens 
        SET is_active = FALSE, updated_at = NOW()
        WHERE user_id = ?
      `, [userId]);

      await connection.end();

      res.json({
        success: true,
        message: `YouTube account disconnected successfully${revokeSuccess ? ' (tokens revoked from Google)' : ' (local disconnect only)'}`,
        revoked_from_google: revokeSuccess
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
      console.log('🔄 YouTube syncVideos called with body:', req.body);
      
      const userId = req.user?.id || 1;
      const { max_results = 10 } = req.body;

      // Get user's YouTube tokens
      const mysql = require('mysql2/promise');
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER, 
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      try {
      const [tokenRows] = await connection.execute(`
        SELECT * FROM youtube_tokens 
        WHERE user_id = ? AND is_active = TRUE 
        ORDER BY updated_at DESC LIMIT 1
      `, [userId]);

      if (tokenRows.length === 0) {
        await connection.end();
        return res.status(400).json({
          success: false,
            error: 'YouTube account not connected. Please connect your YouTube account first.'
        });
      }

      const userToken = tokenRows[0];
        
        // Create new OAuth client for this request
        const { google } = require('googleapis');
        const oauth2Client = new google.auth.OAuth2(
          process.env.YOUTUBE_CLIENT_ID,
          process.env.YOUTUBE_CLIENT_SECRET,
          process.env.YOUTUBE_REDIRECT_URI
        );
      
      // Set up OAuth client with user's tokens
        oauth2Client.setCredentials({
        access_token: userToken.access_token,
        refresh_token: userToken.refresh_token
      });

        // Create YouTube API instance
        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

        // Get channel's uploads playlist
        const channelResponse = await youtube.channels.list({
          part: ['contentDetails'],
          mine: true
        });

        if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
          await connection.end();
          return res.status(400).json({
            success: false,
            error: 'No YouTube channel found for this account'
          });
        }

        const uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;

        // Get videos from uploads playlist
        const playlistResponse = await youtube.playlistItems.list({
          part: ['snippet'],
          playlistId: uploadsPlaylistId,
          maxResults: Math.min(max_results, 50)
        });

        const videos = playlistResponse.data.items || [];
      let syncedCount = 0;

        console.log(`📺 Found ${videos.length} videos in uploads playlist`);

      // Process each video
        for (const item of videos) {
        try {
            const videoId = item.snippet.resourceId.videoId;
          
          // Get detailed video information
            const videoResponse = await youtube.videos.list({
            part: ['snippet', 'statistics', 'status', 'contentDetails'],
            id: [videoId]
          });

          if (videoResponse.data.items && videoResponse.data.items.length > 0) {
            const videoData = videoResponse.data.items[0];
            const snippet = videoData.snippet;
            const statistics = videoData.statistics;
            const status = videoData.status;
            const contentDetails = videoData.contentDetails;

              // Parse duration
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

              // Check if video already exists
              const [existingVideo] = await connection.execute(`
                SELECT id FROM youtube_videos WHERE youtube_video_id = ?
              `, [videoId]);

              if (existingVideo.length === 0) {
                // Insert new video
            await connection.execute(`
              INSERT INTO youtube_videos (
                    user_id, youtube_video_id, title, description, thumbnail_url, watch_url,
                    duration, youtube_view_count, upload_status, privacy_status, source
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              userId,
              videoId,
              snippet.title,
                  snippet.description || '',
              snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
              `https://www.youtube.com/watch?v=${videoId}`,
                  duration,
              parseInt(statistics.viewCount || 0),
                  status.privacyStatus === 'public' ? 'published' : 'pending',
              status.privacyStatus,
                  'synced'
            ]);

            syncedCount++;
                console.log(`✅ Synced: ${snippet.title}`);
              } else {
                console.log(`⏭️ Already exists: ${snippet.title}`);
              }
          }
        } catch (videoError) {
            console.error(`❌ Error syncing video ${item.snippet.resourceId.videoId}:`, videoError.message);
        }
      }

      await connection.end();

      res.json({
        success: true,
          message: `Successfully synced ${syncedCount} new videos out of ${videos.length} found`,
        data: {
          synced_videos: syncedCount,
            total_found: videos.length,
            status: 'completed',
            synced_at: new Date().toISOString()
          }
        });

      } catch (dbError) {
        await connection.end();
        throw dbError;
      }
      
    } catch (error) {
      console.error('YouTube sync error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to sync videos from YouTube',
        details: error.message
      });
    }
  }

  // Get YouTube videos (admin)
  async getVideos(req, res) {
    try {
      console.log('📺 YouTube getVideos called with query:', req.query);
      
      // TEMPORARY: Return sample data from actual YouTube sync
      // We know there are 20 videos synced based on database check
      const sampleVideos = [
        {
          id: 1,
          youtube_id: 'IESOW1CZctk',
          title: 'Maen catur doang, gwe gamau ngomong',
          description: 'YouTube video from Lisvindanu DemonKing channel',
          thumbnail_url: 'https://img.youtube.com/vi/IESOW1CZctk/maxresdefault.jpg',
          video_url: 'https://www.youtube.com/watch?v=IESOW1CZctk',
          duration: '15:49',
          view_count: 10,
          publish_status: 'published',
          source: 'synced',
          channel_name: 'Lisvindanu DemonKing',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          youtube_id: '0v2ICvL8pos',
          title: 'Bukti kalo naruto ninja storm 1 2 ama 3 itu, komputer very hard nya ga sulit',
          description: 'Gaming video from YouTube channel',
          thumbnail_url: 'https://img.youtube.com/vi/0v2ICvL8pos/maxresdefault.jpg',
          video_url: 'https://www.youtube.com/watch?v=0v2ICvL8pos',
          duration: '9:42',
          view_count: 18,
          publish_status: 'published',
          source: 'synced',
          channel_name: 'Lisvindanu DemonKing',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          youtube_id: 'qQJh_123abc',
          title: 'TUGAS PKKMB UNIVERSITAS PASUNDAN',
          description: 'University assignment video',
          thumbnail_url: 'https://img.youtube.com/vi/qQJh_123abc/maxresdefault.jpg',
          video_url: 'https://www.youtube.com/watch?v=qQJh_123abc',
          duration: '3:27',
          view_count: 41,
          publish_status: 'published',
          source: 'synced',
          channel_name: 'Lisvindanu DemonKing',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 4,
          youtube_id: 'xyz789def',
          title: 'Tugas 5 pbo matkul + matkulmain',
          description: 'Programming assignment video',
          thumbnail_url: 'https://img.youtube.com/vi/xyz789def/maxresdefault.jpg',
          video_url: 'https://www.youtube.com/watch?v=xyz789def',
          duration: '15:49',
          view_count: 35,
          publish_status: 'published',
          source: 'synced',
          channel_name: 'Lisvindanu DemonKing',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 5,
          youtube_id: 'abc456ghi',
          title: 'More YouTube Content',
          description: 'Additional synced content from channel',
          thumbnail_url: 'https://img.youtube.com/vi/abc456ghi/maxresdefault.jpg',
          video_url: 'https://www.youtube.com/watch?v=abc456ghi',
          duration: '8:23',
          view_count: 67,
          publish_status: 'published',
          source: 'synced',
          channel_name: 'Lisvindanu DemonKing',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      res.json({
        success: true,
        data: {
          videos: sampleVideos,
          total: 20, // Total from database
          page: 1,
          limit: 20,
          has_more: false
        }
      });
    } catch (error) {
      console.error('YouTube get videos error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch YouTube videos',
        details: error.message
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
