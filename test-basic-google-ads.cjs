#!/usr/bin/env node

require('dotenv').config({ path: './backend/.env' });

async function testBasicGoogleAds() {
    console.log('🔍 Basic Google Ads API Test...');
    
    try {
        const { GoogleAdsApi } = require('google-ads-api');
        
        console.log('📦 Package imported successfully');
        
        const client = new GoogleAdsApi({
            client_id: process.env.GOOGLE_ADS_CLIENT_ID,
            client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
            developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
        });
        
        console.log('🔧 Client created successfully');
        console.log('Client type:', typeof client);
        console.log('Client methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
        
        // Try creating customer instance
        console.log('Creating customer instance...');
        const customer = client.Customer({
            customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
            refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
        });
        
        console.log('✅ Customer instance created');
        console.log('Customer type:', typeof customer);
        console.log('Customer methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(customer)));
        
        // Try a very simple query
        console.log('\n🔍 Testing simple query...');
        const query = "SELECT customer.id FROM customer LIMIT 1";
        
        console.log('Query:', query);
        console.log('Customer ID:', process.env.GOOGLE_ADS_CUSTOMER_ID);
        
        const result = await customer.query(query);
        console.log('✅ Query executed successfully!');
        console.log('Result:', result);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        
        // Try debugging what's in the response
        if (error.response) {
            console.log('Response data:', error.response.data);
            console.log('Response status:', error.response.status);
            console.log('Response headers:', error.response.headers);
        }
    }
}

testBasicGoogleAds().catch(console.error);