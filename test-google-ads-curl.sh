#!/bin/bash

# Test script untuk Google Ads authentication dan connection test
# Usage: ./test-google-ads-curl.sh

echo "🚀 Testing Google Ads Authentication Flow for Naramakna Admin"
echo "============================================================"

BASE_URL="https://naramakna.id/api"
# BASE_URL="http://localhost:5000/api"  # Uncomment for local testing

echo ""
echo "1. Getting Google Admin Auth URL..."
echo "curl -X GET $BASE_URL/auth/google/admin"

RESPONSE=$(curl -s -X GET "$BASE_URL/auth/google/admin")
echo "Response: $RESPONSE"

# Extract auth_url from JSON response
AUTH_URL=$(echo $RESPONSE | grep -o '"auth_url":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$AUTH_URL" ]; then
    echo ""
    echo "✅ Google Admin Auth URL generated successfully!"
    echo ""
    echo "🔗 Open this URL in your browser to authorize Google Ads access:"
    echo "$AUTH_URL"
    echo ""
    echo "📝 After authorization, you'll be redirected to the admin dashboard."
    echo "    The JWT token will be automatically stored in your browser cookies."
    echo ""
    echo "2. After authorization, you can test the connection with:"
    echo "   curl -X GET $BASE_URL/auth/google-ads/test \\"
    echo "        -H 'Cookie: naramakna_auth=YOUR_JWT_TOKEN'"
    echo ""
    echo "   Or simply visit: https://naramakna.id/admin/dashboard"
    echo "   and check if Google Ads status shows as 'Connected'"
else
    echo ""
    echo "❌ Failed to get Google Admin Auth URL"
    echo "Response: $RESPONSE"
fi

echo ""
echo "💡 Tips:"
echo "   - Make sure you have admin/superadmin account in the system"
echo "   - Your Google account should have access to Google Ads"
echo "   - Environment variables should be properly set:"
echo "     * GOOGLE_ADS_CLIENT_ID"
echo "     * GOOGLE_ADS_CLIENT_SECRET" 
echo "     * GOOGLE_ADS_DEVELOPER_TOKEN"
echo "     * GOOGLE_ADS_CUSTOMER_ID"
echo "     * GOOGLE_ADS_REFRESH_TOKEN"