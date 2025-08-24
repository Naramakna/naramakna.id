const express = require('express');
const router = express.Router();
const trendingController = require('../controllers/trendingController');

// Public routes
router.get('/topics', trendingController.getTrendingTopics);
router.get('/articles', trendingController.getTrendingArticles);

// Internal routes (for cronjob)
router.post('/update', trendingController.updateTrendingTopics);

module.exports = router;