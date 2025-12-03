const express = require('express');
const router = express.Router();
const { generateSitemap, generateRSSFeed } = require('../controllers/sitemapController');

// Generate XML sitemap
router.get('/sitemap.xml', generateSitemap);

// Generate RSS feed
router.get('/sitemap.rss', generateRSSFeed);

// Priority sitemap for specific articles
router.get('/sitemap-priority.xml', (req, res) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://naramakna.id/artikel/industri-dirgantara-indonesia-mencoba-bangkit</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://naramakna.id/artikel/generasi-mager-kenapa-anak-muda-lebih-suka-top-up-online</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  
  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

// Alternative RSS endpoints
router.get('/rss', generateRSSFeed);
router.get('/feed', generateRSSFeed);

module.exports = router;