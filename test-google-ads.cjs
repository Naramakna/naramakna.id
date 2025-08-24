#!/usr/bin/env node

/**
 * Test Google Ads API Connection
 * Quick test script to verify Google Ads API setup
 */

require('dotenv').config({ path: './backend/.env' });

async function testGoogleAdsConnection() {
    console.log('🚀 Testing Google Ads API Connection...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Check environment variables
    console.log('\n📋 Environment Variables:');
    console.log('GOOGLE_ADS_CUSTOMER_ID:', process.env.GOOGLE_ADS_CUSTOMER_ID);
    console.log('GOOGLE_ADS_CLIENT_ID:', process.env.GOOGLE_ADS_CLIENT_ID ? '✓ Set' : '❌ Missing');
    console.log('GOOGLE_ADS_CLIENT_SECRET:', process.env.GOOGLE_ADS_CLIENT_SECRET ? '✓ Set' : '❌ Missing');
    console.log('GOOGLE_ADS_REFRESH_TOKEN:', process.env.GOOGLE_ADS_REFRESH_TOKEN ? '✓ Set' : '❌ Missing');
    console.log('GOOGLE_ADS_DEVELOPER_TOKEN:', process.env.GOOGLE_ADS_DEVELOPER_TOKEN ? '✓ Set' : '❌ Missing');
    
    try {
        // Import Google Ads service
        const googleAdsService = require('./backend/src/services/googleAds');
        
        console.log('\n🔌 Testing API Connection...');
        const connectionResult = await googleAdsService.testConnection();
        
        if (connectionResult.success) {
            console.log('✅ Connection successful!');
            console.log('\n📊 Account Info:');
            console.log('- ID:', connectionResult.account.id);
            console.log('- Name:', connectionResult.account.descriptive_name);
            console.log('- Currency:', connectionResult.account.currency_code);
            console.log('- Timezone:', connectionResult.account.time_zone);
            console.log('- Status:', connectionResult.account.status);
            
            console.log('\n🎯 Testing Campaign Retrieval...');
            const campaigns = await googleAdsService.getCampaigns();
            console.log(`📈 Found ${campaigns.length} active campaigns:`);
            
            campaigns.slice(0, 3).forEach(campaign => {
                console.log(`- ${campaign.name} (${campaign.type})`);
            });
            
            if (campaigns.length > 0) {
                console.log('\n🎨 Testing Ads Retrieval...');
                const campaignIds = campaigns.slice(0, 2).map(c => c.id);
                const ads = await googleAdsService.getAds(campaignIds);
                console.log(`📢 Found ${ads.length} ads in first 2 campaigns`);
                
                if (ads.length > 0) {
                    console.log('Sample ad:', ads[0].name);
                }
            }
            
            console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🎉 Google Ads API is ready for use!');
            console.log('🔧 Next step: Apply for Basic Access in Google Ads API dashboard');
            console.log('📱 Visit: https://ads.google.com/aw/apicenter');
            
        } else {
            console.log('❌ Connection failed:', connectionResult.error);
        }
        
    } catch (error) {
        console.error('💥 Test failed:', error.message);
        console.error('\n🔍 Common issues:');
        console.error('- Check environment variables are correct');
        console.error('- Verify Google Ads account permissions');
        console.error('- Ensure API access is enabled');
        console.error('- Check refresh token validity');
    }
}

// Run the test
testGoogleAdsConnection()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Test script error:', error);
        process.exit(1);
    });