/**
 * Simple Google Ads Service
 * Direct API calls without complex SDK
 */

const axios = require('axios');

class GoogleAdsSimpleService {
  constructor() {
    this.clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
    this.refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;
    this.developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    this.customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
    
    console.log('🔧 Google Ads Config:');
    console.log('Client ID:', this.clientId ? 'Present' : 'Missing');
    console.log('Client Secret:', this.clientSecret ? 'Present' : 'Missing');
    console.log('Refresh Token:', this.refreshToken ? 'Present' : 'Missing');
    console.log('Developer Token:', this.developerToken || 'Missing');
    console.log('Customer ID:', this.customerId || 'Missing');
  }

  /**
   * Get access token from refresh token
   */
  async getAccessToken() {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token'
      });

      return response.data.access_token;
    } catch (error) {
      console.error('❌ Failed to get access token:', error.message);
      console.error('Response:', error.response?.data);
      throw error;
    }
  }

  /**
   * Test connection to Google Ads API
   */
  async testConnection() {
    try {
      console.log('🔍 Testing Google Ads connection...');
      
      // Get fresh access token
      const accessToken = await this.getAccessToken();
      console.log('✅ Got access token');

      // Test basic API call - list accessible customers first
      const response = await axios.get(
        `https://googleads.googleapis.com/v21/customers:listAccessibleCustomers`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': this.developerToken,
            'login-customer-id': this.customerId,
            'Content-Type': 'application/json'
          }
        }
      );

      const customers = response.data.resourceNames || [];
      
      console.log('🔍 Available customers:', customers);
      
      return {
        success: true,
        account: {
          id: this.customerId,
          descriptive_name: "Naramakna",
          currency_code: "IDR",
          time_zone: "Asia/Jakarta",
          status: "ENABLED",
          available_customers: customers,
          total_count: customers.length
        }
      };
    } catch (error) {
      console.error('❌ Google Ads connection failed:', error.message);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Full error:', JSON.stringify({
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      }, null, 2));
      
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        debug: {
          status: error.response?.status,
          data: error.response?.data
        }
      };
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus() {
    try {
      // Test connection first
      const connectionTest = await this.testConnection();
      
      if (!connectionTest.success) {
        return {
          connected: false,
          account: null,
          error: connectionTest.error,
          local_google_ads: 0,
          active_google_ads: 0,
          last_sync: null
        };
      }
      
      // TODO: Get real counts from database
      // For now return connected status
      return {
        connected: true,
        account: connectionTest.account,
        error: null,
        local_google_ads: 0, // TODO: count from local DB
        active_google_ads: 0, // TODO: count from Google Ads API
        last_sync: null // TODO: get from sync log
      };
    } catch (error) {
      console.error('❌ Error getting sync status:', error.message);
      return {
        connected: false,
        account: null,
        error: error.message,
        local_google_ads: 0,
        active_google_ads: 0,
        last_sync: null
      };
    }
  }

  /**
   * Get campaigns
   */
  async getCampaigns() {
    try {
      const accessToken = await this.getAccessToken();
      
      const query = `
        SELECT 
          campaign.id,
          campaign.name, 
          campaign.status,
          campaign.start_date,
          campaign.end_date,
          campaign.advertising_channel_type,
          campaign_budget.amount_micros,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.cost_micros
        FROM campaign 
        WHERE segments.date DURING LAST_30_DAYS
        LIMIT 50
      `;
      
      const response = await axios.post(
        `https://googleads.googleapis.com/v21/customers/${this.customerId}/googleAds:search`,
        { query },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': this.developerToken,
            'login-customer-id': this.customerId,
            'Content-Type': 'application/json'
          }
        }
      );

      // Transform Google Ads response to frontend format
      const campaigns = (response.data.results || []).map(result => {
        const campaign = result.campaign;
        const budget = result.campaignBudget;
        const metrics = result.metrics || {};
        
        return {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          start_date: campaign.startDate || '',
          end_date: campaign.endDate === '2037-12-30' ? '' : campaign.endDate || '', // Google Ads default end date
          type: campaign.advertisingChannelType || 'SEARCH',
          budget: budget?.amountMicros ? Math.round(budget.amountMicros / 1000000) : 3500, // Budget in IDR
          impressions: parseInt(metrics.impressions || 0),
          clicks: parseInt(metrics.clicks || 0),
          ctr: parseFloat(metrics.ctr || 0),
          cost: metrics.costMicros ? Math.round(metrics.costMicros / 1000000) : 0 // Cost in IDR
        };
      });

      return {
        success: true,
        campaigns
      };
    } catch (error) {
      console.error('❌ Failed to get campaigns:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get ads (display ads with creative assets) from campaigns
   */
  async getAds(campaignIds = []) {
    try {
      const accessToken = await this.getAccessToken();
      
      let whereClause = '';
      if (campaignIds.length > 0) {
        const campaignIdsList = campaignIds.map(id => `'${id}'`).join(',');
        whereClause = `WHERE campaign.id IN (${campaignIdsList})`;
      }
      
      const query = `
        SELECT 
          campaign.id,
          campaign.name,
          ad_group.id,
          ad_group.name,
          ad_group_ad.ad.id,
          ad_group_ad.ad.type,
          ad_group_ad.ad.responsive_display_ad.headlines,
          ad_group_ad.ad.responsive_display_ad.descriptions,
          ad_group_ad.ad.responsive_display_ad.marketing_images,
          ad_group_ad.ad.responsive_display_ad.final_urls,
          ad_group_ad.status,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.cost_micros
        FROM ad_group_ad 
        ${whereClause}
        AND ad_group_ad.ad.type = 'RESPONSIVE_DISPLAY_AD'
        AND segments.date DURING LAST_30_DAYS
        LIMIT 50
      `;
      
      const response = await axios.post(
        `https://googleads.googleapis.com/v21/customers/${this.customerId}/googleAds:search`,
        { query },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': this.developerToken,
            'login-customer-id': this.customerId,
            'Content-Type': 'application/json'
          }
        }
      );

      // Transform Google Ads response to local format
      const ads = (response.data.results || []).map(result => {
        const campaign = result.campaign;
        const adGroup = result.adGroup;
        const ad = result.adGroupAd?.ad;
        const responsiveAd = ad?.responsiveDisplayAd;
        const metrics = result.metrics || {};
        
        return {
          google_ad_id: ad?.id || '',
          name: `${campaign.name} - Display Ad`,
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          ad_group_id: adGroup?.id || '',
          ad_group_name: adGroup?.name || '',
          type: 'responsive_display_ad',
          status: result.adGroupAd?.status || 'ENABLED',
          final_urls: responsiveAd?.finalUrls || [],
          display_url: responsiveAd?.finalUrls?.[0] || '',
          ad_content: responsiveAd?.headlines?.[0]?.text || '',
          media_url: responsiveAd?.marketingImages?.[0]?.asset || '',
          impressions: parseInt(metrics.impressions || 0),
          clicks: parseInt(metrics.clicks || 0),
          ctr: parseFloat(metrics.ctr || 0),
          cost: metrics.costMicros ? Math.round(metrics.costMicros / 1000000) : 0
        };
      });

      return {
        success: true,
        ads
      };
    } catch (error) {
      console.error('❌ Failed to get ads:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create Display Campaign with Responsive Display Ads
   */
  async createDisplayCampaign(campaignData) {
    try {
      const accessToken = await this.getAccessToken();
      
      // 1. Create Campaign Budget first
      const budgetResource = await this.createCampaignBudget(accessToken, {
        name: `${campaignData.name} Budget`,
        amountMicros: (campaignData.dailyBudget || 5000) * 1000000, // Convert to micros
        deliveryMethod: 'STANDARD'
      });
      
      // 2. Create Display Campaign
      const campaignResource = await this.createCampaign(accessToken, {
        name: campaignData.name,
        advertisingChannelType: 'DISPLAY',
        campaignBudget: budgetResource,
        status: 'PAUSED', // Start paused for safety
        startDate: new Date().toISOString().split('T')[0].replace(/-/g, ''),
        targetingSettings: {
          targetRestrictions: [
            {
              targetingDimension: 'AUDIENCE',
              bidOnly: false
            }
          ]
        }
      });

      // 3. Create Ad Group
      const adGroupResource = await this.createAdGroup(accessToken, {
        name: `${campaignData.name} - Display AdGroup`,
        campaign: campaignResource,
        type: 'DISPLAY_STANDARD',
        status: 'ENABLED',
        cpcBidMicros: (campaignData.maxCpc || 500) * 1000000 // Convert to micros
      });

      // 4. Create Responsive Display Ad
      const responsiveDisplayAd = await this.createResponsiveDisplayAd(accessToken, {
        adGroup: adGroupResource,
        headlines: campaignData.headlines || ['Naramakna - Portal Berita Terpercaya'],
        descriptions: campaignData.descriptions || ['Baca artikel berkualitas dan berita terkini di Naramakna'],
        finalUrls: [campaignData.landingUrl || 'https://naramakna.id'],
        businessName: 'Naramakna',
        marketingImages: campaignData.imageUrls || []
      });

      return {
        success: true,
        campaignId: campaignResource.split('/').pop(),
        adGroupId: adGroupResource.split('/').pop(), 
        adId: responsiveDisplayAd.split('/').pop(),
        message: 'Display campaign created successfully'
      };

    } catch (error) {
      console.error('❌ Failed to create display campaign:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Helper: Create Campaign Budget
   */
  async createCampaignBudget(accessToken, budgetData) {
    const operation = {
      operations: [{
        create: {
          name: budgetData.name,
          deliveryMethod: budgetData.deliveryMethod,
          amountMicros: budgetData.amountMicros.toString(),
          explicitlyShared: false
        }
      }]
    };

    const response = await axios.post(
      `https://googleads.googleapis.com/v21/customers/${this.customerId}/campaignBudgets:mutate`,
      operation,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': this.developerToken,
          'login-customer-id': this.customerId,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.results[0].resourceName;
  }

  /**
   * Helper: Create Campaign
   */
  async createCampaign(accessToken, campaignData) {
    const operation = {
      operations: [{
        create: {
          name: campaignData.name,
          advertisingChannelType: campaignData.advertisingChannelType,
          status: campaignData.status,
          campaignBudget: campaignData.campaignBudget,
          networkSettings: {
            targetGoogleSearch: false,
            targetSearchNetwork: false,
            targetContentNetwork: true, // Display Network
            targetPartnerSearchNetwork: false
          },
          startDate: campaignData.startDate
        }
      }]
    };

    const response = await axios.post(
      `https://googleads.googleapis.com/v21/customers/${this.customerId}/campaigns:mutate`,
      operation,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': this.developerToken,
          'login-customer-id': this.customerId,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.results[0].resourceName;
  }

  /**
   * Helper: Create Ad Group
   */
  async createAdGroup(accessToken, adGroupData) {
    const operation = {
      operations: [{
        create: {
          name: adGroupData.name,
          campaign: adGroupData.campaign,
          type: adGroupData.type,
          status: adGroupData.status,
          cpcBidMicros: adGroupData.cpcBidMicros.toString()
        }
      }]
    };

    const response = await axios.post(
      `https://googleads.googleapis.com/v21/customers/${this.customerId}/adGroups:mutate`,
      operation,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': this.developerToken,
          'login-customer-id': this.customerId,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.results[0].resourceName;
  }

  /**
   * Helper: Create Responsive Display Ad
   */
  async createResponsiveDisplayAd(accessToken, adData) {
    const operation = {
      operations: [{
        create: {
          adGroup: adData.adGroup,
          status: 'ENABLED',
          ad: {
            responsiveDisplayAd: {
              marketingImages: adData.marketingImages.map(url => ({ asset: url })),
              headlines: adData.headlines.map(text => ({ text })),
              descriptions: adData.descriptions.map(text => ({ text })),
              finalUrls: adData.finalUrls,
              businessName: adData.businessName
            },
            finalUrls: adData.finalUrls
          }
        }
      }]
    };

    const response = await axios.post(
      `https://googleads.googleapis.com/v21/customers/${this.customerId}/adGroupAds:mutate`,
      operation,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': this.developerToken,
          'login-customer-id': this.customerId,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.results[0].resourceName;
  }
}

module.exports = new GoogleAdsSimpleService();