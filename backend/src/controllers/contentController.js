/**
 * Universal Content Controller
 * Handles all content types: articles, YouTube videos, TikTok videos
 */

const { Post, PostMeta, User, Analytics, PostViews, Comment, sequelize } = require('../models');
// const { Term, TermTaxonomy, TermRelationship } = require('../models'); // TODO: Re-enable when taxonomy system is complete
const ContentHelpers = require('../models/ContentHelpers');
const { Op } = require('sequelize');

class ContentController {
  
  /**
   * Get mixed content feed (all content types)
   * GET /api/content/feed
   */
  static async getFeed(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        type = null, 
        category = null,
        search = null,
        status = 'publish',
        author = null,
        sortBy = 'date',
        sortOrder = 'desc'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = { post_status: status };

      // Filter by author ID
      if (author) {
        whereClause.post_author = parseInt(author);
        console.log('📍 Filtering by author:', parseInt(author), 'whereClause:', whereClause);
      }

      // Filter by content type
      if (type) {
            const validTypes = ['post', 'youtube_video', 'tiktok_video', 'page'];
    if (validTypes.includes(type)) {
          whereClause.post_type = type;
        }
      }

      // Enhanced search functionality
      if (search) {
        const searchTerms = search.split(' ').filter(term => term.length > 1);
        const searchConditions = [];
        const tagSearches = [];
        
        searchTerms.forEach(term => {
          // Handle hashtag search for tags
          if (term.startsWith('#')) {
            const tagName = term.substring(1); // Remove #
            tagSearches.push(tagName);
            // Also search in content for the tag name
            searchConditions.push(
              { post_title: { [Op.like]: `%${tagName}%` } },
              { post_content: { [Op.like]: `%${tagName}%` } },
              { post_excerpt: { [Op.like]: `%${tagName}%` } }
            );
          } else {
            searchConditions.push(
              { post_title: { [Op.like]: `%${term}%` } },
              { post_content: { [Op.like]: `%${term}%` } },
              { post_excerpt: { [Op.like]: `%${term}%` } }
            );
          }
        });

        // Add tag-based search using subquery
        if (tagSearches.length > 0) {
          const tagSubqueries = tagSearches.map(tagName => `
            SELECT tr.object_id 
            FROM term_relationships tr
            JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
            JOIN terms t ON tt.term_id = t.term_id
            WHERE t.name LIKE '%${tagName}%'
            AND tt.taxonomy IN ('post_tag', 'category', 'newstopic')
          `).join(' UNION ');

          whereClause[Op.or] = [
            ...searchConditions,
            {
              ID: {
                [Op.in]: sequelize.literal(`(${tagSubqueries})`)
              }
            }
          ];
        } else if (searchConditions.length > 0) {
          whereClause[Op.or] = searchConditions;
        }
      }

      const include = [
        {
          model: PostMeta,
          as: 'meta'
        },
        {
          model: User,
          as: 'author',
          attributes: ['ID', 'display_name', 'user_email']
        }
        // TODO: Re-enable categories when taxonomy system is complete
        // {
        //   model: TermRelationship,
        //   as: 'termRelationships',
        //   attributes: ['object_id', 'term_taxonomy_id'],
        //   required: false, // LEFT JOIN
        //   include: [{
        //     model: TermTaxonomy,
        //     as: 'taxonomy',
        //     attributes: ['term_taxonomy_id', 'term_id', 'taxonomy', 'description'],
        //     where: { taxonomy: { [Op.in]: ['category', 'newstopic'] } },
        //     required: false,
        //     include: [{
        //       model: Term,
        //       as: 'term',
        //       attributes: ['term_id', 'name', 'slug'],
        //       required: false
        //     }]
        //   }]
        // }
      ];

      // Category filtering using raw SQL subquery
      if (category) {
        // Use subquery to find posts that belong to the category
        const categorySubquery = `
          SELECT tr.object_id 
          FROM term_relationships tr
          JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
          JOIN terms t ON tt.term_id = t.term_id
          WHERE t.slug = '${category.replace(/'/g, "\\'")}' 
          AND tt.taxonomy IN ('category', 'newstopic', 'post_tag')
        `;
        
        whereClause.ID = {
          [Op.in]: sequelize.literal(`(${categorySubquery})`)
        };
        
        console.log('🏷️ Applied category filter for:', category);
      }

      // Determine sorting options
      let orderClause;
      switch (sortBy) {
        case 'title':
          orderClause = [['post_title', sortOrder.toUpperCase()]];
          break;
        case 'views':
          orderClause = [['post_views', sortOrder.toUpperCase()]];
          break;
        case 'relevance':
          // For relevance, prioritize title matches over content matches
          if (search) {
            orderClause = [
              [sequelize.literal(`CASE 
                WHEN post_title LIKE '%${search}%' THEN 1 
                WHEN post_excerpt LIKE '%${search}%' THEN 2 
                ELSE 3 
              END`), 'ASC'],
              ['post_date', 'DESC']
            ];
          } else {
            orderClause = [['post_date', 'DESC']];
          }
          break;
        case 'date':
        default:
          orderClause = [['post_date', sortOrder.toUpperCase()]];
          break;
      }

      console.log('📊 Final whereClause:', JSON.stringify(whereClause, null, 2));
      console.log('🔄 Order clause:', orderClause);
      
      const result = await Post.findAndCountAll({
        where: whereClause,
        include,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: orderClause,
        distinct: true
      });

      // Format response with metadata
      const formattedPosts = await Promise.all(
        result.rows.map(post => ContentController.formatPostWithMeta(post))
      );

      res.json({
        success: true,
        data: {
          posts: formattedPosts,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(result.count / limit),
            totalItems: result.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Error fetching content feed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch content feed',
        error: error.message
      });
    }
  }

