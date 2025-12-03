require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const SchedulerController = require('../src/controllers/schedulerController');
const RedisLock = require('../src/services/redisLock');

async function checkAndPublish() {
  const lockKey = 'cron:publish-scheduled-posts';
  const lockValue = await RedisLock.acquire(lockKey, 120); // 2 min lock

  if (!lockValue) {
    console.log('⏭️  Another instance is already publishing posts, skipping...');
    process.exit(0);
  }

  try {
    console.log('🔍 Checking for posts to publish...');

    // Check if there are any scheduled posts ready to publish
    const publishedPosts = await SchedulerController.publishScheduledPosts();

    if (publishedPosts && publishedPosts.length > 0) {
      const wibTime = new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
      console.log(`📅 [${wibTime}] Published ${publishedPosts.length} scheduled posts`);
    } else {
      console.log('📅 No posts to publish at this time');
    }

    // Exit cleanly
    process.exit(0);

  } catch (error) {
    console.error('❌ Scheduler error:', error.message);
    process.exit(1);
  } finally {
    await RedisLock.release(lockKey, lockValue);
  }
}

// Run once and exit
checkAndPublish();
