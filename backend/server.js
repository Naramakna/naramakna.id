// File untuk start server production
const app = require('./src/app');
const cacheService = require('./src/services/cacheService'); // Initialize Redis connection
const axios = require('axios');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Start cache warm-up after server is ready
  setTimeout(() => warmupCache().catch(err => console.error('❌ Warm-up error:', err.message)), 10000);
});

/**
 * Cache Warm-up Function
 * Pre-populates Redis cache with critical endpoints to prevent cold start CPU spike
 */
async function warmupCache() {
  console.log('🔥 Starting cache warm-up...');
  
  const baseUrl = `http://localhost:${PORT}`;
  const categories = [
    'jagat-kita', 'pelakon', 'skip', 'horison',
    'laga-gaya', 'cerita-rasa', 'narapandang',
    'budaya', 'pendidikan', 'teknologi', 'sport',
    'liputan-khusus', 'wahana'
  ];
  
  let successCount = 0;
  let failCount = 0;
  
  try {
    // 1. Warm-up category feeds
    console.log('  📂 Warming category feeds...');
    for (const category of categories) {
      try {
        await axios.get(`${baseUrl}/api/content/feed?limit=10&type=post&category=${category}`, {
          timeout: 5000
        });
        successCount++;
        console.log(`    ✅ ${category}`);
      } catch (err) {
        failCount++;
        console.log(`    ❌ ${category}: ${err.message}`);
      }
      
      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // 2. Warm-up trending
    console.log('  🔥 Warming trending...');
    try {
      await axios.get(`${baseUrl}/api/trending/articles?limit=10&type=post`, { timeout: 5000 });
      successCount++;
      console.log('    ✅ trending');
    } catch (err) {
      failCount++;
      console.log(`    ❌ trending: ${err.message}`);
    }
    
    // 3. Warm-up stats
    console.log('  📊 Warming stats...');
    try {
      await axios.get(`${baseUrl}/api/content/stats`, { timeout: 5000 });
      successCount++;
      console.log('    ✅ stats');
    } catch (err) {
      failCount++;
      console.log(`    ❌ stats: ${err.message}`);
    }
    
    // 4. Warm-up categories list
    console.log('  🏷️  Warming categories list...');
    try {
      await axios.get(`${baseUrl}/api/content/categories?limit=50&mainCategoriesOnly=true`, { timeout: 5000 });
      successCount++;
      console.log('    ✅ categories');
    } catch (err) {
      failCount++;
      console.log(`    ❌ categories: ${err.message}`);
    }
    
    console.log(`\n✅ Cache warm-up completed\! Success: ${successCount}, Failed: ${failCount}`);
    console.log('🚀 Server ready to serve fast responses\!');
    
  } catch (error) {
    console.error('❌ Cache warm-up failed:', error.message);
  }
}
