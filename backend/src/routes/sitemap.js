const express = require('express');
const router = express.Router();
const { generateSitemap, generateRSSFeed } = require('../controllers/sitemapController');

// Generate XML sitemap
router.get('/sitemap.xml', generateSitemap);

// Generate RSS feed
router.get('/sitemap.rss', generateRSSFeed);

// Alternative RSS endpoints
router.get('/rss', generateRSSFeed);
router.get('/feed', generateRSSFeed);

module.exports = router;