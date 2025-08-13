// backend/src/app.js

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const sequelize = require('./config/database'); // Memuat koneksi database kita
const models = require('./models'); // Load all models
const errorHandler = require('./middleware/errorHandler');
const ipTracker = require('./middleware/ipTracker');

const app = express();

// Trust proxy for proper IP detection (important for production)
app.set('trust proxy', true);

// Middleware dasar - CORS configuration for development and production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      // Development
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      // Production - add your domains here
      'https://naramakna.id',
      'https://www.naramakna.id',
      // Add your Cloudflare tunnel domain when you get it
      // 'https://your-tunnel-domain.cloudflareaccess.com'
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
  optionsSuccessStatus: 204 // For legacy browser support
};

app.use(cors(corsOptions));

// Increase payload limits for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ 
  limit: '50mb', 
  extended: true, 
  parameterLimit: 50000 
}));
app.use(cookieParser());

// Set timeout for all requests (30 seconds)
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    console.log('⏰ Request timeout');
    res.status(408).json({
      success: false,
      message: 'Request timeout'
    });
  });
  next();
});

// IP and Location tracking middleware
app.use(ipTracker);

// Serve static files from project root public directory
app.use(express.static('../public'));

// Serve uploads directory for profile images
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const profileRoutes = require('./routes/profile');
const contentRoutes = require('./routes/content');
const approvalRoutes = require('./routes/approval');
const analyticsRoutes = require('./routes/analytics');
const adsRoutes = require('./routes/ads');
const tiktokRoutes = require('./routes/tiktok');
const writerRoutes = require('./routes/writer');
const commentRoutes = require('./routes/comments');
const adminRoutes = require('./routes/admin');
const categoryRoutes = require('./routes/category');
const pollingRoutes = require('./routes/polling');
// const taxonomyRoutes = require('./routes/taxonomy'); // TODO: Implement

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/approval', approvalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/tiktok', tiktokRoutes);
app.use('/api/writer', writerRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/polling', pollingRoutes);
// app.use('/api/taxonomy', taxonomyRoutes); // TODO: Implement

// Halaman utama API
app.get('/api', (req, res) => {
    res.json({ 
        message: 'Selamat datang di Naramakna API. Mesin menyala!',
        version: '1.0.0',
        endpoints: {
            content: '/api/content',
            analytics: '/api/analytics', 
            ads: '/api/ads'
        },
        features: [
            'Universal Content System (Articles, YouTube, TikTok)',
            'Advanced Analytics Tracking',
            'Advertisement Management',
            'Real-time Metrics',
            'Hybrid Database Architecture'
        ]
    });
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