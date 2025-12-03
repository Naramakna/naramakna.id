// Cron job untuk update trending topics secara otomatis
const cron = require('node-cron');
const axios = require('axios');
const logger = require('../src/utils/logger');

class TrendingUpdater {
  constructor() {
    this.isRunning = false;
    this.lastUpdate = null;
  }

  /**
   * Start trending update cron job
   * Runs every 6 hours by default
   **/
  start(cronExpression = '0 */6 * * *') {
    logger.info('Starting Trending update cron job...');
    
    // Schedule the update job
    cron.schedule(cronExpression, async () => {
      await this.performUpdate();
    }, {
      scheduled: true,
      timezone: "Asia/Jakarta"
    });

    // Also run an immediate update on startup
    this.performInitialUpdate();
    
    logger.info(`Trending update cron job scheduled with expression: ${cronExpression}`);
  }

  /**
   * Perform initial update on startup
   **/
  async performInitialUpdate() {
    // Wait a bit to let the server fully start
    setTimeout(async () => {
      logger.info('Performing initial trending update...');
      await this.performUpdate();
    }, 30000); // 30 seconds delay
  }

  /**
   * Perform trending update
   **/
  async performUpdate() {
    if (this.isRunning) {
      logger.warn('Trending update already in progress, skipping...');
      return;
    }

    this.isRunning = true;

    try {
      logger.info('Starting trending topics update...');

      // Call the update endpoint
      const response = await axios.post('http://localhost:3001/api/trending/update', {}, {
        timeout: 60000 // 60 seconds timeout
      });

      if (response.data.success) {
        this.lastUpdate = new Date();
        logger.info(`Trending update success: ${JSON.stringify(response.data.data)}`);
      } else {
        logger.error('Trending update failed:', response.data);
      }

    } catch (error) {
      logger.error('Error updating trending topics:', error.message);
    } finally {
      this.isRunning = false;
    }
  }
}

// Export and auto-start
if (require.main === module) {
  const updater = new TrendingUpdater();
  updater.start();
}

module.exports = TrendingUpdater;
