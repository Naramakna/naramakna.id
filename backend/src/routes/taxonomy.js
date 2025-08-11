const express = require('express');
const router = express.Router();
const taxonomyController = require('../controllers/taxonomyController');
const { authenticate } = require('../middleware/auth');

// Public routes
// Get all terms for a specific taxonomy
router.get('/terms/:taxonomy', taxonomyController.getTermsByTaxonomy);

// Get posts by term/category
router.get('/:taxonomy/:slug/posts', taxonomyController.getPostsByTerm);

// Get navigation categories (priority + additional)
router.get('/navigation', taxonomyController.getNavigationCategories);

// Protected routes
// Add terms from post fields (topic, keyword, channel)
router.post('/posts/:postId/terms', authenticate, taxonomyController.addTermsFromPost);

module.exports = router;
