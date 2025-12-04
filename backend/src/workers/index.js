// src/workers/index.js
// Unified BullMQ Worker - Handles all background jobs

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { Worker } = require('bullmq');
const { redisConnection, QUEUE_NAMES } = require('../config/queue');

// Import controllers and services
const SchedulerController = require('../controllers/schedulerController');
const tiktokService = require('../services/tiktokService');
const ContentHelpers = require('../models/ContentHelpers');
const TrendingUpdater = require('../../cron/update-trending');
const RedisLock = require('../services/redisLock');
const logger = require('../utils/logger');

// Quick check for scheduled posts (lightweight COUNT query)
const hasScheduledPostsReady = async () => {
  try {
    const { Post } = require('../models');
    const { Op } = require('sequelize');
    const now = new Date();
    
    const count = await Post.count({
      where: {
        [Op.or]: [
          {
            post_status: 'scheduled',
            scheduled_publish_date: { [Op.lte]: now }
          },
          {
            post_status: 'future',
            post_date: { [Op.lte]: now }
          }
        ]
      }
    });
    
    return count > 0;
  } catch (error) {
    console.error('Error checking scheduled posts count:', error.message);
    return true; // On error, proceed with full check
  }
};

// Job processors
const jobProcessors = {
  // 1. [LEGACY] Publish Scheduled Posts - kept for backwards compatibility
  // New posts use PUBLISH_SINGLE_POST webhook-style instead
  [QUEUE_NAMES.PUBLISH_SCHEDULED]: async (job) => {
    const hasReady = await hasScheduledPostsReady();

    if (!hasReady) {
      return { published: 0, skipped: true, reason: 'no_posts_ready' };
    }

    console.log(`🔍 [${job.id}] Legacy scheduler: Found posts ready to publish...`);

    const publishedPosts = await SchedulerController.publishScheduledPosts();

    if (publishedPosts && publishedPosts.length > 0) {
      const wibTime = new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit'
      });
      console.log(`✅ [${wibTime}] Published ${publishedPosts.length} posts`);
      return { published: publishedPosts.length, posts: publishedPosts };
    }

    console.log('📅 No posts to publish');
    return { published: 0 };
  },

  // 2. Publish Single Post (WEBHOOK-STYLE) - Fires at exact scheduled time
  [QUEUE_NAMES.PUBLISH_SINGLE_POST]: async (job) => {
    const { postId, postTitle } = job.data;
    const { Post, PostMeta } = require('../models');
    const sequelize = require('../config/database');

    console.log(`🎯 [${job.id}] Publishing post: "${postTitle}" (ID: ${postId})`);

    try {
      const post = await Post.findByPk(postId);

      if (!post) {
        console.warn(`⚠️ Post ${postId} not found, skipping`);
        return { success: false, reason: 'post_not_found' };
      }

      // Only publish if still scheduled/future
      if (!['scheduled', 'future'].includes(post.post_status)) {
        console.log(`⏭️ Post ${postId} status is "${post.post_status}", skipping`);
        return { success: false, reason: 'already_published_or_cancelled' };
      }

      const now = new Date();

      // Preserve featured image metadata
      const featuredImageMeta = await PostMeta.findOne({
        where: { post_id: postId, meta_key: '_thumbnail_id' }
      });

      // Update post status to published
      const updateData = {
        post_status: 'publish',
        post_modified: now,
        post_modified_gmt: now
      };

      // For legacy scheduled posts, update post_date
      if (post.post_status === 'scheduled') {
        updateData.post_date = now;
        updateData.post_date_gmt = now;
        updateData.scheduled_publish_date = null;
        updateData.original_status = null;
      }

      await post.update(updateData);

      if (featuredImageMeta) {
        console.log(`  🖼️ Featured image preserved: ${featuredImageMeta.meta_value}`);
      }

      // Log the publishing
      await sequelize.query(
        `INSERT INTO post_schedule_log
         (post_id, action_type, scheduled_by, notes)
         VALUES (:postId, 'published', :scheduledBy, 'Auto-published by webhook scheduler')`,
        {
          replacements: {
            postId: postId,
            scheduledBy: post.scheduled_by || post.post_author
          }
        }
      );

      const wibTime = now.toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit'
      });

      console.log(`✅ [${wibTime}] Published: "${postTitle}" (ID: ${postId})`);

      return {
        success: true,
        postId,
        postTitle,
        publishedAt: now.toISOString()
      };
    } catch (error) {
      console.error(`❌ Failed to publish post ${postId}:`, error.message);
      throw error; // Let BullMQ retry
    }
  },

  // 3. Sync TikTok (30 min cron - keeps this as cron because it doesn't have scheduled times)
  [QUEUE_NAMES.SYNC_TIKTOK]: async (job) => {
    console.log(`📱 [${job.id}] Syncing TikTok videos...`);

    const lockKey = 'cron:sync-tiktok';
    const lockValue = await RedisLock.acquire(lockKey, 300);

    if (!lockValue) {
      logger.warn('⏭️  TikTok sync already running (lock held), skipping');
      return { processed: 0, skipped: true };
    }

    try {
      if (!tiktokService.isTokenValid()) {
        logger.warn('TikTok access token not available, skipping');
        return { processed: 0, error: 'no_token' };
      }

      const syncResult = await tiktokService.syncUserContent();
      let savedCount = 0;

      for (const video of syncResult.videos) {
        try {
          const existingPost = await ContentHelpers.findOne({
            where: { external_id: video.id }
          });

          if (!existingPost) {
            await ContentHelpers.create({
              title: video.title || `TikTok Video ${video.id}`,
              content: video.description || '',
              thumbnail_url: video.cover_image_url,
              video_url: video.embed_link || video.share_url,
              external_id: video.id,
              source: 'tiktok',
              channel: 'sosmed',
              status: 'published',
              author: 'TikTok Bot'
            });
            savedCount++;
          }
        } catch (error) {
          logger.error(`Failed to save video ${video.id}:`, error.message);
        }
      }

      logger.info(`TikTok sync complete: ${savedCount} new videos saved`);
      return { processed: syncResult.videos.length, saved: savedCount };
    } finally {
      await RedisLock.release(lockKey, lockValue);
    }
  },

  // 3. Update Trending
  [QUEUE_NAMES.UPDATE_TRENDING]: async (job) => {
    console.log(`📈 [${job.id}] Updating trending scores...`);

    const updater = new TrendingUpdater();
    const result = await updater.performUpdate();

    console.log(`✅ Trending updated successfully`);
    return result;
  },

  // 4. [LEGACY] Pause Expired Ads - kept for backwards compatibility
  // New ads use PAUSE_SINGLE_AD webhook-style instead
  [QUEUE_NAMES.PAUSE_EXPIRED_ADS]: async (job) => {
    console.log(`💰 [${job.id}] Pausing expired ads...`);

    const { Advertisement } = require('../models');
    const { Op } = require('sequelize');

    const nowUTC = new Date();

    const expiredAds = await Advertisement.findAll({
      where: {
        status: 'active',
        end_date: {
          [Op.lt]: nowUTC
        }
      }
    });

    if (expiredAds.length === 0) {
      console.log('✅ No expired ads found');
      return { count: 0 };
    }

    console.log(`📋 Found ${expiredAds.length} expired ads to pause`);

    for (const ad of expiredAds) {
      await ad.update({
        status: 'finished',
        updated_at: nowUTC
      });
      console.log(`⏸️  Paused ad: "${ad.campaign_name}" (ID: ${ad.id})`);
    }

    console.log(`✅ Paused ${expiredAds.length} expired ads`);
    return { count: expiredAds.length };
  },

  // 5. Pause Single Ad (WEBHOOK-STYLE) - Fires at exact end_date
  [QUEUE_NAMES.PAUSE_SINGLE_AD]: async (job) => {
    const { adId, campaignName } = job.data;
    const { Advertisement } = require('../models');

    console.log(`🎯 [${job.id}] Pausing ad: "${campaignName}" (ID: ${adId})`);

    try {
      const ad = await Advertisement.findByPk(adId);

      if (!ad) {
        console.warn(`⚠️ Ad ${adId} not found, skipping`);
        return { success: false, reason: 'ad_not_found' };
      }

      // Only pause if still active
      if (ad.status !== 'active') {
        console.log(`⏭️ Ad ${adId} status is "${ad.status}", skipping`);
        return { success: false, reason: 'not_active' };
      }

      const now = new Date();

      // Update ad status to finished
      await ad.update({
        status: 'finished',
        updated_at: now
      });

      const wibTime = now.toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit'
      });

      console.log(`✅ [${wibTime}] Paused ad: "${campaignName}" (ID: ${adId})`);

      return {
        success: true,
        adId,
        campaignName,
        pausedAt: now.toISOString()
      };
    } catch (error) {
      console.error(`❌ Failed to pause ad ${adId}:`, error.message);
      throw error; // Let BullMQ retry
    }
  },
};