  /**
   * Get search suggestions
   * GET /api/content/search/suggestions
   */
  static async getSearchSuggestions(req, res) {
    try {
      const { query = '', limit = 50 } = req.query; // Increased default limit for more suggestions

      if (!query || query.length < 2) {
        return res.json({
          success: true,
          data: {
            suggestions: [],
            categories: [],
            tags: []
          }
        });
      }

      // Get title suggestions from recent posts
      const titleSuggestions = await Post.findAll({
        where: {
          post_status: 'publish',
          post_title: { [Op.like]: `%${query}%` }
        },
        attributes: ['post_title'],
        limit: parseInt(limit),
        order: [['post_date', 'DESC']]
      });

      // Get category suggestions using raw SQL ordered by total views
      const categorySuggestions = await sequelize.query(`
        SELECT DISTINCT t.name, t.slug, tt.count, 
               COALESCE(SUM(p.view_count), 0) as total_views
        FROM terms t
        JOIN term_taxonomy tt ON t.term_id = tt.term_id
        LEFT JOIN term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
        LEFT JOIN posts p ON tr.object_id = p.ID AND p.post_status = 'publish'
        WHERE t.name LIKE '%${query}%' 
        AND tt.taxonomy IN ('category', 'newstopic')
        AND tt.count > 0
        GROUP BY t.term_id, t.name, t.slug, tt.count
        ORDER BY total_views DESC, tt.count DESC
        LIMIT ${parseInt(limit)}
      `, {
        type: sequelize.QueryTypes.SELECT
      });

      // Get tag suggestions using raw SQL ordered by total views
      const tagSuggestions = await sequelize.query(`
        SELECT DISTINCT t.name, t.slug, tt.count,
               COALESCE(SUM(p.view_count), 0) as total_views
        FROM terms t
        JOIN term_taxonomy tt ON t.term_id = tt.term_id
        LEFT JOIN term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
        LEFT JOIN posts p ON tr.object_id = p.ID AND p.post_status = 'publish'
        WHERE t.name LIKE '%${query}%' 
        AND tt.taxonomy = 'post_tag'
        AND tt.count > 0
        GROUP BY t.term_id, t.name, t.slug, tt.count
        ORDER BY total_views DESC, tt.count DESC
        LIMIT ${parseInt(limit)}
      `, {
        type: sequelize.QueryTypes.SELECT
      });

      res.json({
        success: true,
        data: {
          suggestions: titleSuggestions.map(post => post.post_title),
          categories: categorySuggestions,
          tags: tagSuggestions
        }
      });

    } catch (error) {
      console.error('Error getting search suggestions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get search suggestions',
        error: error.message
      });
    }
  }

  /**
   * Get single content by ID
   * GET /api/content/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const post = await Post.findByPk(id, {
        include: [
          {
            model: PostMeta,
            as: 'meta'
          },
          {
            model: User,
            as: 'author',
            attributes: ['ID', 'display_name', 'user_email']
          },
          {
            model: TermTaxonomy,
            as: 'categories',
            include: [{
              model: require('../models/Term'),
              as: 'term'
            }]
          }
        ]
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      // Track view
      await ContentController.trackAnalytics(req, post.ID, post.post_type, 'view');

      const formattedPost = await ContentController.formatPostWithMeta(post);

      res.json({
        success: true,
        data: formattedPost
      });

    } catch (error) {
      console.error('Error fetching content:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch content',
        error: error.message
      });
    }
  }

  /**
   * Get content by type (articles, youtube videos, tiktok videos)
   * GET /api/content/type/:type
   */
  static async getByType(req, res) {
    try {
      const { type } = req.params;
      const { page = 1, limit = 20 } = req.query;

      // Validate content type
      const validTypes = ['post', 'youtube_video', 'tiktok_video', 'page'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid content type. Valid types: ${validTypes.join(', ')}`
        });
      }

      const result = await ContentHelpers.getContentByType(type, {
        limit: parseInt(limit),
        offset: (page - 1) * limit
      });

      const formattedPosts = await Promise.all(
        result.rows.map(post => ContentController.formatPostWithMeta(post))
      );

      res.json({
        success: true,
        data: {
          posts: formattedPosts,
          contentType: type,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(result.count / limit),
            totalItems: result.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Error fetching content by type:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch content by type',
        error: error.message
      });
    }
  }

  /**
   * Create new content (article, video)
   * POST /api/content
   */
  static async create(req, res) {
    try {
      console.log('Content controller - req.body:', req.body);
      console.log('Content controller - req.files:', req.files);
      
      // Handle both JSON and FormData requests with validation
      const type = req.body.type || 'post';
      const title = req.body.title || 'Untitled Post';
      const content = req.body.content || '';
      const excerpt = req.body.excerpt || '';
      const status = req.body.status || 'draft';
      // Always use authenticated user's ID for security - handle both 'id' and 'ID'
      const author_id = req.user?.id || req.user?.ID;
      
      console.log('req.user:', req.user);
      console.log('author_id from req.user:', author_id);
      
      // Validate author exists in database
      if (!author_id) {
        return res.status(400).json({
          success: false,
          message: 'User not authenticated properly'
        });
      }
      const meta = req.body.meta ? JSON.parse(req.body.meta) : {};
      const categories = req.body.categories ? JSON.parse(req.body.categories) : [];
      
      console.log('Parsed data:', { type, title, content, status, author_id });

      // TEMPORARILY DISABLED - Debug content type validation
      console.log('Content type received:', type);
      console.log('Type of type:', typeof type);
      console.log('Is type valid?', ['post', 'youtube_video', 'tiktok_video', 'page'].includes(type));
      
      // Skip validation to debug FormData issue
      // const validTypes = ['post', 'youtube_video', 'tiktok_video', 'page'];
      // if (!validTypes.includes(type)) {
      //   return res.status(400).json({
      //     success: false,
      //     message: `Invalid content type. Valid types: ${validTypes.join(', ')}`
      //   });
      // }

      // Create post with all required fields
      const post = await Post.create({
        post_author: author_id,
        post_title: title,
        post_content: content,
        post_excerpt: excerpt,
        post_type: type,
        post_status: status,
        post_name: title ? ContentController.generateSlug(title) : `post-${Date.now()}`,
        post_date: new Date(),
        post_modified: new Date(),
        post_parent: 0,
        menu_order: 0,
        comment_count: 0,
        to_ping: '',
        pinged: '',
        post_content_filtered: '',
        guid: `${req.protocol}://${req.get('host')}/content/${type}/${Date.now()}`
      });

      // Add metadata
      if (Object.keys(meta).length > 0) {
        for (const [key, value] of Object.entries(meta)) {
          await PostMeta.create({
            post_id: post.ID,
            meta_key: key,
            meta_value: typeof value === 'object' ? JSON.stringify(value) : value.toString()
          });
        }
      }

      // Add categories
      if (categories.length > 0) {
        for (const categoryId of categories) {
          await TermRelationship.create({
            object_id: post.ID,
            term_taxonomy_id: categoryId,
            term_order: 0
          });
        }
      }

      res.status(201).json({
        success: true,
        message: 'Content created successfully',
        data: {
          id: post.ID,
          type: post.post_type,
          title: post.post_title,
          status: post.post_status
        }
      });

    } catch (error) {
      console.error('Error creating content:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create content',
        error: error.message
      });
    }
  }

  /**
   * Update existing content
   * PUT /api/content/:id
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        content,
        excerpt,
        status,
        meta = {},
        categories = []
      } = req.body;

      const post = await Post.findByPk(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      // Update post
      await post.update({
        ...(title && { post_title: title }),
        ...(content && { post_content: content }),
        ...(excerpt && { post_excerpt: excerpt }),
        ...(status && { post_status: status }),
        post_modified: new Date()
      });

      // Update metadata
      if (Object.keys(meta).length > 0) {
        for (const [key, value] of Object.entries(meta)) {
          await PostMeta.upsert({
            post_id: post.ID,
            meta_key: key,
            meta_value: typeof value === 'object' ? JSON.stringify(value) : value.toString()
          });
        }
      }

      res.json({
        success: true,
        message: 'Content updated successfully',
        data: {
          id: post.ID,
          title: post.post_title,
          status: post.post_status
        }
      });

    } catch (error) {
      console.error('Error updating content:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update content',
        error: error.message
      });
    }
  }

  /**
   * Delete content
   * DELETE /api/content/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const { permanent = false } = req.query;

      const post = await Post.findByPk(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      if (permanent === 'true') {
        // Permanent deletion
        await PostMeta.destroy({ where: { post_id: id } });
        await TermRelationship.destroy({ where: { object_id: id } });
        await post.destroy();
      } else {
        // Soft deletion (move to trash)
        await post.update({ 
          post_status: 'trash',
          post_modified: new Date()
        });
      }

      res.json({
        success: true,
        message: permanent === 'true' ? 'Content permanently deleted' : 'Content moved to trash'
      });

    } catch (error) {
      console.error('Error deleting content:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete content',
        error: error.message
      });
    }
  }

  /**
   * Get content statistics
   * GET /api/content/stats
   */
  static async getStats(req, res) {
    try {
      const stats = await Promise.all([
        Post.count({ where: { post_type: 'post', post_status: 'publish' } }),
        Post.count({ where: { post_type: 'youtube_video', post_status: 'publish' } }),
        Post.count({ where: { post_type: 'tiktok_video', post_status: 'publish' } }),
        Post.count({ where: { post_status: 'draft' } }),
        Post.count({ where: { post_status: 'trash' } })
      ]);

      res.json({
        success: true,
        data: {
          articles: stats[0],
          youtube_videos: stats[1],
          tiktok_videos: stats[2],
          drafts: stats[3],
          trash: stats[4],
          total_published: stats[0] + stats[1] + stats[2]
        }
      });

    } catch (error) {
      console.error('Error fetching content stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch content statistics',
        error: error.message
      });
    }
  }

  /**
   * Get trending content based on post views
   * GET /api/content/trending
   */
  static async getTrending(req, res) {
    try {
      const { 
        limit = 10, 
        category = null,
        type = null,
        period = null // Optional: filter by specific period (YYYYMMDD)
      } = req.query;

      // Base query for trending posts
      let whereClause = {
        post_status: 'publish'
      };

      // Filter by content type
      if (type) {
        const validTypes = ['post', 'youtube_video', 'tiktok_video', 'page'];
        if (validTypes.includes(type)) {
          whereClause.post_type = type;
        }
      }

      // TODO: Re-enable category filter when taxonomy system is complete
      // let categoryFilter = '';
      // if (category) {
      //   categoryFilter = `
      //     AND p.ID IN (
      //       SELECT tr.object_id 
      //       FROM term_relationships tr
      //       JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
      //       JOIN terms t ON tt.term_id = t.term_id
      //       WHERE t.slug = '${category.replace(/'/g, "\\'")}' 
      //       AND tt.taxonomy IN ('category', 'newstopic')
      //     )
      //   `;
      // }
      let categoryFilter = ''; // Temporary: no category filtering

      // Use raw SQL for better control over the trending query
      const trendingPostIds = await sequelize.query(`
        SELECT p.ID, pv.count as view_count
        FROM posts p
        INNER JOIN post_views pv ON p.ID = pv.id
        WHERE p.post_status = 'publish'
        ${type ? `AND p.post_type = '${type.replace(/'/g, "\\'")}' ` : ''}
        ${categoryFilter}
        ORDER BY pv.count DESC, p.post_date DESC
        LIMIT ${parseInt(limit)}
      `, {
        type: sequelize.QueryTypes.SELECT
      });

      // TODO: Re-enable category fallback when taxonomy system is complete
      if (false && trendingPostIds.length === 0 && category) {
        console.log(`No trending posts found for category '${category}', falling back to recent posts`);
        
        const fallbackQuery = {
          where: {
            post_status: 'publish',
            ...(type && { post_type: type }),
            ID: {
              [Op.in]: sequelize.literal(`(
                SELECT tr.object_id 
                FROM term_relationships tr
                JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
                JOIN terms t ON tt.term_id = t.term_id
                WHERE t.slug = '${category.replace(/'/g, "\\'")}' 
                AND tt.taxonomy IN ('category', 'newstopic')
              )`)
            }
          },
          include: [
            { model: PostMeta, as: 'meta' },
            { model: User, as: 'author', attributes: ['ID', 'display_name', 'user_email'] },
            {
              model: TermRelationship,
              as: 'termRelationships',
              attributes: ['object_id', 'term_taxonomy_id'],
              required: false,
              include: [{
                model: TermTaxonomy,
                as: 'taxonomy',
                attributes: ['term_taxonomy_id', 'term_id', 'taxonomy', 'description'],
                where: { taxonomy: { [Op.in]: ['category', 'newstopic'] } },
                required: false,
                include: [{
                  model: Term,
                  as: 'term',
                  attributes: ['term_id', 'name', 'slug'],
                  required: false
                }]
              }]
            }
          ],
          order: [['post_date', 'DESC']],
          limit: parseInt(limit)
        };

        const fallbackResult = await Post.findAll(fallbackQuery);
        const formattedPosts = await Promise.all(
          fallbackResult.map(post => ContentController.formatPostWithMeta(post))
        );

        // Add viewCount: 0 for consistency
        const fallbackPosts = formattedPosts.map(post => ({
          ...post,
          viewCount: 0
        }));

        return res.json({
          success: true,
          data: {
            posts: fallbackPosts,
            totalItems: fallbackPosts.length,
            criteria: 'most_recent' // Different criteria to indicate fallback
          }
        });
      }

      if (trendingPostIds.length === 0) {
        return res.json({
          success: true,
          data: {
            posts: [],
            totalItems: 0,
            criteria: 'most_viewed'
          }
        });
      }

      const postIds = trendingPostIds.map(item => item.ID);

      // Build the detailed query for the trending post IDs
      const trendingQuery = {
        include: [
          {
            model: PostMeta,
            as: 'meta'
          },
          {
            model: User,
            as: 'author',
            attributes: ['ID', 'display_name', 'user_email']
          }
          // TODO: Re-enable categories when taxonomy system is complete
          // {
          //   model: TermRelationship,
          //   as: 'termRelationships',
          //   attributes: ['object_id', 'term_taxonomy_id'],
          //   required: false,
          //   include: [{
          //     model: TermTaxonomy,
          //     as: 'taxonomy',
          //     attributes: ['term_taxonomy_id', 'term_id', 'taxonomy', 'description'],
          //     where: { taxonomy: { [Op.in]: ['category', 'newstopic'] } },
          //     required: false,
          //     include: [{
          //       model: Term,
          //       as: 'term',
          //       attributes: ['term_id', 'name', 'slug'],
          //       required: false
          //     }]
          //   }]
          // }
        ],
        where: {
          ...whereClause,
          ID: { [Op.in]: postIds }
        },
        order: [
          sequelize.literal(`FIELD(Post.ID, ${postIds.join(',')})`),
        ]
      };

      const result = await Post.findAll(trendingQuery);

      // Format response with metadata
      const formattedPosts = await Promise.all(
        result.map(post => ContentController.formatPostWithMeta(post))
      );

      // Sort posts by trending order and add view counts
      const trendingPosts = trendingPostIds.map(trendingItem => {
        const post = formattedPosts.find(p => p.id === trendingItem.ID);
        return post ? {
          ...post,
          viewCount: trendingItem.view_count
        } : null;
      }).filter(Boolean); // Remove any null entries

      res.json({
        success: true,
        data: {
          posts: trendingPosts,
          totalItems: trendingPosts.length,
          criteria: 'most_viewed'
        }
      });

    } catch (error) {
      console.error('Error fetching trending content:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch trending content',
        error: error.message
      });
    }
  }

  /**
   * Get all categories
   * GET /api/content/categories
   */
  static async getCategories(req, res) {
    try {
      const { 
        limit = 100, 
        page = 1,
        taxonomy = null,
        minCount = 0
      } = req.query;
      
      // Cap the limit to prevent memory issues
      const safeLimit = Math.min(parseInt(limit), 50000);
      
      const offset = (page - 1) * limit;
      
      // Build WHERE clause
      let whereClause = `tt.taxonomy IN ('category', 'newstopic', 'post_tag') AND tt.count >= ${minCount}`;
      if (taxonomy) {
        whereClause = `tt.taxonomy = '${taxonomy}' AND tt.count >= ${minCount}`;
      }
      
      // Use raw SQL to get real categories from database
      // Group by name to handle duplicates and get the highest count
      const categoriesQuery = `
        SELECT 
          t.name,
          t.slug,
          MAX(tt.count) as count,
          MAX(tt.term_taxonomy_id) as id,
          GROUP_CONCAT(DISTINCT tt.taxonomy) as taxonomy
        FROM terms t
        JOIN term_taxonomy tt ON t.term_id = tt.term_id
        WHERE ${whereClause}
        GROUP BY t.name, t.slug
        ORDER BY MAX(tt.count) DESC, t.name ASC
        LIMIT ${safeLimit} OFFSET ${offset}
      `;
      
      // Get total count (count unique names, not all taxonomy entries)
      const countQuery = `
        SELECT COUNT(DISTINCT t.name) as total
        FROM terms t
        JOIN term_taxonomy tt ON t.term_id = tt.term_id
        WHERE ${whereClause}
      `;

      const [categories, totalResult] = await Promise.all([
        sequelize.query(categoriesQuery, {
          type: sequelize.QueryTypes.SELECT
        }),
        sequelize.query(countQuery, {
          type: sequelize.QueryTypes.SELECT
        })
      ]);

      const total = totalResult[0].total;
      const totalPages = Math.ceil(total / safeLimit);

      const formattedCategories = categories.map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        count: category.count,
        taxonomy: category.taxonomy
      }));

      res.json({
        success: true,
        data: {
          categories: formattedCategories,
          total: total,
          pagination: {
            page: parseInt(page),
            limit: safeLimit,
            totalPages: totalPages,
            hasMore: page < totalPages
          }
        }
      });

    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        error: error.message
      });
    }
  }

  /**
   * Helper: Format post with metadata
   */
  static async formatPostWithMeta(post) {
    const postData = post.toJSON();
    
    // Convert meta array to object
    const metadata = {};
    if (postData.meta) {
      postData.meta.forEach(meta => {
        metadata[meta.meta_key] = meta.meta_value;
      });
    }

    // Resolve thumbnail URL from thumbnail ID
    if (metadata._thumbnail_id) {
      try {
        const thumbnailPost = await Post.findByPk(metadata._thumbnail_id, {
          attributes: ['guid', 'post_title']
        });
        
        if (thumbnailPost && thumbnailPost.guid) {
          // GUID already contains localhost URL, just use it directly
          metadata.thumbnail_url = thumbnailPost.guid;
          metadata._thumbnail_url = thumbnailPost.guid;
        }
      } catch (error) {
        console.warn('Failed to resolve thumbnail:', error.message);
        // Fallback to placeholder
        metadata.thumbnail_url = `/uploads/placeholder-${metadata._thumbnail_id}.jpg`;
        metadata._thumbnail_url = metadata.thumbnail_url;
      }
    }

    // Extract categories from termRelationships
    const categories = [];
    if (postData.termRelationships) {
      postData.termRelationships.forEach(relationship => {
        if (relationship.taxonomy && relationship.taxonomy.term) {
          categories.push({
            id: relationship.taxonomy.term_taxonomy_id,
            termId: relationship.taxonomy.term_id,
            name: relationship.taxonomy.term.name,
            slug: relationship.taxonomy.term.slug,
            taxonomy: relationship.taxonomy.taxonomy
          });
        }
      });
    }

    return {
      id: postData.ID,
      title: postData.post_title,
      content: postData.post_content,
      excerpt: postData.post_excerpt,
      type: postData.post_type,
      status: postData.post_status,
      slug: postData.post_name,
      date: postData.post_date,
      modified: postData.post_modified,
      author: postData.author,
      categories: categories,
      metadata,
      // Content type specific formatting
      ...(postData.post_type === 'youtube_video' && {
        youtube: {
          videoId: metadata._external_id,
          channelTitle: metadata._youtube_channel_title,
          viewCount: parseInt(metadata._youtube_view_count) || 0,
          likeCount: parseInt(metadata._youtube_like_count) || 0,
          thumbnailUrl: metadata._thumbnail_url,
          sourceUrl: metadata._source_url
        }
      }),
      ...(postData.post_type === 'tiktok_video' && {
        tiktok: {
          videoId: metadata._external_id,
          username: metadata._tiktok_author_username,
          displayName: metadata._tiktok_author_display_name,
          playCount: parseInt(metadata._tiktok_play_count) || 0,
          likeCount: parseInt(metadata._tiktok_like_count) || 0,
          coverUrl: metadata._tiktok_cover_url,
          sourceUrl: metadata._source_url
        }
      })
    };
  }

  /**
   * Helper: Generate URL slug
   */
  static generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  /**
   * Get posts with view counts and filtering support
   * GET /api/content/posts-with-views
   * Query params: page, limit, author, status, year, month, minViews, maxViews, sortBy, sortOrder
   */
  static async getPostsWithViews(req, res) {
    try {
      const { 
        page = 1, 
        limit = 50, 
        author, 
        status, 
        year, 
        month, 
        minViews, 
        maxViews, 
        sortBy = 'date', 
        sortOrder = 'DESC' 
      } = req.query;
      
      const offset = (page - 1) * limit;

      // Build WHERE conditions
      let whereConditions = ["p.post_type = 'post'"];
      let havingConditions = [];
      let replacements = { limit: parseInt(limit), offset };

      // Author filter
      if (author) {
        whereConditions.push("(u.user_login LIKE :author OR u.display_name LIKE :author)");
        replacements.author = `%${author}%`;
      }

      // Status filter
      if (status) {
        whereConditions.push("p.post_status = :status");
        replacements.status = status;
      }

      // Year filter
      if (year) {
        whereConditions.push("YEAR(p.post_date) = :year");
        replacements.year = parseInt(year);
      }

      // Month filter (requires year)
      if (month && year) {
        whereConditions.push("MONTH(p.post_date) = :month");
        replacements.month = parseInt(month);
      }

      // Views filter (applied in HAVING clause since it's after GROUP BY)
      if (minViews) {
        havingConditions.push("view_count >= :minViews");
        replacements.minViews = parseInt(minViews);
      }

      if (maxViews) {
        havingConditions.push("view_count <= :maxViews");
        replacements.maxViews = parseInt(maxViews);
      }

      // Build ORDER BY clause
      let orderByClause = '';
      switch (sortBy) {
        case 'title':
          orderByClause = `p.post_title ${sortOrder}`;
          break;
        case 'author':
          orderByClause = `u.display_name ${sortOrder}`;
          break;
        case 'status':
          orderByClause = `p.post_status ${sortOrder}`;
          break;
        case 'views':
          orderByClause = `view_count ${sortOrder}`;
          break;
        case 'date':
        default:
          orderByClause = `p.post_date ${sortOrder}`;
          break;
      }

      // Get posts with view counts from analytics table
      const postsQuery = `
        SELECT 
          p.*,
          u.display_name as author_display_name,
          u.user_login as author_login,
          u.user_email as author_email,
          COALESCE(a.view_count, 0) as view_count
        FROM posts p
        LEFT JOIN users u ON p.post_author = u.ID
        LEFT JOIN (
          SELECT 
            content_id, 
            COUNT(*) as view_count 
          FROM analytics 
          WHERE event_type = 'view' 
          GROUP BY content_id
        ) a ON p.ID = a.content_id
        WHERE ${whereConditions.join(' AND ')}
        ${havingConditions.length > 0 ? `HAVING ${havingConditions.join(' AND ')}` : ''}
        ORDER BY ${orderByClause}
        LIMIT :limit OFFSET :offset
      `;

      // Also get count query for pagination (without LIMIT/OFFSET)
      const countQuery = `
        SELECT COUNT(*) as total
        FROM (
          SELECT 
            p.ID,
            COALESCE(a.view_count, 0) as view_count
          FROM posts p
          LEFT JOIN users u ON p.post_author = u.ID
          LEFT JOIN (
            SELECT 
              content_id, 
              COUNT(*) as view_count 
            FROM analytics 
            WHERE event_type = 'view' 
            GROUP BY content_id
          ) a ON p.ID = a.content_id
          WHERE ${whereConditions.join(' AND ')}
          ${havingConditions.length > 0 ? `HAVING ${havingConditions.join(' AND ')}` : ''}
        ) filtered_posts
      `;

      const [posts, countResult] = await Promise.all([
        sequelize.query(postsQuery, {
          replacements,
          type: sequelize.QueryTypes.SELECT
        }),
        sequelize.query(countQuery, {
          replacements: Object.fromEntries(Object.entries(replacements).filter(([key]) => key !== 'limit' && key !== 'offset')),
          type: sequelize.QueryTypes.SELECT
        })
      ]);

      // Format posts data
      const formattedPosts = posts.map(post => ({
        id: post.ID,
        title: post.post_title,
        content: post.post_content,
        excerpt: post.post_excerpt,
        status: post.post_status,
        date: post.post_date,
        modified: post.post_modified,
        author: {
          ID: post.post_author,
          display_name: post.author_display_name,
          user_login: post.author_login,
          user_email: post.author_email
        },
        view_count: parseInt(post.view_count) || 0
      }));

      const total = countResult[0]?.total || 0;

      res.json({
        success: true,
        data: {
          posts: formattedPosts,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          },
          filters: {
            author,
            status,
            year,
            month,
            minViews,
            maxViews,
            sortBy,
            sortOrder
          }
        }
      });

    } catch (error) {
      console.error('Error fetching posts with views:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch posts with views',
        error: error.message
      });
    }
  }

  /**
   * Helper: Track analytics
   */
  static async trackAnalytics(req, contentId, contentType, eventType) {
    try {
      await Analytics.create({
        content_id: contentId,
        content_type: contentType,
        event_type: eventType,
        user_ip: req.ip || req.connection.remoteAddress,
        user_agent: req.get('User-Agent'),
        referrer: req.get('Referer'),
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error tracking analytics:', error);
    }
  }
  /**
   * Get post by ID for article detail page
   * GET /api/content/posts/:id
   */
  static async getPostById(req, res) {
    try {
      const { id } = req.params;
      
      const post = await Post.findOne({
        where: { 
          ID: id,
          post_type: 'post',
          post_status: 'publish'
        },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['ID', 'user_login', 'user_nicename', 'user_email', 'display_name', 'user_role']
          },
          {
            model: PostMeta,
            as: 'meta'
          }
        ]
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      res.status(200).json({
        success: true,
        data: post
      });
    } catch (error) {
      console.error('Error fetching post by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get post by slug for SEO-friendly URLs
   * GET /api/content/posts/slug/:slug
   */
  static async getPostBySlug(req, res) {
    try {
      const { slug } = req.params;
      
      const post = await Post.findOne({
        where: { 
          post_name: slug,
          post_type: 'post',
          post_status: 'publish'
        },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['ID', 'user_login', 'user_nicename', 'user_email', 'display_name', 'user_role']
          },
          {
            model: PostMeta,
            as: 'meta'
          }
        ]
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      // Process metadata for easier access
      const metadata = {};
      if (post.meta) {
        post.meta.forEach(meta => {
          metadata[meta.meta_key] = meta.meta_value;
        });
      }

      // Get featured image URL if exists
      let featuredImage = null;
      if (metadata._thumbnail_id) {
        const thumbnailPost = await Post.findOne({
          where: { ID: metadata._thumbnail_id },
          attributes: ['ID', 'post_title', 'guid']
        });
        
        if (thumbnailPost) {
          featuredImage = {
            id: thumbnailPost.ID,
            url: thumbnailPost.guid,
            title: thumbnailPost.post_title,
            caption: thumbnailPost.post_title
          };
        }
      }

      // Prepare response with enhanced data
      const responseData = {
        ...post.toJSON(),
        metadata,
        featured_image: featuredImage
      };

      res.status(200).json({
        success: true,
        data: responseData
      });
    } catch (error) {
      console.error('Error fetching post by slug:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get post comments by slug
   * GET /api/content/posts/slug/:slug/comments
   */
  static async getPostCommentsBySlug(req, res) {
    try {
      const { slug } = req.params;
      
      // First find the post by slug
      const post = await Post.findOne({
        where: { 
          post_name: slug,
          post_type: 'post',
          post_status: 'publish'
        },
        attributes: ['ID']
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      // For now, return empty comments array since we don't have comments table
      // This can be extended when we implement the comments system
      res.status(200).json({
        success: true,
        data: []
      });
    } catch (error) {
      console.error('Error fetching post comments by slug:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get posts by author (simplified for profile pages)
   * GET /api/content/author/:authorId
   */
  static async getPostsByAuthor(req, res) {
    try {
      const { authorId } = req.params;
      const { page = 1, limit = 20, status = 'publish' } = req.query;
      const offset = (page - 1) * limit;

      console.log('📍 Getting posts for author:', authorId);

      // Validate authorId
      const parsedAuthorId = parseInt(authorId);
      if (isNaN(parsedAuthorId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid author ID'
        });
      }

      const result = await Post.findAndCountAll({
        where: {
          post_author: parsedAuthorId,
          post_status: status,
          post_type: 'post'
        },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['ID', 'display_name', 'user_email', 'user_login']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['post_date', 'DESC']]
      });

      // Format posts
      const formattedPosts = result.rows.map(post => ({
        id: post.ID,
        title: post.post_title,
        content: post.post_content,
        excerpt: post.post_excerpt,
        slug: post.post_name,
        status: post.post_status,
        type: post.post_type,
        date: post.post_date,
        modified: post.post_modified,
        author: {
          ID: post.author.ID,
          display_name: post.author.display_name,
          user_email: post.author.user_email,
          user_login: post.author.user_login
        }
      }));

      res.json({
        success: true,
        data: {
          posts: formattedPosts,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(result.count / parseInt(limit)),
            totalItems: result.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get posts by author error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch posts by author'
      });
    }
  }

  /**
   * Admin: Delete any article
   * DELETE /api/content/admin/articles/:id
   */
  static async adminDeleteArticle(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;

      // Check if user is admin or superadmin
      if (!req.user || (req.user.user_role !== 'admin' && req.user.user_role !== 'superadmin')) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }

      // Find the article
      const article = await Post.findOne({
        where: {
          ID: id,
          post_type: 'post'
        },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['ID', 'display_name', 'user_login']
          }
        ]
      });

      if (!article) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      // Delete related comments first
      await Comment.destroy({
        where: { comment_post_ID: id },
        transaction
      });

      // Delete related metadata
      await PostMeta.destroy({
        where: { post_id: id },
        transaction
      });

      // Delete analytics data
      await Analytics.destroy({
        where: { content_id: id },
        transaction
      });

      // Delete the article
      await article.destroy({ transaction });

      await transaction.commit();

      res.json({
        success: true,
        message: `Article "${article.post_title}" by ${article.author.display_name} has been deleted.`,
        data: {
          deletedArticle: {
            id: article.ID,
            title: article.post_title,
            author: article.author.display_name
          }
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Admin delete article error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete article'
      });
    }
  }
}

module.exports = ContentController;