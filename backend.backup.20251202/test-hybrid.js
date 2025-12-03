/**
 * Test script untuk demonstrasi Hybrid Content System
 * Jalankan dengan: node test-hybrid.js
 */

const { Post, PostMeta, Analytics, Advertisement } = require('./src/models');
const ContentHelpers = require('./src/models/ContentHelpers');

async function demonstrateHybridSystem() {
  console.log('🚀 Demonstrasi Hybrid Content System Naramakna\n');
  
  try {
    // Test database connection
    await require('./src/models').sequelize.authenticate();
    console.log('✅ Database connection successful\n');
    
    // Demo 1: Show content types
    console.log('📋 Content Types yang Didukung:');
    Object.entries(ContentHelpers.CONTENT_TYPES).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value}`);
    });
    console.log();
    
    // Demo 2: Show meta keys for YouTube
    console.log('🎥 Meta Keys untuk YouTube Videos:');
    const youtubeKeys = Object.entries(ContentHelpers.META_KEYS)
      .filter(([key]) => key.includes('YOUTUBE'))
      .slice(0, 5);
    youtubeKeys.forEach(([key, value]) => {
      console.log(`  - ${key}: ${value}`);
    });
    console.log();
    
    // Demo 3: Show meta keys for TikTok
    console.log('🎵 Meta Keys untuk TikTok Videos:');
    const tiktokKeys = Object.entries(ContentHelpers.META_KEYS)
      .filter(([key]) => key.includes('TIKTOK'))
      .slice(0, 5);
    tiktokKeys.forEach(([key, value]) => {
      console.log(`  - ${key}: ${value}`);
    });
    console.log();
    
    // Demo 4: Show how to create YouTube video (simulated)
    console.log('🎯 Contoh Struktur Data YouTube Video:');
    const youtubeExample = {
      videoId: 'dQw4w9WgXcQ',
      title: 'Tutorial React Advanced Hooks',
      description: 'Belajar React Hooks tingkat lanjut untuk developer Indonesia',
      channelTitle: 'Naramakna Tech',
      viewCount: 125000,
      likeCount: 3500,
      duration: 'PT15M30S',
      thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
    };
    console.log('  Data yang akan disimpan:', JSON.stringify(youtubeExample, null, 2));
    console.log();
    
    // Demo 5: Show how to create TikTok video (simulated)
    console.log('🎵 Contoh Struktur Data TikTok Video:');
    const tiktokExample = {
      videoId: '7234567890123456789',
      description: 'Tips coding sambil ngopi ☕ #coding #developer',
      username: 'naramakna.tech',
      displayName: 'Naramakna Tech',
      playCount: 250000,
      likeCount: 12000,
      shareCount: 800,
      coverUrl: 'https://p16-sign.tiktokcdn-us.com/example.jpg'
    };
    console.log('  Data yang akan disimpan:', JSON.stringify(tiktokExample, null, 2));
    console.log();
    
    // Demo 6: Mixed content feed concept
    console.log('📰 Konsep Mixed Content Feed:');
    console.log('  Query untuk mendapatkan semua konten:');
    console.log('  SELECT * FROM posts WHERE post_status = "publish"');
    console.log('  ORDER BY post_date DESC;');
    console.log();
    console.log('  Hasil akan berisi:');
    console.log('  - Artikel (post_type = "post")');
    console.log('  - Video YouTube (post_type = "youtube_video")');  
    console.log('  - Video TikTok (post_type = "tiktok_video")');
    console.log('  - Semua dengan metadata masing-masing di tabel postmeta');
    console.log();
    
    console.log('✅ Hybrid Content System siap digunakan!');
    console.log('💡 Jalankan npm run dev untuk memulai development');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('💡 Pastikan database MySQL sudah running dan ter-configure');
  }
}

// Run demonstration
demonstrateHybridSystem().then(() => {
  console.log('\n🎉 Demo selesai!');
}).catch(console.error);