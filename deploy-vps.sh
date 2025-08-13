#!/bin/bash

# Naramakna VPS Deployment Script
# Usage: ./deploy-vps.sh

set -e

VPS_IP="148.230.96.60"
VPS_USER="root"  # Change if using different user
PROJECT_DIR="/var/www/naramakna"
DOMAIN="dev.naramakna.id"
APP_DOMAIN="app.dev.naramakna.id"

echo "🚀 Starting Naramakna VPS Deployment..."

# Function to run commands on VPS
run_on_vps() {
    ssh $VPS_USER@$VPS_IP "$1"
}

# Function to copy files to VPS
copy_to_vps() {
    scp -r $1 $VPS_USER@$VPS_IP:$2
}

echo "📦 Installing dependencies on VPS..."
run_on_vps "
    # Update system
    apt update && apt upgrade -y
    
    # Install Node.js 18
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
    
    # Install PM2 for process management
    npm install -g pm2
    
    # Install nginx for reverse proxy
    apt install -y nginx
    
    # Create project directory
    mkdir -p $PROJECT_DIR
"

echo "📤 Uploading project files..."
# Upload backend
copy_to_vps "./backend" "$PROJECT_DIR/"

# Upload frontend  
copy_to_vps "./frontend" "$PROJECT_DIR/"

echo "🔧 Setting up backend..."
run_on_vps "
    cd $PROJECT_DIR/backend
    npm install
    
    # Create production .env
    cat > .env << EOF
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_USER=naramakna_user
DB_PASSWORD=secure_password_here
DB_NAME=naramakna_prod
JWT_SECRET=super-secure-jwt-secret-for-production
CORS_ORIGIN=http://$APP_DOMAIN:5173,https://$APP_DOMAIN:5173
EOF
    
    # Start backend with PM2
    pm2 start npm --name 'naramakna-backend' -- start
    pm2 save
    pm2 startup
"

echo "🎨 Setting up frontend..."
run_on_vps "
    cd $PROJECT_DIR/frontend
    npm install
    
    # Update API config for VPS
    sed -i 's|http://localhost:3001|http://$DOMAIN:3001|g' src/config/api.ts
    
    # Build frontend
    npm run build
    
    # Start frontend with PM2
    pm2 start npm --name 'naramakna-frontend' -- run preview -- --host 0.0.0.0 --port 5173
"

echo "🌐 Setting up Nginx..."
run_on_vps "
    # Create nginx config for backend
    cat > /etc/nginx/sites-available/naramakna-backend << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_cache_bypass \\\$http_upgrade;
    }
}
EOF

    # Create nginx config for frontend
    cat > /etc/nginx/sites-available/naramakna-frontend << EOF
server {
    listen 80;
    server_name $APP_DOMAIN;
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_cache_bypass \\\$http_upgrade;
    }
}
EOF

    # Enable sites
    ln -sf /etc/nginx/sites-available/naramakna-backend /etc/nginx/sites-enabled/
    ln -sf /etc/nginx/sites-available/naramakna-frontend /etc/nginx/sites-enabled/
    
    # Remove default nginx site
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload nginx
    nginx -t && systemctl reload nginx
"

echo "🔥 Opening firewall ports..."
run_on_vps "
    ufw allow 22   # SSH
    ufw allow 80   # HTTP
    ufw allow 443  # HTTPS (for future SSL)
    ufw allow 3001 # Backend (direct access)
    ufw allow 5173 # Frontend (direct access)
    ufw --force enable
"

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your application is now available at:"
echo "   Backend API: http://$DOMAIN"
echo "   Frontend:    http://$APP_DOMAIN"
echo ""
echo "📊 Direct access (for debugging):"
echo "   Backend:     http://$VPS_IP:3001"
echo "   Frontend:    http://$VPS_IP:5173"
echo ""
echo "🔧 Management commands:"
echo "   ssh $VPS_USER@$VPS_IP"
echo "   pm2 status"
echo "   pm2 logs naramakna-backend"
echo "   pm2 logs naramakna-frontend"
