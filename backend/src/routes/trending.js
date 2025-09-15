const express = require('express');
const router = express.Router();
const trendingController = require('../controllers/trendingController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Public routes
router.get('/topics', trendingController.getTrendingTopics);
router.get('/articles', trendingController.getTrendingArticles);

// Internal routes (for cronjob)
router.post('/update', trendingController.updateTrendingTopics);

// Admin routes (for manual update)
router.post('/admin/update', requireAuth, requireRole(['superadmin']), trendingController.updateTrendingTopics);

module.exports = router;