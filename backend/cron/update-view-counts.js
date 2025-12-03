require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const sequelize = require("../src/config/database");

async function updateViewCounts() {
  try {
    console.log("🔄 Starting view count update...");
    const startTime = Date.now();

    // Update posts.view_count from Analytics table
    // Using raw SQL for better performance
    const [results] = await sequelize.query(`
      UPDATE posts p
      SET view_count = (
        SELECT COUNT(*) 
        FROM analytics a 
        WHERE a.content_id = p.ID 
          AND a.event_type = 'view'
      )
      WHERE p.post_type IN ('post', 'youtube_video', 'tiktok_video')
        AND p.deleted_at IS NULL
    `);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const wibTime = new Date().toLocaleString("id-ID", { 
      timeZone: "Asia/Jakarta",
      dateStyle: "medium",
      timeStyle: "medium"
    });

    console.log(`✅ View counts updated in ${duration}s at ${wibTime}`);
    
    // Get stats
    const [stats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_posts,
        SUM(view_count) as total_views,
        MAX(view_count) as max_views
      FROM posts 
      WHERE post_type IN ('post', 'youtube_video', 'tiktok_video')
        AND deleted_at IS NULL
    `);

    if (stats && stats[0]) {
      console.log(`📊 Stats: ${stats[0].total_posts} posts, ${stats[0].total_views} total views, max ${stats[0].max_views} views`);
    }

    process.exit(0);

  } catch (error) {
    console.error("❌ Error updating view counts:", error.message);
    process.exit(1);
  }
}

// Run
updateViewCounts();
