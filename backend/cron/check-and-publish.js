require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const SchedulerController = require('../src/controllers/schedulerController');
const RedisLock = require('../src/services/redisLock');
const logger = require('../src/utils/logger');

async function checkAndPublish() {
  const lockKey = 'cron:publish-scheduled-posts';
  const lockValue = await RedisLock.acquire(lockKey, 120); // 2 min lock

  if (!lockValue) {
    logger.info('Cron skip: lock held by another instance');
    process.exit(0);
  }

  try {
    logger.info('Cron check: publishing scheduled posts');

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
      logger.info('Cron published scheduled posts', { time: wibTime, count: publishedPosts.length });
    } else {
      logger.info('Cron no posts to publish');
    }

    // Exit cleanly
    process.exit(0);

  } catch (error) {
    logger.error('Cron scheduler error', { message: error.message });
    process.exit(1);
  } finally {
    await RedisLock.release(lockKey, lockValue);
  }
}

// Run once and exit
checkAndPublish();
