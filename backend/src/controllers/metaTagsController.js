/**
 * Meta Tags Controller
 * Handles HTML generation with Open Graph meta tags for social media sharing
 */

const { Post, PostMeta, User } = require('../models');
const ContentController = require('./contentController');
const path = require('path');
const fs = require('fs');

class MetaTagsController {
  
  /**
   * Generate HTML with Open Graph meta tags for articles
   * GET /artikel/:slug
   */
  static async generateArticleHTML(req, res) {
    try {
      const { slug } = req.params;
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      // Fetch article data
      const post = await Post.findOne({
        where: { 
          post_name: slug,
          post_type: 'post',
          post_status: 'publish',
          deleted_at: null,
        },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['ID', 'display_name', 'user_login']
          },
          {
            model: PostMeta,
            as: 'meta',
            required: false
          }
        ]
      });

      if (!post) {
        // If article not found, serve the default HTML
        return MetaTagsController.serveDefaultHTML(res);
      }

      // Extract metadata from post meta
      const metadata = {};
      if (post.meta) {
        const latestMap = {};
        post.meta.forEach(m => {
          const k = m.meta_key;
          const id = m.meta_id || 0;
          if (!(k in latestMap) || id > latestMap[k]) {
            latestMap[k] = id;
            metadata[k] = m.meta_value;
          }
        });
      }
      
      // Get featured image URL from thumbnail_id, fallback to first inline image
      let featuredImageUrl = 'https://naramakna.id/LogoNaramakna.png'; // default fallback
      let imageType = 'image/png'; // default for logo
      
      if (metadata._thumbnail_id) {
        try {
          const thumbnailPost = await Post.findOne({
            where: { ID: metadata._thumbnail_id },
            attributes: ['ID', 'post_title', 'guid']
          });
          
          if (thumbnailPost && thumbnailPost.guid) {
            // Ensure URL uses HTTPS protocol for social media compatibility
            featuredImageUrl = thumbnailPost.guid.replace(/^http:\/\//, 'https://');
            
            // Detect image type from URL extension
            const urlLower = featuredImageUrl.toLowerCase();
            if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) {
              imageType = 'image/jpeg';
            } else if (urlLower.includes('.png')) {
              imageType = 'image/png';
            } else if (urlLower.includes('.gif')) {
              imageType = 'image/gif';
            } else if (urlLower.includes('.webp')) {
              imageType = 'image/webp';
            } else {
              imageType = 'image/jpeg'; // fallback
            }
          }
        } catch (error) {
          console.log('Error fetching thumbnail:', error.message);
        }
      }

      // Fallback: extract first image from post content if no thumbnail
      if (!featuredImageUrl || featuredImageUrl.includes('LogoNaramakna.png')) {
        const content = post.post_content || '';
        const match = content.match(/<img[^>]+src=['"]([^'\"]+)['"]/i);
        if (match && match[1]) {
          let src = match[1];
          // Ensure absolute URL
          if (!src.startsWith('http')) {
            if (src.startsWith('/')) {
              src = `${baseUrl}${src}`;
            } else if (src.startsWith('uploads') || src.startsWith('/uploads')) {
              src = `${baseUrl}/${src.replace(/^\//, '')}`;
            } else {
              src = `${baseUrl}/${src}`;
            }
          }
          featuredImageUrl = src.replace(/^http:\/\//, 'https://');
          const urlLower = featuredImageUrl.toLowerCase();
          if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) {
            imageType = 'image/jpeg';
          } else if (urlLower.includes('.png')) {
            imageType = 'image/png';
          } else if (urlLower.includes('.gif')) {
            imageType = 'image/gif';
          } else if (urlLower.includes('.webp')) {
            imageType = 'image/webp';
          } else {
            imageType = 'image/jpeg';
          }
        }
      }

      // Extract meta data
      const excerpt = metadata.excerpt;
      const seoDescription = metadata._aioseo_description;
      
