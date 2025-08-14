# TikTok Integration Setup Guide

## Overview
Panduan ini menjelaskan cara mengaktifkan TikTok integration di platform Naramakna.id.

## ✅ Status Implementation
- [x] Backend API routes dan controllers
- [x] Frontend UI components untuk dashboard admin
- [x] OAuth flow handling
- [x] TikTok content display di homepage
- [x] Trending section integration
- [x] Auto-sync cron job

## 🔧 Setup Environment Variables

Buat file `.env` di folder `backend/` dengan konfigurasi berikut:

```env
# TikTok API Configuration
TIKTOK_CLIENT_KEY=your_tiktok_client_key_here
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret_here
TIKTOK_REDIRECT_URI=http://localhost:5173/tiktok/callback
TIKTOK_AUTO_SYNC=true

# TikTok Sync Configuration
TIKTOK_SYNC_INTERVAL=6h
TIKTOK_MIN_VIEWS=1000
TIKTOK_MIN_LIKES=100
TIKTOK_MAX_VIDEOS_PER_SYNC=50
```

## 📱 TikTok Developer App Setup

### 1. Buat TikTok Developer Account
1. Kunjungi [TikTok for Developers](https://developers.tiktok.com/)
2. Login dengan akun TikTok Anda
3. Complete profile verification

### 2. Create New App
1. Go to [Developer Dashboard](https://developers.tiktok.com/apps)
2. Click "Create an App"
3. Fill out app information:
   - **App Name**: Naramakna.id Integration
   - **App Description**: Aplikasi untuk mengintegrasikan konten TikTok dengan website berita Naramakna.id
   - **Category**: Content & Publishers
   - **Platform**: Web

### 3. Configure App Products
Add these products:
- **Login Kit**: Untuk autentikasi
- **Content Posting API**: Untuk akses video (read-only)

### 4. Set Redirect URI
```
http://localhost:5173/tiktok/callback (development)
https://yourdomain.com/tiktok/callback (production)
```

### 5. Configure Scopes
Enable scopes:
- `user.info.basic`
- `user.info.profile`
- `user.info.stats`
- `video.list`

## 🎯 How to Use

### For Admin/Writer:
1. Login ke dashboard admin/writer
2. Navigate ke tab "🎬 TikTok Integration"
3. Click "Connect with TikTok" button
4. Authorize aplikasi di TikTok
5. Setelah connected, click "Sync Now" untuk sync konten

### Features Available:
- **Manual Sync**: Sync konten secara manual
- **Auto Sync**: Sync otomatis setiap 6 jam
- **Content Filter**: Hanya video dengan min 1,000 views dan 100 likes
- **Display Integration**: TikTok videos muncul di homepage dan trending

## 🔄 API Endpoints

### TikTok Integration Endpoints:
```
GET    /api/tiktok/auth          # Get auth URL
POST   /api/tiktok/callback      # Handle OAuth callback
GET    /api/tiktok/profile       # Get profile info
GET    /api/tiktok/videos        # Get videos
POST   /api/tiktok/sync          # Manual sync
GET    /api/tiktok/status        # Get connection status
DELETE /api/tiktok/disconnect    # Disconnect account
GET    /api/tiktok/content       # Get synced content
```

## 📋 Frontend Components

### New Components Added:
- `TikTokIntegration` - Admin dashboard component
- `TikTokSection` - Homepage display component
- `TikTokCallback` - OAuth callback handler

### Homepage Integration:
TikTok videos ditampilkan di homepage dalam grid layout 3 kolom, terintegrasi dengan trending section.

## ⚙️ Configuration Options

### Content Filter (backend/src/config/tiktok.js):
```javascript
contentFilter: {
  minViews: 1000,        // Minimum views required
  minLikes: 100,         // Minimum likes required
  excludePrivate: true,  // Exclude private videos
  maxVideosPerSync: 50   // Max videos per sync
}
```

### Sync Schedule:
- Default: Every 6 hours
- Configurable via TIKTOK_SYNC_INTERVAL environment variable
- Manual sync available via admin dashboard

## 🔒 Security Considerations

1. **API Keys**: Never commit API keys ke repository
2. **Token Storage**: Access tokens stored securely (memory only)
3. **User Privacy**: Only sync public videos
4. **Rate Limiting**: Respects TikTok API rate limits (60 req/min)

## 🚀 Production Deployment

### Environment Setup:
```env
NODE_ENV=production
TIKTOK_REDIRECT_URI=https://yourdomain.com/tiktok/callback
TIKTOK_AUTO_SYNC=true
```

### TikTok App Review:
Untuk production, app mungkin perlu review dari TikTok.

## 📞 Support

Jika ada masalah dengan TikTok integration:
1. Check environment variables sudah benar
2. Verify TikTok app configuration
3. Check backend logs untuk error messages
4. Ensure database models sudah ter-sync

## 🎉 Implementation Complete!

TikTok integration sudah siap digunakan. Admin/writer bisa connect TikTok account mereka dan mulai sync konten ke website.
