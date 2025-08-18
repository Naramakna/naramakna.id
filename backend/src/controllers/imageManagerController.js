const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const getDbConfig = () => ({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

class ImageManagerController {
  
  /**
   * Analyze image URLs in database (dry-run)
   */
  static async analyzeImageUrls(req, res) {
    try {
      const connection = await mysql.createConnection(getDbConfig());
      
      const analysis = {
        posts: { total: 0, needsUpdate: 0, patterns: {} },
        postmeta: { total: 0, needsUpdate: 0, patterns: {} },
        users: { total: 0, needsUpdate: 0, patterns: {} },
        tiktok_videos: { total: 0, needsUpdate: 0, patterns: {} }
      };
      
      // Patterns to detect
      const patterns = [
        { name: 'localhost:3001', pattern: 'localhost:3001' },
        { name: 'localhost:5173', pattern: 'localhost:5173' },
        { name: 'localhost:5000', pattern: 'localhost:5000' },
        { name: 'ngrok.app', pattern: '.ngrok.app' },
        { name: 'ngrok.io', pattern: '.ngrok.io' },
        { name: 'relative paths', pattern: '/uploads/' }
      ];

      // Analyze posts table
      const [postsTotal] = await connection.query('SELECT COUNT(*) as count FROM posts');
      analysis.posts.total = postsTotal[0].count;
      
      for (const pattern of patterns) {
        const [postsWithPattern] = await connection.query(`
          SELECT COUNT(*) as count, 
                 GROUP_CONCAT(DISTINCT SUBSTRING(post_title, 1, 50) SEPARATOR '; ') as sample_titles
          FROM posts 
          WHERE post_content LIKE ?
        `, [`%${pattern.pattern}%`]);
        
        if (postsWithPattern[0].count > 0) {
          analysis.posts.patterns[pattern.name] = {
            count: postsWithPattern[0].count,
            samples: postsWithPattern[0].sample_titles
          };
          analysis.posts.needsUpdate += postsWithPattern[0].count;
        }
      }

      // Analyze postmeta table
      const [postmetaTotal] = await connection.query('SELECT COUNT(*) as count FROM postmeta');
      analysis.postmeta.total = postmetaTotal[0].count;
      
      for (const pattern of patterns) {
        const [postmetaWithPattern] = await connection.query(`
          SELECT COUNT(*) as count,
                 GROUP_CONCAT(DISTINCT meta_key SEPARATOR '; ') as sample_keys
          FROM postmeta 
          WHERE meta_value LIKE ?
        `, [`%${pattern.pattern}%`]);
        
        if (postmetaWithPattern[0].count > 0) {
          analysis.postmeta.patterns[pattern.name] = {
            count: postmetaWithPattern[0].count,
            samples: postmetaWithPattern[0].sample_keys
          };
          analysis.postmeta.needsUpdate += postmetaWithPattern[0].count;
        }
      }

      // Analyze users table
      const [usersTotal] = await connection.query('SELECT COUNT(*) as count FROM users');
      analysis.users.total = usersTotal[0].count;
      
      const [usersWithOldUrls] = await connection.query(`
        SELECT COUNT(*) as count,
               GROUP_CONCAT(DISTINCT user_login SEPARATOR '; ') as sample_users
        FROM users 
        WHERE profile_image LIKE '%localhost%' 
        OR profile_image LIKE '%.ngrok%'
        OR (profile_image LIKE '/uploads/%' AND profile_image NOT LIKE 'http%')
      `);
      
      if (usersWithOldUrls[0].count > 0) {
        analysis.users.patterns['old_urls'] = {
          count: usersWithOldUrls[0].count,
          samples: usersWithOldUrls[0].sample_users
        };
        analysis.users.needsUpdate = usersWithOldUrls[0].count;
      }

      // Analyze tiktok_videos table
      try {
        const [tiktokTotal] = await connection.query('SELECT COUNT(*) as count FROM tiktok_videos');
        analysis.tiktok_videos.total = tiktokTotal[0].count;
        
        const [tiktokWithOldUrls] = await connection.query(`
          SELECT COUNT(*) as count
          FROM tiktok_videos 
          WHERE cover_image_url LIKE '%localhost%' 
          OR cover_image_url LIKE '%.ngrok%'
          OR (cover_image_url LIKE '/uploads/%' AND cover_image_url NOT LIKE 'http%')
        `);
        
        if (tiktokWithOldUrls[0].count > 0) {
          analysis.tiktok_videos.patterns['old_urls'] = {
            count: tiktokWithOldUrls[0].count,
            samples: 'TikTok cover images'
          };
          analysis.tiktok_videos.needsUpdate = tiktokWithOldUrls[0].count;
        }
      } catch (error) {
        // TikTok table might not exist
        analysis.tiktok_videos.error = 'Table does not exist';
      }

      await connection.end();

      res.json({
        success: true,
        data: {
          analysis,
          currentSettings: {
            backend_url: process.env.BACKEND_URL,
            uploads_url: process.env.UPLOADS_URL,
            frontend_url: process.env.FRONTEND_URL
          },
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error analyzing image URLs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze image URLs',
        error: error.message
      });
    }
  }

  /**
   * Update image URLs based on selected tables and patterns
   */
  static async updateImageUrls(req, res) {
    try {
      const { tables, patterns, newBaseUrl, dryRun = false } = req.body;
      const userId = req.user.ID;
      
      if (!tables || !Array.isArray(tables) || tables.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please select at least one table to update'
        });
      }

      if (!patterns || !Array.isArray(patterns) || patterns.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please select at least one pattern to replace'
        });
      }

      const connection = await mysql.createConnection(getDbConfig());
      const results = {};
      const currentUploadsUrl = newBaseUrl || process.env.UPLOADS_URL;

      console.log(`🖼️ ${dryRun ? 'DRY RUN - ' : ''}Image URL update started by user ${req.user.user_login}`);
      console.log('📋 Tables:', tables);
      console.log('📋 Patterns:', patterns);
      console.log('📋 New URL:', currentUploadsUrl);

      // Update posts table
      if (tables.includes('posts')) {
        let postsUpdated = 0;
        
        for (const pattern of patterns) {
          const [postsToUpdate] = await connection.query(`
            SELECT ID, post_title 
            FROM posts 
            WHERE post_content LIKE ?
          `, [`%${pattern}%`]);

          if (!dryRun && postsToUpdate.length > 0) {
            const updateResult = await connection.query(`
              UPDATE posts 
              SET post_content = REPLACE(post_content, ?, ?)
              WHERE post_content LIKE ?
            `, [pattern, `${currentUploadsUrl}/`, `%${pattern}%`]);
            
            postsUpdated += updateResult[0].affectedRows;
          }
        }
        
        results.posts = { updated: postsUpdated };
      }

      // Update postmeta table
      if (tables.includes('postmeta')) {
        let postmetaUpdated = 0;
        
        for (const pattern of patterns) {
          const [metaToUpdate] = await connection.query(`
            SELECT meta_id, meta_key 
            FROM postmeta 
            WHERE meta_value LIKE ?
          `, [`%${pattern}%`]);

          if (!dryRun && metaToUpdate.length > 0) {
            const updateResult = await connection.query(`
              UPDATE postmeta 
              SET meta_value = REPLACE(meta_value, ?, ?)
              WHERE meta_value LIKE ?
            `, [pattern, `${currentUploadsUrl}/`, `%${pattern}%`]);
            
            postmetaUpdated += updateResult[0].affectedRows;
          }
        }
        
        results.postmeta = { updated: postmetaUpdated };
      }

      // Update users table
      if (tables.includes('users')) {
        const [usersToUpdate] = await connection.query(`
          SELECT ID, user_login, profile_image
          FROM users 
          WHERE profile_image LIKE '%localhost%' 
          OR profile_image LIKE '%.ngrok%'
          OR (profile_image LIKE '/uploads/%' AND profile_image NOT LIKE 'http%')
        `);

        let usersUpdated = 0;
        
        if (!dryRun) {
          for (const user of usersToUpdate) {
            let newUrl = user.profile_image;
            
            // Handle different URL formats
            for (const pattern of patterns) {
              if (newUrl.includes(pattern)) {
                if (pattern.includes('localhost') || pattern.includes('ngrok')) {
                  newUrl = newUrl.replace(new RegExp(`https?://[^/]*${pattern.replace('.', '\\.')}/uploads/`, 'g'), `${currentUploadsUrl}/`);
                }
              }
            }
            
            // Handle relative paths
            if (newUrl.startsWith('/uploads/')) {
              newUrl = currentUploadsUrl + newUrl;
            } else if (!newUrl.startsWith('http') && newUrl.trim() !== '') {
              newUrl = `${currentUploadsUrl}/${newUrl}`;
            }
            
            if (newUrl !== user.profile_image) {
              await connection.query('UPDATE users SET profile_image = ? WHERE ID = ?', [newUrl, user.ID]);
              usersUpdated++;
            }
          }
        }
        
        results.users = { updated: usersUpdated, found: usersToUpdate.length };
      }

      // Update tiktok_videos table
      if (tables.includes('tiktok_videos')) {
        try {
          const [videosToUpdate] = await connection.query(`
            SELECT id, cover_image_url
            FROM tiktok_videos 
            WHERE cover_image_url LIKE '%localhost%' 
            OR cover_image_url LIKE '%.ngrok%'
            OR (cover_image_url LIKE '/uploads/%' AND cover_image_url NOT LIKE 'http%')
          `);

          let videosUpdated = 0;
          
          if (!dryRun) {
            for (const video of videosToUpdate) {
              let newUrl = video.cover_image_url;
              
              for (const pattern of patterns) {
                if (newUrl.includes(pattern)) {
                  if (pattern.includes('localhost') || pattern.includes('ngrok')) {
                    newUrl = newUrl.replace(new RegExp(`https?://[^/]*${pattern.replace('.', '\\.')}/uploads/`, 'g'), `${currentUploadsUrl}/`);
                  }
                }
              }
              
              if (newUrl.startsWith('/uploads/')) {
                newUrl = currentUploadsUrl + newUrl;
              }
              
              if (newUrl !== video.cover_image_url) {
                await connection.query('UPDATE tiktok_videos SET cover_image_url = ? WHERE id = ?', [newUrl, video.id]);
                videosUpdated++;
              }
            }
          }
          
          results.tiktok_videos = { updated: videosUpdated, found: videosToUpdate.length };
        } catch (error) {
          results.tiktok_videos = { error: 'Table does not exist' };
        }
      }

      await connection.end();

      // Log the action
      console.log(`${dryRun ? '🧪 DRY RUN - ' : '✅'}Image URL update completed:`, results);

      res.json({
        success: true,
        message: dryRun ? 'Dry run completed' : 'Image URLs updated successfully',
        data: {
          results,
          dryRun,
          timestamp: new Date().toISOString(),
          updatedBy: req.user.user_login
        }
      });

    } catch (error) {
      console.error('Error updating image URLs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update image URLs',
        error: error.message
      });
    }
  }

  /**
   * Get statistics about image URLs in database
   */
  static async getImageStats(req, res) {
    try {
      const connection = await mysql.createConnection(getDbConfig());
      
      const stats = {};
      
      // Posts stats
      const [postsStats] = await connection.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN post_content LIKE '%uploads/%' THEN 1 ELSE 0 END) as with_images,
          SUM(CASE WHEN post_content LIKE '%localhost%' OR post_content LIKE '%.ngrok%' THEN 1 ELSE 0 END) as needs_update
        FROM posts
      `);
      stats.posts = postsStats[0];
      
      // PostMeta stats
      const [postmetaStats] = await connection.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN meta_value LIKE '%uploads/%' THEN 1 ELSE 0 END) as with_images,
          SUM(CASE WHEN meta_value LIKE '%localhost%' OR meta_value LIKE '%.ngrok%' THEN 1 ELSE 0 END) as needs_update
        FROM postmeta
      `);
      stats.postmeta = postmetaStats[0];
      
      // Users stats
      const [usersStats] = await connection.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN profile_image IS NOT NULL AND profile_image != '' THEN 1 ELSE 0 END) as with_images,
          SUM(CASE WHEN profile_image LIKE '%localhost%' OR profile_image LIKE '%.ngrok%' THEN 1 ELSE 0 END) as needs_update
        FROM users
      `);
      stats.users = usersStats[0];
      
      await connection.end();
      
      res.json({
        success: true,
        data: {
          stats,
          environment: {
            backend_url: process.env.BACKEND_URL,
            uploads_url: process.env.UPLOADS_URL,
            frontend_url: process.env.FRONTEND_URL
          }
        }
      });

    } catch (error) {
      console.error('Error getting image stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get image statistics',
        error: error.message
      });
    }
  }
}

module.exports = ImageManagerController;