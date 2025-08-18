#!/bin/bash

echo "🔍 Mencari semua occurence dari 'http://localhost:3001'..."
echo "=================================================="

# Cari di semua file, kecuali direktori yang biasanya tidak perlu
grep -r "http://localhost:3001" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=dist \
  --exclude-dir=build \
  --exclude-dir=.next \
  --exclude="*.log" \
  --exclude="find-localhost.sh" \
  -n --color=always

echo ""
echo "🔍 Mencari juga variant dengan port 3001 tanpa http..."
echo "=================================================="

# Cari juga variant lain dari localhost:3001
grep -r "localhost:3001" . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=dist \
  --exclude-dir=build \
  --exclude-dir=.next \
  --exclude="*.log" \
  --exclude="find-localhost.sh" \
  -n --color=always

echo ""
echo "✅ Pencarian selesai!"