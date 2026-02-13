// backend/src/app.js

// Load environment variables
require('dotenv').config({ path: require('fs').existsSync('/var/www/naramakna.id/backend/.env') ? '/var/www/naramakna.id/backend/.env' : require('path').join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');
const sequelize = require('./config/database'); // Memuat koneksi database kita
const models = require('./models'); // Load all models
const errorHandler = require('./middleware/errorHandler');
const ipTracker = require('./middleware/ipTracker');
const requestDeduplication = require('./middleware/requestDeduplication');

const app = express();

// Trust proxy for proper IP detection (important for production)
app.set('trust proxy', true);

// Middleware dasar - CORS configuration for development and production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, direct navigation)
    // Also allow origin 'null' (some browsers/bots send this as a string)
    if (!origin || origin === 'null') return callback(null, true);
    
    const allowedOrigins = [
      // Development
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      // VPS Testing with subdomain
      'http://dev.naramakna.id:3001',
      'https://dev.naramakna.id:3001',
      'http://app.dev.naramakna.id:5173',
      'https://app.dev.naramakna.id:5173',
      'https://app.dev.naramakna.id',
      // Production - add your domains here
      'https://naramakna.id',
      'https://www.naramakna.id',
      // Cloudflare tunnel domains
      'https://fenarmak.naramakna.id',
      'https://api.naramakna.id',
      'https://ujife.naramakna.id'
    ];

    // If CORS_ORIGIN is set in environment, use it (for production flexibility)
    if (process.env.CORS_ORIGIN) {
      const envOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
      allowedOrigins.push(...envOrigins);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies for authentication
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Explicitly allow PATCH method
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  preflightContinue: false, // Pass control to next handler
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));
// Response Compression (gzip/brotli) - reduces response size by 60-80%
app.use(compression({
  filter: (req, res) => {
    // Compress all responses except already compressed or streaming
    if (req.headers["x-no-compression"]) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Compression level 0-9 (6 is balanced speed/size)
  threshold: 1024 // Only compress responses larger than 1KB
}));

// Payload limits for file uploads (reduced from 50mb to 10mb for memory optimization)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({
  limit: '10mb',
  extended: true,
  parameterLimit: 10000
}));
app.use(cookieParser());

// Set timeout for all requests (60 seconds)
app.use((req, res, next) => {
  res.setTimeout(60000, () => {
    console.log('⏰ Request timeout');
    if (!res.headersSent) {
      res.status(408).json({
        success: false,
        message: 'Request timeout'
      });
    }
  });
  next();
});

// IP and Location tracking middleware
app.use(ipTracker);

app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  const { randomUUID } = require('crypto');
  const request_id = typeof randomUUID === 'function' ? randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  req.request_id = request_id;
  let responseBody;
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  res.json = function (body) {
    responseBody = body;
    return originalJson(body);
  };
  res.send = function (body) {
    responseBody = body;
    return originalSend(body);
  };
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number((end - start) / 1000000n);
    const ip = (req.location && req.location.ip) || req.ip || (req.headers['x-forwarded-for'] || '');
  const logEntry = {
      timestamp: new Date().toISOString(),
      status: res.statusCode < 400 ? 'SUCCESS' : 'ERROR',
      request_id,
      ip,
      method: req.method,
      path: req.originalUrl || req.url,
      query: req.query || {},
      headers: {
        user_agent: req.headers['user-agent'] || '',
        content_type: req.headers['content-type'] || ''
      },
      body: (function maskSensitive(obj) {
        try {
          if (Array.isArray(obj)) return undefined;
          if (!obj || typeof obj !== 'object') return obj;
          const redactKeys = ['password', 'pass', 'authorization', 'token', 'access_token', 'refresh_token'];
          const walk = (input) => {
            if (Array.isArray(input)) return undefined;
            if (input && typeof input === 'object') {
              const out = {};
              for (const k of Object.keys(input)) {
                if (redactKeys.includes(k.toLowerCase())) out[k] = '[REDACTED]';
                else out[k] = walk(input[k]);
              }
              return out;
            }
            return input;
          };
          return walk(obj);
        } catch (e) {
          return {};
        }
      })(req.body),
      response_status: res.statusCode,
      response_time_ms: durationMs,
      response_body: (function sanitizeResponse(body) {
        try {
          if (!body) return {};
          if (typeof body === 'string') {
            try { const parsed = JSON.parse(body); return Array.isArray(parsed) ? undefined : parsed; } catch { return { data: body }; }
          }
          if (Array.isArray(body)) return undefined;
          return (function maskSensitive(obj) {
            try {
              if (Array.isArray(obj)) return undefined;
              if (!obj || typeof obj !== 'object') return obj;
              const redactKeys = ['password', 'pass', 'authorization', 'token', 'access_token', 'refresh_token'];
              const walk = (input) => {
                if (Array.isArray(input)) return undefined;
                if (input && typeof input === 'object') {
                  const out = {};
                  for (const k of Object.keys(input)) {
                    if (redactKeys.includes(k.toLowerCase())) out[k] = '[REDACTED]';
                    else out[k] = walk(input[k]);
                  }
                  return out;
                }
                return input;
              };
              return walk(obj);
            } catch (e) {
              return {};
            }
          })(body);
        } catch (e) {
          return {};
        }
      })(responseBody)
    };
    try {
      console.log(JSON.stringify(logEntry));
    } catch (e) {
      console.log('{}');
    }
  });
  next();
});

