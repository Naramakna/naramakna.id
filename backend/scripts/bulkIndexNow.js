require('dotenv').config();
const mysql = require('mysql2/promise');
const indexNow = require('../src/services/indexNowService');

async function bulkSubmitToIndexNow() {
  console.log('Starting bulk IndexNow submission...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'naramakna_clean'
  });

  try {
    // Get all published articles
    const [posts] = await connection.execute(
      'SELECT post_name FROM posts WHERE post_status = ? AND post_type = ? ORDER BY post_date DESC',
      ['publish', 'post']
    );

    console.log(`Found ${posts.length} published articles`);

    if (posts.length === 0) {
      console.log('No articles to submit');
      return;
    }

    // Generate URLs
    const urls = posts.map(post => `https://naramakna.id/${post.post_name}`);

    // Submit in batches of 10000 (IndexNow limit)
    const batchSize = 10000;
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      console.log(`\nSubmitting batch ${Math.floor(i/batchSize) + 1}: ${batch.length} URLs`);
      
      await indexNow.submitUrls(batch);
      
      // Wait 1 second between batches to avoid rate limiting
      if (i + batchSize < urls.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('\n✅ Bulk submission completed!');
  } catch (error) {
    console.error('❌ Error during bulk submission:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the script
bulkSubmitToIndexNow()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
