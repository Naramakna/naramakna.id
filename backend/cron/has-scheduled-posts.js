require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Post } = require('../src/models');
const { Op } = require('sequelize');

async function hasScheduledPosts() {
  try {
    const now = new Date();
    
    // Check if there are any posts scheduled for now or earlier
    // Support both 'scheduled' and 'future' status for compatibility
    const count = await Post.count({
      where: {
        [Op.or]: [
          {
            post_status: 'scheduled',
            scheduled_publish_date: {
              [Op.lte]: now
            }
          },
          {
            post_status: 'future',
            post_date: {
              [Op.lte]: now
            }
          }
        ]
      }
    });
    
    // Exit with code 0 if there are scheduled posts, 1 if none
    process.exit(count > 0 ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Error checking scheduled posts:', error.message);
    process.exit(1);
  }
}

hasScheduledPosts();