// Create workers for each queue
const workers = [];

Object.values(QUEUE_NAMES).forEach(queueName => {
  const worker = new Worker(
    queueName,
    async (job) => {
      const processor = jobProcessors[queueName];

      if (!processor) {
        throw new Error(`No processor found for queue: ${queueName}`);
      }

      try {
        const result = await processor(job);
        return result;
      } catch (error) {
        console.error(`❌ [${queueName}] Job ${job.id} failed:`, error.message);
        throw error;
      }
    },
    {
      connection: redisConnection,
      concurrency: 1,
      limiter: {
        max: 10,
        duration: 60000,
      },
    }
  );

  worker.on('completed', (job, result) => {
    // Only log if something was actually done (not silent skip)
    if (result && !result.skipped) {
      console.log(`✅ [${queueName}] Job ${job.id} completed`);
    }
  });

  worker.on('failed', (job, error) => {
    console.error(`❌ [${queueName}] Job ${job?.id} failed:`, error.message);
  });

  worker.on('error', (error) => {
    console.error(`❌ [${queueName}] Worker error:`, error);
  });

  workers.push(worker);
  console.log(`🔧 Worker started for queue: ${queueName}`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🛑 Shutting down workers...');

  await Promise.all(
    workers.map(worker => worker.close())
  );

  console.log('✅ All workers closed');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

console.log(`🚀 BullMQ Workers started (${workers.length} queues)`);
console.log('📊 Queues:', Object.values(QUEUE_NAMES).join(', '));
console.log('⏳ Waiting for jobs...\n');
