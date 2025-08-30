const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

const categoryController = {
  // Get popular channels/tags for article writing
  async getPopularTags(req, res) {
    try {
      console.log('🏷️ Getting popular tags for article writing');
      
      // Get specific allowed rubrikasi channels only
      const allowedChannels = [
        'narapandang', 'pelakon', 'laga-gaya', 'wahana', 'olah-bola', 
        'cerita-rasa', 'horison', 'jagat-kita', 'akal-budi', 'budaya', 
        'pendidikan', 'teknologi'
      ];
      
      const channelsQuery = `
        SELECT t.name, t.slug, tt.count 
        FROM terms t
        JOIN term_taxonomy tt ON t.term_id = tt.term_id
        WHERE tt.taxonomy IN ('category', 'newstopic')
        AND tt.count >= 0
        AND t.slug IN (${allowedChannels.map(() => '?').join(', ')})
        ORDER BY tt.count DESC
      `;

      const channels = await sequelize.query(channelsQuery, {
        type: QueryTypes.SELECT,
        replacements: allowedChannels
      });

      // Get popular tags/keywords (increased limit)
      const tagsQuery = `
        SELECT t.name, t.slug, tt.count 
        FROM terms t
        JOIN term_taxonomy tt ON t.term_id = tt.term_id
        WHERE tt.taxonomy = 'post_tag'
        AND tt.count >= 0
        ORDER BY tt.count DESC
        LIMIT 100
      `;

      const tags = await sequelize.query(tagsQuery, {
        type: QueryTypes.SELECT
      });

      res.json({
        success: true,
        data: {
          popularChannels: channels,
          popularTags: tags,
          defaultChannels: [] // No hardcoded defaults, use only database channels
        }
      });

    } catch (error) {
      console.error('Error fetching popular tags:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch popular tags',
        error: error.message
      });
    }
  },

  // Get all categories for navigation
  async getNavigationCategories(req, res) {
    try {
      console.log('🏷️ Getting navigation categories');
      
      // Priority categories (hardcoded for navbar)
      const priorityCategories = [
        'News', 'Entertainment', 'Tekno & Sains', 'Bisnis', 
        'Bola & Sports', 'Otomotif', 'Woman', 'Food & Travel', 'Mom', 'Bolanita'
      ];

      // Get additional categories from database (top terms by count)
      const additionalQuery = `
        SELECT t.name, t.slug, tt.count 
        FROM terms t
        JOIN term_taxonomy tt ON t.term_id = tt.term_id
        WHERE tt.taxonomy = 'newstopic' 
        AND tt.count >= 0
        AND t.name NOT IN (${priorityCategories.map(() => '?').join(',')})
        ORDER BY tt.count DESC
        LIMIT 20
      `;

      const additional = await sequelize.query(additionalQuery, {
        replacements: priorityCategories,
        type: QueryTypes.SELECT
      });

      res.json({
        success: true,
        data: {
          priority: priorityCategories.map(name => ({
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            count: 0 // Will be populated later
          })),
          additional: additional.map(item => ({
            name: item.name,
            slug: item.slug,
            count: item.count
          }))
        }
      });

    } catch (error) {
      console.error('❌ Error getting navigation categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get navigation categories',
        error: error.message
      });
    }
  },

  // Get posts by category/term
  async getPostsByCategory(req, res) {
    try {
      let { slug } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      // Map frontend slugs to database slugs
      const slugMapping = {
        'olah-bola': 'sport',
        'laga-gaya': 'laga-gaya',
        'horison': 'horison', 
        'cerita-rasa': 'cerita-rasa',
        'narapandang': 'narapandang',
        'wahana': 'wahana',
        'akal-budi': 'akal-budi'
      };
      
      // Use mapped slug if exists, otherwise use original slug
      const databaseSlug = slugMapping[slug] || slug;
      console.log(`🏷️ Getting posts for category: ${slug} -> ${databaseSlug}`);

      // Query to get posts by term slug with metadata and view count
      const query = `
        SELECT DISTINCT 
          p.ID as id,
          p.post_title as title,
          p.post_content as content,
          p.post_excerpt as excerpt,
          p.post_name as slug,
          p.post_date as date,
          p.post_modified as modified,
          u.display_name as author_name,
          u.ID as author_id,
          COALESCE(p.view_count, 0) as view_count,
          thumbnail_meta.meta_value as thumbnail_id,
          thumbnail_post.guid as featured_image
        FROM posts p
        LEFT JOIN users u ON p.post_author = u.ID
        LEFT JOIN term_relationships tr ON p.ID = tr.object_id
        LEFT JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
        LEFT JOIN terms t ON tt.term_id = t.term_id
        LEFT JOIN postmeta thumbnail_meta ON p.ID = thumbnail_meta.post_id AND thumbnail_meta.meta_key = '_thumbnail_id'
        LEFT JOIN posts thumbnail_post ON thumbnail_meta.meta_value = thumbnail_post.ID
        WHERE p.post_status = 'publish'
        AND p.post_type = 'post'
        AND t.slug = ?
        ORDER BY p.post_date DESC
        LIMIT ? OFFSET ?
      `;

      const posts = await sequelize.query(query, {
        replacements: [databaseSlug, parseInt(limit), parseInt(offset)],
        type: QueryTypes.SELECT
      });

      // Get analytics view counts for all posts (same as individual article API)
      const { Analytics } = require('../models');
      const postIds = posts.map(post => post.id);
      
      // Get view counts from analytics table for batch processing
      const analyticsViewCounts = {};
      if (postIds.length > 0) {
        try {
          const analyticsData = await Analytics.findAll({
            attributes: [
              'content_id',
              [sequelize.fn('COUNT', sequelize.col('id')), 'view_count']
            ],
            where: {
              content_id: postIds,
              event_type: 'view'
            },
            group: ['content_id']
          });

          analyticsData.forEach(item => {
            analyticsViewCounts[item.content_id] = parseInt(item.dataValues.view_count) || 0;
          });
        } catch (error) {
          console.error('Error fetching analytics view counts:', error);
        }
      }

      // Update posts with analytics view counts
      const postsWithAnalytics = posts.map(post => ({
        ...post,
        view_count: analyticsViewCounts[post.id] || 0
      }));

      // Get total count
      const countQuery = `
        SELECT COUNT(DISTINCT p.ID) as total
        FROM posts p
        LEFT JOIN term_relationships tr ON p.ID = tr.object_id
        LEFT JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
        LEFT JOIN terms t ON tt.term_id = t.term_id
        WHERE p.post_status = 'publish'
        AND p.post_type = 'post'
        AND t.slug = ?
      `;

      const [{ total }] = await sequelize.query(countQuery, {
        replacements: [databaseSlug],
        type: QueryTypes.SELECT
      });

      res.json({
        success: true,
        data: {
          posts: postsWithAnalytics,
          pagination: {
            total: parseInt(total),
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: parseInt(offset) + parseInt(limit) < parseInt(total)
          },
          category: {
            slug,
            name: posts.length > 0 ? slug.replace(/-/g, ' ') : slug
          }
        }
      });

    } catch (error) {
      console.error('❌ Error getting posts by category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get posts by category',
        error: error.message
      });
    }
  }
};

module.exports = categoryController;
