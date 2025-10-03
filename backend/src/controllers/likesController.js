const { PostLikes, Post, User } = require('../models');

class LikesController {
  
  // Toggle like pada artikel
  static async toggleLike(req, res) {
    const { postId } = req.params;
    const userId = req.user.ID;

    try {
      // First, resolve postId (could be numeric ID or slug)
      let actualPostId = postId;
      
      // If postId is not numeric, treat it as a slug and find the actual ID
      if (isNaN(postId)) {
        const post = await Post.findOne({
          where: { post_name: postId },
          attributes: ['ID']
        });
        
        if (!post) {
          return res.status(404).json({
            success: false,
            message: 'Post not found'
          });
        }
        
        actualPostId = post.ID;
      }

      // Check if user already liked this post
      const existingLike = await PostLikes.findOne({
        where: {
          post_id: actualPostId,
          user_id: userId
        }
      });

      if (existingLike) {
        // Unlike - remove like
        await existingLike.destroy();

        // Decrease like count
        const post = await Post.findByPk(actualPostId);
        if (post) {
          const newCount = Math.max((post.like_count || 0) - 1, 0);
          await post.update({
            like_count: newCount
          });
          console.log(`👎 Post ${actualPostId} unliked. Count: ${post.like_count} -> ${newCount}`);
        }

        // Get updated post data
        const updatedPost = await Post.findByPk(actualPostId);

        res.json({
          success: true,
          message: 'Post unliked',
          data: {
            liked: false,
            likeCount: updatedPost ? (updatedPost.like_count || 0) : 0
          }
        });

      } else {
        // Like - add like
        await PostLikes.create({
          post_id: actualPostId,
          user_id: userId
        });

        // Increase like count
        const post = await Post.findByPk(actualPostId);
        if (post) {
          const newCount = (post.like_count || 0) + 1;
          await post.update({
            like_count: newCount
          });
          console.log(`👍 Post ${actualPostId} liked. Count: ${post.like_count} -> ${newCount}`);
        }

        // Get updated post data
        const updatedPost = await Post.findByPk(actualPostId);

        res.json({
          success: true,
          message: 'Post liked',
          data: {
            liked: true,
            likeCount: updatedPost ? (updatedPost.like_count || 0) : 0
          }
        });
      }

    } catch (error) {
      console.error('Error toggling like:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle like',
        error: error.message
      });
    }
  }

  // Get like status for user and post
  static async getLikeStatus(req, res) {
    const { postId } = req.params;
    const userId = req.user?.ID;

    try {
      // First, resolve postId (could be numeric ID or slug)
      let actualPostId = postId;
      
      // If postId is not numeric, treat it as a slug and find the actual ID
      if (isNaN(postId)) {
        const post = await Post.findOne({
          where: { post_name: postId },
          attributes: ['ID']
        });
        
        if (!post) {
          return res.status(404).json({
            success: false,
            message: 'Post not found'
          });
        }
        
        actualPostId = post.ID;
      }

      // Get post with like count
      const post = await Post.findByPk(actualPostId, {
        attributes: ['ID', 'like_count']
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      let liked = false;
      if (userId) {
        // Check if user liked this post
        const userLike = await PostLikes.findOne({
          where: {
            post_id: actualPostId,
            user_id: userId
          }
        });
        liked = !!userLike;
      }

      res.json({
        success: true,
        data: {
          liked,
          likeCount: post.like_count || 0
        }
      });

    } catch (error) {
      console.error('Error getting like status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get like status',
        error: error.message
      });
    }
  }

  // Get users who liked a post (for admin)
  static async getPostLikers(req, res) {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    try {
      // First, resolve postId (could be numeric ID or slug)
      let actualPostId = postId;
      
      // If postId is not numeric, treat it as a slug and find the actual ID
      if (isNaN(postId)) {
        const post = await Post.findOne({
          where: { post_name: postId },
          attributes: ['ID']
        });
        
        if (!post) {
          return res.status(404).json({
            success: false,
            message: 'Post not found'
          });
        }
        
        actualPostId = post.ID;
      }

      // Get users who liked the post with pagination
      const { count, rows: likes } = await PostLikes.findAndCountAll({
        where: { post_id: actualPostId },
        include: [{
          model: User,
          as: 'user',
          attributes: ['ID', 'display_name', 'user_email']
        }],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      res.json({
        success: true,
        data: {
          likes: likes.map(like => ({
            created_at: like.created_at,
            user_id: like.user.ID,
            display_name: like.user.display_name,
            user_email: like.user.user_email
          })),
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error getting post likers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get post likers',
        error: error.message
      });
    }
  }

  // Get posts liked by user
  static async getUserLikedPosts(req, res) {
    try {
      const userId = req.user.ID;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Get posts liked by user with post details
      const { count, rows: likedPosts } = await PostLikes.findAndCountAll({
        where: { user_id: userId },
        include: [{
          model: Post,
          as: 'post',
          where: {
            post_status: 'publish',
            post_type: 'post'
          },
          attributes: ['ID', 'post_title', 'post_content', 'post_excerpt', 'post_name', 'post_date', 'post_author', 'like_count'],
          include: [{
            model: User,
            as: 'author',
            attributes: ['ID', 'display_name', 'user_login']
          }]
        }],
        order: [['created_at', 'DESC']],
        limit: limit,
        offset: offset
      });

      // Get Analytics model for view counts
      const { Analytics } = require('../models');

      // Get view counts from Analytics table for all liked posts
      const postIds = likedPosts.map(like => like.post.ID);
      const viewCounts = {};

      if (postIds.length > 0) {
        const analyticsData = await Analytics.findAll({
          attributes: [
            'content_id',
            [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'view_count']
          ],
          where: {
            content_id: postIds,
            event_type: 'view'
          },
          group: ['content_id']
        });

        analyticsData.forEach(item => {
          viewCounts[item.content_id] = parseInt(item.dataValues.view_count) || 0;
        });
      }

      // Format the response
      const formattedPosts = likedPosts.map(like => ({
        id: like.post.ID,
        title: like.post.post_title,
        excerpt: like.post.post_excerpt || like.post.post_content.substring(0, 150) + '...',
        slug: like.post.post_name,
        date: like.post.post_date,
        author: {
          id: like.post.author.ID,
          name: like.post.author.display_name,
          login: like.post.author.user_login
        },
        like_count: like.post.like_count || 0,
        view_count: viewCounts[like.post.ID] || 0,
        liked_at: like.created_at
      }));

      res.json({
        success: true,
        data: {
          posts: formattedPosts,
          pagination: {
            total: count,
            page: page,
            limit: limit,
            totalPages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error getting user liked posts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get liked posts',
        error: error.message
      });
    }
  }

}

module.exports = LikesController;