      // Prepare meta data
      const title = `${post.post_title} - Naramakna`;
      const description = seoDescription || excerpt || post.post_excerpt || post.post_content?.substring(0, 160) + '...' || 'Artikel terbaru dari Naramakna.id';
      const articleUrl = `${baseUrl}/artikel/${slug}`;
      const authorName = post.author?.display_name || 'Naramakna';
      const publishedTime = post.post_date;
      const modifiedTime = post.post_modified;

      // Read the base HTML template
      const htmlTemplate = MetaTagsController.getHTMLTemplate();
      
      // Replace placeholders with actual data
      const html = htmlTemplate
        .replace(/{{TITLE}}/g, title)
        .replace(/{{DESCRIPTION}}/g, description)
        .replace(/{{IMAGE_URL}}/g, featuredImageUrl)
        .replace(/{{IMAGE_TYPE}}/g, imageType)
        .replace(/{{ARTICLE_URL}}/g, articleUrl)
        .replace(/{{AUTHOR_NAME}}/g, authorName)
        .replace(/{{PUBLISHED_TIME}}/g, publishedTime)
        .replace(/{{MODIFIED_TIME}}/g, modifiedTime)
        .replace(/{{SLUG}}/g, slug);

      res.setHeader('Content-Type', 'text/html');
      res.send(html);

    } catch (error) {
      console.error('Error generating article HTML:', error);
      if (!res.headersSent) {
        MetaTagsController.serveDefaultHTML(res);
      }
    }
  }

  /**
   * Serve default HTML when article not found or error occurs
   */
  static serveDefaultHTML(res) {
    // Check if headers are already sent
    if (res.headersSent) {
      console.warn('Cannot serve default HTML - headers already sent');
      return;
    }

    try {
      const frontendIndexPath = path.join(__dirname, '../../../frontend/index.html');

      if (fs.existsSync(frontendIndexPath)) {
        const html = fs.readFileSync(frontendIndexPath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
      } else {
        // Fallback HTML
        const fallbackHTML = `
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="https://api.naramakna.id/uploads/2025/07/cropped-IKON-LOGO-180x180.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Naramakna - Cerdas Memaknai</title>
    <meta name="description" content="Naramakna.id - Platform media digital yang menghadirkan informasi berkualitas dan perspektif mendalam untuk membantu Anda cerdas dalam memaknai berbagai peristiwa dan isu terkini." />
</head>
<body>
<div id="root"></div>
<script>window.location.href = '/';</script>
</body>
</html>`;
        res.setHeader('Content-Type', 'text/html');
        res.send(fallbackHTML);
      }
    } catch (error) {
      console.error('Error serving default HTML:', error);
      if (!res.headersSent) {
        res.status(500).send('Internal Server Error');
      }
    }
  }

  /**
   * Get dynamic asset files from dist directory
   */
  static getAssetFiles() {
    try {
      const assetsPath = path.join(__dirname, '../../../frontend/dist/assets');
      const files = fs.readdirSync(assetsPath);

      // Find all index JS files and pick the largest one (main entry point)
      const jsFiles = files.filter(file => file.startsWith('index-') && file.endsWith('.js'));
      let jsFile = null;

      if (jsFiles.length > 0) {
        // If multiple index files, pick the one with largest size (main bundle)
        let largestSize = 0;
        jsFiles.forEach(file => {
          const filePath = path.join(assetsPath, file);
          const stats = fs.statSync(filePath);
          if (stats.size > largestSize) {
            largestSize = stats.size;
            jsFile = file;
          }
        });
      }

      const cssFile = files.find(file => file.startsWith('index-') && file.endsWith('.css'));

      // Use current timestamp for cache busting
      const timestamp = Date.now();

      return {
        js: jsFile ? `/assets/${jsFile}?v=${timestamp}` : '/assets/index.js',
        css: cssFile ? `/assets/${cssFile}?v=${timestamp}` : '/assets/index.css'
      };
    } catch (error) {
      console.error('Error reading asset files:', error);
      // Fallback to default paths
      return {
        js: '/assets/index.js',
        css: '/assets/index.css'
      };
    }
  }

  /**
   * Get HTML template with Open Graph meta tags
   */
  static getHTMLTemplate() {
    const assets = MetaTagsController.getAssetFiles();
    
    return `<!doctype html>
<html lang="id">
<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="https://api.naramakna.id/uploads/2025/07/cropped-IKON-LOGO-180x180.png" />
    <link rel="shortcut icon" href="https://api.naramakna.id/uploads/favico/favicon.ico" />
    <link rel="apple-touch-icon" href="https://api.naramakna.id/uploads/2025/07/cropped-IKON-LOGO-180x180.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Basic Meta Tags -->
    <title>{{TITLE}}</title>
    <meta name="description" content="{{DESCRIPTION}}" />
    <meta name="keywords" content="naramakna, cerdas memaknai, media digital, berita, artikel" />
    <meta name="author" content="{{AUTHOR_NAME}}" />
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="{{TITLE}}" />
    <meta property="og:description" content="{{DESCRIPTION}}" />
    <meta property="og:image" content="{{IMAGE_URL}}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="{{IMAGE_TYPE}}" />
    <meta property="og:image:alt" content="{{TITLE}}" />
    <meta property="og:image:secure_url" content="{{IMAGE_URL}}" />
    <meta property="og:url" content="{{ARTICLE_URL}}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Naramakna" />
    <meta property="og:locale" content="id_ID" />
    
    <!-- Article specific Open Graph -->
    <meta property="article:author" content="{{AUTHOR_NAME}}" />
    <meta property="article:published_time" content="{{PUBLISHED_TIME}}" />
    <meta property="article:modified_time" content="{{MODIFIED_TIME}}" />
    <meta property="article:section" content="Berita" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{{TITLE}}" />
    <meta name="twitter:description" content="{{DESCRIPTION}}" />
    <meta name="twitter:image" content="{{IMAGE_URL}}" />
    <meta name="twitter:site" content="@naramakna" />
    
    <!-- Additional SEO Meta Tags -->
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="{{ARTICLE_URL}}" />

    <!-- Structured Data (JSON-LD) for Google News -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": "{{TITLE}}",
      "description": "{{DESCRIPTION}}",
      "image": ["{{IMAGE_URL}}"],
      "author": {
        "@type": "Person",
        "name": "{{AUTHOR_NAME}}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Naramakna",
        "logo": {
          "@type": "ImageObject",
          "url": "https://naramakna.id/LogoNaramakna.png"
        }
      },
      "datePublished": "{{PUBLISHED_TIME}}",
      "dateModified": "{{MODIFIED_TIME}}",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "{{ARTICLE_URL}}"
      },
      "articleSection": "Berita"
    }
    </script>

    <!-- Google Reader Revenue Manager -->
    <script async type="application/javascript"
            src="https://news.google.com/swg/js/v1/swg-basic.js"></script>
    <script>
      (self.SWG_BASIC = self.SWG_BASIC || []).push( basicSubscriptions => {
        basicSubscriptions.init({
          type: "NewsArticle",
          isPartOfType: ["Product"],
          isPartOfProductId: "CAowofy8DA:openaccess",
          clientOptions: { theme: "light", lang: "id" },
        });
      });
    </script>

    <!-- Preload critical resources -->
    <link rel="preconnect" href="https://api.naramakna.id">
    <link rel="dns-prefetch" href="https://api.naramakna.id">
    
    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-40CJJY40JM"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-40CJJY40JM');
    </script>
    
    <!-- Accessibility Widget -->
    <script src="https://website-widgets.pages.dev/dist/sienna.min.js" defer></script>
    
    <!-- Production built assets -->
    <script type="module" crossorigin src="${assets.js}"></script>
    <link rel="stylesheet" crossorigin href="${assets.css}">
</head>
<body>
<h1 style="position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden;">{{TITLE}}</h1>
<div id="root"></div>
</body>
</html>`;
  }
}

module.exports = MetaTagsController;
