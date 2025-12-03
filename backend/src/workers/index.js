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
  // 1. Publish Scheduled Posts - SMART: Early exit if no posts ready
  [QUEUE_NAMES.PUBLISH_SCHEDULED]: async (job) => {
    // Quick check first - avoid heavy processing if no posts ready
    const hasReady = await hasScheduledPostsReady();
    
    if (!hasReady) {
      // Silent skip - no need to log every 5 minutes when nothing to do
      return { published: 0, skipped: true, reason: 'no_posts_ready' };
    }
    
    console.log(`🔍 [${job.id}] Found posts ready to publish, processing...`);

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

  // 2. Sync TikTok
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

  // 4. Pause Expired Ads
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
