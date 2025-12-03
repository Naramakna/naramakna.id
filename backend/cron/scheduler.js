require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const cron = require('node-cron');
const SchedulerController = require('../src/controllers/schedulerController');
const RedisLock = require('../src/services/redisLock');

console.log('📅 Post Scheduler initialized');

// Run every minute to check for posts to publish
// Format: '* * * * *' = [minute] [hour] [day] [month] [day_of_week]
const schedulerJob = cron.schedule('* * * * *', async () => {
  const lockKey = 'cron:publish-scheduled-posts';
  const lockValue = await RedisLock.acquire(lockKey, 120); // 2 min lock

  if (!lockValue) {
    console.log('⏭️  Lock already held by another instance, skipping this cycle');
    return;
  }

  try {
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
      console.log(`📅 [${wibTime}] Cron published ${publishedPosts.length} scheduled posts`);
    }
  } catch (error) {
    console.error('❌ Scheduler error:', error.message);
  } finally {
    await RedisLock.release(lockKey, lockValue);
  }
}, {
  scheduled: false,
  timezone: "Asia/Jakarta"
});

// Start the scheduler
schedulerJob.start();
console.log('📅 Post Scheduler started - checking every minute for posts to publish');



module.exports = schedulerJob;
