const { Post, PostMeta, User, sequelize } = require('../models');
const { POST_STATUS, USER_ROLES } = require('../../../shared/constants/roles.cjs');
const { Op } = require('sequelize');

class ContentApprovalController {
  // Get pending posts (admin+ only)
  static async getPendingPosts(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        author_id,
        post_type = 'post'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {
        post_status: POST_STATUS.PENDING,
        post_type
      };

      if (author_id) {
        where.post_author = parseInt(author_id);
      }

      const posts = await Post.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['ID', 'user_login', 'display_name', 'user_email', 'user_role']
          }
        ],
        order: [['post_date', 'ASC']], // Oldest first for review queue
        limit: parseInt(limit),
        offset
      });

      // Add metadata for each post
      const postsWithMeta = await Promise.all(
        posts.rows.map(async (post) => {
          const meta = await PostMeta.findAll({
            where: { post_id: post.ID },
            attributes: ['meta_key', 'meta_value']
          });

          return {
            ...post.toJSON(),
            meta: meta.reduce((acc, m) => {
              acc[m.meta_key] = m.meta_value;
              return acc;
            }, {})
          };
        })
      );

      res.json({
        success: true,
        data: {
          pending_posts: postsWithMeta,
          pagination: {
            total: posts.count,
            page: parseInt(page),
            limit: parseInt(limit),
            total_pages: Math.ceil(posts.count / parseInt(limit))
          }
        }
      });

    } catch (error) {
      console.error('Get pending posts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pending posts'
      });
    }
  }

  // Approve or reject post (admin+ only)
  static async reviewPost(req, res) {
    try {
      const { id } = req.params;
      const { action, feedback } = req.body; // action: 'approve' | 'reject'
      const reviewer = req.user;

      if (!action || !['approve', 'reject'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Valid action (approve/reject) is required'
        });
      }

      const post = await Post.findOne({
        where: { 
          ID: id,
          post_status: POST_STATUS.PENDING
        },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['ID', 'user_login', 'display_name', 'user_email']
          }
        ]
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Pending post not found'
        });
      }

      // Update post status
      const newStatus = action === 'approve' ? POST_STATUS.PUBLISHED : POST_STATUS.REJECTED;
      
      await post.update({
        post_status: newStatus,
        post_modified: new Date()
      });

      // Add review metadata
      await PostMeta.create({
        post_id: post.ID,
        meta_key: '_review_action',
        meta_value: JSON.stringify({
          action,
          reviewer_id: reviewer.ID,
          reviewer_name: reviewer.display_name,
          review_date: new Date(),
          feedback: feedback || null
        })
      });

      // TODO: Send notification to author
      console.log(`Post ${action}d: "${post.post_title}" by ${post.author.display_name}`);

      res.json({
        success: true,
        message: `Post ${action}d successfully`,
        data: {
          post_id: post.ID,
          post_title: post.post_title,
          author: post.author.display_name,
          action,
          new_status: newStatus,
          reviewer: reviewer.display_name
        }
      });

    } catch (error) {
      console.error('Review post error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to review post'
      });
    }
  }

  // Bulk review posts (admin+ only)
  static async bulkReviewPosts(req, res) {
    try {
      const { post_ids, action, feedback } = req.body;
      const reviewer = req.user;

      if (!post_ids || !Array.isArray(post_ids) || post_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Post IDs array is required'
        });
      }

      if (!action || !['approve', 'reject'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Valid action (approve/reject) is required'
        });
      }

      const posts = await Post.findAll({
        where: {
          ID: { [Op.in]: post_ids },
          post_status: POST_STATUS.PENDING
        }
      });

      if (posts.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No pending posts found with provided IDs'
        });
      }

      const newStatus = action === 'approve' ? POST_STATUS.PUBLISHED : POST_STATUS.REJECTED;
      
      // Update all posts
      await Post.update(
        { 
          post_status: newStatus,
          post_modified: new Date()
        },
        {
          where: { ID: { [Op.in]: post_ids } }
        }
      );

      // Add review metadata for each post
      const reviewMeta = posts.map(post => ({
        post_id: post.ID,
        meta_key: '_review_action',
        meta_value: JSON.stringify({
          action,
          reviewer_id: reviewer.ID,
          reviewer_name: reviewer.display_name,
          review_date: new Date(),
          feedback: feedback || null,
          bulk_review: true
        })
      }));

      await PostMeta.bulkCreate(reviewMeta);

      res.json({
        success: true,
        message: `${posts.length} posts ${action}d successfully`,
        data: {
          affected_posts: posts.length,
          action,
          new_status: newStatus,
          reviewer: reviewer.display_name
        }
      });

    } catch (error) {
      console.error('Bulk review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform bulk review'
      });
    }
  }

  // Get review statistics (admin+ only)
  static async getReviewStats(req, res) {
    try {
      const stats = await Promise.all([
        // Pending posts count
        Post.count({ where: { post_status: POST_STATUS.PENDING } }),
        
        // Posts by status
        Post.count({ where: { post_status: POST_STATUS.PUBLISHED } }),
        Post.count({ where: { post_status: POST_STATUS.REJECTED } }),
        Post.count({ where: { post_status: POST_STATUS.DRAFT } }),
        
        // Recent pending posts (last 7 days)
        Post.count({
          where: {
            post_status: POST_STATUS.PENDING,
            post_date: {
              [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        
        // Posts by author role (writers vs admins)
        Post.count({
          include: [{
            model: User,
            as: 'author',
            where: { user_role: USER_ROLES.WRITER }
          }]
        }),
        
        Post.count({
          include: [{
            model: User,
            as: 'author',
            where: { user_role: { [Op.in]: [USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN] } }
          }]
        })
      ]);

      res.json({
        success: true,
        data: {
          review_queue: {
            pending: stats[0],
            recent_submissions: stats[4]
          },
          post_status: {
            published: stats[1],
            rejected: stats[2],
            draft: stats[3]
          },
          author_breakdown: {
            writers: stats[5],
            admins: stats[6]
          }
        }
      });

    } catch (error) {
      console.error('Get review stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch review statistics'
      });
    }
  }

  // Get my pending posts (writer can see their own)
  static async getMyPendingPosts(req, res) {
    try {
      const user = req.user;
      const { page = 1, limit = 20 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const posts = await Post.findAndCountAll({
        where: {
          post_author: user.ID,
          post_status: POST_STATUS.PENDING
        },
        order: [['post_date', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: {
          my_pending_posts: posts.rows,
          pagination: {
            total: posts.count,
            page: parseInt(page),
            limit: parseInt(limit),
            total_pages: Math.ceil(posts.count / parseInt(limit))
          }
        }
      });

    } catch (error) {
      console.error('Get my pending posts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch your pending posts'
      });
    }
  }

  /**
   * Get post details for review/editing (admin+ only)
   * GET /api/approval/:id/details
   */
  static async getPostForReview(req, res) {
    try {
      const { id } = req.params;
      
      const post = await Post.findOne({
        where: { 
          ID: id,
          post_status: { [Op.in]: [POST_STATUS.PENDING, POST_STATUS.DRAFT] }
        },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['ID', 'user_login', 'display_name', 'user_email', 'user_role']
          }
        ]
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found or not available for review'
        });
      }

      // Get post metadata
      const meta = await PostMeta.findAll({
        where: { post_id: post.ID },
        attributes: ['meta_key', 'meta_value']
      });

      const postData = {
        ...post.toJSON(),
        meta: meta.reduce((acc, m) => {
          acc[m.meta_key] = m.meta_value;
          return acc;
        }, {})
      };

      res.json({
        success: true,
        data: { post: postData }
      });

    } catch (error) {
      console.error('Get post for review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch post details'
      });
    }
  }

  /**
   * Edit writer post content (admin+ only)
   * PUT /api/approval/:id/edit
   */
  static async editWriterPost(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const reviewer = req.user;
      
      const {
        title,
        content,
        description,
        summary_social,
        channel,
        topic,
        keyword,
        location,
        mark_as_18_plus,
        edit_reason
      } = req.body;

      // Find the post
      const post = await Post.findOne({
        where: { 
          ID: id,
          post_status: { [Op.in]: [POST_STATUS.PENDING, POST_STATUS.DRAFT] }
        },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['ID', 'user_login', 'display_name', 'user_email']
          }
        ],
        transaction
      });

      if (!post) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Post not found or not available for editing'
        });
      }

      // Only allow editing writer posts
      if (post.author.user_role !== USER_ROLES.WRITER) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'This feature is only for editing writer posts'
        });
      }

      // Update post content
      const updateData = {};
      if (title) updateData.post_title = title;
      if (content) updateData.post_content = content;
      if (description) updateData.post_excerpt = description;
      updateData.post_modified = new Date();

      await post.update(updateData, { transaction });

      // Update metadata if provided
      const metaUpdates = [];
      if (description !== undefined) metaUpdates.push({ key: '_aioseo_description', value: description });
      if (summary_social !== undefined) metaUpdates.push({ key: '_summary_social', value: summary_social });
      if (channel !== undefined) metaUpdates.push({ key: '_channel', value: channel });
      if (topic !== undefined) metaUpdates.push({ key: '_topic', value: topic || '' });
      if (keyword !== undefined) metaUpdates.push({ key: '_keyword', value: keyword || '' });
      if (location !== undefined) metaUpdates.push({ key: '_location', value: location || '' });
      if (mark_as_18_plus !== undefined) metaUpdates.push({ key: '_mark_as_18_plus', value: mark_as_18_plus ? '1' : '0' });

      // Update metadata
      for (const meta of metaUpdates) {
        await PostMeta.upsert({
          post_id: post.ID,
          meta_key: meta.key,
          meta_value: meta.value
        }, { transaction });
      }

      // Record the edit action
      await PostMeta.create({
        post_id: post.ID,
        meta_key: '_admin_edit',
        meta_value: JSON.stringify({
          editor_id: reviewer.ID,
          editor_name: reviewer.display_name,
          edit_date: new Date(),
          edit_reason: edit_reason || 'Content review and editing',
          changes: {
            title: title !== undefined,
            content: content !== undefined,
            description: description !== undefined,
            metadata: metaUpdates.length > 0
          }
        })
      }, { transaction });

      await transaction.commit();

      res.json({
        success: true,
        message: 'Post edited successfully',
        data: {
          post_id: post.ID,
          post_title: post.post_title,
          author: post.author.display_name,
          editor: reviewer.display_name,
          edit_reason: edit_reason || 'Content review and editing'
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Edit writer post error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to edit post'
      });
    }
  }

  /**
   * Review post with optional editing (admin+ only)
   * POST /api/approval/:id/review-with-edit
   */
  static async reviewWithEdit(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const reviewer = req.user;
      
      const {
        action, // 'approve', 'reject', 'request-changes'
        feedback,
        // Optional edit fields
        title,
        content,
        description,
        summary_social,
        channel,
        topic,
        keyword,
        location,
        mark_as_18_plus
      } = req.body;

      if (!action || !['approve', 'reject', 'request-changes'].includes(action)) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Valid action (approve/reject/request-changes) is required'
        });
      }

      const post = await Post.findOne({
        where: { 
          ID: id,
          post_status: { [Op.in]: [POST_STATUS.PENDING, POST_STATUS.DRAFT] }
        },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['ID', 'user_login', 'display_name', 'user_email']
          }
        ],
        transaction
      });

      if (!post) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      // Apply edits if provided
      let hasEdits = false;
      const updateData = {};
      
      if (title && title !== post.post_title) {
        updateData.post_title = title;
        hasEdits = true;
      }
      if (content && content !== post.post_content) {
        updateData.post_content = content;
        hasEdits = true;
      }
      if (description && description !== post.post_excerpt) {
        updateData.post_excerpt = description;
        hasEdits = true;
      }

      // Set new status based on action
      let newStatus;
      switch (action) {
        case 'approve':
          newStatus = POST_STATUS.PUBLISHED;
          break;
        case 'reject':
          newStatus = POST_STATUS.REJECTED;
          break;
        case 'request-changes':
          newStatus = POST_STATUS.DRAFT; // Send back to writer
          break;
      }

      updateData.post_status = newStatus;
      updateData.post_modified = new Date();

      await post.update(updateData, { transaction });

      // Update metadata if provided
      const metaUpdates = [];
      if (description !== undefined) metaUpdates.push({ key: '_aioseo_description', value: description });
      if (summary_social !== undefined) metaUpdates.push({ key: '_summary_social', value: summary_social });
      if (channel !== undefined) metaUpdates.push({ key: '_channel', value: channel });
      if (topic !== undefined) metaUpdates.push({ key: '_topic', value: topic || '' });
      if (keyword !== undefined) metaUpdates.push({ key: '_keyword', value: keyword || '' });
      if (location !== undefined) metaUpdates.push({ key: '_location', value: location || '' });
      if (mark_as_18_plus !== undefined) metaUpdates.push({ key: '_mark_as_18_plus', value: mark_as_18_plus ? '1' : '0' });

      // Update metadata
      for (const meta of metaUpdates) {
        await PostMeta.upsert({
          post_id: post.ID,
          meta_key: meta.key,
          meta_value: meta.value
        }, { transaction });
        hasEdits = true;
      }

      // Record the review action
      await PostMeta.create({
        post_id: post.ID,
        meta_key: '_review_with_edit',
        meta_value: JSON.stringify({
          action,
          reviewer_id: reviewer.ID,
          reviewer_name: reviewer.display_name,
          review_date: new Date(),
          feedback: feedback || null,
          has_edits: hasEdits,
          changes: hasEdits ? {
            title: title !== undefined && title !== post.post_title,
            content: content !== undefined && content !== post.post_content,
            description: description !== undefined && description !== post.post_excerpt,
            metadata: metaUpdates.length > 0
          } : null
        })
      }, { transaction });

      await transaction.commit();

      res.json({
        success: true,
        message: `Post ${action.replace('-', ' ')}d${hasEdits ? ' with edits' : ''} successfully`,
        data: {
          post_id: post.ID,
          post_title: post.post_title,
          author: post.author.display_name,
          reviewer: reviewer.display_name,
          action,
          new_status: newStatus,
          has_edits: hasEdits,
          feedback
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Review with edit error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to review post'
      });
    }
  }
}

module.exports = ContentApprovalController;