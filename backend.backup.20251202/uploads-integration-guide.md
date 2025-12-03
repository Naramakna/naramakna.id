# WordPress Uploads Integration Guide

## 📁 Integrasi Folder Uploads WordPress ke Backend Naramakna

### 1. Download Folder Uploads WordPress

```bash
# Struktur WordPress uploads biasanya:
wp-content/uploads/
├── 2023/
│   ├── 01/ (Januari)
│   ├── 02/ (Februari)
│   └── ...
├── 2024/
│   ├── 01/
│   ├── 02/
│   └── ...
└── 2025/
    ├── 01/
    ├── 08/ (Agustus - bulan ini)
    └── ...
```

### 2. Lokasi Target di Naramakna (PROJECT ROOT!)

```bash
# Shared struktur di project root
naramakna.id/public/
├── uploads/           ← WordPress media files
│   ├── 2023/
│   ├── 2024/
│   └── 2025/
├── index.html         ← Portal landing page
└── (shared assets)
```

### 3. Langkah Integrasi

#### Step 1: Struktur sudah ready!
```bash
cd /Users/lisvindanuu/Sites/naramakna.id
# Folder public/uploads/ sudah siap di project root
```

#### Step 2: Download dan extract uploads WordPress  
```bash
# Download uploads dari WordPress (sesuaikan dengan metode Anda)
# Misalnya via FTP, cPanel File Manager, atau backup

# Extract ke PROJECT ROOT public/uploads
cp -r /path/to/wordpress/wp-content/uploads/* public/uploads/
```

#### Step 3: Setup Static File Serving
Backend sudah akan melayani file static dari folder public/uploads/

### 4. URL Mapping

#### URL WordPress Lama:
```
https://old-site.com/wp-content/uploads/2025/08/image.jpg
```

#### URL Naramakna Baru (CLEAN & SIMPLE!):
```
http://localhost:3001/uploads/2025/08/image.jpg
```

### 5. Database Update (Optional)

Jika ingin update URL di database artikel:

```sql
-- Update URL gambar di dalam content
UPDATE posts 
SET post_content = REPLACE(
    post_content, 
    'https://naramakna.id/wp-content/uploads/', 
    'http://localhost:3001/uploads/'
);

-- Update thumbnail metadata
UPDATE postmeta 
SET meta_value = REPLACE(
    meta_value, 
    'https://naramakna.id/wp-content/uploads/', 
    'http://localhost:3001/uploads/'
) 
WHERE meta_key LIKE '%url%' OR meta_key LIKE '%image%';
```

### 6. Nginx/Production Setup

Untuk production, setup nginx:

```nginx
# nginx.conf
location /uploads/ {
    alias /var/www/naramakna/backend/public/uploads/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 7. File Management API

Backend sudah support upload management melalui:
- GET /api/content/:id - Akan otomatis resolve image URLs
- POST /api/content - Support untuk image metadata
- Automatic thumbnail handling

### 8. CDN Integration (Future)

Nanti bisa integrate dengan CDN:
```javascript
// config/upload.js
const CDN_BASE_URL = 'https://cdn.naramakna.id';
const UPLOAD_BASE_URL = CDN_BASE_URL + '/uploads';
```

## ✅ Keuntungan Pendekatan Ini:

1. **Kompatibilitas**: URL structure mirip WordPress
2. **Performance**: Static file serving langsung dari Express
3. **Migrasi Mudah**: Tidak perlu ubah database content
4. **Scalable**: Siap untuk CDN integration
5. **Backup**: File media tetap aman dan organized

## 🚀 Ready to Use!

Setelah folder uploads diintegrasikan, sistem API Naramakna akan otomatis:
- ✅ Serve image/media files
- ✅ Handle thumbnail metadata  
- ✅ Support attachment URLs
- ✅ Maintain WordPress compatibility