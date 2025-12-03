const express = require('express');
const router = express.Router();
const trendingController = require('../controllers/trendingController');
const { requireAuth, requireRole } = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');

// Public routes with cache
router.get('/topics', cacheMiddleware(600), trendingController.getTrendingTopics); // Cache 10 min
router.get('/articles', cacheMiddleware(600), trendingController.getTrendingArticles); // Cache 10 min

// Internal routes (for cronjob)
router.post('/update', trendingController.updateTrendingTopics);

// Admin routes (for manual update)
router.post('/admin/update', requireAuth, requireRole(['superadmin']), trendingController.updateTrendingTopics);

module.exports = router;
