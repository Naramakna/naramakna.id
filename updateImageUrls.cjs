#!/usr/bin/env node

const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const getDbConfig = () => ({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

/**
 * Update Image URLs Script
 *
 * This script updates image URLs in the database:
 * 1. Replaces all localhost and ngrok URLs with the UPLOADS_URL from environment variables
 * 2. Replaces all naramakna.id/wp-content/uploads URLs with api.naramakna.id/uploads
 *
 * The script updates URLs in the following tables:
 * - posts (post_content field)
 * - postmeta (meta_value field)
 * - users (profile_image field)
 *
 * Usage:
 * - Dry run (preview changes without applying them): node scripts/update-image-urls.js --dry-run
 * - Apply changes: node scripts/update-image-urls.js
 *
 * IMPORTANT: Always run with --dry-run first to verify the changes before applying them.
 * It's recommended to backup your database before running this script.
 */
async function updateImageUrls() {
  const isDryRun = process.argv.includes('--dry-run');
  const currentUploadsUrl = process.env.UPLOADS_URL || 'https://benarmak.naramakna.id/uploads';
  const apiUploadsUrl = 'https://api.naramakna.id/uploads';

  console.log('🖼️  Image URL Update Script');
  console.log('📋 Current uploads URL:', currentUploadsUrl);
  console.log('📋 API uploads URL:', apiUploadsUrl);
  console.log('🧪 Dry run mode:', isDryRun ? 'ON' : 'OFF');
  console.log('---');

  const connection = await mysql.createConnection(getDbConfig());

  try {
    // Patterns to replace with currentUploadsUrl
    const standardPatterns = [
      'http://localhost:3001/uploads/',
      'https://localhost:3001/uploads/',
      'http://localhost:5000/uploads/',
      'https://localhost:5000/uploads/',
      /https?:\/\/[^\/]*\.ngrok[^\/]*\.app\/uploads\//g,
      /https?:\/\/[^\/]*\.ngrok[^\/]*\.io\/uploads\//g,
    ];

    // Patterns to replace with apiUploadsUrl
    const wpContentPatterns = [
      'https://naramakna.id/wp-content/uploads/',
      'http://naramakna.id/wp-content/uploads/',
    ];

    // 1. Update posts table
    console.log('📝 Checking posts table...');

    // Process standard patterns (replace with currentUploadsUrl)
    for (const pattern of standardPatterns) {
      const likePattern = typeof pattern === 'string' ? pattern : pattern.source.replace(/\\\//g, '/');

      const [postsToUpdate] = await connection.query(`
        SELECT ID, post_title, SUBSTRING(post_content, 1, 100) as content_preview
        FROM posts
        WHERE post_content LIKE ?
      `, [`%${typeof pattern === 'string' ? pattern : 'uploads/'}%`]);

      if (postsToUpdate.length > 0) {
        console.log(`  📄 Found ${postsToUpdate.length} posts to update for pattern: ${pattern}`);

        if (!isDryRun) {
          if (typeof pattern === 'string') {
            await connection.query(`
              UPDATE posts
              SET post_content = REPLACE(post_content, ?, ?)
              WHERE post_content LIKE ?
            `, [pattern, currentUploadsUrl + '/', `%${pattern}%`]);
          } else {
            // For regex patterns, we need to handle each post individually
            for (const post of postsToUpdate) {
              const [fullPost] = await connection.query('SELECT post_content FROM posts WHERE ID = ?', [post.ID]);
              if (fullPost[0]) {
                const updatedContent = fullPost[0].post_content.replace(pattern, currentUploadsUrl + '/');
                if (updatedContent !== fullPost[0].post_content) {
                  await connection.query('UPDATE posts SET post_content = ? WHERE ID = ?', [updatedContent, post.ID]);
                }
              }
            }
          }
          console.log(`    ✅ Updated posts`);
        } else {
          postsToUpdate.slice(0, 3).forEach(post => {
            console.log(`      - ${post.post_title}: ${post.content_preview}...`);
          });
        }
      }
    }

    // Process WordPress content patterns (replace with apiUploadsUrl)
    for (const pattern of wpContentPatterns) {
      const [postsToUpdate] = await connection.query(`
        SELECT ID, post_title, SUBSTRING(post_content, 1, 100) as content_preview
        FROM posts
        WHERE post_content LIKE ?
      `, [`%${pattern}%`]);

      if (postsToUpdate.length > 0) {
        console.log(`  📄 Found ${postsToUpdate.length} posts to update for WordPress pattern: ${pattern}`);

        if (!isDryRun) {
          await connection.query(`
            UPDATE posts
            SET post_content = REPLACE(post_content, ?, ?)
            WHERE post_content LIKE ?
          `, [pattern, apiUploadsUrl + '/', `%${pattern}%`]);
          console.log(`    ✅ Updated posts`);
        } else {
          postsToUpdate.slice(0, 3).forEach(post => {
            console.log(`      - ${post.post_title}: ${post.content_preview}...`);
          });
        }
      }
    }

    // 2. Update postmeta table
    console.log('📋 Checking postmeta table...');

    // Process standard patterns (replace with currentUploadsUrl)
    for (const pattern of standardPatterns) {
      const [metaToUpdate] = await connection.query(`
        SELECT meta_id, meta_key, meta_value
        FROM postmeta
        WHERE meta_value LIKE ?
      `, [`%${typeof pattern === 'string' ? pattern : 'uploads/'}%`]);

      if (metaToUpdate.length > 0) {
        console.log(`  📋 Found ${metaToUpdate.length} postmeta entries to update for pattern: ${pattern}`);

        if (!isDryRun) {
          if (typeof pattern === 'string') {
            await connection.query(`
              UPDATE postmeta
              SET meta_value = REPLACE(meta_value, ?, ?)
              WHERE meta_value LIKE ?
            `, [pattern, currentUploadsUrl + '/', `%${pattern}%`]);
          } else {
            for (const meta of metaToUpdate) {
              const updatedValue = meta.meta_value.replace(pattern, currentUploadsUrl + '/');
              if (updatedValue !== meta.meta_value) {
                await connection.query('UPDATE postmeta SET meta_value = ? WHERE meta_id = ?', [updatedValue, meta.meta_id]);
              }
            }
          }
          console.log(`    ✅ Updated postmeta`);
        } else {
          metaToUpdate.slice(0, 3).forEach(meta => {
            console.log(`      - ${meta.meta_key}: ${meta.meta_value}`);
          });
        }
      }
    }

    // Process WordPress content patterns (replace with apiUploadsUrl)
    for (const pattern of wpContentPatterns) {
      const [metaToUpdate] = await connection.query(`
        SELECT meta_id, meta_key, meta_value
        FROM postmeta
        WHERE meta_value LIKE ?
      `, [`%${pattern}%`]);

      if (metaToUpdate.length > 0) {
        console.log(`  📋 Found ${metaToUpdate.length} postmeta entries to update for WordPress pattern: ${pattern}`);

        if (!isDryRun) {
          await connection.query(`
            UPDATE postmeta
            SET meta_value = REPLACE(meta_value, ?, ?)
            WHERE meta_value LIKE ?
          `, [pattern, apiUploadsUrl + '/', `%${pattern}%`]);
          console.log(`    ✅ Updated postmeta`);
        } else {
          metaToUpdate.slice(0, 3).forEach(meta => {
            console.log(`      - ${meta.meta_key}: ${meta.meta_value}`);
          });
        }
      }
    }

    // 3. Check user profile images
    console.log('👤 Checking user profile images...');

    const [usersToUpdate] = await connection.query(`
      SELECT ID, user_login, profile_image
      FROM users
      WHERE profile_image LIKE '%localhost%'
      OR profile_image LIKE '%.ngrok%'
      OR profile_image LIKE '/uploads/%'
      OR profile_image LIKE '%naramakna.id/wp-content/uploads/%'
      OR (profile_image NOT LIKE 'http%' AND profile_image IS NOT NULL AND profile_image != '')
    `);

    if (usersToUpdate.length > 0) {
      console.log(`  👥 Found ${usersToUpdate.length} users with profile images to update`);

      if (!isDryRun) {
        for (const user of usersToUpdate) {
          let newUrl = user.profile_image;

          // Handle different URL formats
          if (newUrl.includes('localhost')) {
            newUrl = newUrl.replace(/https?:\/\/localhost:\d+\/uploads\//, currentUploadsUrl + '/');
          } else if (newUrl.includes('.ngrok')) {
            newUrl = newUrl.replace(/https?:\/\/[^\/]*\.ngrok[^\/]*\.(app|io)\/uploads\//, currentUploadsUrl + '/');
          } else if (newUrl.includes('naramakna.id/wp-content/uploads/')) {
            newUrl = newUrl.replace(/https?:\/\/naramakna\.id\/wp-content\/uploads\//, apiUploadsUrl + '/');
          } else if (newUrl.startsWith('/uploads/')) {
            newUrl = currentUploadsUrl + newUrl;
          } else if (!newUrl.startsWith('http') && newUrl.trim() !== '') {
            newUrl = `${currentUploadsUrl}/${newUrl}`;
          }

          if (newUrl !== user.profile_image) {
            await connection.query('UPDATE users SET profile_image = ? WHERE ID = ?', [newUrl, user.ID]);
          }
        }
        console.log(`    ✅ Updated user profile images`);
      } else {
        usersToUpdate.slice(0, 3).forEach(user => {
          console.log(`      - ${user.user_login}: ${user.profile_image}`);
        });
      }
    }

    // Final verification
    console.log('---');
    console.log('🔍 Final verification:');

    const [remainingPosts] = await connection.query(`
      SELECT COUNT(*) as count
      FROM posts
      WHERE post_content LIKE '%localhost%'
      OR post_content LIKE '%.ngrok%'
    `);

    const [remainingMeta] = await connection.query(`
      SELECT COUNT(*) as count
      FROM postmeta
      WHERE meta_value LIKE '%localhost%'
      OR meta_value LIKE '%.ngrok%'
    `);

    const [remainingUsers] = await connection.query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE profile_image LIKE '%localhost%'
      OR profile_image LIKE '%.ngrok%'
    `);

    const [remainingWpContentPosts] = await connection.query(`
      SELECT COUNT(*) as count
      FROM posts
      WHERE post_content LIKE '%naramakna.id/wp-content/uploads%'
    `);

    const [remainingWpContentMeta] = await connection.query(`
      SELECT COUNT(*) as count
      FROM postmeta
      WHERE meta_value LIKE '%naramakna.id/wp-content/uploads%'
    `);

    const [remainingWpContentUsers] = await connection.query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE profile_image LIKE '%naramakna.id/wp-content/uploads%'
    `);

    console.log(`📝 Posts with localhost/ngrok URLs: ${remainingPosts[0].count}`);
    console.log(`📋 Postmeta with localhost/ngrok URLs: ${remainingMeta[0].count}`);
    console.log(`👤 Users with localhost/ngrok URLs: ${remainingUsers[0].count}`);
    console.log(`📝 Posts with WordPress content URLs: ${remainingWpContentPosts[0].count}`);
    console.log(`📋 Postmeta with WordPress content URLs: ${remainingWpContentMeta[0].count}`);
    console.log(`👤 Users with WordPress content URLs: ${remainingWpContentUsers[0].count}`);

    if (isDryRun) {
      console.log('');
      console.log('🧪 This was a dry run. To apply changes, run without --dry-run flag');
    } else {
      console.log('');
      console.log('✅ Image URL update completed successfully!');
    }

  } catch (error) {
    console.error('❌ Error updating image URLs:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run the script
updateImageUrls().catch(console.error);