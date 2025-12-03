/**
 * Universal Content Routes
 * Handles all content types: articles, YouTube videos, TikTok videos
 */

const express = require('express');
const router = express.Router();
const ContentController = require('../controllers/contentController');
const { authenticate, requireWriter, requireAdmin, canEditPost, canCreateVideo } = require('../middleware/auth');
const { uploadPostImages, handleUploadError } = require('../middleware/upload');

// Content feed and discovery
router.get('/feed', ContentController.getFeed);
router.get('/posts', ContentController.getFeed);

// Search functionality
router.get('/search/suggestions', ContentController.getSearchSuggestions); // alias for frontend compatibility
router.get('/trending', ContentController.getTrending);
router.get('/stats', ContentController.getStats);
router.get('/posts-with-views', ContentController.getPostsWithViews);
router.get('/categories', ContentController.getCategories);
router.get('/author/:authorId', ContentController.getPostsByAuthor);

// Content by type
router.get('/type/:type', ContentController.getByType);

// Individual content CRUD - Specific routes first!
router.get('/posts/slug/:slug/comments', ContentController.getPostCommentsBySlug);
router.get('/posts/slug/:slug', ContentController.getPostBySlug);
router.get('/posts/:id', ContentController.getPostById);
router.get('/:id', ContentController.getById);
router.post('/', authenticate, uploadPostImages, handleUploadError, canCreateVideo, ContentController.create);
router.put('/:id', authenticate, canEditPost, ContentController.update);
router.delete('/:id', authenticate, canEditPost, ContentController.delete);

// Admin routes
router.delete('/admin/articles/:id', authenticate, requireAdmin, ContentController.adminDeleteArticle);

module.exports = router;