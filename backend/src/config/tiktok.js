// Konfigurasi TikTok API credentials
const tiktokConfig = {
  // Basic TikTok API configuration
  clientKey: process.env.TIKTOK_CLIENT_KEY || '',
  clientSecret: process.env.TIKTOK_CLIENT_SECRET || '',
  redirectUri: process.env.TIKTOK_REDIRECT_URI || '',
  
  // API endpoints
  baseURL: 'https://open.tiktokapis.com',
  
  // OAuth endpoints
  authURL: 'https://www.tiktok.com/v2/auth/authorize',
  tokenURL: 'https://open.tiktokapis.com/v2/oauth/token',
  
  // Scopes required for integration
  scopes: [
    'user.info.basic',
    'user.info.profile', 
    'user.info.stats',
    'video.list',
    'video.upload'
  ],
  
  // Rate limiting
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerDay: 10000
  },
  
  // Content filtering
  contentFilter: {
    minViews: 1000,
    minLikes: 100,
    excludePrivate: true,
    maxVideosPerSync: 50
  }
};

module.exports = tiktokConfig;
