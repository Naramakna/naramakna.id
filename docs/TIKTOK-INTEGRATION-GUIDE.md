# TikTok Integration Guide

Panduan lengkap untuk mengintegrasikan TikTok Content Posting API dengan aplikasi Naramakna.

## 📋 Overview

Integrasi TikTok memungkinkan:
- **Admin Upload**: Admin dapat upload video langsung ke akun TikTok dari web admin
- **Video Sync**: Superadmin dapat sync video dari akun TikTok ke platform
- **View Tracking**: Video TikTok yang ditampilkan di web otomatis mentrack views
- **Analytics**: Dashboard analytics untuk performance TikTok videos

## 🚀 Setup TikTok Developer Account

### 1. Daftar TikTok for Developers

1. Kunjungi [TikTok for Developers](https://developers.tiktok.com/)
2. Login dengan akun TikTok yang akan digunakan untuk business
3. Verifikasi akun dengan nomor telepon dan email

### 2. Buat TikTok App

1. Masuk ke **Dashboard** → **Manage Apps**
2. Klik **Create an App**
3. Isi informasi aplikasi:
   - **App Name**: `Naramakna TikTok Integration`
   - **Description**: `TikTok integration for Naramakna news platform`
   - **Category**: `News & Media`
   - **Website**: `https://naramakna.id`

### 3. Konfigurasi App Settings

#### Basic Settings
- **App Name**: Naramakna TikTok Integration
- **App Description**: TikTok content integration for news platform
   - **Platform**: Web
- **Redirect URI**: `http://localhost:3001/api/tiktok/callback` (development)
- **Production Redirect URI**: `https://naramakna.id/api/tiktok/callback`

#### Required Products
Tambahkan products berikut ke app:
- ✅ **Content Posting API** (untuk upload video)
- ✅ **Display API** (untuk display video info)
- ✅ **Login Kit** (untuk OAuth authentication)

#### Scopes yang Dibutuhkan
Request scopes berikut:
- `user.info.basic` - untuk info user TikTok
- `video.publish` - untuk upload video ke TikTok
- `video.list` - untuk sync video dari TikTok

### 4. Domain Verification

Untuk posting video dari URL, verifikasi domain:
1. Masuk ke **App Settings** → **Domain Verification**
2. Tambahkan domain: `naramakna.id`
3. Download file verifikasi dan letakkan di root domain
4. Klik **Verify Domain**

## ⚙️ Environment Configuration

### Backend Environment Variables

Tambahkan ke file `.env` di backend:

```bash
# TikTok API Configuration
TIKTOK_CLIENT_KEY=your_tiktok_client_key_here
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret_here
TIKTOK_APP_ID=your_tiktok_app_id_here
TIKTOK_REDIRECT_URI=http://localhost:3001/api/tiktok/callback

# Production settings (uncomment for production)
# TIKTOK_REDIRECT_URI=https://naramakna.id/api/tiktok/callback
```

### Cara Mendapatkan Credentials

1. **Client Key & Client Secret**:
   - Masuk ke TikTok Developer Dashboard
   - Pilih app yang sudah dibuat
   - Masuk ke **Basic Information**
   - Copy **Client Key** dan **Client Secret**

2. **App ID**:
   - Sama dengan Client Key (dalam beberapa kasus)
   - Atau bisa ditemukan di **App Settings**

## 🗄️ Database Setup

Jalankan migration untuk membuat tabel TikTok:

```bash
# Masuk ke direktori backend
cd backend

# Jalankan migration
mysql -u your_username -p your_database < database/migrations/015_create_tiktok_integration.sql
```

### Tabel yang Dibuat

1. **tiktok_config** - Konfigurasi TikTok app
2. **tiktok_tokens** - OAuth tokens untuk multiple users
3. **tiktok_videos** - Data video TikTok
4. **tiktok_video_views** - Tracking views di platform
5. **tiktok_video_categories** - Kategorisasi video
6. **tiktok_upload_queue** - Queue untuk batch upload

## 🔗 OAuth Flow Setup

### 1. Connect TikTok Account (Admin)

1. Login sebagai admin/superadmin
2. Masuk ke `/admin/tiktok`
3. Klik **Connect TikTok Account**
4. Authorize aplikasi di TikTok
5. Redirect kembali ke admin panel

### 2. Test Connection

Setelah terkoneksi, admin dapat:
- ✅ Upload video ke TikTok
- ✅ Lihat status upload
- ✅ Superadmin: Sync video dari TikTok

## 📤 Upload Video Workflow

### 1. File Requirements

Video yang dapat diupload ke TikTok:
- **Format**: MP4, MOV, AVI
- **Max Size**: 500MB
- **Duration**: 15 detik - 10 menit
- **Resolution**: Minimum 720p, maksimum 1080p
- **Aspect Ratio**: 9:16 (portrait) direkomendasikan

### 2. Upload Process

1. Admin pilih file video
2. Isi title, description, privacy settings
3. Klik **Upload to TikTok**
4. System akan:
   - Validate file
   - Query creator info dari TikTok
   - Initiate upload ke TikTok servers
   - Track upload status
   - Update database dengan video info

### 3. Upload Status Tracking

Status upload yang bisa di-track:
- `pending` - Upload dimulai
- `processing` - TikTok sedang process video
- `published` - Video berhasil dipublish
- `failed` - Upload gagal

## 🔄 Video Sync (Superadmin Only)

### Automatic Sync

Superadmin dapat sync video dari akun TikTok:

1. Masuk ke `/admin/tiktok`
2. Tab **Manage Videos**
3. Klik **Sync from TikTok**
4. System akan fetch video terbaru dan update database

### Manual Sync via API

```bash
curl -X POST http://localhost:3001/api/tiktok/sync-videos \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"limit": 20}'
```

## 📊 View Tracking

### How It Works

Ketika video TikTok ditampilkan di web:

1. **Auto Track**: View otomatis di-track saat video di-play
2. **IP-based**: User tanpa login di-track berdasarkan IP
3. **User-based**: User yang login di-track dengan user ID
4. **Milestones**: Track view progress (25%, 50%, 75%, 100%)

### View Data

Data yang di-track:
- View duration (berapa lama ditonton)
- View percentage (persentase video yang ditonton)
- Device type (desktop/mobile/tablet)
- Geographic info (opsional)
- Referrer URL

## 🎯 Display TikTok Videos

### Homepage Integration

TikTok videos otomatis tampil di homepage:

```tsx
// Di Home.tsx sudah ditambahkan
<TikTokSection limit={8} />
```

### Custom Display

```tsx
import { TikTokSection } from './components/organisms/TikTokSection';

// Display dengan kategori tertentu
<TikTokSection 
  category="entertainment"
  limit={6}
  showTitle={true}
/>
```

### Video Card Features

Setiap video card menampilkan:
- Video player dengan controls
- View count dari TikTok
- Like, comment, share counts
- Local view tracking
- Link ke video TikTok asli
- Hashtags dan mentions

## 📈 Analytics Dashboard

### Admin Analytics

Masuk ke `/admin/tiktok` → Tab **Analytics**:

- **Overview Stats**: Total videos, views, engagement
- **Daily Trends**: View trends per hari
- **Top Videos**: Video dengan performance terbaik
- **Engagement Rate**: Rata-rata engagement per video

### API Analytics

```bash
# Get analytics data
curl -X GET "http://localhost:3001/api/tiktok/analytics?start_date=2024-01-01&end_date=2024-01-31" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 🔧 Troubleshooting

### Common Issues

1. **OAuth Failed**
   - Pastikan `TIKTOK_REDIRECT_URI` sesuai dengan setting di TikTok Developer
   - Check network connectivity
   - Verify credentials di `.env`

2. **Upload Failed**
   - Check file format dan size
   - Pastikan akun TikTok terverifikasi
   - Check rate limits (TikTok ada limit upload per hari)

3. **Sync Failed**
   - Pastikan token masih valid (tidak expired)
   - Check permissions `video.list` scope
   - Verify API rate limits

4. **Videos Not Displaying**
   - Check database connection
   - Verify API endpoint `/api/tiktok/videos`
   - Check console errors di browser

### Rate Limits

TikTok API memiliki rate limits:
- **Upload**: 50 video per hari per app
- **Sync**: 100 requests per 10 menit
- **Analytics**: 1000 requests per jam

### Debug Mode

Enable debug logging:

```bash
# Backend - tambah ke .env
DEBUG_TIKTOK=true

# Check logs di console
tail -f backend/logs/tiktok.log
```

## 🚀 Production Deployment

### 1. Update Environment

```bash
# Production .env
TIKTOK_REDIRECT_URI=https://naramakna.id/api/tiktok/callback
NODE_ENV=production
```

### 2. Domain Verification

Pastikan domain `naramakna.id` sudah diverifikasi di TikTok Developer Dashboard.

### 3. App Review

Untuk production, app perlu review TikTok:
1. Submit app untuk review
2. Sertakan demo video
3. Explain use case untuk news platform
4. Tunggu approval (biasanya 2-7 hari)

### 4. SSL Certificate

Pastikan HTTPS diaktifkan untuk redirect URI.

## 📚 API Reference

### Authentication Endpoints

- `GET /api/tiktok/auth-url` - Get OAuth URL
- `GET /api/tiktok/callback` - OAuth callback
- `GET /api/tiktok/connection-status` - Check connection
- `DELETE /api/tiktok/disconnect` - Disconnect account

### Video Management

- `POST /api/tiktok/upload` - Upload video
- `GET /api/tiktok/upload-status/:id` - Check upload status
- `POST /api/tiktok/sync-videos` - Sync from TikTok
- `GET /api/tiktok/videos` - Get public videos
- `GET /api/tiktok/admin/videos` - Get admin videos

### Analytics

- `POST /api/tiktok/track-view` - Track video view
- `GET /api/tiktok/analytics` - Get analytics data

## 🔐 Security Considerations

1. **Token Storage**: Tokens disimpan encrypted di database
2. **Rate Limiting**: Implement rate limiting untuk API calls
3. **File Validation**: Strict validation untuk video uploads
4. **CORS**: Proper CORS setup untuk frontend
5. **Auth Middleware**: Semua admin endpoints protected

## 🎉 Testing

### Unit Tests

```bash
# Test TikTok controllers
npm test -- --grep "TikTok"

# Test frontend hooks
npm test -- --grep "useTikTok"
```

### Integration Tests

```bash
# Test OAuth flow
npm run test:integration tiktok-auth

# Test upload functionality  
npm run test:integration tiktok-upload
```

### Manual Testing Checklist

- [ ] OAuth connection berhasil
- [ ] Video upload ke TikTok
- [ ] Video sync dari TikTok
- [ ] View tracking berfungsi
- [ ] Analytics data akurat
- [ ] Error handling proper
- [ ] Mobile responsive
- [ ] Performance optimization

---

## 📞 Support

Jika ada masalah dengan integrasi TikTok:

1. Check dokumentasi TikTok: https://developers.tiktok.com/doc/
2. Review error logs di backend
3. Test dengan TikTok API directly via Postman
4. Contact TikTok Developer Support jika diperlukan

**Happy TikToking! 🎵**