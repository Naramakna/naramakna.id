#!/bin/bash

echo "🔍 Naramakna VPS Server Status Check"
echo "====================================="

# Check if backend is running
echo ""
echo "📡 Backend Server Status:"
echo "-------------------------"

# Check process
if pgrep -f "node.*app.js\|npm.*start\|nodemon" > /dev/null; then
    echo "✅ Backend process is running"
    pgrep -f "node.*app.js\|npm.*start\|nodemon" | head -5
else
    echo "❌ Backend process not found"
fi

# Check port 3001
if netstat -tlnp 2>/dev/null | grep -q ":3001 "; then
    echo "✅ Port 3001 is listening"
    netstat -tlnp 2>/dev/null | grep ":3001 "
else
    echo "❌ Port 3001 is not listening"
fi

# Test local connection
echo ""
echo "🌐 Local Connection Test:"
echo "-------------------------"
if curl -s http://localhost:3001/api/ > /dev/null; then
    echo "✅ Local API accessible"
    curl -s http://localhost:3001/api/ | jq . 2>/dev/null || curl -s http://localhost:3001/api/
else
    echo "❌ Local API not accessible"
fi

# Test external connection
echo ""
echo "🌍 External Connection Test:"
echo "----------------------------"
if curl -s http://dev.naramakna.id/api/ > /dev/null; then
    echo "✅ External API accessible"
    curl -s http://dev.naramakna.id/api/ | jq . 2>/dev/null || curl -s http://dev.naramakna.id/api/
else
    echo "❌ External API not accessible"
fi

# Check nginx
echo ""
echo "⚙️  Nginx Status:"
echo "-----------------"
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
    nginx -t 2>&1 | head -3
else
    echo "❌ Nginx is not running"
fi

# Check database
echo ""
echo "🗄️  Database Connection:"
echo "------------------------"
if mysqladmin ping -h localhost 2>/dev/null | grep -q "alive"; then
    echo "✅ MySQL is responsive"
else
    echo "❌ MySQL connection failed"
fi

# Check recent logs
echo ""
echo "📋 Recent Backend Logs:"
echo "----------------------"
if [ -f /var/log/naramakna/backend.log ]; then
    echo "📁 Backend log found:"
    tail -5 /var/log/naramakna/backend.log
elif [ -f ~/naramakna-backend.log ]; then
    echo "📁 Backend log found:"
    tail -5 ~/naramakna-backend.log
else
    echo "📁 No backend log found"
fi

# Check PM2 if used
echo ""
echo "🔧 PM2 Status (if used):"
echo "------------------------"
if command -v pm2 > /dev/null; then
    pm2 list | grep -E "(naramakna|backend)" || echo "No naramakna processes in PM2"
else
    echo "PM2 not installed"
fi

echo ""
echo "💡 Quick Fixes:"
echo "1. To restart backend: cd /var/www/naramakna/backend && npm start"
echo "2. To restart nginx: sudo systemctl restart nginx"
echo "3. To check detailed logs: journalctl -u nginx -n 50"
echo "4. To check firewall: sudo ufw status"








