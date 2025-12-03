/**
 * Google Ads Controller
 * Handles Google Ads API integration endpoints
 */

const googleAdsService = require('../services/googleAdsSimple');

class GoogleAdsController {

  /**
   * Test Google Ads API connection
   * GET /api/google-ads/test-connection
   */
  static async testConnection(req, res) {
    try {
      console.log('🔍 Testing Google Ads API connection...');
      
      const result = await googleAdsService.testConnection();
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Google Ads connection successful',
          data: {
            account: result.account,
            connected: true
          }
        });
      } else {
        // Check if this is a developer token issue
        let statusCode = 400;
        let message = 'Google Ads connection failed';
        
        if (result.error && result.error.includes('developer token is only approved for use with test accounts')) {
          statusCode = 403;
          message = 'Developer token requires Basic Access approval for production accounts';
          result.error = 'Your developer token is currently in "Test Account Access" mode. To access production accounts, you need to apply for Basic or Standard Access in Google Ads API Console.';
        }
        
        res.status(statusCode).json({
          success: false,
          message: message,
          data: {
            error: result.error,
            connected: false,
            requires_basic_access: result.error && result.error.includes('developer token is only approved')
          }
        });
      }
    } catch (error) {
      console.error('❌ Connection test error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to test Google Ads connection',
        error: error.message
      });
    }
  }

  /**
   * Get Google Ads campaigns
   * GET /api/google-ads/campaigns
   */
  static async getCampaigns(req, res) {
    try {
      console.log('📊 Getting Google Ads campaigns...');
      
      const result = await googleAdsService.getCampaigns();
      
      if (result.success && result.campaigns) {
        const campaigns = result.campaigns;
        res.json({
          success: true,
          message: `Retrieved ${campaigns.length} campaigns`,
          data: {
            campaigns,
            count: campaigns.length
          }
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to get campaigns from Google Ads API',
          error: result.error || 'Unknown error'
        });
      }
    } catch (error) {
      console.error('❌ Error getting campaigns:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get Google Ads campaigns',
        error: error.message
      });
    }
  }

  /**
   * Get Google Ads from campaigns
   * GET /api/google-ads/ads
   */
  static async getAds(req, res) {
    try {
      console.log('📊 Getting Google Ads...');
      
      const { campaign_ids } = req.query;
      const campaignIds = campaign_ids ? campaign_ids.split(',').map(id => id.trim()) : [];
      
      const ads = await googleAdsService.getAds(campaignIds);
      
      res.json({
        success: true,
        message: `Retrieved ${ads.length} ads`,
        data: {
          ads,
          count: ads.length
        }
      });
    } catch (error) {
      console.error('❌ Error getting ads:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get Google Ads',
        error: error.message
      });
    }
  }

  /**
   * Sync Google Ads to local database
   * POST /api/google-ads/sync
   */
  static async syncAds(req, res) {
    try {
      console.log('🔄 Starting Google Ads sync...');
      
      const result = await googleAdsService.syncAdsToDatabase();
      
      res.json({
        success: true,
        message: 'Google Ads sync completed successfully',
        data: result
      });
    } catch (error) {
      console.error('❌ Sync error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sync Google Ads',
        error: error.message
      });
    }
  }

  /**
   * Get sync status and statistics
   * GET /api/google-ads/status
   */
  static async getSyncStatus(req, res) {
    try {
      console.log('📊 Getting Google Ads sync status...');
      
      const status = await googleAdsService.getSyncStatus();
      
      res.json({
        success: true,
        message: 'Sync status retrieved',
        data: status
      });
    } catch (error) {
      console.error('❌ Error getting sync status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get sync status',
        error: error.message
      });
    }
  }

  /**
   * Run scheduled sync (for cron jobs)
   * POST /api/google-ads/schedule-sync
   */
  static async scheduleSync(req, res) {
    try {
      console.log('⏰ Running scheduled Google Ads sync...');
      
      // Check if request has valid auth (for security)
      const { sync_token } = req.body;
      const expectedToken = process.env.GOOGLE_ADS_SYNC_TOKEN || 'secure_sync_token_123';
      
      if (!sync_token || sync_token !== expectedToken) {
        return res.status(401).json({
          success: false,
          message: 'Invalid sync token'
        });
      }
      
      const result = await googleAdsService.scheduleSync();
      
      res.json({
        success: true,
        message: 'Scheduled sync completed',
        data: result
      });
    } catch (error) {
      console.error('❌ Scheduled sync error:', error);
      res.status(500).json({
        success: false,
        message: 'Scheduled sync failed',
        error: error.message
      });
    }
  }

  /**
   * Get Google Ads configuration info
   * GET /api/google-ads/config
   */
  static async getConfig(req, res) {
    try {
      const config = {
        customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID || null,
        has_client_id: !!process.env.GOOGLE_ADS_CLIENT_ID,
        has_client_secret: !!process.env.GOOGLE_ADS_CLIENT_SECRET,
        has_refresh_token: !!process.env.GOOGLE_ADS_REFRESH_TOKEN,
        has_developer_token: !!process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
        configured: !!(
          process.env.GOOGLE_ADS_CLIENT_ID &&
          process.env.GOOGLE_ADS_CLIENT_SECRET &&
          process.env.GOOGLE_ADS_REFRESH_TOKEN &&
          process.env.GOOGLE_ADS_DEVELOPER_TOKEN &&
          process.env.GOOGLE_ADS_CUSTOMER_ID
        )
      };
      
      res.json({
        success: true,
        message: 'Configuration status retrieved',
        data: config
      });
    } catch (error) {
      console.error('❌ Error getting config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get configuration',
        error: error.message
      });
    }
  }

  /**
   * Create Display Campaign
   * POST /api/google-ads/create-display-campaign
   */
  static async createDisplayCampaign(req, res) {
    try {
      console.log('🎨 Creating display campaign...');
      
      const { 
        name, 
        dailyBudget, 
        maxCpc, 
        headlines, 
        descriptions, 
        landingUrl, 
        imageUrls 
      } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Campaign name is required'
        });
      }

      const result = await googleAdsService.createDisplayCampaign({
        name,
        dailyBudget: dailyBudget || 3500,
        maxCpc: maxCpc || 500,
        headlines: headlines || ['Naramakna - Portal Berita Terpercaya', 'Baca Berita Terkini'],
        descriptions: descriptions || ['Dapatkan informasi terpercaya dari Naramakna'],
        landingUrl: landingUrl || 'https://naramakna.id',
        imageUrls: imageUrls || []
      });

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: {
            campaignId: result.campaignId,
            adGroupId: result.adGroupId,
            adId: result.adId
          }
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to create display campaign',
          error: result.error
        });
      }
    } catch (error) {
      console.error('❌ Error creating display campaign:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create display campaign',
        error: error.message
      });
    }
  }
}

module.exports = {
  testConnection: GoogleAdsController.testConnection,
  getCampaigns: GoogleAdsController.getCampaigns,
  createDisplayCampaign: GoogleAdsController.createDisplayCampaign,
  getAds: GoogleAdsController.getAds,
  syncAds: GoogleAdsController.syncAds,
  getSyncStatus: GoogleAdsController.getSyncStatus,
  scheduleSync: GoogleAdsController.scheduleSync,
  getConfig: GoogleAdsController.getConfig
};