#!/usr/bin/env node
/**
 * Google Ads Auto-Sync Cron Job
 * Automatically syncs Google Ads campaigns to local database
 * 
 * Usage:
 * - Run once: node cron/google-ads-sync.js
 * - Schedule with cron: 0 6,12,18 * * * (every 6 hours)
 * - Schedule with cron: 0 2 * * * (every day at 2 AM)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const axios = require('axios');

class GoogleAdsSyncCron {
  constructor() {
    this.baseURL = process.env.API_BASE_URL || 'http://localhost:3001/api';
    this.syncToken = process.env.GOOGLE_ADS_SYNC_TOKEN || 'secure_sync_token_123';
    this.enabled = process.env.GOOGLE_ADS_AUTO_SYNC === 'true';
  }

  async run() {
    console.log('🤖 Google Ads Auto-Sync Cron Job Started');
    console.log('⏰ Time:', new Date().toISOString());

    try {
      // Check if auto-sync is enabled
      if (!this.enabled) {
        console.log('ℹ️ Google Ads auto-sync is disabled. Set GOOGLE_ADS_AUTO_SYNC=true to enable.');
        return;
      }

      // Check basic environment variables directly
      const requiredEnvVars = [
        'GOOGLE_ADS_CLIENT_ID',
        'GOOGLE_ADS_CLIENT_SECRET', 
        'GOOGLE_ADS_REFRESH_TOKEN',
        'GOOGLE_ADS_DEVELOPER_TOKEN',
        'GOOGLE_ADS_CUSTOMER_ID'
      ];

      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      if (missingVars.length > 0) {
        console.log('⚠️ Google Ads API is not configured. Missing environment variables:', missingVars);
        return;
      }

      console.log('✅ Google Ads environment variables configured');
      console.log('📊 Customer ID:', process.env.GOOGLE_ADS_CUSTOMER_ID);

      // Run the sync directly
      const syncResult = await this.runSync();
      
      console.log('✅ Google Ads sync completed successfully');
      console.log('📊 Sync Results:', {
        campaigns: syncResult.campaigns,
        total_ads: syncResult.total_ads,
        synced: syncResult.synced,
        actions: syncResult.results?.length || 0
      });

      // Log details if there were actions
      if (syncResult.results && syncResult.results.length > 0) {
        const actions = syncResult.results.reduce((acc, result) => {
          acc[result.action] = (acc[result.action] || 0) + 1;
          return acc;
        }, {});
        console.log('📈 Actions taken:', actions);
      }

    } catch (error) {
      console.error('❌ Google Ads sync cron job failed:', error.message);
      
      // Log more details for debugging
      if (error.response) {
        console.error('🔍 Response status:', error.response.status);
        console.error('🔍 Response data:', error.response.data);
      }
      
      process.exit(1);
    }
  }

  async checkConfiguration() {
    try {
      const response = await axios.get(`${this.baseURL}/google-ads/config`);
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to check Google Ads configuration:', error.message);
      throw error;
    }
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseURL}/google-ads/test-connection`);
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to test Google Ads connection:', error.message);
      throw error;
    }
  }

  async runSync() {
    try {
      const response = await axios.post(`${this.baseURL}/google-ads/schedule-sync`, {
        sync_token: this.syncToken
      });
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to run Google Ads sync:', error.message);
      throw error;
    }
  }
}

// Run the cron job
if (require.main === module) {
  const cronJob = new GoogleAdsSyncCron();
  cronJob.run()
    .then(() => {
      console.log('🎉 Google Ads sync cron job completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Google Ads sync cron job failed:', error.message);
      process.exit(1);
    });
}

module.exports = GoogleAdsSyncCron;