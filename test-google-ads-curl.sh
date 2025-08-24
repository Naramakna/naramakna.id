#!/bin/bash

# Test Google Ads API with direct HTTP requests
# This helps us understand if the issue is with the Node.js library or the API itself

source backend/.env

echo "🔍 Testing Google Ads API with direct HTTP requests..."
echo "Customer ID: $GOOGLE_ADS_CUSTOMER_ID"
echo "Developer Token: $GOOGLE_ADS_DEVELOPER_TOKEN"

# First, get fresh access token from refresh token
echo -e "\n🔄 Getting fresh access token..."

ACCESS_TOKEN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=$GOOGLE_ADS_CLIENT_ID" \
  -d "client_secret=$GOOGLE_ADS_CLIENT_SECRET" \
  -d "refresh_token=$GOOGLE_ADS_REFRESH_TOKEN" \
  -d "grant_type=refresh_token" \
  https://oauth2.googleapis.com/token)

echo "Token response: $ACCESS_TOKEN_RESPONSE"

# Extract access token using jq (or basic grep if jq not available)
if command -v jq &> /dev/null; then
    ACCESS_TOKEN=$(echo $ACCESS_TOKEN_RESPONSE | jq -r '.access_token')
else
    ACCESS_TOKEN=$(echo $ACCESS_TOKEN_RESPONSE | sed -n 's/.*"access_token": *"\([^"]*\)".*/\1/p')
fi

echo "Access token: ${ACCESS_TOKEN:0:50}..."

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
    echo "❌ Failed to get access token"
    echo "Response was: $ACCESS_TOKEN_RESPONSE"
    exit 1
fi

echo -e "\n🔍 Testing Google Ads API query..."

# First, let's try to list accessible customers
echo "🔍 Listing accessible customers..."
CUSTOMERS_RESPONSE=$(curl -s -X GET \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "developer-token: $GOOGLE_ADS_DEVELOPER_TOKEN" \
  -H "Content-Type: application/json" \
  "https://googleads.googleapis.com/v21/customers:listAccessibleCustomers")

echo "Accessible Customers:"
echo "$CUSTOMERS_RESPONSE"

# Try with correct customer IDs from accessible customers
CUSTOMER_ID_1="4713804246"
CUSTOMER_ID_2="2413041593"

echo -e "\n🔍 Testing with correct Customer ID 1: $CUSTOMER_ID_1"

RESPONSE1=$(curl -s -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "developer-token: $GOOGLE_ADS_DEVELOPER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone FROM customer LIMIT 1"
  }' \
  "https://googleads.googleapis.com/v21/customers/$CUSTOMER_ID_1/googleAds:search")

echo "Customer ID 1 Response:"
echo "$RESPONSE1"

echo -e "\n🔍 Testing with correct Customer ID 2: $CUSTOMER_ID_2"

RESPONSE2=$(curl -s -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "developer-token: $GOOGLE_ADS_DEVELOPER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone FROM customer LIMIT 1"
  }' \
  "https://googleads.googleapis.com/v21/customers/$CUSTOMER_ID_2/googleAds:search")

echo "Customer ID 2 Response:"
echo "$RESPONSE2"

echo -e "\n✅ Direct API test completed"