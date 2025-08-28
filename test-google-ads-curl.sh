#!/bin/bash

# Test Google Ads API Connection
# Load environment variables
source /var/www/naramakna.id/backend/.env

echo "Testing Google Ads API Connection..."
echo "Customer ID: $GOOGLE_ADS_CUSTOMER_ID"
echo "Client ID: ${GOOGLE_ADS_CLIENT_ID:0:20}..."

# Test with refresh token to get access token
echo "Getting access token..."
response=$(curl -s -X POST https://oauth2.googleapis.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=$GOOGLE_ADS_CLIENT_ID" \
  -d "client_secret=$GOOGLE_ADS_CLIENT_SECRET" \
  -d "refresh_token=$GOOGLE_ADS_REFRESH_TOKEN" \
  -d "grant_type=refresh_token")

echo "Response: $response"

# Extract access token
access_token=$(echo $response | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -n "$access_token" ]; then
    echo "✅ Got access token: ${access_token:0:20}..."
    
    # Test Google Ads API call
    echo "Testing Google Ads API call..."
    ads_response=$(curl -s -X GET \
      "https://googleads.googleapis.com/v14/customers/$GOOGLE_ADS_CUSTOMER_ID/campaigns" \
      -H "Authorization: Bearer $access_token" \
      -H "developer-token: $GOOGLE_ADS_DEVELOPER_TOKEN")
    
    echo "Ads API Response: $ads_response"
else
    echo "❌ Failed to get access token"
fi
