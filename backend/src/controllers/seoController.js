const sequelize = require('../config/database');

class SEOController {
  // Generate XML sitemap
  async generateSitemap(req, res) {
    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      
      // Get all published articles
      const articlesQuery = `
        SELECT 
          ID, 
          post_title, 
          post_name, 
          post_date, 
          post_modified,
          post_status
        FROM posts 
        WHERE post_status = 'publish' 
        AND post_type = 'post'
        ORDER BY post_modified DESC
      `;
      
      const articles = await sequelize.query(articlesQuery, { 
        type: sequelize.QueryTypes.SELECT 
      });
      
      // Get all categories (simplified for now)
      const categories = [
        { category_name: 'News' },
        { category_name: 'Politics' },
        { category_name: 'Sports' },
        { category_name: 'Technology' },
        { category_name: 'Entertainment' }
      ];
      
      // Build XML sitemap
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

      // Add category pages
      for (const category of categories) {
        const categorySlug = category.category_name.toLowerCase().replace(/\s+/g, '-');
        sitemap += `  <url>
    <loc>${baseUrl}/category/${categorySlug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }

      // Add article pages
      for (const article of articles) {
        const articleUrl = article.post_name 
          ? `${baseUrl}/article/${article.post_name}`
          : `${baseUrl}/article/${article.ID}`;
        
        const lastmod = new Date(article.post_modified).toISOString().split('T')[0];
        
        sitemap += `  <url>
    <loc>${articleUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }

      sitemap += `</urlset>`;

      res.set('Content-Type', 'application/xml');
      res.send(sitemap);
      
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to generate sitemap',
        details: error.message 
      });
    }
  }

  // Generate robots.txt
  async generateRobotsTxt(req, res) {
    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      
      const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin areas
Disallow: /admin/
Disallow: /login/
Disallow: /register/

# Allow important pages
Allow: /article/
Allow: /category/
Allow: /

# Crawl delay
Crawl-delay: 1
`;

      res.set('Content-Type', 'text/plain');
      res.send(robotsTxt);
      
    } catch (error) {
      console.error('Error generating robots.txt:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to generate robots.txt' 
      });
    }
  }

  // Get SEO analytics
  async getSEOAnalytics(req, res) {
    try {
      // Get total articles
      const totalArticlesResult = await sequelize.query(
        'SELECT COUNT(*) as total FROM posts WHERE post_status = "publish"',
        { type: sequelize.QueryTypes.SELECT }
      );
      const totalArticles = totalArticlesResult[0].total;

      // Get articles without meta description (content length < 160)
      const noMetaResult = await sequelize.query(`
        SELECT COUNT(*) as total 
        FROM posts 
        WHERE post_status = "publish" 
        AND (post_excerpt IS NULL OR post_excerpt = "" OR LENGTH(post_excerpt) < 120)
      `, { type: sequelize.QueryTypes.SELECT });
      const articlesWithoutMeta = noMetaResult[0].total;

      // Get articles without featured images
      const noImageResult = await sequelize.query(`
        SELECT COUNT(*) as total 
        FROM posts 
        WHERE post_status = "publish" 
        AND (featured_image IS NULL OR featured_image = "")
      `, { type: sequelize.QueryTypes.SELECT });
      const articlesWithoutImages = noImageResult[0].total;

      // Get top performing articles by views
      const topArticlesResult = await sequelize.query(`
        SELECT 
          p.ID,
          p.post_title,
          p.post_name,
          COALESCE(p.view_count, 0) as views
        FROM posts p
        WHERE p.post_status = "publish"
        ORDER BY views DESC
        LIMIT 10
      `, { type: sequelize.QueryTypes.SELECT });

      // Get recent articles
      const recentArticlesResult = await sequelize.query(`
        SELECT 
          ID,
          post_title,
          post_name,
          post_date,
          LENGTH(post_content) as content_length,
          CASE 
            WHEN post_excerpt IS NOT NULL AND post_excerpt != "" AND LENGTH(post_excerpt) >= 120 THEN 'good'
            ELSE 'needs_improvement'
          END as meta_status,
          CASE 
            WHEN featured_image IS NOT NULL AND featured_image != "" THEN 'good'
            ELSE 'needs_improvement'
          END as image_status
        FROM posts 
        WHERE post_status = "publish"
        ORDER BY post_date DESC
        LIMIT 20
      `, { type: sequelize.QueryTypes.SELECT });

      const analytics = {
        overview: {
          totalArticles,
          articlesWithoutMeta,
          articlesWithoutImages,
          seoScore: Math.round(
            ((totalArticles - articlesWithoutMeta - articlesWithoutImages) / totalArticles) * 100
          )
        },
        topPerforming: topArticlesResult,
        recentArticles: recentArticlesResult,
        recommendations: []
      };

      // Add recommendations
      if (articlesWithoutMeta > 0) {
        analytics.recommendations.push({
          type: 'meta_description',
          count: articlesWithoutMeta,
          message: `${articlesWithoutMeta} articles need meta descriptions`
        });
      }

      if (articlesWithoutImages > 0) {
        analytics.recommendations.push({
          type: 'featured_image',
          count: articlesWithoutImages,
          message: `${articlesWithoutImages} articles need featured images`
        });
      }

      res.json({ success: true, data: analytics });

    } catch (error) {
      console.error('Error getting SEO analytics:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get SEO analytics' 
      });
    }
  }
}

module.exports = new SEOController();