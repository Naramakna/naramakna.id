#!/usr/bin/env node

/**
 * Test Google AdSense Integration
 * Verifies that AdSense configuration is working properly
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Google AdSense Integration...\n');

// Check if .env file exists
const envPath = path.join(__dirname, 'frontend', '.env');
const envExamplePath = path.join(__dirname, 'frontend', '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found in frontend folder');
  console.log('📋 Please copy .env.example to .env first:');
  console.log('   cp frontend/.env.example frontend/.env\n');
  
  if (fs.existsSync(envExamplePath)) {
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    console.log('📝 Required environment variables:');
    const adsenseVars = envExample.split('\n').filter(line => line.includes('ADSENSE'));
    adsenseVars.forEach(line => console.log('   ' + line));
  }
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

console.log('✅ .env file found');

// Check required AdSense variables
const requiredVars = [
  'REACT_APP_ADSENSE_PUBLISHER_ID'
];

const optionalSlots = [
  'REACT_APP_ADSENSE_SLOT_HERO',
  'REACT_APP_ADSENSE_SLOT_HEADER',
  'REACT_APP_ADSENSE_SLOT_MID',
  'REACT_APP_ADSENSE_SLOT_BOTTOM',
  'REACT_APP_ADSENSE_SLOT_POPUP',
  'REACT_APP_ADSENSE_SLOT_REGULAR',
  'REACT_APP_ADSENSE_SLOT_SIDEBAR',
  'REACT_APP_ADSENSE_SLOT_ARTICLE_TOP',
  'REACT_APP_ADSENSE_SLOT_ARTICLE_MID',
  'REACT_APP_ADSENSE_SLOT_ARTICLE_BOTTOM',
  'REACT_APP_ADSENSE_SLOT_ARTICLE_FINAL',
  'REACT_APP_ADSENSE_SLOT_CONTENT',
  'REACT_APP_ADSENSE_SLOT_BREAKING_PRE',
  'REACT_APP_ADSENSE_SLOT_BREAKING_POST'
];

let missingRequired = 0;
let configuredSlots = 0;

console.log('\n📋 Checking AdSense Configuration:');

// Check required variables
requiredVars.forEach(varName => {
  if (envVars[varName] && envVars[varName] !== 'YOUR_ADSENSE_PUBLISHER_ID') {
    console.log(`   ✅ ${varName}: ${envVars[varName]}`);
  } else {
    console.log(`   ❌ ${varName}: NOT CONFIGURED`);
    missingRequired++;
  }
});

console.log('\n🎯 Ad Slot Configuration:');

// Check optional slots
optionalSlots.forEach(varName => {
  if (envVars[varName] && !envVars[varName].match(/^\d{10}$/)) {
    console.log(`   ✅ ${varName}: ${envVars[varName]}`);
    configuredSlots++;
  } else {
    console.log(`   ⚠️  ${varName}: Using default placeholder`);
  }
});

console.log(`\n📊 Configuration Summary:`);
console.log(`   Required variables: ${requiredVars.length - missingRequired}/${requiredVars.length} configured`);
console.log(`   Ad slots: ${configuredSlots}/${optionalSlots.length} configured\n`);

// Overall status
if (missingRequired === 0) {
  console.log('🎉 AdSense integration ready!');
  console.log('\n🚀 Next steps:');
  console.log('   1. Create AdSense ads in Admin Panel');
  console.log('   2. Set Media Type to "Google AdSense (Auto)"');
  console.log('   3. Choose appropriate placement type');
  console.log('   4. Monitor performance in AdSense dashboard');
  
  if (configuredSlots < optionalSlots.length) {
    console.log('\n💡 Tip: Configure actual ad slot IDs for better targeting');
  }
} else {
  console.log('⚠️  AdSense integration incomplete');
  console.log('\n🔧 Required actions:');
  console.log('   1. Sign up for Google AdSense');
  console.log('   2. Get your Publisher ID');
  console.log('   3. Update .env with your Publisher ID');
  console.log('   4. Create ad units and update slot IDs (optional)');
}

console.log('\n📖 Full documentation: ./ADSENSE_SETUP.md');
console.log('🌐 Admin panel: https://naramakna.id/superadmin/dashboard/ads\n');