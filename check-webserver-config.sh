#!/bin/bash

echo "🔍 Web Server Configuration Check"
echo "=================================="

echo "📋 Checking which web server is running..."
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
    WEBSERVER="nginx"
elif systemctl is-active --quiet apache2; then
    echo "✅ Apache2 is running"
    WEBSERVER="apache2"
elif systemctl is-active --quiet httpd; then
    echo "✅ Apache (httpd) is running"
    WEBSERVER="httpd"
else
    echo "❌ No web server detected"
    exit 1
fi

echo ""
echo "🔍 Checking $WEBSERVER configuration for app.dev.naramakna.id..."

if [ "$WEBSERVER" = "nginx" ]; then
    echo ""
    echo "📁 Nginx sites available:"
    ls -la /etc/nginx/sites-available/ | grep -E "(naramakna|app\.dev|dev\.)"
    
    echo ""
    echo "📁 Nginx sites enabled:"
    ls -la /etc/nginx/sites-enabled/ | grep -E "(naramakna|app\.dev|dev\.)"
    
    echo ""
    echo "🔍 Searching for app.dev.naramakna.id in nginx configs:"
    grep -r "app.dev.naramakna.id" /etc/nginx/ 2>/dev/null || echo "❌ No app.dev.naramakna.id found in nginx config"
    
    echo ""
    echo "🔍 Searching for phpmyadmin in nginx configs:"
    grep -r -i "phpmyadmin" /etc/nginx/ 2>/dev/null || echo "❌ No phpmyadmin found in nginx config"
    
    echo ""
    echo "📋 All virtual hosts in nginx:"
    grep -r "server_name" /etc/nginx/sites-enabled/ 2>/dev/null | grep -v "#"
    
elif [ "$WEBSERVER" = "apache2" ] || [ "$WEBSERVER" = "httpd" ]; then
    echo ""
    echo "📁 Apache sites available:"
    ls -la /etc/apache2/sites-available/ 2>/dev/null || ls -la /etc/httpd/conf.d/ 2>/dev/null
    
    echo ""
    echo "📁 Apache sites enabled:"
    ls -la /etc/apache2/sites-enabled/ 2>/dev/null || echo "Using conf.d directory"
    
    echo ""
    echo "🔍 Searching for app.dev.naramakna.id in apache configs:"
    grep -r "app.dev.naramakna.id" /etc/apache2/ 2>/dev/null || grep -r "app.dev.naramakna.id" /etc/httpd/ 2>/dev/null || echo "❌ No app.dev.naramakna.id found"
    
    echo ""
    echo "🔍 Searching for phpmyadmin in apache configs:"
    grep -r -i "phpmyadmin" /etc/apache2/ 2>/dev/null || grep -r -i "phpmyadmin" /etc/httpd/ 2>/dev/null || echo "❌ No phpmyadmin found"
    
    echo ""
    echo "📋 All virtual hosts in apache:"
    grep -r "ServerName\|DocumentRoot" /etc/apache2/sites-enabled/ 2>/dev/null || grep -r "ServerName\|DocumentRoot" /etc/httpd/conf.d/ 2>/dev/null
fi

echo ""
echo "🌐 Testing DNS resolution:"
nslookup app.dev.naramakna.id 2>/dev/null || echo "❌ DNS resolution failed"

echo ""
echo "📋 Checking /etc/hosts for local overrides:"
grep -i "naramakna\|app\.dev" /etc/hosts 2>/dev/null || echo "❌ No local naramakna entries in /etc/hosts"

echo ""
echo "🔍 Checking for phpMyAdmin installation:"
find /var/www /usr/share -name "*phpmyadmin*" -type d 2>/dev/null | head -5

echo ""
echo "📋 Current listening ports:"
netstat -tlnp | grep -E ":80 |:443 |:3001 " || ss -tlnp | grep -E ":80 |:443 |:3001 "

echo ""
echo "💡 Common Issues & Solutions:"
echo "1. Wrong DocumentRoot/root pointing to phpMyAdmin"
echo "2. Missing virtual host for app.dev.naramakna.id"
echo "3. Default site catching all requests"
echo "4. DNS pointing to wrong server"
echo ""
echo "🔧 Recommended fixes:"
echo "1. Create proper virtual host for app.dev.naramakna.id"
echo "2. Point DocumentRoot to your frontend build directory"
echo "3. Disable default sites if conflicting"







