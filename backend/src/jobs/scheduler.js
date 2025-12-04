// src/jobs/scheduler.js
// BullMQ Job Scheduler - Adds recurring jobs and syncs existing scheduled items

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { queues, QUEUE_NAMES } = require('../config/queue');
const { schedulePauseAdJob } = require('../controllers/adsController');

// Sync existing scheduled posts to BullMQ delayed jobs (webhook-style)
async function syncExistingScheduledPosts() {
  console.log('\n🔄 Syncing existing scheduled posts to webhook-style jobs...');

  try {
    const sequelize = require('../config/database');
    const { QueryTypes } = require('sequelize');

    // Find all posts that are still scheduled for the future
    const scheduledPosts = await sequelize.query(
      `SELECT ID, post_title, scheduled_publish_date, post_date, post_status
       FROM posts
       WHERE post_status IN ('scheduled', 'future')
         AND (
           (post_status = 'scheduled' AND scheduled_publish_date > NOW())
           OR (post_status = 'future' AND post_date > NOW())
         )
         AND deleted_at IS NULL
       ORDER BY COALESCE(scheduled_publish_date, post_date) ASC`,
      { type: QueryTypes.SELECT }
    );

    if (scheduledPosts.length === 0) {
      console.log('   No scheduled posts to sync');
      return { synced: 0 };
    }

    console.log(`   Found ${scheduledPosts.length} scheduled posts`);

    const queue = queues[QUEUE_NAMES.PUBLISH_SINGLE_POST];
    let syncedCount = 0;

    for (const post of scheduledPosts) {
      const publishDate = post.scheduled_publish_date || post.post_date;
      const delay = Math.max(0, new Date(publishDate).getTime() - Date.now());
      const jobId = `publish-post-${post.ID}`;

      // Remove existing job if any (to prevent duplicates)
      try {
        const existingJob = await queue.getJob(jobId);
        if (existingJob) {
          await existingJob.remove();
        }
      } catch (err) {
        // Job might not exist, that's ok
      }

      // Add delayed job
      await queue.add(
        'publish-single-post',
        { postId: post.ID, postTitle: post.post_title },
        {
          delay,
          jobId,
          removeOnComplete: true,
          removeOnFail: false
        }
      );

      const wibTime = new Date(publishDate).toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        dateStyle: 'short',
        timeStyle: 'short'
      });
      console.log(`   📅 Synced: "${post.post_title.substring(0, 40)}..." for ${wibTime} (${Math.round(delay/1000/60)} min)`);
      syncedCount++;
    }

    console.log(`   ✅ Synced ${syncedCount} scheduled posts\n`);
    return { synced: syncedCount };
  } catch (error) {
    console.error('   ❌ Error syncing scheduled posts:', error.message);
    return { synced: 0, error: error.message };
  }
}

// Sync existing active ads to BullMQ delayed jobs (webhook-style)
async function syncExistingActiveAds() {
  console.log('\n🔄 Syncing existing active ads to webhook-style jobs...');

  try {
    const sequelize = require('../config/database');
    const { QueryTypes } = require('sequelize');

    // Find all active ads with future end_dates
    const activeAds = await sequelize.query(
      `SELECT id, campaign_name, end_date, status
       FROM advertisements
       WHERE status = 'active'
         AND end_date > NOW()
       ORDER BY end_date ASC`,
      { type: QueryTypes.SELECT }
    );

    if (activeAds.length === 0) {
      console.log('   No active ads to sync');
      return { synced: 0 };
    }

    console.log(`   Found ${activeAds.length} active ads`);

    let syncedCount = 0;

    for (const ad of activeAds) {
      try {
        await schedulePauseAdJob(ad.id, ad.end_date, ad.campaign_name);
        syncedCount++;
      } catch (error) {
        console.error(`   ❌ Failed to sync ad ${ad.id}:`, error.message);
      }
    }

    console.log(`   ✅ Synced ${syncedCount} active ads\n`);
    return { synced: syncedCount };
  } catch (error) {
    console.error('   ❌ Error syncing active ads:', error.message);
    return { synced: 0, error: error.message };
  }
}

// Schedule recurring jobs (cron-style for jobs without specific times)
async function setupRecurringJobs() {
  console.log('📅 Setting up recurring jobs...\n');

  // NOTE: Publish Scheduled Posts is now WEBHOOK-STYLE (delayed jobs per post)
  // NOTE: Pause Ads is now WEBHOOK-STYLE (delayed jobs per active ad)
  // No more cron polling! Jobs are created when posts are scheduled or ads become active.

  // 1. Sync TikTok - Once per day at 03:00 WIB
  await queues[QUEUE_NAMES.SYNC_TIKTOK].add(
    'sync-tiktok',
    {},
    {
      repeat: {
        pattern: '0 3 * * *', // Every day at 03:00 (3 AM WIB)
        tz: 'Asia/Jakarta',
      },
      jobId: 'sync-tiktok-videos',
    }
  );
  console.log('✅ Scheduled: TikTok Sync (daily at 03:00 WIB)');

  // 2. Update Trending - Once per day at 03:30 WIB (30 min after TikTok to avoid race)
  await queues[QUEUE_NAMES.UPDATE_TRENDING].add(
    'update-trending',
    {},
    {
      repeat: {
        pattern: '30 3 * * *', // Every day at 03:30 (3:30 AM WIB)
        tz: 'Asia/Jakarta',
      },
      jobId: 'update-trending-scores',
    }
  );
  console.log('✅ Scheduled: Update Trending (daily at 03:30 WIB)');

  // NOTE: Pause Expired Ads hourly cron is REMOVED
  // Ads now use webhook-style (delayed job per active ad that fires at end_date)
  // See syncExistingActiveAds() for startup sync

  console.log('\n🎯 Recurring jobs scheduled successfully!');
  console.log('📊 Note: Publish posts & pause ads use webhook-style (no polling)\n');
}

// Run setup
async function main() {
  try {
    // Step 1: Setup recurring jobs (TikTok, Trending)
    await setupRecurringJobs();

    // Step 2: Sync existing scheduled posts to delayed jobs (webhook-style)
    await syncExistingScheduledPosts();

    // Step 3: Sync existing active ads to delayed jobs (webhook-style)
    await syncExistingActiveAds();

    console.log('✅ Scheduler setup complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Scheduler setup failed:', error);
    process.exit(1);
  }
}

main();
