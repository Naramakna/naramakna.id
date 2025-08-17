const express = require('express');
const router = express.Router();
const LikesController = require('../controllers/likesController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Toggle like (requires authentication)
router.post('/posts/:postId/like', authenticate, LikesController.toggleLike);

// Get like status (optional authentication)
router.get('/posts/:postId/like-status', optionalAuth, LikesController.getLikeStatus);

// Get post likers (admin only)
router.get('/posts/:postId/likers', authenticate, LikesController.getPostLikers);

module.exports = router;