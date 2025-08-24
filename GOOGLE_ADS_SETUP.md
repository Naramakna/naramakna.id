# Google Ads Integration Setup Guide

This guide will help you set up Google Ads API integration to automatically sync your Google Ads campaigns into the naramakna.id advertisement system.

## Prerequisites

1. **Google Ads Account**: You need an active Google Ads account
2. **Google Cloud Project**: Create a project in Google Cloud Console
3. **API Access**: Enable Google Ads API in your Google Cloud project

## Step-by-Step Setup

### 1. Enable Google Ads API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to "APIs & Services" → "Library"
4. Search for "Google Ads API" and enable it

### 2. Create OAuth2 Credentials

1. In Google Cloud Console, go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `https://developers.google.com/oauthplayground`
   - Your application URLs if needed
5. Save the **Client ID** and **Client Secret**

### 3. Get Developer Token

1. Go to [Google Ads](https://ads.google.com/)
2. Navigate to "Tools & Settings" → "Setup" → "API Center"
3. Apply for API access and get your **Developer Token**
4. **Note**: For production use, your Developer Token must be approved by Google

### 4. Generate Refresh Token

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click the settings gear (⚙️) in the top right
3. Check "Use your own OAuth credentials"
4. Enter your Client ID and Client Secret from step 2
5. In "Step 1", enter this scope: `https://www.googleapis.com/auth/adwords`
6. Click "Authorize APIs" and sign in with your Google account
7. In "Step 2", click "Exchange authorization code for tokens"
8. Copy the **Refresh Token** (this doesn't expire)

### 5. Get Customer ID

1. Go to your [Google Ads account](https://ads.google.com/)
2. Look in the top right corner for your Customer ID (format: 123-456-7890)
3. Remove the dashes for the environment variable (1234567890)

### 6. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.google-ads.example .env.google-ads
   ```

2. Edit your main `.env` file and add these variables:
   ```env
   # Google Ads API Configuration
   GOOGLE_ADS_CUSTOMER_ID=1234567890
   GOOGLE_ADS_CLIENT_ID=your-client-id.googleusercontent.com
   GOOGLE_ADS_CLIENT_SECRET=your-client-secret
   GOOGLE_ADS_REFRESH_TOKEN=your-refresh-token
   GOOGLE_ADS_DEVELOPER_TOKEN=your-developer-token
   GOOGLE_ADS_SYNC_TOKEN=secure_random_sync_token_123
   GOOGLE_ADS_AUTO_SYNC=true
   ```

3. Replace all placeholder values with your actual credentials

### 7. Test the Integration

1. Restart your backend server:
   ```bash
   npm run dev  # or pm2 restart backend
   ```

2. Go to the admin panel: `https://naramakna.id/admin/google-ads`

3. Click "Test Connection" to verify your setup

4. If successful, you should see your Google Ads account information

### 8. Sync Your Ads

1. In the admin panel, go to the "Campaigns" tab
2. Click "Fetch Campaigns" to see your Google Ads campaigns
3. Select campaigns you want to sync
4. Click "Sync Now" to import ads into your local system

### 9. Set Up Automatic Sync (Optional)

To automatically sync ads every 6 hours, set up a cron job:

1. Edit your crontab:
   ```bash
   crontab -e
   ```

2. Add this line:
   ```bash
   0 */6 * * * /usr/bin/node /var/www/naramakna.id/cron/google-ads-sync.js
   ```

3. Or run manually:
   ```bash
   node cron/google-ads-sync.js
   ```

## How It Works

1. **Automatic Integration**: Google Ads are automatically pulled from your campaigns
2. **Database Storage**: Ads are stored in your local `advertisements` table with `media_type = 'google_ads'`
3. **Display System**: Existing ad rotation system automatically includes Google Ads
4. **Performance Tracking**: Clicks and impressions are tracked locally
5. **Campaign Management**: Ads are organized by campaign name with `[Google Ads]` prefix

## Ad Display

Your Google Ads will automatically appear in:
- Header banners (`placement_type = 'header'`)
- Regular ad slots (`placement_type = 'regular'`)
- Sidebar ads (`placement_type = 'sidebar'`)
- All other ad placements in your system

The system automatically handles:
- ✅ Text ads with headlines and descriptions
- ✅ Image ads with media URLs
- ✅ Responsive display ads
- ✅ HTML ad content
- ✅ Click tracking and analytics
- ✅ Ad rotation with existing ads

## Troubleshooting

### "Developer Token not approved"
- For production use, Google must approve your Developer Token
- Test accounts work but have limited functionality
- Apply for approval in Google Ads API Center

### "Invalid Customer ID"
- Make sure Customer ID is numeric only (no dashes)
- Use the Customer ID from your Google Ads account header

### "Refresh Token expired"
- Refresh tokens from OAuth Playground don't expire
- If you see this error, regenerate the refresh token

### "Insufficient permissions"
- Make sure your Google account has access to the Google Ads account
- Check that the account is not suspended or restricted

### "API quota exceeded"
- Google Ads API has daily quotas
- Reduce sync frequency if you hit limits
- Consider upgrading your quota if needed

## Production Considerations

1. **Security**: Keep all API credentials secure and never commit to version control
2. **Quotas**: Monitor your API usage and quotas
3. **Error Handling**: Set up monitoring for sync failures
4. **Backup**: Regular backups of your ads database
5. **Testing**: Test thoroughly before enabling auto-sync

## Support

If you encounter issues:

1. Check the backend logs for error details
2. Verify all environment variables are set correctly
3. Test the connection in the admin panel
4. Check Google Ads API documentation
5. Ensure your Google Ads account is active and not suspended

## API Endpoints

The system provides these API endpoints:

- `GET /api/google-ads/test-connection` - Test API connection
- `GET /api/google-ads/config` - Check configuration status
- `GET /api/google-ads/status` - Get sync status and stats
- `GET /api/google-ads/campaigns` - Fetch campaigns from Google Ads
- `GET /api/google-ads/ads` - Fetch ads from campaigns
- `POST /api/google-ads/sync` - Manual sync operation
- `POST /api/google-ads/schedule-sync` - Scheduled sync (with token)

All endpoints require authentication, and most require superadmin privileges.