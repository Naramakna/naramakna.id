// Test script untuk trigger semua BullMQ workers
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { queues, QUEUE_NAMES } = require('../backend/src/config/queue');

async function testAllWorkers() {
  console.log('🧪 TESTING ALL BULLMQ WORKERS\n');
  console.log('='.repeat(50));

  try {
    // 1. Test Publish Scheduled Posts
    console.log('\n📝 [1/4] Testing Publish Scheduled Posts...');
    const publishJob = await queues[QUEUE_NAMES.PUBLISH_SCHEDULED].add(
      'manual-test-publish',
      { test: true },
      { priority: 1 }
    );
    console.log(`   ✅ Job added: ${publishJob.id}`);

    // 2. Test Sync TikTok
    console.log('\n📱 [2/4] Testing Sync TikTok...');
    const tiktokJob = await queues[QUEUE_NAMES.SYNC_TIKTOK].add(
      'manual-test-tiktok',
      { test: true },
      { priority: 1 }
    );
    console.log(`   ✅ Job added: ${tiktokJob.id}`);

    // 3. Test Update Trending
    console.log('\n📈 [3/4] Testing Update Trending...');
    const trendingJob = await queues[QUEUE_NAMES.UPDATE_TRENDING].add(
      'manual-test-trending',
      { test: true },
      { priority: 1 }
    );
    console.log(`   ✅ Job added: ${trendingJob.id}`);

    // 4. Test Pause Expired Ads
    console.log('\n💰 [4/4] Testing Pause Expired Ads...');
    const adsJob = await queues[QUEUE_NAMES.PAUSE_EXPIRED_ADS].add(
      'manual-test-ads',
      { test: true },
      { priority: 1 }
    );
    console.log(`   ✅ Job added: ${adsJob.id}`);

    console.log('\n' + '='.repeat(50));
    console.log('✅ All test jobs added to queues!');
    console.log('📊 Workers will process them automatically');
    console.log('📝 Check logs: tail -f /var/log/bullmq-workers.log\n');

    // Wait a bit to see initial processing
    console.log('⏳ Waiting 5 seconds to check job status...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check job statuses
    console.log('📊 JOB STATUS CHECK:\n');

    const publishState = await publishJob.getState();
    console.log(`   Publish Scheduled: ${publishState}`);

    const tiktokState = await tiktokJob.getState();
    console.log(`   Sync TikTok: ${tiktokState}`);

    const trendingState = await trendingJob.getState();
    console.log(`   Update Trending: ${trendingState}`);

    const adsState = await adsJob.getState();
    console.log(`   Pause Expired Ads: ${adsState}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testAllWorkers();
