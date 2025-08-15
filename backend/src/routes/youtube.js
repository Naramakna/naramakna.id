const express = require('express');
const router = express.Router();
const youtubeController = require('../controllers/youtubeController');
const { authenticate, requireRole } = require('../middleware/auth');

// Public routes
router.get('/test', youtubeController.test);
router.get('/test-api', youtubeController.testYouTubeAPI);
router.get('/callback', youtubeController.handleCallback);
router.get('/auth-url', youtubeController.getAuthUrl);

// Public videos (no auth required)
router.get('/public', youtubeController.getPublicVideos);

// Authenticated routes
router.use(authenticate);

// Connection management
router.get('/status', youtubeController.getConnectionStatus);
router.post('/disconnect', youtubeController.disconnect);

// Video operations (require admin or writer role)
router.post('/upload', requireRole(['admin', 'writer']), youtubeController.uploadVideo);
router.post('/sync', requireRole(['admin', 'writer']), youtubeController.syncVideos);

// Video management (admin only)
router.get('/videos', requireRole(['admin']), youtubeController.getVideos);
router.get('/analytics', requireRole(['admin']), youtubeController.getAnalytics);

// Video view tracking
router.post('/videos/:videoId/view', youtubeController.trackView);

module.exports = router;