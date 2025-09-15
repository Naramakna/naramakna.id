#!/usr/bin/env node

/**
 * Cronjob script to update trending topics
 * Run daily at 5 AM: 0 5 * * * /usr/bin/node /var/www/naramakna.id/cron/update-trending.cjs
 */

const axios = require('axios');

async function updateTrending() {
  try {
    console.log(`[${new Date().toISOString()}] 🔄 Starting trending topics update...`);
    
    // Call our internal API to update trending topics
    const response = await axios.post('http://localhost:3001/api/trending/update', {}, {
      timeout: 120000, // 2 minutes timeout
      headers: {
        'User-Agent': 'TrendingCronjob/1.0'
      }
    });
    
    if (response.data.success) {
      console.log(`[${new Date().toISOString()}] ✅ Trending update successful:`, {
        topicsFound: response.data.data.topicsFound,
        articlesMatched: response.data.data.articlesMatched
      });
    } else {
      console.error(`[${new Date().toISOString()}] ❌ Trending update failed:`, response.data.message);
    }
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error updating trending topics:`, error.message);
    
    // Log to file for debugging
    const fs = require('fs');
    const path = require('path');
    const logFile = path.join(__dirname, '../logs/trending-cron.log');
    
    const logEntry = `[${new Date().toISOString()}] ERROR: ${error.message}\n`;
    
    try {
      // Ensure logs directory exists
      const logsDir = path.dirname(logFile);
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      
      fs.appendFileSync(logFile, logEntry);
    } catch (logError) {
      console.error('Failed to write to log file:', logError.message);
    }
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log(`[${new Date().toISOString()}] 🛑 Trending cronjob terminated`);
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log(`[${new Date().toISOString()}] 🛑 Trending cronjob interrupted`);
  process.exit(0);
});

// Run the update
updateTrending()
  .then(() => {
    console.log(`[${new Date().toISOString()}] 🏁 Trending cronjob completed`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`[${new Date().toISOString()}] 💥 Trending cronjob failed:`, error.message);
    process.exit(1);
  });