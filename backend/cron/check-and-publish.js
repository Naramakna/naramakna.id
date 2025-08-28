require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const SchedulerController = require('../src/controllers/schedulerController');

async function checkAndPublish() {
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
  }
}

// Run once and exit
checkAndPublish();