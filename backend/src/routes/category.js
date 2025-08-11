const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Public routes
// Get popular tags for article writing
router.get('/popular-tags', categoryController.getPopularTags);

// Get navigation categories (priority + additional)
router.get('/navigation', categoryController.getNavigationCategories);

// Get posts by category slug
router.get('/:slug/posts', categoryController.getPostsByCategory);

module.exports = router;
