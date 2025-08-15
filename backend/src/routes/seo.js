const express = require('express');
const router = express.Router();
const seoController = require('../controllers/seoController');
const { authenticate, requireRole } = require('../middleware/auth');

// Public SEO routes
router.get('/sitemap.xml', seoController.generateSitemap);
router.get('/robots.txt', seoController.generateRobotsTxt);

// Admin SEO analytics (requires authentication)
router.get('/analytics', authenticate, requireRole(['admin']), seoController.getSEOAnalytics);

module.exports = router;

