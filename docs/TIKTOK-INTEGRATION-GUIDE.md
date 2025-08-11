# TikTok Integration Guide - Naramakna.id

## Overview

Panduan ini menjelaskan cara mengintegrasikan akun TikTok Anda dengan platform Naramakna.id untuk otomatis mengambil dan menampilkan konten video TikTok di website.

## Prerequisites

1. Akun TikTok aktif dengan konten video
2. Akses ke TikTok for Developers
3. Akses admin/writer ke dashboard Naramakna.id

## Langkah 1: Setup TikTok Developer App

### 1.1 Buat Developer Account
1. Kunjungi [TikTok for Developers](https://developers.tiktok.com/)
2. Login dengan akun TikTok Anda
3. Complete profile verification jika diperlukan

### 1.2 Create New App
1. Go to [Developer Dashboard](https://developers.tiktok.com/apps)
2. Click "Create an App"
3. Fill out app information:
   - **App Name**: Naramakna.id Integration
   - **App Description**: Aplikasi untuk mengintegrasikan konten TikTok dengan website berita Naramakna.id
   - **Category**: Content & Publishers
   - **Platform**: Web
   - **Website URL**: https://naramakna.id (atau domain Anda)

### 1.3 Configure App Products
1. Add these products to your app:
   - **Login Kit**: Untuk autentikasi
   - **Content Posting API**: Untuk akses video (hanya read access yang digunakan)

### 1.4 Set Redirect URI
```
https://yourdomain.com/api/tiktok/callback
```
(Ganti dengan domain website Anda)

### 1.5 Configure Scopes
Enable scopes berikut:
- `user.info.basic`
- `user.info.profile`
- `user.info.stats`
- `video.list`

## Langkah 2: Environment Configuration

### 2.1 Update Environment Variables
Tambahkan ke file `.env`:

```env
# TikTok API Configuration
TIKTOK_CLIENT_KEY=your_client_key_from_tiktok_app
TIKTOK_CLIENT_SECRET=your_client_secret_from_tiktok_app
TIKTOK_REDIRECT_URI=https://yourdomain.com/api/tiktok/callback
TIKTOK_AUTO_SYNC=true
```

### 2.2 Restart Server
Restart backend server agar environment variables ter-load:
```bash
cd backend
npm restart
```

## Langkah 3: Connect TikTok Account

### 3.1 Access Admin Dashboard
1. Login sebagai admin/writer
2. Navigate ke integration settings

### 3.2 Connect TikTok
1. Click "Connect TikTok Account"
2. Anda akan diarahkan ke halaman login TikTok
3. Authorize aplikasi untuk mengakses akun Anda
4. Setelah berhasil, Anda akan dikembalikan ke dashboard

### 3.3 Verify Connection
- Check status connection di dashboard
- Profile TikTok Anda akan ditampilkan jika berhasil

## Langkah 4: Content Sync

### 4.1 Manual Sync
1. Di dashboard, click "Sync TikTok Content"
2. Sistem akan mengambil video terbaru dari akun Anda
3. Video akan difilter berdasarkan kriteria (minimal views, likes, etc.)

### 4.2 Automatic Sync
Jika `TIKTOK_AUTO_SYNC=true`, sistem akan otomatis sync setiap 6 jam.

### 4.3 Sync Configuration
Edit file `backend/src/config/tiktok.js` untuk mengatur filter:

```javascript
contentFilter: {
  minViews: 1000,        // Minimal views
  minLikes: 100,         // Minimal likes
  excludePrivate: true,  // Exclude private videos
  maxVideosPerSync: 50   // Max videos per sync
}
```

## Langkah 5: Display Configuration

### 5.1 Trending Section
TikTok content akan otomatis muncul di trending section dengan:
- Icon 📱 untuk membedakan dari artikel
- Author TikTok sebagai source
- Thumbnail video jika tersedia

### 5.2 Custom Display
Untuk mengatur tampilan TikTok content:

```typescript
// Disable TikTok di trending
<TrendingSection includeTikTok={false} />

// Disable mixed content
<TrendingSection mixedContent={false} />

// Custom limit
<TrendingSection limit={10} includeTikTok={true} />
```

## Troubleshooting

### Connection Issues
1. **Invalid Client Key/Secret**
   - Verify credentials di TikTok Developer Dashboard
   - Pastikan app sudah approved jika perlu

2. **Redirect URI Mismatch**
   - Pastikan redirect URI exact match dengan yang di dashboard
   - Include protocol (https://) dan port jika perlu

3. **Scope Issues**
   - Verify semua required scopes sudah enabled
   - Re-authorize jika ada perubahan scope

### Sync Issues
1. **No Content Synced**
   - Check apakah ada video yang memenuhi kriteria filter
   - Verify akun TikTok tidak private
   - Check rate limits

2. **Sync Errors**
   - Check logs di `backend/logs/`
   - Verify token masih valid
   - Check TikTok API status

### Performance Issues
1. **Slow Loading**
   - Implement caching di Redis
   - Reduce sync frequency
   - Optimize content filter

## API Endpoints

### TikTok Integration Endpoints
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

## Monitoring

### Sync Statistics
Monitor sync performance:
```javascript
// Get sync stats
const stats = tiktokSync.getStats();
console.log({
  totalSyncs: stats.totalSyncs,
  successfulSyncs: stats.successfulSyncs,
  failedSyncs: stats.failedSyncs,
  lastSync: stats.lastSync
});
```

### Rate Limiting
TikTok API memiliki rate limits:
- 60 requests per minute
- 10,000 requests per day

Monitor usage di dashboard untuk avoid rate limit exceeded.

## Security Considerations

1. **Token Storage**
   - Access tokens disimpan di memory (tidak persistent)
   - Implement secure token storage untuk production
   - Regular token refresh

2. **API Keys**
   - Never commit API keys ke repository
   - Use environment variables
   - Rotate keys secara berkala

3. **User Privacy**
   - Hanya sync public videos
   - Respect user privacy settings
   - Implement data retention policies

## Production Deployment

### Environment Setup
```env
NODE_ENV=production
TIKTOK_AUTO_SYNC=true
TIKTOK_REDIRECT_URI=https://yourdomain.com/api/tiktok/callback
```

### TikTok App Review
Untuk production use, TikTok app mungkin perlu review:
1. Submit app untuk review
2. Provide detailed use case
3. Include demo video
4. Wait for approval (1-2 weeks)

### Monitoring Setup
1. Setup logging
2. Error tracking (Sentry)
3. Performance monitoring
4. Sync success rate tracking

## Support

Untuk bantuan teknis:
1. Check troubleshooting section di atas
2. Review logs di `backend/logs/`
3. Contact TikTok Developer Support untuk API issues
4. Submit issue di repository untuk integration bugs

## Updates & Maintenance

### Regular Tasks
1. Monitor sync success rate
2. Update filter criteria based on content performance
3. Rotate API credentials
4. Update TikTok app information if needed

### Backup & Recovery
1. Export synced content data
2. Backup configuration settings
3. Document custom modifications