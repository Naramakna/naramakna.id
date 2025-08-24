// API Services Re-exports
export { adsAPI } from './ads';
export { articlesAPI } from './articles';
export { authAPI } from './auth';
export { googleAdsAPI } from './googleAds';

// Type exports
export type { Advertisement, AdsResponse, CreateAdRequest, CreateAdResponse } from './ads';
export type { Article, FeedResponse, Category } from './articles';
export type { AuthResponse, LoginRequest, RegisterRequest, ProfileResponse } from './auth';
export type { GoogleAdsAccount, GoogleAdsCampaign, GoogleAd, GoogleAdsConfig, GoogleAdsSyncStatus, GoogleAdsSyncResult } from './googleAds';
