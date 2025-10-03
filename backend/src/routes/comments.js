const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/commentController');
const { authenticate, requireAdmin, canPost } = require('../middleware/auth');

// Get comments for a specific post
router.get('/post/:postId', CommentController.getPostComments);

// Get comments for a specific post by slug
router.get('/post/slug/:slug', CommentController.getPostCommentsBySlug);

// Create a new comment (requires authentication + not suspended)
router.post('/', authenticate, canPost, CommentController.createComment);

// Update a comment (requires authentication + not suspended)
router.put('/:id', authenticate, canPost, CommentController.updateComment);

// Delete a comment (requires authentication)
router.delete('/:id', authenticate, CommentController.deleteComment);

// Get user's comments
router.get('/user/my-comments', authenticate, CommentController.getUserComments);

// Admin routes
router.delete('/admin/:id', authenticate, requireAdmin, CommentController.adminDeleteComment);

module.exports = router;