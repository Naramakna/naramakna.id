const { Post, User, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

// Generate XML sitemap
const generateSitemap = async (req, res) => {
  try {
    console.log('🗺️ Generating sitemap.xml...');
    const baseUrl = process.env.FRONTEND_URL || 'https://naramakna.id';
    
    // Get all published posts using Sequelize model
    const posts = await Post.findAll({
      where: {
        post_status: 'publish',
        post_type: 'post'
      },
      attributes: ['ID', 'post_name', 'post_modified', 'post_date'],
      order: [['post_modified', 'DESC']],
      limit: 1000
    });

    console.log(`📄 Found ${posts.length} posts for sitemap`);

    // Get categories - simplified approach
    let categories = [];
    try {
      categories = await sequelize.query(`
        SELECT
          t.slug,
          t.name
        FROM terms t
        INNER JOIN term_taxonomy tt ON t.term_id = tt.term_id
        WHERE tt.taxonomy = 'category'
        ORDER BY t.name
        LIMIT 50
      `, { type: QueryTypes.SELECT });
      
      console.log(`🏷️ Found ${categories.length} categories for sitemap`);
    } catch (catError) {
      console.warn('⚠️ Category query failed, skipping categories in sitemap:', catError.message);
      categories = [];
    }

    // Start building sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

    // Add homepage
    sitemap += `  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

    // Add static pages
    const staticPages = [
      { path: '/tulis', changefreq: 'weekly', priority: '0.8' },
      { path: '/partnership', changefreq: 'monthly', priority: '0.6' },
      { path: '/help', changefreq: 'monthly', priority: '0.5' }
    ];

    staticPages.forEach(page => {
      sitemap += `  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

    // Add categories
    categories.forEach(category => {
      const lastMod = category.last_modified ? 
        new Date(category.last_modified).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0];
      
      sitemap += `  <url>
    <loc>${baseUrl}/kategori/${category.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    // Add posts
    posts.forEach(post => {
      const lastMod = new Date(post.post_modified).toISOString().split('T')[0];
      const publishDate = new Date(post.post_date);
      const isRecent = (Date.now() - publishDate.getTime()) < (7 * 24 * 60 * 60 * 1000); // 7 days
      
      sitemap += `  <url>
    <loc>${baseUrl}/artikel/${post.post_name}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${isRecent ? 'daily' : 'weekly'}</changefreq>
    <priority>${isRecent ? '0.9' : '0.7'}</priority>`;
      
      // Add Google News tags for recent articles
      if (isRecent) {
        sitemap += `
    <news:news>
      <news:publication>
        <news:name>Naramakna</news:name>
        <news:language>id</news:language>
      </news:publication>
      <news:publication_date>${publishDate.toISOString()}</news:publication_date>
      <news:title>${post.post_name.replace(/-/g, ' ')}</news:title>
    </news:news>`;
      }
      
      sitemap += `
  </url>
`;
    });

    sitemap += `</urlset>`;

    // Set proper headers
    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Last-Modified': new Date().toUTCString()
    });

    res.send(sitemap);

  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating sitemap'
    });
  }
};

// Generate RSS feed
const generateRSSFeed = async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://naramakna.id';
    
    // Get latest 50 published posts using Sequelize
    const posts = await Post.findAll({
      where: {
        post_status: 'publish',
        post_type: 'post'
      },
      include: [{
        model: User,
        as: 'author',
        attributes: ['display_name'],
        required: false
      }],
      attributes: [
        'ID', 'post_title', 'post_name', 'post_content', 
        'post_excerpt', 'post_date', 'post_modified'
      ],
      order: [['post_date', 'DESC']],
      limit: 50
    });

    // Helper function to clean HTML and create excerpt
    const createExcerpt = (content, excerpt) => {
      if (excerpt && excerpt.trim()) {
        return excerpt.trim();
      }
      
      // Remove HTML tags and get first 200 characters
      const cleanContent = content
        .replace(/<[^>]*>/g, '')
        .replace(/&[a-zA-Z0-9#]+;/g, '')
        .trim();
      
      return cleanContent.length > 200 
        ? cleanContent.substring(0, 200) + '...'
        : cleanContent;
    };

    // Start building RSS XML
    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" 
     xmlns:wfw="http://wellformedweb.org/CommentAPI/" 
     xmlns:dc="http://purl.org/dc/elements/1.1/" 
     xmlns:atom="http://www.w3.org/2005/Atom" 
     xmlns:sy="http://purl.org/rss/1.0/modules/syndication/" 
     xmlns:slash="http://purl.org/rss/1.0/modules/slash/">
  <channel>
    <title>Naramakna - Cerdas Memaknai</title>
    <atom:link href="${baseUrl}/sitemap.rss" rel="self" type="application/rss+xml" />
    <link>${baseUrl}</link>
    <description>Platform media digital yang menghadirkan informasi berkualitas dan perspektif mendalam untuk membantu Anda cerdas dalam memaknai berbagai peristiwa dan isu terkini.</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <language>id-ID</language>
    <sy:updatePeriod>hourly</sy:updatePeriod>
    <sy:updateFrequency>1</sy:updateFrequency>
    <generator>Naramakna Custom RSS Generator</generator>
`;

    // Add posts to RSS
    posts.forEach(post => {
      const pubDate = new Date(post.post_date).toUTCString();
      const description = createExcerpt(post.post_content, post.post_excerpt);
      
      // Escape XML special characters
      const escapeXml = (str) => {
        if (!str) return '';
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
      };

      rss += `    <item>
      <title>${escapeXml(post.post_title)}</title>
      <link>${baseUrl}/artikel/${post.post_name}</link>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">${baseUrl}/artikel/${post.post_name}</guid>`;
      
      if (post.author && post.author.display_name) {
        rss += `
      <dc:creator>${escapeXml(post.author.display_name)}</dc:creator>`;
      }
      
      rss += `
    </item>
`;
    });

    rss += `  </channel>
</rss>`;

    // Set proper headers
    res.set({
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
      'Last-Modified': new Date().toUTCString()
    });

    res.send(rss);

  } catch (error) {
    console.error('Error generating RSS feed:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating RSS feed'
    });
  }
};

module.exports = {
  generateSitemap,
  generateRSSFeed
};