# Auto-publish di Docker

Service `scheduler` menjalankan pemeriksaan setiap menit (Asia/Jakarta), termasuk
satu pemeriksaan saat startup untuk mengejar artikel yang terlambat. Service ini
hanya memproses artikel `scheduled` atau `future` yang waktunya sudah tiba dan belum
dihapus. TikTok, trending, dan iklan tidak dijalankan oleh service ini.

## Menjalankan

Pastikan `backend/.env` menunjuk database yang ingin dipublish. `DB_HOST` harus bisa
diakses dari container; untuk MySQL pada host Docker Desktop gunakan
`host.docker.internal`. `DB_PORT` default 3306. Compose memakai Redis internal
(`REDIS_HOST=redis`) untuk backend dan scheduler.

```sh
docker compose up -d --build redis backend scheduler
docker compose ps scheduler
docker compose logs -f --tail=100 scheduler
```

Perintah startup langsung mempublish artikel yang sudah lewat jadwal. Untuk
frontend Docker, build/restart juga service `frontend`. Jika frontend memakai Vite
lokal, panel monitoring langsung tersedia di dashboard Admin/Superadmin, tab
Scheduled. Backend dan scheduler harus menggunakan database dan Redis yang sama.

## Monitoring

- Docker healthcheck memeriksa heartbeat dan pemeriksaan database sukses terbaru.
- Panel Auto-publish menampilkan aktif/offline/error, heartbeat terakhir,
  pemeriksaan sukses terakhir, jumlah terbit, dan tiga publikasi terbaru.
- `GET /api/scheduler/status` membutuhkan login admin/superadmin.
- Log JSON mencatat `check_completed`, `check_failed`, `publish_errors`, dan
  gangguan Redis. Docker membatasi log ke 3 file masing-masing 10 MB.
- Status menjadi offline setelah 150 detik tanpa heartbeat. Error tidak ditampilkan
  sebagai sukses. Status disimpan di Redis hingga 7 hari; jumlah dan daftar
  publikasi pada panel berlaku untuk proses scheduler saat ini. Riwayat permanen
  ada di `post_schedule_log`.

```sh
docker compose stop scheduler
docker compose restart scheduler
```

Jalankan satu service scheduler. Hentikan scheduler publish lama (BullMQ/crontab)
untuk memusatkan eksekusi dan monitoring. Redis lock mencegah siklus bersamaan;
transaksi dan row lock database mencegah publish/log ganda dari pemeriksaan
otomatis lain. Artikel dan log di-commit bersamaan; kegagalan diulang pada menit
berikutnya. Metadata gambar tetap tersimpan. Cache feed/detail publik dibersihkan
sesudah publish agar artikel baru segera terlihat. Maksimal 100 artikel diproses per
siklus. Docker restart policy memulai ulang proses yang berhenti; status
`unhealthy` sendiri tidak otomatis me-restart container.

## Pengujian

```sh
cd backend
npm run test:scheduler
# Integration tests: dedicated disposable MySQL, not backend/.env
SCHEDULER_TEST_MYSQL_PORT=13316 npm run test:scheduler
```

Database integrasi harus bernama `scheduler_test` pada `127.0.0.1`, user `root`,
password `scheduler-test-only`. Tabel database uji tersebut dibuat ulang oleh tes.
