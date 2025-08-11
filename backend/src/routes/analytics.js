/**
 * Analytics Routes
 * Handles analytics tracking and reporting endpoints
 */

const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');

// Analytics tracking
router.post('/track', AnalyticsController.track);

// Analytics reporting
router.get('/dashboard', AnalyticsController.getDashboard);
router.get('/realtime', AnalyticsController.getRealtime);
router.get('/content/:id', AnalyticsController.getContentMetrics);
router.get('/post/:id/detailed', AnalyticsController.getPostDetailedAnalytics);

module.exports = router;