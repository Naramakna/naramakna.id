const express = require('express');
const router = express.Router();
const ImageManagerController = require('../controllers/imageManagerController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

/**
 * @route   GET /api/image-manager/analysis
 * @desc    Analyze image URLs in database (dry-run)
 * @access  Admin/SuperAdmin
 */
router.get('/analysis', ImageManagerController.analyzeImageUrls);

/**
 * @route   POST /api/image-manager/update
 * @desc    Update image URLs based on selected tables and patterns
 * @access  Admin/SuperAdmin
 * @body    { tables: ['posts', 'postmeta', 'users'], patterns: [...], newUrl: '...' }
 */
router.post('/update', ImageManagerController.updateImageUrls);

/**
 * @route   GET /api/image-manager/stats
 * @desc    Get statistics about image URLs in database
 * @access  Admin/SuperAdmin
 */
router.get('/stats', ImageManagerController.getImageStats);

module.exports = router;