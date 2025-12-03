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
   * OPTIMIZED: Uses single query with OR conditions instead of 84 separate queries
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

      // Analyze all tables in parallel with single optimized queries
      const [[postsTotal], [postmetaTotal], [usersTotal], [postsPatterns], [postmetaPatterns], [usersWithOldUrls]] = await Promise.all([
        connection.query('SELECT COUNT(*) as count FROM posts'),
        connection.query('SELECT COUNT(*) as count FROM postmeta'),
        connection.query('SELECT COUNT(*) as count FROM users'),
        // Single query for all post patterns using CASE statements
        connection.query(`
          SELECT
            SUM(CASE WHEN post_content LIKE '%localhost:3001%' THEN 1 ELSE 0 END) as localhost_3001,
            SUM(CASE WHEN post_content LIKE '%localhost:5173%' THEN 1 ELSE 0 END) as localhost_5173,
            SUM(CASE WHEN post_content LIKE '%localhost:5000%' THEN 1 ELSE 0 END) as localhost_5000,
            SUM(CASE WHEN post_content LIKE '%.ngrok.app%' THEN 1 ELSE 0 END) as ngrok_app,
            SUM(CASE WHEN post_content LIKE '%.ngrok.io%' THEN 1 ELSE 0 END) as ngrok_io,
            SUM(CASE WHEN post_content LIKE '%/uploads/%' THEN 1 ELSE 0 END) as relative_paths,
            SUM(CASE WHEN post_content LIKE '%2025/%' THEN 1 ELSE 0 END) as paths_2025
          FROM posts
        `),
        // Single query for all postmeta patterns
        connection.query(`
          SELECT
            SUM(CASE WHEN meta_value LIKE '%localhost:3001%' THEN 1 ELSE 0 END) as localhost_3001,
            SUM(CASE WHEN meta_value LIKE '%localhost:5173%' THEN 1 ELSE 0 END) as localhost_5173,
            SUM(CASE WHEN meta_value LIKE '%localhost:5000%' THEN 1 ELSE 0 END) as localhost_5000,
            SUM(CASE WHEN meta_value LIKE '%.ngrok.app%' THEN 1 ELSE 0 END) as ngrok_app,
            SUM(CASE WHEN meta_value LIKE '%.ngrok.io%' THEN 1 ELSE 0 END) as ngrok_io,
            SUM(CASE WHEN meta_value LIKE '%/uploads/%' THEN 1 ELSE 0 END) as relative_paths,
            SUM(CASE WHEN meta_value LIKE '%2025/%' THEN 1 ELSE 0 END) as paths_2025
          FROM postmeta
        `),
        // Users query
        connection.query(`
          SELECT COUNT(*) as count,
                 GROUP_CONCAT(DISTINCT user_login SEPARATOR '; ') as sample_users
          FROM users
          WHERE profile_image LIKE '%localhost%'
          OR profile_image LIKE '%.ngrok%'
          OR (profile_image LIKE '/uploads/%' AND profile_image NOT LIKE 'http%')
        `)
      ]);

      analysis.posts.total = postsTotal[0].count;
      analysis.postmeta.total = postmetaTotal[0].count;
      analysis.users.total = usersTotal[0].count;

      // Map pattern results for posts
      const postPatternMap = {
        'localhost:3001': postsPatterns[0].localhost_3001,
        'localhost:5173': postsPatterns[0].localhost_5173,
        'localhost:5000': postsPatterns[0].localhost_5000,
        'ngrok.app': postsPatterns[0].ngrok_app,
        'ngrok.io': postsPatterns[0].ngrok_io,
        'relative paths': postsPatterns[0].relative_paths,
        '2025 paths': postsPatterns[0].paths_2025
      };

      for (const [name, count] of Object.entries(postPatternMap)) {
        if (count > 0) {
          analysis.posts.patterns[name] = { count, samples: '' };
          analysis.posts.needsUpdate += count;
        }
      }

      // Map pattern results for postmeta
      const metaPatternMap = {
        'localhost:3001': postmetaPatterns[0].localhost_3001,
        'localhost:5173': postmetaPatterns[0].localhost_5173,
        'localhost:5000': postmetaPatterns[0].localhost_5000,
        'ngrok.app': postmetaPatterns[0].ngrok_app,
        'ngrok.io': postmetaPatterns[0].ngrok_io,
        'relative paths': postmetaPatterns[0].relative_paths,
        '2025 paths': postmetaPatterns[0].paths_2025
      };

      for (const [name, count] of Object.entries(metaPatternMap)) {
        if (count > 0) {
          analysis.postmeta.patterns[name] = { count, samples: '' };
          analysis.postmeta.needsUpdate += count;
        }
      }

      // Users patterns
      if (usersWithOldUrls[0].count > 0) {
        analysis.users.patterns['old_urls'] = {
          count: usersWithOldUrls[0].count,
          samples: usersWithOldUrls[0].sample_users
        };
        analysis.users.needsUpdate = usersWithOldUrls[0].count;
      }

      // Analyze tiktok_videos table
      try {
        const [[tiktokTotal], [tiktokWithOldUrls]] = await Promise.all([
          connection.query('SELECT COUNT(*) as count FROM tiktok_videos'),
          connection.query(`
            SELECT COUNT(*) as count
            FROM tiktok_videos
            WHERE cover_image_url LIKE '%localhost%'
            OR cover_image_url LIKE '%.ngrok%'
            OR (cover_image_url LIKE '/uploads/%' AND cover_image_url NOT LIKE 'http%')
          `)
        ]);

        analysis.tiktok_videos.total = tiktokTotal[0].count;

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
   * Convert relative image paths to full URLs and store them
   */
  static async convertRelativeToFullUrls(req, res) {
    try {
      const { baseUrl = 'https://api.naramakna.id/uploads', dryRun = false } = req.body;
      const userId = req.user.ID;
      
      const connection = await mysql.createConnection(getDbConfig());
      const results = {};

      console.log(`🔄 ${dryRun ? 'DRY RUN - ' : ''}Converting relative paths to full URLs by user ${req.user.user_login}`);
      console.log('📋 Base URL:', baseUrl);

      // Find and convert WordPress attachment file paths
      const [attachmentFiles] = await connection.query(`
        SELECT meta_id, post_id, meta_value 
        FROM postmeta 
        WHERE meta_key = '_wp_attached_file' 
        AND meta_value NOT LIKE 'http%'
        AND meta_value LIKE '%.%'
      `);

      let convertedFiles = 0;
      
      if (!dryRun && attachmentFiles.length > 0) {
        for (const file of attachmentFiles) {
          const fullUrl = `${baseUrl}/${file.meta_value}`;
          
          await connection.query(
            'UPDATE postmeta SET meta_value = ? WHERE meta_id = ?',
            [fullUrl, file.meta_id]
          );
          
          convertedFiles++;
        }
      }

      results.wp_attached_files = { 
        found: attachmentFiles.length, 
        converted: convertedFiles 
      };

      // Find and convert other relative paths in postmeta
      const [relativeMetaPaths] = await connection.query(`
        SELECT meta_id, post_id, meta_key, meta_value 
        FROM postmeta 
        WHERE (meta_value LIKE '%2025/%' OR meta_value LIKE '%2024/%' OR meta_value LIKE '%uploads/%')
        AND meta_value NOT LIKE 'http%'
        AND meta_key != '_wp_attached_file'
        AND LENGTH(meta_value) < 500
      `);

      let convertedMeta = 0;
      
      if (!dryRun && relativeMetaPaths.length > 0) {
        for (const meta of relativeMetaPaths) {
          let fullUrl = meta.meta_value;
          
          // Handle different relative path formats
          if (fullUrl.startsWith('/uploads/')) {
            fullUrl = baseUrl + fullUrl.substring(8); // Remove /uploads/ and use base
          } else if (fullUrl.match(/^\d{4}\//)) { // Starts with year/
            fullUrl = `${baseUrl}/${fullUrl}`;
          } else if (fullUrl.includes('/uploads/') && !fullUrl.startsWith('http')) {
            fullUrl = fullUrl.replace(/.*\/uploads\//, `${baseUrl}/`);
          }
          
          if (fullUrl !== meta.meta_value) {
            await connection.query(
              'UPDATE postmeta SET meta_value = ? WHERE meta_id = ?',
              [fullUrl, meta.meta_id]
            );
            
            convertedMeta++;
          }
        }
      }

      results.relative_meta_paths = { 
        found: relativeMetaPaths.length, 
        converted: convertedMeta 
      };

      // Find and convert relative paths in post content
      const [postsWithRelative] = await connection.query(`
        SELECT ID, post_title, post_content
        FROM posts 
        WHERE (post_content LIKE '%src="/uploads/%' 
        OR post_content LIKE '%src="2025/%'
        OR post_content LIKE '%src="2024/%')
        AND post_content NOT LIKE '%src="http%'
      `);

      let convertedPosts = 0;
      
      if (!dryRun && postsWithRelative.length > 0) {
        for (const post of postsWithRelative) {
          let updatedContent = post.post_content;
          
          // Replace relative src paths
          updatedContent = updatedContent.replace(
            /src="\/uploads\//g, 
            `src="${baseUrl}/`
          );
          updatedContent = updatedContent.replace(
            /src="(\d{4}\/[^"]+)"/g, 
            `src="${baseUrl}/$1"`
          );
          
          if (updatedContent !== post.post_content) {
            await connection.query(
              'UPDATE posts SET post_content = ? WHERE ID = ?',
              [updatedContent, post.ID]
            );
            
            convertedPosts++;
          }
        }
      }

      results.posts_content = { 
        found: postsWithRelative.length, 
        converted: convertedPosts 
      };

      await connection.end();

      console.log(`${dryRun ? '🧪 DRY RUN - ' : '✅'}Relative paths conversion completed:`, results);

      res.json({
        success: true,
        message: dryRun ? 'Dry run completed - relative paths analysis' : 'Relative paths converted to full URLs successfully',
        data: {
          results,
          dryRun,
          timestamp: new Date().toISOString(),
          convertedBy: req.user.user_login,
          baseUrl
        }
      });

    } catch (error) {
      console.error('Error converting relative paths:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to convert relative paths',
        error: error.message
      });
    }
  }

  /**
   * Update image URLs based on selected tables and patterns
   * OPTIMIZED: Reduced nested loops, batch updates
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
      const baseUrl = currentUploadsUrl.replace('/uploads', '');

      console.log(`🖼️ ${dryRun ? 'DRY RUN - ' : ''}Image URL update started by user ${req.user.user_login}`);
      console.log('📋 Tables:', tables);
      console.log('📋 Patterns:', patterns);
      console.log('📋 New URL:', currentUploadsUrl);

      // Build all search patterns once
      const allSearchPatterns = [];
      for (const pattern of patterns) {
        if (pattern.includes('localhost') || pattern.includes('ngrok')) {
          allSearchPatterns.push({ search: `http://${pattern}`, pattern });
          allSearchPatterns.push({ search: `https://${pattern}`, pattern });
          allSearchPatterns.push({ search: pattern, pattern });
        } else {
          allSearchPatterns.push({ search: pattern, pattern });
        }
      }

      // Helper to get replacement URL
      const getReplacementUrl = (searchPattern) => {
        if (searchPattern.includes('/uploads/')) {
          return currentUploadsUrl.endsWith('/') ? currentUploadsUrl : currentUploadsUrl + '/';
        } else if (searchPattern.includes('/wp-content/')) {
          const wpUrl = currentUploadsUrl.replace('/uploads', '/wp-content');
          return wpUrl.endsWith('/') ? wpUrl : wpUrl + '/';
        } else {
          return baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
        }
      };

      // Update posts table - batch updates without SELECT first
      if (tables.includes('posts')) {
        let postsUpdated = 0;

        if (!dryRun) {
          for (const { search } of allSearchPatterns) {
            const replacementUrl = getReplacementUrl(search);
            const [updateResult] = await connection.query(`
              UPDATE posts
              SET post_content = REPLACE(post_content, ?, ?)
              WHERE post_content LIKE ?
            `, [search, replacementUrl, `%${search}%`]);
            postsUpdated += updateResult.affectedRows;
          }
        } else {
          // For dry run, count matching rows in single query
          const likeConditions = allSearchPatterns.map(() => 'post_content LIKE ?').join(' OR ');
          const [countResult] = await connection.query(
            `SELECT COUNT(*) as count FROM posts WHERE ${likeConditions}`,
            allSearchPatterns.map(p => `%${p.search}%`)
          );
          postsUpdated = countResult[0].count;
        }

        results.posts = { updated: postsUpdated };
      }

      // Update postmeta table - batch updates
      if (tables.includes('postmeta')) {
        let postmetaUpdated = 0;

        if (!dryRun) {
          for (const { search } of allSearchPatterns) {
            const replacementUrl = getReplacementUrl(search);
            const [updateResult] = await connection.query(`
              UPDATE postmeta
              SET meta_value = REPLACE(meta_value, ?, ?)
              WHERE meta_value LIKE ?
            `, [search, replacementUrl, `%${search}%`]);
            postmetaUpdated += updateResult.affectedRows;
          }
        } else {
          // For dry run, count matching rows in single query
          const likeConditions = allSearchPatterns.map(() => 'meta_value LIKE ?').join(' OR ');
          const [countResult] = await connection.query(
            `SELECT COUNT(*) as count FROM postmeta WHERE ${likeConditions}`,
            allSearchPatterns.map(p => `%${p.search}%`)
          );
          postmetaUpdated = countResult[0].count;
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