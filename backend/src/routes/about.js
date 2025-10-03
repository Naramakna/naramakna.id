const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/aboutController');
const { authenticate, requireSuperAdmin } = require('../middleware/auth');
const { uploadPostImages, handleUploadError } = require('../middleware/upload');

// Public route to get about page content
router.get('/', aboutController.getAboutPage);

// Protected route to update about page content (superadmin only)
router.put('/', authenticate, requireSuperAdmin, aboutController.updateAboutPage);

// Protected route to upload images for about page content (superadmin only)
router.post('/upload-image', authenticate, requireSuperAdmin, uploadPostImages, handleUploadError, aboutController.uploadImage);

module.exports = router;