// Request Deduplication Middleware (CPU Spike Prevention)
// DISABLED - causing pending request issues when errors occur
// app.use(requestDeduplication(1000)); // 1 second deduplication window

// Serve static files from project root public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve frontend build files (for production and SSR meta tags)
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Serve uploads directory for profile images (from project root public)
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

// Serve ads directory for advertisement images
app.use('/ads', express.static(path.join(__dirname, '../../public/ads')));

// Serve ads.txt file for AdSense verification
app.get('/ads.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.sendFile(path.join(__dirname, '../public/ads.txt'));
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const profileRoutes = require('./routes/profile');
const contentRoutes = require('./routes/content');
const approvalRoutes = require('./routes/approval');
const analyticsRoutes = require('./routes/analytics');
const adsRoutes = require('./routes/ads');
const tiktokRoutes = require('./routes/tiktok');
// const youtubeRoutes = require('./routes/youtube');
const seoRoutes = require('./routes/seo');
const seoController = require('./controllers/seoController');
const metaTagsController = require('./controllers/metaTagsController');
const writerRoutes = require('./routes/writer');
const likesRoutes = require('./routes/likes');
const commentRoutes = require('./routes/comments');
const adminRoutes = require('./routes/admin');
const superadminRoutes = require('./routes/superadmin');
const categoryRoutes = require('./routes/category');
const pollingRoutes = require('./routes/polling');
const schedulerRoutes = require('./routes/scheduler');
const settingsRoutes = require('./routes/settings');
const imageManagerRoutes = require('./routes/imageManager');
const sitemapRoutes = require('./routes/sitemap');
const googleAdsRoutes = require('./routes/googleAds');
const trendingRoutes = require('./routes/trending');
const aboutRoutes = require('./routes/about');
const mataElangRoutes = require('./routes/mataElang');
const batchRoutes = require('./routes/batch');
const termsRoutes = require('./routes/terms');
// const taxonomyRoutes = require('./routes/taxonomy'); // TODO: Implement

// Initialize background jobs (scheduler, TikTok sync)
if (process.env.NODE_ENV !== 'test') {
  // DISABLED - Using BullMQ instead:   require('../cron/scheduler');
  // DISABLED - Using BullMQ instead:   require('../cron/syncTikTok');
}

// Meta tags route for articles (must be before API routes)
app.get('/artikel/:slug', metaTagsController.generateArticleHTML);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/approval', approvalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/google-ads', googleAdsRoutes);
app.use('/api/tiktok', tiktokRoutes);
// app.use('/api/youtube', youtubeRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/trending', trendingRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/mata-elang', mataElangRoutes);
app.use('/api/batch', batchRoutes);
app.use('/api/terms', termsRoutes);

// SEO routes at root level
app.use('/', sitemapRoutes);
app.get('/robots.txt', seoController.generateRobotsTxt);
app.use('/api/writer', writerRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/polling', pollingRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/image-manager', imageManagerRoutes);
// app.use('/api/taxonomy', taxonomyRoutes); // TODO: Implement

// Halaman utama API
app.get('/api', (req, res) => {
    res.json({ 
        message: 'Selamat datang di Naramakna API. Mesin menyala!',
        version: '1.0.0',
        endpoints: {
            content: '/api/content',
            analytics: '/api/analytics', 
            ads: '/api/ads',
            tiktok: '/api/tiktok'
        },
        features: [
            'Universal Content System (Articles, YouTube, TikTok)',
            'Advanced Analytics Tracking',
            'Advertisement Management',
            'Real-time Metrics',
            'Hybrid Database Architecture',
            'TikTok Integration'
        ]
    });
});

// Static pages for TikTok app requirements
app.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/terms.html'));
});

app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/privacy.html'));
});

// Global error handler (must be last)
app.use(errorHandler);

// Test koneksi database saat aplikasi start
sequelize.authenticate()
    .then(() => {
        console.log('✅ Koneksi ke database berhasil.');
    })
    .catch(err => {
        console.warn('⚠️  Database belum tersedia:', err.message);
        console.log('💡 Tip: Install MySQL atau jalankan docker-compose up -d untuk database');
    });

module.exports = app;
