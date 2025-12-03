const { User, Advertisement } = require('./src/models');

async function createTestPopupAd() {
  try {
    console.log('🎯 Creating test popup ad...');
    
    // Find admin user
    const admin = await User.findOne({ 
      where: { 
        user_role: 'admin'
      } 
    });
    
    if (!admin) { 
      console.log('❌ No admin user found'); 
      return; 
    }

    console.log('👤 Found admin:', admin.display_name);

    // Create popup ad with Picsum image 900x1200
    const ad = await Advertisement.create({
      advertiser_id: admin.ID,
      campaign_name: 'Test Popup Ad - Homepage Demo',
      start_date: new Date('2025-08-15'),
      end_date: new Date('2025-12-31'),
      placement_type: 'popup',
      media_type: 'image',
      media_url: 'https://picsum.photos/900/1200?random=42',
      image_url: 'https://picsum.photos/900/1200?random=42',
      target_url: 'https://naramakna.id',
      budget: 150000,
      status: 'active'
    });

    console.log('✅ Test popup ad created successfully!');
    console.log('📊 Details:');
    console.log('- ID:', ad.id);
    console.log('- Title:', ad.campaign_name);
    console.log('- Placement:', ad.placement_type);
    console.log('- Status:', ad.status);
    console.log('- Image URL:', ad.media_url);
    console.log('- Size: 900x1200px (3:4 ratio)');
    console.log('- Target:', ad.target_url);
    console.log('');
    console.log('🎯 Test instructions:');
    console.log('1. Go to http://localhost:5174/ (homepage)');
    console.log('2. Open DevTools Console');
    console.log('3. Run: localStorage.removeItem("naramakna_popup_shown")');
    console.log('4. Refresh page');
    console.log('5. Popup should appear after 1 second delay');
    
  } catch (error) {
    console.error('❌ Error creating popup ad:', error.message);
  } finally {
    process.exit(0);
  }
}

createTestPopupAd();
