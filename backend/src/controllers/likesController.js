const { PostLikes, Post, User } = require('../models');

class LikesController {
  
  // Toggle like pada artikel
  static async toggleLike(req, res) {
    const { postId } = req.params;
    const userId = req.user.ID;

    try {
      // Check if user already liked this post
      const existingLike = await PostLikes.findOne({
        where: {
          post_id: postId,
          user_id: userId
        }
      });

      if (existingLike) {
        // Unlike - remove like
        await existingLike.destroy();

        // Decrease like count
        const post = await Post.findByPk(postId);
        if (post) {
          const newCount = Math.max((post.like_count || 0) - 1, 0);
          await post.update({
            like_count: newCount
          });
          console.log(`👎 Post ${postId} unliked. Count: ${post.like_count} -> ${newCount}`);
        }

        // Get updated post data
        const updatedPost = await Post.findByPk(postId);

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
          post_id: postId,
          user_id: userId
        });

        // Increase like count
        const post = await Post.findByPk(postId);
        if (post) {
          const newCount = (post.like_count || 0) + 1;
          await post.update({
            like_count: newCount
          });
          console.log(`👍 Post ${postId} liked. Count: ${post.like_count} -> ${newCount}`);
        }

        // Get updated post data
        const updatedPost = await Post.findByPk(postId);

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
      // Get post with like count
      const post = await Post.findByPk(postId, {
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
            post_id: postId,
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
      // Get users who liked the post with pagination
      const { count, rows: likes } = await PostLikes.findAndCountAll({
        where: { post_id: postId },
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

}

module.exports = LikesController;