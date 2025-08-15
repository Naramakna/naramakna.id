const cron = require('node-cron');
const SchedulerController = require('../src/controllers/schedulerController');

console.log('📅 Post Scheduler initialized');

// Run every minute to check for posts to publish
// Format: '* * * * *' = [minute] [hour] [day] [month] [day_of_week]
const schedulerJob = cron.schedule('* * * * *', async () => {
  try {
    const publishedPosts = await SchedulerController.publishScheduledPosts();
    
    if (publishedPosts && publishedPosts.length > 0) {
      console.log(`📅 [${new Date().toISOString()}] Published ${publishedPosts.length} scheduled posts`);
    }
  } catch (error) {
    console.error('❌ Scheduler error:', error.message);
  }
}, {
  scheduled: false,
  timezone: "Asia/Jakarta"
});

// Start the scheduler
schedulerJob.start();
console.log('📅 Post Scheduler started - checking every minute for posts to publish');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('📅 Stopping scheduler...');
  schedulerJob.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('📅 Stopping scheduler...');
  schedulerJob.stop();
  process.exit(0);
});

module.exports = schedulerJob;
