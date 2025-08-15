/**
 * Advertisement Routes
 * Handles advertisement management and serving endpoints
 */

const express = require('express');
const router = express.Router();
const AdsController = require('../controllers/adsController');
const { authenticate, canManageAds } = require('../middleware/auth');

// Advertisement serving (public)
router.get('/serve', AdsController.serve);
router.get('/popup-active', AdsController.getActivePopupAd);
router.post('/:id/click', AdsController.trackClick);

// Image upload endpoint (requires auth)
router.post('/upload', authenticate, canManageAds, AdsController.uploadImage);

// Advertisement management (superadmin only)
router.get('/stats', authenticate, canManageAds, AdsController.getStats);
router.get('/', authenticate, canManageAds, AdsController.getAll);
router.get('/:id', authenticate, canManageAds, AdsController.getById);
router.post('/', authenticate, canManageAds, AdsController.create);
router.put('/:id', authenticate, canManageAds, AdsController.update);
router.patch('/:id/status', authenticate, canManageAds, AdsController.updateStatus);
router.delete('/:id', authenticate, canManageAds, AdsController.delete);

module.exports = router;