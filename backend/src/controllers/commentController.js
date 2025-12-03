const { Comment, Post, User } = require('../models');
const UserProfile = require('../models/UserProfile');
const { Op } = require('sequelize');

class CommentController {
  /**
   * Get comments for a specific post
   * GET /api/comments/post/:postId
   */
  static async getPostComments(req, res) {
    try {
      const { postId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      console.log('📝 Getting comments for post:', postId);

      // Check if post exists
      const post = await Post.findOne({
        where: { 
          ID: postId,
          post_status: 'publish',
          post_type: 'post'
        }
      });

      if (!post) {
        console.log('❌ Post not found:', postId);
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      console.log('✅ Post found:', post.post_title);

      // Get comments with pagination
      console.log('🔍 Searching comments with where:', {
        comment_post_ID: postId,
        comment_approved: '1',
        comment_type: 'comment'
      });

      const result = await Comment.findAndCountAll({
        where: {
          comment_post_ID: postId,
          comment_approved: '1',
          comment_type: 'comment'
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['ID', 'display_name', 'user_email', 'user_login', 'profile_image'],
            required: false,
            include: [
              {
                model: UserProfile,
                as: 'profile',
                attributes: ['profile_image'],
                required: false
              }
            ]
          }
        ],
        order: [['comment_date', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      console.log('📊 Comment query result:', result.count, 'comments found');

      // Format comments and group replies (OPTIMIZED - no N+1 queries!)
      const formattedComments = result.rows.map(comment => {
        let profileImage = null;

        // Get profile image if user exists
        if (comment.user && comment.user.ID) {
          // First check if user has profile_image in users table (e.g., from Google OAuth)
          if (comment.user.profile_image) {
            profileImage = comment.user.profile_image;
          } else if (comment.user.profile && comment.user.profile.profile_image) {
            // Fallback to UserProfile table for uploaded images
            profileImage = `${process.env.BACKEND_URL}${comment.user.profile.profile_image}`;
          }
        }

        return {
          id: comment.comment_ID,
          content: comment.comment_content,
          author: {
            name: comment.comment_author,
            email: comment.comment_author_email,
            user: comment.user ? {
              id: comment.user.ID,
              display_name: comment.user.display_name,
              user_login: comment.user.user_login,
              profile_image: profileImage
            } : null
          },
          date: comment.comment_date,
          parent_id: comment.comment_parent,
          replies: []
        };
      });

      // Group replies under their parent comments
      const groupedComments = [];
      const repliesMap = {};

      // First pass: separate main comments and replies
      formattedComments.forEach(comment => {
        if (comment.parent_id === 0) {
          // Main comment
          comment.replies = [];
          groupedComments.push(comment);
        } else {
          // Reply - add to replies map
          if (!repliesMap[comment.parent_id]) {
            repliesMap[comment.parent_id] = [];
          }
          repliesMap[comment.parent_id].push(comment);
        }
      });

      // Second pass: assign replies to their parent comments
      groupedComments.forEach(comment => {
        if (repliesMap[comment.id]) {
          comment.replies = repliesMap[comment.id];
        }
      });

      res.json({
        success: true,
        data: {
          comments: groupedComments,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(result.count / parseInt(limit)),
            totalItems: result.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get post comments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch comments'
      });
    }
  }

  /**
   * Get comments for a specific post by slug
   * GET /api/comments/post/slug/:slug
   */
  static async getPostCommentsBySlug(req, res) {
    try {
      const { slug } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      console.log('📝 Getting comments for post slug:', slug);

      // Find post by slug
      const post = await Post.findOne({
        where: {
          post_name: slug,
          post_status: 'publish',
          post_type: 'post'
        }
      });

      if (!post) {
        console.log('❌ Post not found for slug:', slug);
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      console.log('✅ Post found by slug:', post.post_title, 'ID:', post.ID);

      // Get comments with pagination using the found post ID
      const result = await Comment.findAndCountAll({
        where: {
          comment_post_ID: post.ID,
          comment_approved: '1',
          comment_type: 'comment'
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['ID', 'display_name', 'user_email', 'user_login', 'profile_image'],
            required: false,
            include: [
              {
                model: UserProfile,
                as: 'profile',
                attributes: ['profile_image'],
                required: false
              }
            ]
          }
        ],
        order: [['comment_date', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      console.log('📊 Comment query result for slug:', result.count, 'comments found');

      // Format comments and group replies (OPTIMIZED - no N+1 queries!)
      const formattedComments = result.rows.map(comment => {
        let profileImage = null;

        // Get profile image if user exists
        if (comment.user && comment.user.ID) {
          // First check if user has profile_image in users table (e.g., from Google OAuth)
          if (comment.user.profile_image) {
            profileImage = comment.user.profile_image;
          } else if (comment.user.profile && comment.user.profile.profile_image) {
            // Fallback to UserProfile table for uploaded images
            profileImage = `${process.env.BACKEND_URL}${comment.user.profile.profile_image}`;
          }
        }

        return {
          id: comment.comment_ID,
          content: comment.comment_content,
          author: {
            name: comment.comment_author,
            email: comment.comment_author_email,
            user: comment.user ? {
              id: comment.user.ID,
              display_name: comment.user.display_name,
              user_login: comment.user.user_login,
              profile_image: profileImage
            } : null
          },
          date: comment.comment_date,
          parent_id: comment.comment_parent,
          replies: []
        };
      });

      // Group replies under their parent comments
      const groupedComments = [];
      const repliesMap = {};

      // First pass: separate main comments and replies
      formattedComments.forEach(comment => {
        if (comment.parent_id === 0) {
          // Main comment
          comment.replies = [];
          groupedComments.push(comment);
        } else {
          // Reply - add to replies map
          if (!repliesMap[comment.parent_id]) {
            repliesMap[comment.parent_id] = [];
          }
          repliesMap[comment.parent_id].push(comment);
        }
      });

      // Second pass: assign replies to their parent comments
      groupedComments.forEach(comment => {
        if (repliesMap[comment.id]) {
          comment.replies = repliesMap[comment.id];
        }
      });

      res.json({
        success: true,
        data: {
          comments: groupedComments,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(result.count / parseInt(limit)),
            totalItems: result.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get post comments by slug error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch comments'
      });
    }
  }

  /**
   * Create a new comment
   * POST /api/comments
   */
  static async createComment(req, res) {
    try {
      const { postId, content, parentId = 0 } = req.body;
      const userIP = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || '';

      // Validate required fields
      if (!postId || !content) {
        return res.status(400).json({
          success: false,
          message: 'Post ID and content are required'
        });
      }

      // Check if post exists - handle both ID and slug
      let post;
      const isNumeric = /^\d+$/.test(postId.toString());

      if (isNumeric) {
        // postId is numeric - treat as ID
        post = await Post.findOne({
          where: {
            ID: postId,
            post_status: 'publish',
            post_type: 'post'
          }
        });
      } else {
        // postId is string - treat as slug
        post = await Post.findOne({
          where: {
            post_name: postId,
            post_status: 'publish',
            post_type: 'post'
          }
        });
      }

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      // Check if parent comment exists (for replies)
      if (parentId > 0) {
        const parentComment = await Comment.findOne({
          where: {
            comment_ID: parentId,
            comment_post_ID: post.ID, // Use the actual post ID
            comment_approved: '1'
          }
        });

        if (!parentComment) {
          return res.status(404).json({
            success: false,
            message: 'Parent comment not found'
          });
        }
      }

      // Create comment data
      const commentData = {
        comment_post_ID: post.ID, // Use the actual post ID, not the slug
        comment_content: content.trim(),
        comment_parent: parentId,
        comment_author_IP: userIP,
        comment_agent: userAgent,
        comment_approved: '1' // Auto-approve for authenticated users
      };

      // Add user info if authenticated
      if (req.user) {
        commentData.user_id = req.user.ID;
        commentData.comment_author = req.user.display_name || req.user.user_login;
        commentData.comment_author_email = req.user.user_email;
      } else {
        // For guest users (if allowed)
        const { author_name, author_email } = req.body;
        
        if (!author_name || !author_email) {
          return res.status(400).json({
            success: false,
            message: 'Author name and email are required for guest comments'
          });
        }

        commentData.comment_author = author_name;
        commentData.comment_author_email = author_email;
      }

      // Create comment
      const comment = await Comment.create(commentData);

      // Fetch the created comment with user data
      const createdComment = await Comment.findOne({
        where: { comment_ID: comment.comment_ID },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['ID', 'display_name', 'user_email', 'user_login'],
            required: false
          }
        ]
      });

      // Get profile image if user exists
      let profileImage = null;
      if (createdComment.user && createdComment.user.ID) {
        const userProfile = await UserProfile.findOne({
          where: { user_id: createdComment.user.ID }
        });

        if (userProfile && userProfile.profile_image) {
          profileImage = `${process.env.BACKEND_URL}${userProfile.profile_image}`;
        }
      }

      res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        data: {
          id: createdComment.comment_ID,
          content: createdComment.comment_content,
          author: {
            name: createdComment.comment_author,
            email: createdComment.comment_author_email,
            user: createdComment.user ? {
              id: createdComment.user.ID,
              display_name: createdComment.user.display_name,
              user_login: createdComment.user.user_login,
              profile_image: profileImage
            } : null
          },
          date: createdComment.comment_date,
          parent_id: createdComment.comment_parent,
          replies: []
        }
      });

    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create comment'
      });
    }
  }

  /**
   * Update a comment
   * PUT /api/comments/:id
   */
  static async updateComment(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Content is required'
        });
      }

      // Find comment
      const comment = await Comment.findOne({
        where: { comment_ID: id }
      });

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      // Check permission (only comment author or admin can edit)
      if (req.user && (
        comment.user_id === req.user.ID || 
        ['admin', 'superadmin'].includes(req.user.user_role)
      )) {
        await comment.update({
          comment_content: content.trim()
        });

        res.json({
          success: true,
          message: 'Comment updated successfully',
          data: {
            id: comment.comment_ID,
            content: comment.comment_content
          }
        });
      } else {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to edit this comment'
        });
      }

    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update comment'
      });
    }
  }

  /**
   * Delete a comment
   * DELETE /api/comments/:id
   */
  static async deleteComment(req, res) {
    try {
      const { id } = req.params;

      // Find comment
      const comment = await Comment.findOne({
        where: { comment_ID: id }
      });

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      // Check permission (only comment author or admin can delete)
      if (req.user && (
        comment.user_id === req.user.ID || 
        ['admin', 'superadmin'].includes(req.user.user_role)
      )) {
        await comment.destroy();

        res.json({
          success: true,
          message: 'Comment deleted successfully'
        });
      } else {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this comment'
        });
      }

    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete comment'
      });
    }
  }

  /**
   * Admin: Delete any comment
   * DELETE /api/comments/admin/:id
   */
  static async adminDeleteComment(req, res) {
    try {
      const { id } = req.params;

      // Check if user is admin or superadmin
      if (!req.user || (req.user.user_role !== 'admin' && req.user.user_role !== 'superadmin')) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }

      // Find the comment
      const comment = await Comment.findOne({
        where: { comment_ID: id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['ID', 'display_name', 'user_login']
          }
        ]
      });

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      // Delete all replies to this comment first
      await Comment.destroy({
        where: { comment_parent: id }
      });

      // Delete the comment itself
      await comment.destroy();

      res.json({
        success: true,
        message: `Comment by ${comment.comment_author} has been deleted.`,
        data: {
          deletedComment: {
            id: comment.comment_ID,
            author: comment.comment_author,
            content: comment.comment_content.substring(0, 50) + '...'
          }
        }
      });

    } catch (error) {
      console.error('Admin delete comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete comment'
      });
    }
  }

  /**
   * Get comments by user
   * GET /api/comments/user/my-comments
   */
  static async getUserComments(req, res) {
    try {
      const userId = req.user.ID;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Get comments by user with post details
      const { count, rows: userComments } = await Comment.findAndCountAll({
        where: {
          user_id: userId,
          comment_approved: '1',
          comment_type: 'comment'
        },
        include: [{
          model: Post,
          as: 'post',
          where: {
            post_status: 'publish',
            post_type: 'post'
          },
          attributes: ['ID', 'post_title', 'post_name', 'post_date']
        }],
        order: [['comment_date', 'DESC']],
        limit: limit,
        offset: offset
      });

      // Format the response
      const formattedComments = userComments.map(comment => ({
        id: comment.comment_ID,
        content: comment.comment_content,
        date: comment.comment_date,
        post: {
          id: comment.post.ID,
          title: comment.post.post_title,
          slug: comment.post.post_name,
          date: comment.post.post_date
        }
      }));

      res.json({
        success: true,
        data: {
          comments: formattedComments,
          pagination: {
            total: count,
            page: page,
            limit: limit,
            totalPages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error getting user comments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user comments',
        error: error.message
      });
    }
  }
}

module.exports = CommentController;