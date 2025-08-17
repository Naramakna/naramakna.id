const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function addSampleTikTokData() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Connected to database');

    // Sample TikTok videos data dari @naramakna.id
    const sampleVideos = [
      {
        tiktok_video_id: 'sample1',
        tiktok_username: 'naramakna.id',
        title: 'Breaking News: Update Terbaru dari Naramakna',
        description: 'Ikuti terus update berita terkini dari Naramakna.id - portal berita terpercaya Indonesia',
        duration: 30,
        video_url: 'https://example.com/sample1.mp4',
        cover_image_url: 'https://picsum.photos/400/600?random=1',
        web_video_url: 'https://www.tiktok.com/@naramakna.id/video/sample1',
        share_url: 'https://vm.tiktok.com/sample1',
        tiktok_view_count: 15420,
        tiktok_like_count: 892,
        tiktok_share_count: 45,
        tiktok_comment_count: 67,
        local_view_count: 0,
        hashtags: JSON.stringify(['#naramakna', '#berita', '#indonesia', '#news']),
        source: 'synced',
        publish_status: 'published',
        privacy_level: 'PUBLIC_TO_EVERYONE',
        categories: 'news,politics'
      },
      {
        tiktok_video_id: 'sample2',
        tiktok_username: 'naramakna.id',
        title: 'Tips Membaca Berita dengan Bijak',
        description: 'Dalam era digital ini, penting untuk bisa membaca berita dengan bijak dan kritis',
        duration: 45,
        video_url: 'https://example.com/sample2.mp4',
        cover_image_url: 'https://picsum.photos/400/600?random=2',
        web_video_url: 'https://www.tiktok.com/@naramakna.id/video/sample2',
        share_url: 'https://vm.tiktok.com/sample2',
        tiktok_view_count: 8750,
        tiktok_like_count: 456,
        tiktok_share_count: 23,
        tiktok_comment_count: 89,
        local_view_count: 0,
        hashtags: JSON.stringify(['#literasimedia', '#berita', '#edukasi', '#tips']),
        source: 'synced',
        publish_status: 'published',
        privacy_level: 'PUBLIC_TO_EVERYONE',
        categories: 'education,tips'
      },
      {
        tiktok_video_id: 'sample3',
        tiktok_username: 'naramakna.id',
        title: 'Cerdas Memaknai - Filosofi Naramakna',
        description: 'Kenali lebih dalam filosofi "Cerdas Memaknai" yang menjadi tagline Naramakna.id',
        duration: 60,
        video_url: 'https://example.com/sample3.mp4',
        cover_image_url: 'https://picsum.photos/400/600?random=3',
        web_video_url: 'https://www.tiktok.com/@naramakna.id/video/sample3',
        share_url: 'https://vm.tiktok.com/sample3',
        tiktok_view_count: 12300,
        tiktok_like_count: 678,
        tiktok_share_count: 34,
        tiktok_comment_count: 45,
        local_view_count: 0,
        hashtags: JSON.stringify(['#cerdasmemaknai', '#naramakna', '#filosofi', '#wisdom']),
        source: 'synced',
        publish_status: 'published',
        privacy_level: 'PUBLIC_TO_EVERYONE',
        categories: 'philosophy,brand'
      },
      {
        tiktok_video_id: 'sample4',
        tiktok_username: 'naramakna.id',
        title: 'Behind The Scenes: Redaksi Naramakna',
        description: 'Lihat bagaimana tim redaksi Naramakna.id bekerja untuk menghadirkan berita berkualitas',
        duration: 75,
        video_url: 'https://example.com/sample4.mp4',
        cover_image_url: 'https://picsum.photos/400/600?random=4',
        web_video_url: 'https://www.tiktok.com/@naramakna.id/video/sample4',
        share_url: 'https://vm.tiktok.com/sample4',
        tiktok_view_count: 9870,
        tiktok_like_count: 523,
        tiktok_share_count: 28,
        tiktok_comment_count: 91,
        local_view_count: 0,
        hashtags: JSON.stringify(['#behindthescenes', '#redaksi', '#journalism', '#newsroom']),
        source: 'synced',
        publish_status: 'published',
        privacy_level: 'PUBLIC_TO_EVERYONE',
        categories: 'behind-scenes,journalism'
      }
    ];

    for (const video of sampleVideos) {
      await connection.query(`
        INSERT INTO tiktok_videos (
          tiktok_video_id, tiktok_username, title, description, duration,
          video_url, cover_image_url, web_video_url, share_url,
          tiktok_view_count, tiktok_like_count, tiktok_share_count, tiktok_comment_count,
          local_view_count, hashtags, source, publish_status, privacy_level, categories,
          tiktok_created_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
      `, [
        video.tiktok_video_id, video.tiktok_username, video.title, video.description, video.duration,
        video.video_url, video.cover_image_url, video.web_video_url, video.share_url,
        video.tiktok_view_count, video.tiktok_like_count, video.tiktok_share_count, video.tiktok_comment_count,
        video.local_view_count, video.hashtags, video.source, video.publish_status, video.privacy_level, video.categories
      ]);
      
      console.log(`Added video: ${video.title}`);
    }

    await connection.end();
    console.log('Sample TikTok data added successfully!');

  } catch (error) {
    console.error('Error adding sample TikTok data:', error);
  }
}

addSampleTikTokData();
