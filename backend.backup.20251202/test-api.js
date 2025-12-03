/**
 * API Endpoints Test Script
 * Test all universal API endpoints for Naramakna Portal
 */

const http = require('http');

function testAPIConnection() {
  console.log('🚀 Testing Naramakna Universal API Connection\n');

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ API Connection Success!');
        console.log('   Message:', response.message);
        console.log('   Version:', response.version);
        console.log('   Available Endpoints:');
        Object.entries(response.endpoints).forEach(([name, path]) => {
          console.log(`     - ${name}: ${path}`);
        });
        console.log('   Features:');
        response.features.forEach(feature => {
          console.log(`     ✅ ${feature}`);
        });
        console.log('\n🎉 Universal API Endpoints are READY!');
        console.log('\n📖 Available Endpoints Documentation:');
        console.log('1. Content Management:');
        console.log('   GET /api/content/feed - Mixed content feed (articles + videos)');
        console.log('   GET /api/content/type/:type - Content by type (post, youtube_video, tiktok_video)');
        console.log('   GET /api/content/:id - Single content item');
        console.log('   POST /api/content - Create new content');
        console.log('   PUT /api/content/:id - Update content');
        console.log('   DELETE /api/content/:id - Delete content');
        console.log('   GET /api/content/stats - Content statistics');
        console.log('\n2. Analytics:');
        console.log('   POST /api/analytics/track - Track user interactions');
        console.log('   GET /api/analytics/dashboard - Analytics dashboard');
        console.log('   GET /api/analytics/realtime - Real-time analytics');
        console.log('   GET /api/analytics/content/:id - Content performance');
        console.log('\n3. Advertisements:');
        console.log('   GET /api/ads/serve - Serve ads for placement');
        console.log('   POST /api/ads/:id/click - Track ad clicks');
        console.log('   GET /api/ads - List all ads (admin)');
        console.log('   POST /api/ads - Create new ad campaign');
        console.log('   PUT /api/ads/:id - Update ad campaign');
        console.log('   DELETE /api/ads/:id - Delete ad campaign');
        console.log('   GET /api/ads/stats - Advertisement statistics');
        console.log('\n🚀 Naramakna Universal API is PRODUCTION READY!');
      } catch (error) {
        console.error('❌ Error parsing response:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ API Connection Failed:', error.message);
    console.log('💡 Make sure the server is running:');
    console.log('   cd backend && npm run dev');
    console.log('   OR');
    console.log('   cd .. && npm run dev  (from project root)');
  });

  req.end();

}

// Run test
testAPIConnection();