#!/bin/bash

echo "🚀 Deploying Naramakna to VPS"
echo "=============================="

# Configuration
VPS_USER="root"
VPS_HOST="srv928055"  # or your VPS IP
VPS_PATH="/var/www/naramakna"
LOCAL_PATH="/Users/lisvindanuu/Sites/debug-naramakna-prod"

echo "📦 Syncing files to VPS..."

# Sync backend files
rsync -avz --exclude 'node_modules' --exclude '.git' \
  "${LOCAL_PATH}/backend/" "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/backend/"

echo "✅ Files synced"

echo "🔧 Setting up backend on VPS..."

# Connect to VPS and setup
ssh "${VPS_USER}@${VPS_HOST}" << 'EOF'
cd /var/www/naramakna/backend

echo "📦 Installing dependencies..."
npm install

echo "⚙️  Setting up environment..."
if [ ! -f .env ]; then
    cat > .env << 'ENV_EOF'
DB_HOST=localhost
DB_USER=naramakna_user
DB_PASSWORD=your_password_here
DB_NAME=naramakna_db
JWT_SECRET=fallback-secret
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://app.dev.naramakna.id,https://app.dev.naramakna.id
REQUIRE_EMAIL_VERIFICATION=false
ENV_EOF
    echo "📝 Created .env file - please update with correct values"
fi

echo "🔍 Checking dependencies..."
npm list express sequelize mysql2 jsonwebtoken bcryptjs cors cookie-parser multer

echo "🧪 Testing app startup..."
timeout 10s npm start || echo "⚠️  App startup test completed"

echo "✅ Backend setup complete"
EOF

echo ""
echo "🌐 Testing deployment..."
sleep 2

if curl -s http://dev.naramakna.id/api/ > /dev/null; then
    echo "✅ API is accessible"
else
    echo "❌ API not accessible - check server status"
fi

echo ""
echo "📋 Next steps:"
echo "1. SSH to VPS: ssh ${VPS_USER}@${VPS_HOST}"
echo "2. Update .env with correct database credentials"
echo "3. Start backend: cd ${VPS_PATH}/backend && npm start"
echo "4. Check server status: bash check-server.sh"
echo "5. Test authentication: node test-auth.js"