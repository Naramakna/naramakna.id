/**
 * Google Ads API Service
 * Handles Google Ads API integration for automatic ad sync
 */

const { Advertisement, User } = require('../models');
const { GoogleAdsApi, enums } = require('google-ads-api');

class GoogleAdsService {
  constructor() {
    this.client = null;
    this.customerId = process.env.GOOGLE_ADS_CUSTOMER_ID || null;
    this.initialized = false;
  }

  /**
   * Initialize Google Ads API client
   */
  async initialize() {
    try {
      if (this.initialized && this.client) {
        return this.client;
      }

      // Check for required environment variables
      const requiredEnvVars = [
        'GOOGLE_ADS_CLIENT_ID',
        'GOOGLE_ADS_CLIENT_SECRET', 
        'GOOGLE_ADS_REFRESH_TOKEN',
        'GOOGLE_ADS_DEVELOPER_TOKEN',
        'GOOGLE_ADS_CUSTOMER_ID'
      ];

      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
      }

      this.client = new GoogleAdsApi({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
        developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      });

      this.customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
      this.initialized = true;
      
      console.log('✅ Google Ads API client initialized successfully');
      return this.client;
    } catch (error) {
      console.error('❌ Failed to initialize Google Ads API client:', error.message);
      throw error;
    }
  }

  /**
   * Test connection to Google Ads API using HTTP requests (fallback method)
   */
  async testConnection() {
    try {
      console.log('🔍 Testing Google Ads API connection using HTTP fallback...');
      
      // Get fresh access token
      const tokenResponse = await this.getAccessToken();
      if (!tokenResponse.success) {
        throw new Error(`Failed to get access token: ${tokenResponse.error}`);
      }

      const accessToken = tokenResponse.access_token;
      const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
      
      console.log(`📡 Testing with Customer ID: ${customerId}`);

      // Test with direct HTTP API call
      const axios = require('axios');
      const response = await axios.post(
        `https://googleads.googleapis.com/v21/customers/${customerId}/googleAds:search`,
        {
          query: "SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone FROM customer LIMIT 1"
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.results && response.data.results.length > 0) {
        const accountInfo = response.data.results[0].customer;
        console.log('✅ Google Ads HTTP connection successful:', {
          id: accountInfo.id,
          name: accountInfo.descriptiveName,
          currency: accountInfo.currencyCode,
          timezone: accountInfo.timeZone
        });
        
        return {
          success: true,
          account: {
            id: accountInfo.id,
            descriptive_name: accountInfo.descriptiveName,
            currency_code: accountInfo.currencyCode,
            time_zone: accountInfo.timeZone
          }
        };
      } else {
        throw new Error('No account data returned from HTTP API');
      }
    } catch (error) {
      console.error('❌ Google Ads HTTP connection test failed:', error.message);
      if (error.response) {
        console.error('HTTP Status:', error.response.status);
        console.error('HTTP Headers:', error.response.headers);
        console.error('HTTP Error Response:', JSON.stringify(error.response.data, null, 2));
      }
      console.error('Request config:', error.config);
      return {
        success: false,
        error: error.message,
        details: error.response ? JSON.stringify(error.response.data) : JSON.stringify(error, Object.getOwnPropertyNames(error))
      };
    }
  }

  /**
   * Get fresh access token from refresh token
   */
  async getAccessToken() {
    try {
      const axios = require('axios');
      const response = await axios.post('https://oauth2.googleapis.com/token', 
        new URLSearchParams({
          client_id: process.env.GOOGLE_ADS_CLIENT_ID,
          client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
          refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
          grant_type: 'refresh_token'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return {
        success: true,
        access_token: response.data.access_token,
        expires_in: response.data.expires_in
      };
    } catch (error) {
      console.error('❌ Failed to get access token:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all active campaigns from Google Ads
   */
  async getCampaigns() {
    try {
      await this.initialize();
      
      const customer = this.client.Customer({
        customer_id: this.customerId,
        refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
      });

      const response = await customer.query(`
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.start_date,
          campaign.end_date,
          campaign.advertising_channel_type,
          campaign.budget,
          campaign_budget.amount_micros,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.cost_micros
        FROM campaign 
        WHERE campaign.status = 'ENABLED'
        ORDER BY campaign.name
      `);

      const campaigns = response.map(row => ({
        id: row.campaign.id,
        name: row.campaign.name,
        status: row.campaign.status,
        start_date: row.campaign.start_date,
        end_date: row.campaign.end_date,
        type: row.campaign.advertising_channel_type,
        budget_micros: row.campaign_budget?.amount_micros || 0,
        budget: row.campaign_budget?.amount_micros ? (row.campaign_budget.amount_micros / 1000000) : 0,
        impressions: row.metrics?.impressions || 0,
        clicks: row.metrics?.clicks || 0,
        ctr: row.metrics?.ctr || 0,
        cost_micros: row.metrics?.cost_micros || 0,
        cost: row.metrics?.cost_micros ? (row.metrics.cost_micros / 1000000) : 0
      }));

      console.log(`📊 Retrieved ${campaigns.length} active campaigns from Google Ads`);
      return campaigns;
    } catch (error) {
      console.error('❌ Failed to get Google Ads campaigns:', error.message);
      throw error;
    }
  }

  /**
   * Get ads from specific campaigns
   */
  async getAds(campaignIds = []) {
    try {
      await this.initialize();
      
      const customer = this.client.Customer({
        customer_id: this.customerId,
        refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
      });

      let whereClause = '';
      if (campaignIds.length > 0) {
        whereClause = `WHERE campaign.id IN (${campaignIds.join(',')})`;
      }

      const response = await customer.query(`
        SELECT 
          ad_group_ad.ad.id,
          ad_group_ad.ad.name,
          ad_group_ad.ad.final_urls,
          ad_group_ad.ad.display_url,
          ad_group_ad.status,
          campaign.id AS campaign_id,
          campaign.name AS campaign_name,
          ad_group.id AS ad_group_id,
          ad_group.name AS ad_group_name,
          ad_group_ad.ad.type,
          ad_group_ad.ad.responsive_display_ad.headlines,
          ad_group_ad.ad.responsive_display_ad.descriptions,
          ad_group_ad.ad.responsive_display_ad.marketing_images,
          ad_group_ad.ad.image_ad.image_url,
          ad_group_ad.ad.text_ad.headline,
          ad_group_ad.ad.text_ad.description1,
          ad_group_ad.ad.text_ad.description2,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr
        FROM ad_group_ad 
        ${whereClause}
        AND ad_group_ad.status = 'ENABLED'
        ORDER BY campaign.name, ad_group.name
      `);

      const ads = response.map(row => {
        const ad = row.ad_group_ad.ad;
        const metrics = row.metrics;
        
        // Extract ad content based on ad type
        let adContent = '';
        let mediaUrl = '';
        
        if (ad.type === 'RESPONSIVE_DISPLAY_AD' && ad.responsive_display_ad) {
          const rda = ad.responsive_display_ad;
          const headline = rda.headlines?.[0]?.text || '';
          const description = rda.descriptions?.[0]?.text || '';
          const imageAsset = rda.marketing_images?.[0];
          
          adContent = `<div class="google-ad-responsive">
            <h3>${headline}</h3>
            <p>${description}</p>
          </div>`;
          
          if (imageAsset?.asset?.image_asset?.full_size_image_url) {
            mediaUrl = imageAsset.asset.image_asset.full_size_image_url;
          }
        } else if (ad.type === 'IMAGE_AD' && ad.image_ad) {
          mediaUrl = ad.image_ad.image_url;
          adContent = `<img src="${mediaUrl}" alt="${ad.name || 'Google Ad'}" />`;
        } else if (ad.type === 'TEXT_AD' && ad.text_ad) {
          const textAd = ad.text_ad;
          adContent = `<div class="google-ad-text">
            <h3>${textAd.headline}</h3>
            <p>${textAd.description1}</p>
            ${textAd.description2 ? `<p>${textAd.description2}</p>` : ''}
          </div>`;
        }

        return {
          google_ad_id: ad.id,
          name: ad.name || `${row.campaign.name} - ${row.ad_group.name}`,
          campaign_id: row.campaign.id,
          campaign_name: row.campaign.name,
          ad_group_id: row.ad_group.id,
          ad_group_name: row.ad_group.name,
          type: ad.type,
          status: row.ad_group_ad.status,
          final_urls: ad.final_urls,
          display_url: ad.display_url,
          ad_content: adContent,
          media_url: mediaUrl,
          impressions: metrics?.impressions || 0,
          clicks: metrics?.clicks || 0,
          ctr: metrics?.ctr || 0
        };
      });

      console.log(`📊 Retrieved ${ads.length} ads from Google Ads`);
      return ads;
    } catch (error) {
      console.error('❌ Failed to get Google Ads:', error.message);
      throw error;
    }
  }

  /**
   * Sync Google Ads to local database
   */
  async syncAdsToDatabase() {
    try {
      console.log('🔄 Starting Google Ads sync...');
      
      // Get system user for ads (create if doesn't exist)
      let systemUser = await User.findOne({ 
        where: { user_login: 'google_ads_system' } 
      });
      
      if (!systemUser) {
        systemUser = await User.create({
          user_login: 'google_ads_system',
          user_nicename: 'google_ads_system',
          user_email: 'naramaknaskt@gmail.com',
          user_pass: '$2b$10$dummy.hash.for.system.user.google.ads.sync',
          display_name: 'Google Ads System',
          user_status: 1,
          user_registered: new Date()
        });
        console.log('📝 Created system user for Google Ads');
      }

      // Get active campaigns
      const campaigns = await this.getCampaigns();
      if (campaigns.length === 0) {
        console.log('ℹ️ No active campaigns found');
        return { synced: 0, campaigns: 0 };
      }

      // Get ads from all campaigns
      const campaignIds = campaigns.map(c => c.id);
      const googleAds = await this.getAds(campaignIds);
      
      if (googleAds.length === 0) {
        console.log('ℹ️ No ads found in campaigns');
        return { synced: 0, campaigns: campaigns.length };
      }

      // Sync each ad to database
      let syncedCount = 0;
      const syncResults = [];

      for (const googleAd of googleAds) {
        try {
          // Check if ad already exists
          const existingAd = await Advertisement.findOne({
            where: {
              ad_content: { [require('sequelize').Op.like]: `%google_ad_id:${googleAd.google_ad_id}%` }
            }
          });

          const adData = {
            advertiser_id: systemUser.ID,
            campaign_name: `[Google Ads] ${googleAd.campaign_name}`,
            start_date: new Date(), // Current date as start
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            placement_type: 'regular', // Default placement
            media_type: 'google_ads',
            media_url: googleAd.media_url || null,
            target_url: googleAd.final_urls?.[0] || googleAd.display_url,
            ad_content: `<!-- google_ad_id:${googleAd.google_ad_id} -->\n${googleAd.ad_content}`,
            google_ads_code: googleAd.ad_content,
            status: googleAd.status === 'ENABLED' ? 'active' : 'paused',
            impressions: googleAd.impressions,
            clicks: googleAd.clicks
          };

          if (existingAd) {
            // Update existing ad
            await existingAd.update({
              ...adData,
              impressions: googleAd.impressions,
              clicks: googleAd.clicks,
              status: googleAd.status === 'ENABLED' ? 'active' : 'paused'
            });
            syncResults.push({ action: 'updated', ad: googleAd.name });
          } else {
            // Create new ad
            await Advertisement.create(adData);
            syncResults.push({ action: 'created', ad: googleAd.name });
            syncedCount++;
          }
        } catch (adError) {
          console.error(`❌ Failed to sync ad ${googleAd.name}:`, adError.message);
          syncResults.push({ action: 'error', ad: googleAd.name, error: adError.message });
        }
      }

      console.log(`✅ Google Ads sync completed. Synced: ${syncedCount} ads`);
      console.log('📊 Sync results:', syncResults);

      return {
        synced: syncedCount,
        campaigns: campaigns.length,
        total_ads: googleAds.length,
        results: syncResults
      };

    } catch (error) {
      console.error('❌ Google Ads sync failed:', error.message);
      throw error;
    }
  }

  /**
   * Get sync status and statistics
   */
  async getSyncStatus() {
    try {
      const googleAdsCount = await Advertisement.count({
        where: { media_type: 'google_ads' }
      });

      const activeGoogleAdsCount = await Advertisement.count({
        where: { 
          media_type: 'google_ads',
          status: 'active'
        }
      });

      const connectionTest = await this.testConnection();

      return {
        connected: connectionTest.success,
        account: connectionTest.account || null,
        error: connectionTest.error || null,
        local_google_ads: googleAdsCount,
        active_google_ads: activeGoogleAdsCount,
        last_sync: await this.getLastSyncTime()
      };
    } catch (error) {
      console.error('❌ Failed to get sync status:', error.message);
      return {
        connected: false,
        error: error.message,
        local_google_ads: 0,
        active_google_ads: 0,
        last_sync: null
      };
    }
  }

  /**
   * Get last sync time from database
   */
  async getLastSyncTime() {
    try {
      const lastGoogleAd = await Advertisement.findOne({
        where: { media_type: 'google_ads' },
        order: [['updated_at', 'DESC']],
        attributes: ['updated_at']
      });

      return lastGoogleAd?.updated_at || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Schedule automatic sync (called by cron job)
   */
  async scheduleSync() {
    try {
      console.log('⏰ Running scheduled Google Ads sync...');
      const result = await this.syncAdsToDatabase();
      console.log('✅ Scheduled sync completed:', result);
      return result;
    } catch (error) {
      console.error('❌ Scheduled sync failed:', error.message);
      throw error;
    }
  }
}

// Singleton instance
const googleAdsService = new GoogleAdsService();

module.exports = googleAdsService;