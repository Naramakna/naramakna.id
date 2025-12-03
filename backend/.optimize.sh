#!/bin/bash
# Memory optimization script

echo "=== Optimizing Memory ==="

# 1. Clear PageCache only (safe)
sync && echo 1 > /proc/sys/vm/drop_caches

# 2. Restart backend with fresh memory
cd /var/www/naramakna.id/backend
pm2 restart backend

sleep 3

# 3. Show memory status
free -h
pm2 list

echo "✅ Memory optimization complete"
