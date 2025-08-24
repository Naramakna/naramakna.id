#!/bin/bash

# Naramakna API Test Script
# Usage: ./api-test.sh

BASE_URL="https://benarmak.naramakna.id/api"
COOKIE_JAR="cookies.txt"

echo "🚀 Naramakna API Test Suite"
echo "=========================="
echo "Base URL: $BASE_URL"
echo "Cookie jar: $COOKIE_JAR"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run test
run_test() {
    local name="$1"
    local cmd="$2"
    echo -e "${YELLOW}Testing: $name${NC}"
    echo "Command: $cmd"
    echo "Response:"
    eval "$cmd"
    echo ""
    echo "---"
    echo ""
}

# Clean up old cookies
rm -f $COOKIE_JAR

echo "📋 1. API ROOT - Check if API is alive"
run_test "API Root" "curl -s '$BASE_URL' | jq ."

echo "📋 2. AUTHENTICATION TESTS"
echo "========================="

echo "🔐 2.1 Register new user"
run_test "Register User" "curl -s -X POST '$BASE_URL/auth/register' \
  -H 'Content-Type: application/json' \
  -c $COOKIE_JAR \
  -d '{
    \"user_login\": \"testuser$(date +%s)\",
    \"user_email\": \"test$(date +%s)@example.com\",
    \"user_pass\": \"password123\",
    \"display_name\": \"Test User\",
    \"role_request\": \"user\"
  }' | jq ."

echo "🔐 2.2 Login with test user"
run_test "Login User" "curl -s -X POST '$BASE_URL/auth/login' \
  -H 'Content-Type: application/json' \
  -c $COOKIE_JAR \
  -d '{
    \"identifier\": \"admin@naramakna.id\",
    \"user_pass\": \"admin123\",
    \"remember_me\": true
  }' | jq ."

echo "🔐 2.3 Get user profile (requires auth)"
run_test "Get Profile" "curl -s '$BASE_URL/auth/profile' \
  -H 'Content-Type: application/json' \
  -b $COOKIE_JAR | jq ."

echo "📋 3. CONTENT TESTS"
echo "=================="

echo "📰 3.1 Get content feed"
run_test "Content Feed" "curl -s '$BASE_URL/content/feed?limit=5&type=post' \
  -b $COOKIE_JAR | jq ."

echo "📰 3.2 Get trending content"
run_test "Trending Content" "curl -s '$BASE_URL/content/trending?limit=5&type=post' \
  -b $COOKIE_JAR | jq ."

echo "📰 3.3 Get categories"
run_test "Categories" "curl -s '$BASE_URL/content/categories?limit=10&mainCategoriesOnly=true' \
  -b $COOKIE_JAR | jq ."

echo "📰 3.4 Search content"
run_test "Search Content" "curl -s '$BASE_URL/content/search?q=teknologi&limit=3' \
  -b $COOKIE_JAR | jq ."

echo "📋 4. ADS TESTS"
echo "=============="

echo "📢 4.1 Get ads"
run_test "Get Ads" "curl -s '$BASE_URL/ads/serve?placement=regular&limit=3' \
  -b $COOKIE_JAR | jq ."

echo "📢 4.2 Get popup ads"
run_test "Popup Ads" "curl -s '$BASE_URL/ads/popup-active' \
  -b $COOKIE_JAR | jq ."

echo "📋 5. POLLING TESTS"
echo "=================="

echo "🗳️ 5.1 Get active polls"
run_test "Active Polls" "curl -s '$BASE_URL/polling/active?limit=5' \
  -b $COOKIE_JAR | jq ."

echo "📋 6. VIDEO TESTS"
echo "================"

echo "📺 6.1 Get YouTube videos"
run_test "YouTube Videos" "curl -s '$BASE_URL/youtube/public?limit=3' \
  -b $COOKIE_JAR | jq ."

echo "📱 6.2 Get TikTok videos"
run_test "TikTok Videos" "curl -s '$BASE_URL/tiktok/videos?limit=3' \
  -b $COOKIE_JAR | jq ."

echo "📋 7. ANALYTICS TESTS"
echo "==================="

echo "📊 7.1 Track page view"
run_test "Track Page View" "curl -s -X POST '$BASE_URL/analytics/track' \
  -H 'Content-Type: application/json' \
  -b $COOKIE_JAR \
  -d '{
    \"event_type\": \"page_view\",
    \"page_url\": \"/test-page\",
    \"page_title\": \"Test Page\",
    \"referrer\": \"https://google.com\"
  }' | jq ."

echo "📋 8. ADMIN TESTS (requires admin role)"
echo "======================================"

echo "👑 8.1 Get admin stats"
run_test "Admin Stats" "curl -s '$BASE_URL/analytics/dashboard-stats' \
  -b $COOKIE_JAR | jq ."

echo "👑 8.2 Get all users (admin only)"
run_test "All Users" "curl -s '$BASE_URL/admin/users?limit=5' \
  -b $COOKIE_JAR | jq ."

echo "📋 9. LOGOUT TEST"
echo "================"

echo "🚪 9.1 Logout user"
run_test "Logout" "curl -s -X POST '$BASE_URL/auth/logout' \
  -H 'Content-Type: application/json' \
  -b $COOKIE_JAR | jq ."

echo "🚪 9.2 Try accessing protected route after logout"
run_test "Protected After Logout" "curl -s '$BASE_URL/auth/profile' \
  -H 'Content-Type: application/json' \
  -b $COOKIE_JAR | jq ."

echo "📋 10. CORS TEST"
echo "==============="

echo "🌐 10.1 CORS preflight test"
run_test "CORS Preflight" "curl -s -X OPTIONS '$BASE_URL/auth/login' \
  -H 'Origin: https://naramakna.id' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: Content-Type' \
  -v 2>&1 | grep -E '(< HTTP|< Access-Control)'"

echo ""
echo "🎉 API Test Suite Complete!"
echo "============================="
echo "Check the responses above for any errors."
echo "Cookie jar saved to: $COOKIE_JAR"
echo ""
echo "📝 Quick Manual Tests:"
echo "Login:    curl -X POST '$BASE_URL/auth/login' -H 'Content-Type: application/json' -c cookies.txt -d '{\"identifier\":\"admin@naramakna.id\",\"user_pass\":\"admin123\"}'"
echo "Profile:  curl '$BASE_URL/auth/profile' -b cookies.txt"
echo "Content:  curl '$BASE_URL/content/feed?limit=3' -b cookies.txt"
echo "Logout:   curl -X POST '$BASE_URL/auth/logout' -b cookies.txt"