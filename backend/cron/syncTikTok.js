// Cron job untuk sync video TikTok secara otomatis
const cron = require('node-cron');
const tiktokService = require('../src/services/tiktokService');
const ContentHelpers = require('../src/models/ContentHelpers');
const logger = require('../src/utils/logger');

class TikTokSync {
  constructor() {
    this.isRunning = false;
    this.lastSync = null;
    this.syncStats = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      lastError: null
    };
  }

  /**
   * Start TikTok sync cron job
   * Runs every 6 hours by default
   */
  start(cronExpression = '0 */6 * * *') {
    logger.info('Starting TikTok sync cron job...');
    
    // Schedule the sync job
    cron.schedule(cronExpression, async () => {
      await this.performSync();
    }, {
      scheduled: true,
      timezone: "Asia/Jakarta"
    });

    // Also run an immediate sync on startup if needed
    this.performInitialSync();
    
    logger.info(`TikTok sync cron job scheduled with expression: ${cronExpression}`);
  }

  /**
   * Perform initial sync on startup (if token is available)
   */
  async performInitialSync() {
    // Wait a bit to let the server fully start
    setTimeout(async () => {
      if (tiktokService.isTokenValid()) {
        logger.info('Performing initial TikTok sync...');
        await this.performSync();
      } else {
        logger.info('TikTok not connected, skipping initial sync');
      }
    }, 30000); // 30 seconds delay
  }

  /**
   * Main sync function
   */
  async performSync() {
    if (this.isRunning) {
      logger.warn('TikTok sync already running, skipping this cycle');
      return;
    }

    if (!tiktokService.isTokenValid()) {
      logger.warn('TikTok access token not available or expired, skipping sync');
      return;
    }

    this.isRunning = true;
    this.lastSync = new Date();
    
    try {
      logger.info('Starting TikTok content sync...');
      
      const syncResult = await tiktokService.syncUserContent();
      
      // Process and save videos to database
      let savedCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;
      const errors = [];

      for (const video of syncResult.videos) {
        try {
          const existingPost = await this.checkExistingVideo(video.id);
          
          if (existingPost) {
            // Update existing video stats
            await this.updateVideoStats(existingPost, video);
            updatedCount++;
          } else {
            // Create new video post
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
            
            // Use system user ID (1) for automated content
            await ContentHelpers.createTikTokVideo(videoData, 1);
            savedCount++;
          }
        } catch (error) {
          errors.push({
            videoId: video.id,
            error: error.message
          });
          logger.error(`Failed to process TikTok video ${video.id}:`, error.message);
        }
      }

      // Update sync statistics
      this.syncStats.totalSyncs++;
      this.syncStats.successfulSyncs++;
      this.syncStats.lastError = null;

      const syncSummary = {
        timestamp: this.lastSync,
        totalFetched: syncResult.totalFetched,
        totalFiltered: syncResult.totalFiltered,
        savedCount,
        updatedCount,
        skippedCount,
        errorCount: errors.length,
        profile: syncResult.profile.display_name
      };

      logger.info('TikTok sync completed successfully:', syncSummary);

      // Store sync results for reporting
      await this.storeSyncResults(syncSummary);

    } catch (error) {
      this.syncStats.failedSyncs++;
      this.syncStats.lastError = error.message;
      
      logger.error('TikTok sync failed:', error.message);
      
      // Store failed sync for reporting
      await this.storeSyncResults({
        timestamp: this.lastSync,
        error: error.message,
        success: false
      });
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Check if video already exists in database
   */
  async checkExistingVideo(tiktokVideoId) {
    try {
      const { Post, PostMeta } = require('../src/models');
      
      const existingPost = await Post.findOne({
        where: {
          post_type: ContentHelpers.CONTENT_TYPES.TIKTOK_VIDEO,
          post_name: tiktokVideoId
        },
        include: [{
          model: PostMeta,
          where: {
            meta_key: ContentHelpers.META_KEYS.EXTERNAL_ID,
            meta_value: tiktokVideoId
          },
          required: true
        }]
      });

      return existingPost;
    } catch (error) {
      logger.error(`Error checking existing TikTok video ${tiktokVideoId}:`, error.message);
      return null;
    }
  }

  /**
   * Update existing video statistics
   */
  async updateVideoStats(existingPost, videoData) {
    try {
      const { PostMeta } = require('../src/models');
      
      // Update post metadata with latest stats
      const updates = [
        { key: ContentHelpers.META_KEYS.TIKTOK_PLAY_COUNT, value: videoData.view_count?.toString() || '0' },
        { key: ContentHelpers.META_KEYS.TIKTOK_LIKE_COUNT, value: videoData.like_count?.toString() || '0' },
        { key: ContentHelpers.META_KEYS.TIKTOK_SHARE_COUNT, value: videoData.share_count?.toString() || '0' },
        { key: ContentHelpers.META_KEYS.TIKTOK_COMMENT_COUNT, value: videoData.comment_count?.toString() || '0' }
      ];

      for (const update of updates) {
        await PostMeta.update(
          { meta_value: update.value },
          {
            where: {
              post_id: existingPost.ID,
              meta_key: update.key
            }
          }
        );
      }

      logger.debug(`Updated stats for TikTok video ${videoData.id}`);
    } catch (error) {
      logger.error(`Failed to update TikTok video stats ${videoData.id}:`, error.message);
      throw error;
    }
  }

  /**
   * Store sync results for reporting and monitoring
   */
  async storeSyncResults(results) {
    try {
      // You can implement this to store sync results in database
      // For now, just log the results
      logger.info('TikTok sync results stored:', results);
    } catch (error) {
      logger.error('Failed to store TikTok sync results:', error.message);
    }
  }

  /**
   * Manual sync trigger (for API endpoints)
   */
  async triggerManualSync() {
    if (this.isRunning) {
      throw new Error('Sync is already running');
    }
    
    logger.info('Manual TikTok sync triggered');
    await this.performSync();
    
    return {
      success: true,
      timestamp: this.lastSync,
      stats: this.syncStats
    };
  }

  /**
   * Get sync statistics
   */
  getStats() {
    return {
      ...this.syncStats,
      isRunning: this.isRunning,
      lastSync: this.lastSync
    };
  }

  /**
   * Stop all cron jobs
   */
  stop() {
    // Note: node-cron doesn't provide direct stop method for all jobs
    // This would need to be implemented if you need to dynamically stop
    logger.info('TikTok sync cron job stopped');
  }
}

// Create singleton instance
const tiktokSync = new TikTokSync();

// Auto-start if in production or if TIKTOK_AUTO_SYNC is enabled
if (process.env.NODE_ENV === 'production' || process.env.TIKTOK_AUTO_SYNC === 'true') {
  tiktokSync.start();
}

module.exports = tiktokSync;
