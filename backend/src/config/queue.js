// src/config/queue.js
// BullMQ Queue Configuration

const { Queue, Worker, QueueScheduler } = require('bullmq');

// Redis connection configuration
const redisConnection = {
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// Default job options
const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: {
    age: 24 * 3600, // Keep completed jobs for 24 hours
    count: 1000, // Keep last 1000 completed jobs
  },
  removeOnFail: {
    age: 7 * 24 * 3600, // Keep failed jobs for 7 days
  },
};

// Queue names
const QUEUE_NAMES = {
  PUBLISH_SCHEDULED: 'publish-scheduled-posts', // Legacy - keep for cleanup
  PUBLISH_SINGLE_POST: 'publish-single-post', // New webhook-style: 1 job per scheduled post
  SYNC_TIKTOK: 'sync-tiktok',
  UPDATE_TRENDING: 'update-trending',
  PAUSE_EXPIRED_ADS: 'pause-expired-ads', // Legacy hourly cron - keep for backwards compatibility
  PAUSE_SINGLE_AD: 'pause-single-ad', // New webhook-style: 1 job per active ad
};

// Create queues
const queues = {};

Object.values(QUEUE_NAMES).forEach(queueName => {
  queues[queueName] = new Queue(queueName, {
    connection: redisConnection,
    defaultJobOptions,
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Closing BullMQ queues...');
  await Promise.all(
    Object.values(queues).map(queue => queue.close())
  );
  console.log('✅ All queues closed');
  process.exit(0);
});

module.exports = {
  redisConnection,
  defaultJobOptions,
  QUEUE_NAMES,
  queues,
  // Helper to get a specific queue
  getQueue: (queueName) => queues[queueName],
};
