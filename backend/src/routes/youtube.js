const express = require('express');
const router = express.Router();
const youtubeController = require('../controllers/youtubeController');
const { authenticate, requireRole } = require('../middleware/auth');

// Public routes
router.get('/callback', youtubeController.handleCallback);
router.get('/auth-url', youtubeController.getAuthUrl);
router.get('/status', youtubeController.getConnectionStatus);
router.post('/disconnect', youtubeController.disconnect);
router.post('/upload', youtubeController.uploadVideo);
router.post('/sync', youtubeController.syncVideos);
router.get('/videos', youtubeController.getVideos);
router.get('/analytics', youtubeController.getAnalytics);

// Public videos (no auth required)
router.get('/public', youtubeController.getPublicVideos);

// Authenticated routes (if any future endpoints need strict auth)
router.use(authenticate);

// Video view tracking
router.post('/videos/:videoId/view', youtubeController.trackView);

module.exports = router;