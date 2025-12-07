# Spesifikasi Sistem Cron Publish

## Ringkasan

Dokumentasi spesifikasi ini menguraikan sistem publishing berbasis cron untuk artikel dengan status `schedule` dan `future` pada aplikasi backend Naramakna.id. Sistem ini memastikan publikasi otomatis konten yang dijadwalkan pada waktu yang telah ditentukan.

## Arsitektur Sistem

### Komponen

1. **Scheduler Controller** (`backend/src/controllers/schedulerController.js`)
   - Menangani logika bisnis untuk publikasi posting terjadwal
   - Gunakan function `publishScheduledPosts` untuk publikasi posting terjadwal

2. **Cron Jobs** (`backend/cron/`)
   - `check-and-publish.js`: Executor publikasi utama

3. **Running Cron Job on Application Start** (`backend/src/workers/index.js`)
   - Jalankan cron job `check-and-publish.js` saat aplikasi dimulai
   - Gunakan function `startCronJobs` untuk memulai cron job

### Logika Publishing

```javascript
// Query utama untuk menemukan posting yang dapat dipublikasikan
const publishablePosts = await Post.findAll({
  where: {
    [Op.or]: [
      {
        post_status: 'scheduled',
        scheduled_publish_date: { [Op.lte]: now }
      },
      {
        post_status: 'future',
        post_date: { [Op.lte]: now }
      }
    ],
    post_type: 'post'
  }
});
```

### Proses Transisi Status

Untuk setiap posting yang dapat dipublikasikan:

```javascript
// 1. Update status posting menjadi 'publish'
await post.update({
  post_status: 'publish',
  post_date: now,
  post_date_gmt: now,
  post_modified: now,
  post_modified_gmt: now
});

// 2. Log aksi publishing
await PostScheduleLog.create({
  post_id: post.ID,
  scheduled_by: post.scheduled_by,
  action_type: 'publish',
  scheduled_date: now
});

// 3. Hapus field penjadwalan
await post.update({
  scheduled_by: null,
  scheduled_publish_date: null,
  original_status: null,
  scheduling_notes: null
});
```

## Strategi Testing
### Load Testing
```javascript
// Test performa dengan volume tinggi posting terjadwal
test('Sistem menangani 1000+ posting terjadwal secara efisien');
```

## Pertimbangan Deployment
### Konfigurasi Cron
```bash
# Entri crontab produksi
*/5 * * * * cd /var/www/naramakna.id/backend && node cron/check-and-publish.js