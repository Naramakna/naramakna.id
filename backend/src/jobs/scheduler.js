// src/jobs/scheduler.js
// BullMQ Job Scheduler - Adds recurring jobs to queues

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { queues, QUEUE_NAMES } = require('../config/queue');

// Schedule recurring jobs
async function setupRecurringJobs() {
  console.log('📅 Setting up recurring jobs...\n');

  // 1. Publish Scheduled Posts - Every 5 minutes (OPTIMIZED: was every minute)
  // Worker has smart early-exit if no posts ready to publish
  await queues[QUEUE_NAMES.PUBLISH_SCHEDULED].add(
    'check-and-publish',
    {},
    {
      repeat: {
        pattern: '*/5 * * * *', // Every 5 minutes (reduced from every minute)
      },
      jobId: 'publish-scheduled-posts', // Prevent duplicates
    }
  );
  console.log('✅ Scheduled: Publish Posts (every 5 minutes - optimized)');

  // 2. Sync TikTok - Every 30 minutes
  await queues[QUEUE_NAMES.SYNC_TIKTOK].add(
    'sync-tiktok',
    {},
    {
      repeat: {
        pattern: '*/30 * * * *', // Every 30 minutes
      },
      jobId: 'sync-tiktok-videos',
    }
  );
  console.log('✅ Scheduled: TikTok Sync (every 30 minutes)');

  // 3. Update Trending - Every 15 minutes
  await queues[QUEUE_NAMES.UPDATE_TRENDING].add(
    'update-trending',
    {},
    {
      repeat: {
        pattern: '*/15 * * * *', // Every 15 minutes
      },
      jobId: 'update-trending-scores',
    }
  );
  console.log('✅ Scheduled: Update Trending (every 15 minutes)');

  // 4. Pause Expired Ads - Every hour
  await queues[QUEUE_NAMES.PAUSE_EXPIRED_ADS].add(
    'pause-expired-ads',
    {},
    {
      repeat: {
        pattern: '0 * * * *', // Every hour at minute 0
      },
      jobId: 'pause-expired-advertisements',
    }
  );
  console.log('✅ Scheduled: Pause Expired Ads (every hour)');

  console.log('\n🎯 All recurring jobs scheduled successfully!');
  console.log('📊 Jobs will be processed by workers\n');
}

// Run setup
setupRecurringJobs()
  .then(() => {
    console.log('✅ Scheduler setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Scheduler setup failed:', error);
    process.exit(1);
  });
