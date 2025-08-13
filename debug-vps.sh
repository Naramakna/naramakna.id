#!/bin/bash

echo "🔍 DEBUGGING VPS ISSUES"
echo "======================="

echo ""
echo "1. Checking MySQL connections:"
echo "------------------------------"
mysql -u root -p naramakna_clean -e "SHOW PROCESSLIST;" 2>/dev/null || echo "❌ Cannot connect to MySQL"

echo ""
echo "2. Checking uploads directory:"
echo "------------------------------"
ls -la /var/www/naramakna/backend/public/uploads/ || echo "❌ Uploads directory missing"
ls -la /var/www/naramakna/public/uploads/ || echo "❌ Root uploads directory missing"

echo ""
echo "3. Checking PM2 status:"
echo "------------------------"
pm2 status

echo ""
echo "4. Checking recent logs:"
echo "------------------------"
pm2 logs backend --lines 20

echo ""
echo "5. Checking disk space:"
echo "-----------------------"
df -h

echo ""
echo "6. Checking memory usage:"
echo "-------------------------"
free -h

echo ""
echo "7. Checking MySQL status:"
echo "-------------------------"
systemctl status mysql --no-pager

echo ""
echo "8. Testing database connection:"
echo "-------------------------------"
mysql -u root -p naramakna_clean -e "SELECT COUNT(*) as total_posts FROM posts;" 2>/dev/null || echo "❌ Database query failed"

echo ""
echo "9. Checking Node.js processes:"
echo "------------------------------"
ps aux | grep node

echo ""
echo "10. Checking nginx status:"
echo "--------------------------"
systemctl status nginx --no-pager
