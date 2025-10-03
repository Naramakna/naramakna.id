const { User, Post, Comment, UserProfile, Analytics, Option, sequelize } = require('../models');
const { Op } = require('sequelize');

class AdminController {
  /**
   * Admin: Delete user account
   * DELETE /api/admin/users/:id
   */
  static async deleteUser(req, res) {
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

      // Prevent deleting superadmin (only superadmin can delete superadmin)
      const targetUser = await User.findByPk(id);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (targetUser.user_role === 'superadmin' && req.user.user_role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Only SuperAdmin can delete SuperAdmin accounts'
        });
      }

      // Prevent deleting self
      if (parseInt(id) === req.user.ID) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account'
        });
      }

      // Delete user's profile
      await UserProfile.destroy({
        where: { user_id: id },
        transaction
      });

      // Update user's posts to mark as deleted author (assign to admin user ID 1)
      await Post.update(
        {
          post_author: 1, // Assign to admin instead of null
          post_title: `[DELETED USER] ${new Date().toISOString().split('T')[0]} - ` + sequelize.col('post_title')
        },
        { 
          where: { post_author: id },
          transaction
        }
      );

      // Update user's comments to mark as deleted author (assign to admin)
      await Comment.update(
        {
          comment_author: '[DELETED USER]',
          comment_author_email: 'deleted@example.com',
          user_id: 1 // Assign to admin instead of null
        },
        { 
          where: { user_id: id },
          transaction
        }
      );

      // Delete the user
      await targetUser.destroy({ transaction });

      await transaction.commit();

      res.json({
        success: true,
        message: `User "${targetUser.display_name || targetUser.user_login}" has been deleted.`,
        data: {
          deletedUser: {
            id: targetUser.ID,
            login: targetUser.user_login,
            display_name: targetUser.display_name,
            role: targetUser.user_role
          }
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Admin delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  }

  /**
   * Admin: Suspend/Unsuspend user (toggle posting ability)
   * PATCH /api/admin/users/:id/suspend
   */
  static async suspendUser(req, res) {
    try {
      const { id } = req.params;
      const { suspend } = req.body; // true to suspend, false to unsuspend

      // Check if user is admin or superadmin
      if (!req.user || (req.user.user_role !== 'admin' && req.user.user_role !== 'superadmin')) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }

      const targetUser = await User.findByPk(id);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Prevent suspending superadmin (only superadmin can suspend superadmin)
      if (targetUser.user_role === 'superadmin' && req.user.user_role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Only SuperAdmin can suspend SuperAdmin accounts'
        });
      }

      // Prevent suspending self
      if (parseInt(id) === req.user.ID) {
        return res.status(400).json({
          success: false,
          message: 'You cannot suspend your own account'
        });
      }

      // Update user status
      const newStatus = suspend ? 'suspended' : 'active';
      await targetUser.update({ user_status: newStatus });

      const action = suspend ? 'suspended' : 'unsuspended';
      const message = suspend 
        ? `User "${targetUser.display_name || targetUser.user_login}" has been suspended and cannot post content.`
        : `User "${targetUser.display_name || targetUser.user_login}" has been unsuspended and can post content.`;

      res.json({
        success: true,
        message,
        data: {
          user: {
            id: targetUser.ID,
            login: targetUser.user_login,
            display_name: targetUser.display_name,
            status: newStatus,
            action
          }
        }
      });

    } catch (error) {
      console.error('Admin suspend user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user status'
      });
    }
  }

  /**
   * Admin: Get all users for management
   * GET /api/admin/users
   */
  static async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 20, role, status, search } = req.query;
      const offset = (page - 1) * limit;

      // Check if user is admin or superadmin
      if (!req.user || (req.user.user_role !== 'admin' && req.user.user_role !== 'superadmin')) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }

      let whereClause = {};

      // Filter by role
      if (role && role !== 'all') {
        whereClause.user_role = role;
      }

      // Filter by status
      if (status && status !== 'all') {
        whereClause.user_status = status;
      }

      // Search by username or email
      if (search) {
        whereClause[Op.or] = [
          { user_login: { [Op.like]: `%${search}%` } },
          { user_email: { [Op.like]: `%${search}%` } },
          { display_name: { [Op.like]: `%${search}%` } }
        ];
      }

      const result = await User.findAndCountAll({
        where: whereClause,
        attributes: ['ID', 'user_login', 'user_email', 'display_name', 'user_role', 'user_status', 'user_registered'],
        include: [
          {
            model: UserProfile,
            as: 'profile',
            attributes: ['profile_image', 'birth_date', 'gender', 'city', 'profession'],
            required: false
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['user_registered', 'DESC']]
      });

      const users = result.rows.map(user => ({
        id: user.ID,
        login: user.user_login,
        email: user.user_email,
        display_name: user.display_name,
        role: user.user_role,
        status: user.user_status || 'active',
        registered: user.user_registered,
        profile_image: user.profile?.profile_image ? `${process.env.BACKEND_URL}${user.profile.profile_image}` : null,
        profile_complete: !!(user.profile?.birth_date && user.profile?.gender && user.profile?.city)
      }));

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(result.count / parseInt(limit)),
            totalItems: result.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Admin get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }

  /**
   * Admin: Boost post views
   * POST /api/admin/analytics/boost-views
   */
  static async boostViews(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { target_views, post_ids = 'all', clear_existing = false } = req.body;

      // Check if user is superadmin only
      if (!req.user || req.user.user_role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. SuperAdmin privileges required.'
        });
      }

      // Validate input
      if (!target_views || target_views < 1 || target_views > 1000000) {
        return res.status(400).json({
          success: false,
          message: 'Target views must be between 1 and 1,000,000'
        });
      }

      // Get posts to boost
      let whereClause = { post_status: 'publish' };
      if (post_ids !== 'all' && Array.isArray(post_ids) && post_ids.length > 0) {
        whereClause.ID = { [Op.in]: post_ids };
      }

      const posts = await Post.findAll({
        where: whereClause,
        attributes: ['ID', 'post_title'],
        transaction
      });

      if (posts.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No published posts found to boost'
        });
      }

      let totalViewsAdded = 0;
      
      for (const post of posts) {
        // Get current view count for this post
        const currentViews = await Analytics.count({
          where: { 
            content_id: post.ID, 
            event_type: 'view' 
          },
          transaction
        });

        // Clear existing views if requested
        if (clear_existing) {
          await Analytics.destroy({
            where: { 
              content_id: post.ID, 
              event_type: 'view' 
            },
            transaction
          });
        }

        // Calculate how many views to add
        const viewsToAdd = clear_existing ? target_views : Math.max(0, target_views - currentViews);

        if (viewsToAdd > 0) {
          // Create views in batches to avoid memory issues
          const batchSize = 1000;
          const batches = Math.ceil(viewsToAdd / batchSize);

          for (let batch = 0; batch < batches; batch++) {
            const viewsInThisBatch = Math.min(batchSize, viewsToAdd - (batch * batchSize));
            const viewsData = [];

            for (let i = 0; i < viewsInThisBatch; i++) {
              const randomIndex = (batch * batchSize) + i;
              viewsData.push({
                content_id: post.ID,
                content_type: 'post',
                event_type: 'view',
                user_ip: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${(randomIndex % 254) + 1}`,
                country: ['Indonesia', 'Malaysia', 'Singapore', 'Thailand', 'Philippines', 'Vietnam', 'Brunei', 'Myanmar'][randomIndex % 8],
                region: 'Unknown',
                city: 'Unknown'
              });
            }

            await Analytics.bulkCreate(viewsData, { transaction });
          }

          totalViewsAdded += viewsToAdd;
        }
      }

      await transaction.commit();

      // Get final statistics
      const finalStats = await Analytics.findAll({
        where: { 
          content_id: { [Op.in]: posts.map(p => p.ID) },
          event_type: 'view' 
        },
        attributes: [
          'content_id',
          [sequelize.fn('COUNT', sequelize.col('id')), 'view_count']
        ],
        group: ['content_id'],
        raw: true
      });

      res.json({
        success: true,
        message: `Successfully boosted views for ${posts.length} posts`,
        data: {
          posts_affected: posts.length,
          total_views_added: totalViewsAdded,
          target_views: target_views,
          clear_existing: clear_existing,
          final_stats: finalStats.map(stat => ({
            post_id: stat.content_id,
            view_count: parseInt(stat.view_count)
          }))
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Admin boost views error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to boost views'
      });
    }
  }

  /**
   * Admin: Get analytics overview
   * GET /api/admin/analytics/overview
   */
  static async getAnalyticsOverview(req, res) {
    try {
      // Check if user is superadmin only
      if (!req.user || req.user.user_role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. SuperAdmin privileges required.'
        });
      }

      // Get total analytics by event type
      const eventStats = await Analytics.findAll({
        attributes: [
          'event_type',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_events'],
          [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('content_id'))), 'unique_posts']
        ],
        group: ['event_type'],
        raw: true
      });

      // Get top posts by views
      const topPosts = await Analytics.findAll({
        where: { event_type: 'view' },
        attributes: [
          'content_id',
          [sequelize.fn('COUNT', sequelize.col('Analytics.id')), 'view_count']
        ],
        include: [{
          model: Post,
          as: 'post',
          attributes: ['post_title'],
          required: true
        }],
        group: ['content_id', 'post.ID'],
        order: [[sequelize.fn('COUNT', sequelize.col('Analytics.id')), 'DESC']],
        limit: 10,
        raw: true
      });

      // Get total published posts
      const totalPosts = await Post.count({
        where: { post_status: 'publish' }
      });

      res.json({
        success: true,
        data: {
          event_stats: eventStats.map(stat => ({
            event_type: stat.event_type,
            total_events: parseInt(stat.total_events),
            unique_posts: parseInt(stat.unique_posts)
          })),
          top_posts: topPosts.map(post => ({
            post_id: post.content_id,
            title: post['post.post_title'] || 'Untitled',
            view_count: parseInt(post.view_count)
          })),
          total_published_posts: totalPosts
        }
      });

    } catch (error) {
      console.error('Admin analytics overview error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get analytics overview'
      });
    }
  }

  /**
   * Get posts with current view counts for selection
   * GET /api/admin/analytics/posts
   */
  static async getPostsForBoost(req, res) {
    try {
      // Check if user is superadmin only
      if (!req.user || req.user.user_role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. SuperAdmin privileges required.'
        });
      }

      const { page = 1, limit = 20, search = '' } = req.query;
      const offset = (page - 1) * limit;

      // Build where clause for search
      let whereClause = { post_status: 'publish' };
      if (search.trim()) {
        whereClause.post_title = {
          [Op.like]: `%${search.trim()}%`
        };
      }

      // Get posts with view counts
      const posts = await Post.findAll({
        where: whereClause,
        attributes: ['ID', 'post_title', 'post_date'],
        include: [{
          model: Analytics,
          as: 'analytics',
          attributes: [],
          where: { event_type: 'view' },
          required: false
        }],
        attributes: [
          'ID', 
          'post_title', 
          'post_date',
          [sequelize.fn('COUNT', sequelize.col('analytics.id')), 'view_count']
        ],
        group: ['Post.ID'],
        order: [['post_date', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        subQuery: false
      });

      // Get total count for pagination
      const totalCount = await Post.count({ where: whereClause });

      res.json({
        success: true,
        data: {
          posts: posts.map(post => ({
            id: post.ID,
            title: post.post_title,
            date: post.post_date,
            current_views: parseInt(post.dataValues.view_count) || 0
          })),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount,
            pages: Math.ceil(totalCount / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get posts for boost error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Boost single post views
   * POST /api/admin/analytics/boost-single
   */
  static async boostSinglePost(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { post_id, target_views, clear_existing = false } = req.body;

      // Check if user is superadmin only
      if (!req.user || req.user.user_role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. SuperAdmin privileges required.'
        });
      }

      // Validate input
      if (!post_id || !target_views || target_views < 1 || target_views > 1000000) {
        return res.status(400).json({
          success: false,
          message: 'Post ID is required and target views must be between 1 and 1,000,000'
        });
      }

      // Get the post
      const post = await Post.findOne({
        where: { 
          ID: post_id,
          post_status: 'publish' 
        },
        attributes: ['ID', 'post_title'],
        transaction
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Published post not found'
        });
      }

      // Get current view count
      const currentViews = await Analytics.count({
        where: { 
          content_id: post_id,
          event_type: 'view' 
        },
        transaction
      });

      let viewsToAdd = 0;
      
      if (clear_existing) {
        // Delete existing views
        await Analytics.destroy({
          where: { 
            content_id: post_id,
            event_type: 'view' 
          },
          transaction
        });
        viewsToAdd = target_views;
      } else {
        // Only add views if current is less than target
        if (currentViews < target_views) {
          viewsToAdd = target_views - currentViews;
        }
      }

      if (viewsToAdd > 0) {
        // Generate realistic view data
        const countries = ['Indonesia', 'Malaysia', 'Singapore', 'Thailand', 'Philippines', 'Vietnam', 'Brunei', 'Myanmar'];
        const viewsData = [];

        for (let i = 0; i < viewsToAdd; i++) {
          // Random timestamp within last 30 days
          const randomDays = Math.floor(Math.random() * 30);
          const randomHours = Math.floor(Math.random() * 24);
          const randomMinutes = Math.floor(Math.random() * 60);
          const timestamp = new Date();
          timestamp.setDate(timestamp.getDate() - randomDays);
          timestamp.setHours(randomHours, randomMinutes, 0, 0);

          viewsData.push({
            content_id: post_id,
            content_type: 'post',
            event_type: 'view',
            user_ip: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            country: countries[Math.floor(Math.random() * countries.length)],
            region: 'Unknown',
            city: 'Unknown',
            timestamp: timestamp
          });
        }

        // Insert in batches for performance
        const batchSize = 1000;
        for (let i = 0; i < viewsData.length; i += batchSize) {
          const batch = viewsData.slice(i, i + batchSize);
          await Analytics.bulkCreate(batch, { transaction });
        }
      }

      await transaction.commit();

      // Get final view count
      const finalViews = await Analytics.count({
        where: { 
          content_id: post_id,
          event_type: 'view' 
        }
      });

      res.json({
        success: true,
        message: `Successfully boosted views for "${post.post_title}"`,
        data: {
          post_id: post_id,
          post_title: post.post_title,
          previous_views: currentViews,
          target_views: target_views,
          views_added: viewsToAdd,
          final_views: finalViews,
          clear_existing: clear_existing
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Boost single post error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get analytics button visibility setting
   * GET /api/admin/settings/analytics-button
   */
  static async getAnalyticsButtonSetting(req, res) {
    try {
      // Check if user is superadmin
      if (!req.user || req.user.user_role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. SuperAdmin privileges required.'
        });
      }

      const setting = await Option.findOne({
        where: { option_name: 'show_analytics_button' }
      });

      const showAnalyticsButton = setting ? setting.option_value === 'true' : true;

      res.json({
        success: true,
        data: {
          show_analytics_button: showAnalyticsButton
        }
      });

    } catch (error) {
      console.error('Get analytics button setting error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Toggle analytics button visibility setting
   * POST /api/admin/settings/analytics-button/toggle
   */
  static async toggleAnalyticsButtonSetting(req, res) {
    try {
      // Check if user is superadmin
      if (!req.user || req.user.user_role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. SuperAdmin privileges required.'
        });
      }

      const { enabled } = req.body;

      // Find or create the setting
      const [setting, created] = await Option.findOrCreate({
        where: { option_name: 'show_analytics_button' },
        defaults: {
          option_name: 'show_analytics_button',
          option_value: 'true',
          autoload: 'yes'
        }
      });

      // Update the setting
      await setting.update({
        option_value: enabled ? 'true' : 'false'
      });

      console.log(`📊 Analytics button ${enabled ? 'enabled' : 'disabled'} by ${req.user.user_login}`);

      res.json({
        success: true,
        message: `Analytics button ${enabled ? 'enabled' : 'disabled'} successfully`,
        data: {
          show_analytics_button: enabled,
          updated_by: req.user.user_login,
          updated_at: new Date()
        }
      });

    } catch (error) {
      console.error('Toggle analytics button setting error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get polling settings
   * GET /api/admin/settings/polling
   */
  static async getPollingSettings(req, res) {
    try {
      // Check if user is superadmin
      if (!req.user || req.user.user_role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. SuperAdmin privileges required.'
        });
      }

      const setting = await Option.findOne({
        where: { option_name: 'enable_polling' }
      });

      const enablePolling = setting ? setting.option_value === 'true' : true;

      res.json({
        success: true,
        data: {
          enable_polling: enablePolling
        }
      });

    } catch (error) {
      console.error('Get polling setting error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Toggle polling settings
   * POST /api/admin/settings/polling/toggle
   */
  static async togglePollingSettings(req, res) {
    try {
      // Check if user is superadmin
      if (!req.user || req.user.user_role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. SuperAdmin privileges required.'
        });
      }

      const { enabled } = req.body;

      // Find or create the setting
      const [setting, created] = await Option.findOrCreate({
        where: { option_name: 'enable_polling' },
        defaults: {
          option_name: 'enable_polling',
          option_value: 'true',
          autoload: 'yes'
        }
      });

      // Update the setting
      await setting.update({
        option_value: enabled ? 'true' : 'false'
      });

      console.log(`📊 Polling ${enabled ? 'enabled' : 'disabled'} by ${req.user.user_login}`);

      res.json({
        success: true,
        message: `Polling ${enabled ? 'enabled' : 'disabled'} successfully`,
        data: {
          enable_polling: enabled,
          updated_by: req.user.user_login,
          updated_at: new Date()
        }
      });

    } catch (error) {
      console.error('Toggle polling setting error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get site settings for public use (no auth required)
   * GET /api/admin/settings/public
   */
  static async getPublicSettings(req, res) {
    try {
      const analyticsButtonSetting = await Option.findOne({
        where: { option_name: 'show_analytics_button' }
      });

      const pollingSettings = await Option.findOne({
        where: { option_name: 'enable_polling' }
      });

      const viewsCountSetting = await Option.findOne({
        where: { option_name: 'show_views_count' }
      });

      const showAnalyticsButton = analyticsButtonSetting ?
        analyticsButtonSetting.option_value === 'true' : true;

      const enablePolling = pollingSettings ?
        pollingSettings.option_value === 'true' : true;

      const showViewsCount = viewsCountSetting ?
        viewsCountSetting.option_value === 'true' : true;

      res.json({
        success: true,
        data: {
          show_analytics_button: showAnalyticsButton,
          enable_polling: enablePolling,
          show_views_count: showViewsCount
        }
      });

    } catch (error) {
      console.error('Get public settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Toggle views count display setting
   * POST /api/settings/toggle-views-count
   */
  static async toggleViewsCount(req, res) {
    try {
      const { enabled } = req.body;

      // Find or create the views count setting
      const [setting, created] = await Option.findOrCreate({
        where: { option_name: 'show_views_count' },
        defaults: {
          option_name: 'show_views_count',
          option_value: 'true'
        }
      });

      // Update the setting
      setting.option_value = enabled ? 'true' : 'false';
      await setting.save();

      res.json({
        success: true,
        data: {
          views_count_enabled: enabled
        },
        message: `Views count display ${enabled ? 'enabled' : 'disabled'} successfully`
      });

    } catch (error) {
      console.error('Toggle views count error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Bulk categorize articles
   * POST /api/admin/bulk-categorize
   */
  static async bulkCategorizeArticles(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { article_ids, category_slug } = req.body;

      // Check if user is admin or superadmin
      if (!req.user || (req.user.user_role !== 'admin' && req.user.user_role !== 'superadmin')) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }

      // Validate input
      if (!article_ids || !Array.isArray(article_ids) || article_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Article IDs array is required'
        });
      }

      if (!category_slug) {
        return res.status(400).json({
          success: false,
          message: 'Category slug is required'
        });
      }

      // Find the category by slug
      const categoryQuery = `
        SELECT tt.term_taxonomy_id 
        FROM terms t
        JOIN term_taxonomy tt ON t.term_id = tt.term_id
        WHERE t.slug = ? AND tt.taxonomy = 'category'
        LIMIT 1
      `;
      
      const categoryResult = await sequelize.query(categoryQuery, {
        replacements: [category_slug],
        type: sequelize.QueryTypes.SELECT,
        transaction
      });

      if (!categoryResult || categoryResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Category with slug '${category_slug}' not found`
        });
      }

      const categoryId = categoryResult[0].term_taxonomy_id;

      // First, remove existing categories for these articles
      const deleteQuery = `
        DELETE FROM term_relationships 
        WHERE object_id IN (${article_ids.map(() => '?').join(',')})
        AND term_taxonomy_id IN (
          SELECT term_taxonomy_id FROM term_taxonomy WHERE taxonomy = 'category'
        )
      `;

      await sequelize.query(deleteQuery, {
        replacements: article_ids,
        type: sequelize.QueryTypes.DELETE,
        transaction
      });

      // Add new category relationships
      const insertData = article_ids.map(articleId => ({
        object_id: articleId,
        term_taxonomy_id: categoryId,
        term_order: 0
      }));

      const insertQuery = `
        INSERT INTO term_relationships (object_id, term_taxonomy_id, term_order)
        VALUES ${insertData.map(() => '(?, ?, ?)').join(', ')}
      `;

      const insertReplacements = insertData.flatMap(item => [
        item.object_id,
        item.term_taxonomy_id,
        item.term_order
      ]);

      await sequelize.query(insertQuery, {
        replacements: insertReplacements,
        type: sequelize.QueryTypes.INSERT,
        transaction
      });

      // Update category count
      const updateCountQuery = `
        UPDATE term_taxonomy SET count = (
          SELECT COUNT(*) FROM term_relationships 
          WHERE term_taxonomy_id = ?
        ) WHERE term_taxonomy_id = ?
      `;

      await sequelize.query(updateCountQuery, {
        replacements: [categoryId, categoryId],
        type: sequelize.QueryTypes.UPDATE,
        transaction
      });

      await transaction.commit();

      res.json({
        success: true,
        message: `Successfully categorized ${article_ids.length} articles`,
        data: {
          categorized_count: article_ids.length,
          category_slug: category_slug
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Bulk categorize articles error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to categorize articles',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * SuperAdmin: Demote admin to user
   * POST /api/superadmin/demote-admin/:userId
   */
  static async demoteAdmin(req, res) {
    try {
      const { userId } = req.params;

      // Check if user is superadmin
      if (!req.user || req.user.user_role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. SuperAdmin privileges required.'
        });
      }

      // Find the target user
      const targetUser = await User.findByPk(userId);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if target user is actually an admin
      if (targetUser.user_role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'User is not an admin'
        });
      }

      // Prevent demoting self
      if (parseInt(userId) === req.user.ID) {
        return res.status(400).json({
          success: false,
          message: 'You cannot demote yourself'
        });
      }

      // Demote admin to user
      await targetUser.update({
        user_role: 'user'
      });

      res.json({
        success: true,
        message: `Admin ${targetUser.display_name} has been demoted to user`,
        data: {
          user_id: targetUser.ID,
          display_name: targetUser.display_name,
          previous_role: 'admin',
          new_role: 'user'
        }
      });

    } catch (error) {
      console.error('Demote admin error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to demote admin',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

}

module.exports = AdminController;