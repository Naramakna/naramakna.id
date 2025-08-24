/**
 * Google Ads API Service
 * Frontend service for Google Ads integration
 */

import { buildApiUrl } from '../../config/api';

export interface GoogleAdsAccount {
  id: string;
  descriptive_name: string;
  currency_code: string;
  time_zone: string;
  status: string;
}

export interface GoogleAdsCampaign {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  type: string;
  budget: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cost: number;
}

export interface GoogleAd {
  google_ad_id: string;
  name: string;
  campaign_id: string;
  campaign_name: string;
  ad_group_id: string;
  ad_group_name: string;
  type: string;
  status: string;
  final_urls: string[];
  display_url: string;
  ad_content: string;
  media_url: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

export interface GoogleAdsConfig {
  customer_id: string | null;
  has_client_id: boolean;
  has_client_secret: boolean;
  has_refresh_token: boolean;
  has_developer_token: boolean;
  configured: boolean;
}

export interface GoogleAdsSyncStatus {
  connected: boolean;
  account: GoogleAdsAccount | null;
  error: string | null;
  local_google_ads: number;
  active_google_ads: number;
  last_sync: string | null;
}

export interface GoogleAdsSyncResult {
  synced: number;
  campaigns: number;
  total_ads: number;
  results: Array<{
    action: 'created' | 'updated' | 'error';
    ad: string;
    error?: string;
  }>;
}

export const googleAdsAPI = {
  /**
   * Test Google Ads API connection
   */
  async testConnection(): Promise<{
    success: boolean;
    data: { account: GoogleAdsAccount | null; connected: boolean; error?: string };
  }> {
    const response = await fetch(buildApiUrl('google-ads/test-connection'), {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Get Google Ads configuration status
   */
  async getConfig(): Promise<{
    success: boolean;
    data: GoogleAdsConfig;
  }> {
    const response = await fetch(buildApiUrl('google-ads/config'), {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Get sync status and statistics
   */
  async getSyncStatus(): Promise<{
    success: boolean;
    data: GoogleAdsSyncStatus;
  }> {
    const response = await fetch(buildApiUrl('google-ads/status'), {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Get Google Ads campaigns
   */
  async getCampaigns(): Promise<{
    success: boolean;
    data: { campaigns: GoogleAdsCampaign[]; count: number };
  }> {
    const response = await fetch(buildApiUrl('google-ads/campaigns'), {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Get Google Ads from campaigns
   */
  async getAds(campaignIds?: string[]): Promise<{
    success: boolean;
    data: { ads: GoogleAd[]; count: number };
  }> {
    const url = new URL(buildApiUrl('google-ads/ads'));
    if (campaignIds) {
      url.searchParams.set('campaign_ids', campaignIds.join(','));
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Sync Google Ads to local database
   */
  async syncAds(): Promise<{
    success: boolean;
    data: GoogleAdsSyncResult;
    message: string;
  }> {
    const response = await fetch(buildApiUrl('google-ads/sync'), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Run scheduled sync
   */
  async scheduleSync(syncToken: string): Promise<{
    success: boolean;
    data: GoogleAdsSyncResult;
    message: string;
  }> {
    const response = await fetch(buildApiUrl('google-ads/schedule-sync'), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sync_token: syncToken })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
};