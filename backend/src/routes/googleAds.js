/**
 * Google Ads Routes
 * Handles Google Ads API integration endpoints
 */

const express = require('express');
const router = express.Router();
const googleAdsController = require('../controllers/googleAdsController');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');

/**
 * Test Google Ads API connection
 * GET /api/google-ads/test-connection
 */
router.get('/test-connection', requireAuth, googleAdsController.testConnection);

/**
 * Get Google Ads configuration status
 * GET /api/google-ads/config
 */
router.get('/config', requireAuth, googleAdsController.getConfig);

/**
 * Get sync status and statistics
 * GET /api/google-ads/status
 */
router.get('/status', requireAuth, googleAdsController.getSyncStatus);

/**
 * Get Google Ads campaigns
 * GET /api/google-ads/campaigns
 */
router.get('/campaigns', requireAuth, requireSuperAdmin, googleAdsController.getCampaigns);

/**
 * Get Google Ads from campaigns
 * GET /api/google-ads/ads
 * Query params: campaign_ids (comma-separated list)
 */
router.get('/ads', requireSuperAdmin, googleAdsController.getAds);

/**
 * Sync Google Ads to local database
 * POST /api/google-ads/sync
 */
router.post('/sync', requireSuperAdmin, googleAdsController.syncAds);

/**
 * Run scheduled sync (for cron jobs)
 * POST /api/google-ads/schedule-sync
 * Body: { sync_token: "secure_token" }
 */
router.post('/schedule-sync', googleAdsController.scheduleSync);

/**
 * Create Display Campaign
 * POST /api/google-ads/create-display-campaign
 */
router.post('/create-display-campaign', requireAuth, requireSuperAdmin, googleAdsController.createDisplayCampaign);

module.exports = router;