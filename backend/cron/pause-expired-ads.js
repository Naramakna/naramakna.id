#!/usr/bin/env node

/**
 * Auto-pause expired advertisements cron job
 * This script runs every hour to check and pause ads that have exceeded their duration
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Advertisement } = require('../src/models');
const { Op } = require('sequelize');

async function pauseExpiredAds() {
  try {
    console.log('🕒 Checking for expired advertisements...');
    
    // Use current WIB time for logging, but UTC time for database comparison
    const nowWIB = new Date(Date.now() + (7 * 60 * 60 * 1000));
    const nowUTC = new Date();
    
    console.log(`🕒 Current time: ${nowWIB.toISOString()} WIB (UTC: ${nowUTC.toISOString()})`);
    
    // Find all active ads that have passed their end_date (database stores in UTC)
    const expiredAds = await Advertisement.findAll({
      where: {
        status: 'active',
        end_date: {
          [Op.lt]: nowUTC
        }
      }
    });

    if (expiredAds.length === 0) {
      console.log('✅ No expired ads found.');
      return;
    }

    console.log(`📋 Found ${expiredAds.length} expired ads to pause:`);
    
    // Pause each expired ad
    for (const ad of expiredAds) {
      await ad.update({ 
        status: 'finished',
        updated_at: nowUTC
      });
      
      const duration = ad.duration_hours ? `${ad.duration_hours} hours` : 'custom duration';
      console.log(`⏸️  Paused ad: "${ad.campaign_name}" (ID: ${ad.id}, Duration: ${duration})`);
    }

    console.log(`✅ Successfully paused ${expiredAds.length} expired advertisements.`);
    
  } catch (error) {
    console.error('❌ Error pausing expired ads:', error);
    process.exit(1);
  }
}

// Add method to get ads status summary
async function getAdsSummary() {
  try {
    const summary = await Advertisement.findAll({
      attributes: [
        'status',
        [Advertisement.sequelize.fn('COUNT', Advertisement.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    console.log('\n📊 Current ads status summary:');
    summary.forEach(item => {
      console.log(`  ${item.status}: ${item.dataValues.count} ads`);
    });
    
  } catch (error) {
    console.error('Error getting ads summary:', error);
  }
}

// Run the main function
pauseExpiredAds()
  .then(() => getAdsSummary())
  .then(() => {
    console.log('🏁 Ads cleanup completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });