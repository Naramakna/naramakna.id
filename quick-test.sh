#!/bin/bash

# Quick API Test Commands
BASE_URL="https://benarmak.naramakna.id/api"

echo "🚀 Quick API Tests for Naramakna"
echo "================================"

echo ""
echo "1️⃣ Test API Root:"
echo "curl '$BASE_URL'"
curl "$BASE_URL"

echo ""
echo ""
echo "2️⃣ Test Login (save cookies):"
echo "curl -X POST '$BASE_URL/auth/login' -H 'Content-Type: application/json' -c cookies.txt -d '{\"identifier\":\"admin@naramakna.id\",\"user_pass\":\"admin123\"}'"
curl -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -c cookies.txt -d '{"identifier":"admin@naramakna.id","user_pass":"admin123"}'

echo ""
echo ""
echo "3️⃣ Test Profile (use cookies):"
echo "curl '$BASE_URL/auth/profile' -b cookies.txt"
curl "$BASE_URL/auth/profile" -b cookies.txt

echo ""
echo ""
echo "4️⃣ Test Content Feed:"
echo "curl '$BASE_URL/content/feed?limit=3' -b cookies.txt"
curl "$BASE_URL/content/feed?limit=3" -b cookies.txt

echo ""
echo ""
echo "5️⃣ Test CORS Headers:"
echo "curl -I -H 'Origin: https://fenarmak.naramakna.id' '$BASE_URL/content/feed'"
curl -I -H "Origin: https://fenarmak.naramakna.id" "$BASE_URL/content/feed"

echo ""
echo ""
echo "✅ Quick tests complete!"
echo ""
echo "📝 Manual Test Commands:"
echo "========================"
echo ""
echo "# Test login and save cookies"
echo "curl -X POST '$BASE_URL/auth/login' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -c cookies.txt \\"
echo "  -d '{\"identifier\":\"admin@naramakna.id\",\"user_pass\":\"admin123\"}' | jq"
echo ""
echo "# Test protected endpoint"
echo "curl '$BASE_URL/auth/profile' -b cookies.txt | jq"
echo ""
echo "# Test content feed"
echo "curl '$BASE_URL/content/feed?limit=5&type=post' -b cookies.txt | jq"
echo ""
echo "# Test ads"
echo "curl '$BASE_URL/ads/serve?placement=regular&limit=3' -b cookies.txt | jq"
echo ""
echo "# Test logout"  
echo "curl -X POST '$BASE_URL/auth/logout' -b cookies.txt | jq"
echo ""
echo "# Test CORS with Origin header"
echo "curl -H 'Origin: https://fenarmak.naramakna.id' '$BASE_URL/content/feed' -v"