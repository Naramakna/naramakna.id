# Analytics Boost API Documentation

## Overview
API endpoints untuk mengelola analytics dan boost views postingan melalui admin panel.

## Endpoints

### 1. Get Analytics Overview
**GET** `/api/admin/analytics/overview`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "event_stats": [
      {
        "event_type": "view",
        "total_events": 1818630,
        "unique_posts": 363
      }
    ],
    "top_posts": [
      {
        "post_id": 2,
        "title": "Indeks Berita",
        "view_count": 5010
      }
    ],
    "total_published_posts": 363
  }
}
```

### 2. Boost Views
**POST** `/api/admin/analytics/boost-views`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "target_views": 5000,
  "post_ids": "all",
  "clear_existing": false
}
```

**Parameters:**
- `target_views` (number, required): Target jumlah views per post (1-1,000,000)
- `post_ids` (string|array): "all" untuk semua post atau array ID post spesifik
- `clear_existing` (boolean): true untuk menghapus views existing, false untuk menambah

**Response:**
```json
{
  "success": true,
  "message": "Successfully boosted views for 363 posts",
  "data": {
    "posts_affected": 363,
    "total_views_added": 1814370,
    "target_views": 5000,
    "clear_existing": false,
    "final_stats": [
      {
        "post_id": 2,
        "view_count": 5000
      }
    ]
  }
}
```

## Frontend Usage

### 1. Import Component
```tsx
import { AdminAnalytics } from './Analytics';
```

### 2. Tambahkan ke Dashboard
```tsx
{activeTab === 'analytics' && (
  <div className="p-6">
    <AdminAnalytics />
  </div>
)}
```

## Features

### 🎯 Analytics Dashboard
- **Overview Statistics**: Total posts, views, avg views per post
- **Event Breakdown**: Views, likes, shares, comments by type
- **Top Posts**: 10 posts dengan views tertinggi

### 🚀 Boost Views Tool
- **Target Views**: Set target views (1-1M) untuk semua post
- **Clear Existing**: Option untuk reset views existing
- **Batch Processing**: Efficient bulk insert dengan batches
- **Real-time Feedback**: Progress indicator dan hasil detail

### 🛡️ Security
- **Admin Only**: Requires admin/superadmin privileges
- **Input Validation**: Target views 1-1,000,000
- **Transaction Safety**: Database transactions untuk consistency
- **Error Handling**: Comprehensive error messages

## Usage Examples

### Basic Boost (5,000 views per post)
1. Login sebagai admin
2. Go to Admin Dashboard → Analytics tab
3. Set "Target Views per Post" = 5000
4. Leave "Clear existing views first" unchecked
5. Click "Boost All Posts"

### Reset & Set (100,000 views per post)
1. Set "Target Views per Post" = 100000
2. Check "Clear existing views first"
3. Click "Boost All Posts"

### View Results
- Refresh overview untuk melihat stats terbaru
- Check top posts table untuk verifikasi
- Analytics akan update real-time di frontend

## Performance Notes

- **Batch Size**: 1,000 records per batch untuk menghindari memory issues
- **Random Data**: IP addresses, countries, timestamps untuk realistic data
- **Efficient Queries**: Uses bulk insert dan indexed queries
- **Background Processing**: Large operations handled with proper batching

## Error Handling

- **401**: Authentication required
- **403**: Admin privileges required  
- **400**: Invalid target views (out of range)
- **404**: No posts found to boost
- **500**: Server error during processing

Semua error akan ditampilkan di UI dengan AlertMessage component.
