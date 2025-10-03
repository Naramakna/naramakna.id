const express = require('express');
const router = express.Router();
const MataElangController = require('../controllers/mataElangController');
const { authenticate, requireAdmin, requireSuperAdmin, requirePartnerFotografi } = require('../middleware/auth');
const { uploadPostImages, handleUploadError } = require('../middleware/upload');

// Public routes
router.get('/', MataElangController.getGalleries);
router.get('/featured', MataElangController.getFeaturedGalleries);
router.get('/download-photo/:photoId', MataElangController.downloadPhotoWithWatermark);

// Partner Fotografi routes - MUST be before /:slug route
router.get('/my-galleries', authenticate, requirePartnerFotografi, MataElangController.getMyGalleries);
router.get('/partner/galleries/:id', authenticate, requirePartnerFotografi, MataElangController.getGalleryById);
router.post('/partner/galleries', authenticate, requirePartnerFotografi, MataElangController.createGallery);
router.put('/partner/galleries/:id', authenticate, requirePartnerFotografi, MataElangController.updateGallery);
router.delete('/partner/galleries/:id', authenticate, requirePartnerFotografi, MataElangController.deleteGallery);
router.post('/partner/galleries/:id/submit-for-approval', authenticate, requirePartnerFotografi, MataElangController.submitForApproval);
router.post('/partner/galleries/:galleryId/photos', authenticate, requirePartnerFotografi, MataElangController.addPhoto);
router.put('/partner/photos/:photoId', authenticate, requirePartnerFotografi, MataElangController.updatePhoto);
router.delete('/partner/photos/:photoId', authenticate, requirePartnerFotografi, MataElangController.deletePhoto);
router.post('/partner/upload-image', authenticate, requirePartnerFotografi, uploadPostImages, handleUploadError, MataElangController.uploadImage);

// Dynamic slug route - MUST be last among public routes
router.get('/:slug', MataElangController.getGallery);

// Admin routes
router.get('/admin/galleries', authenticate, requireAdmin, MataElangController.getAdminGalleries);
router.get('/admin/galleries/:id', authenticate, requireAdmin, MataElangController.getGalleryById);
router.post('/admin/galleries', authenticate, requireAdmin, MataElangController.createGallery);
router.put('/admin/galleries/:id', authenticate, requireAdmin, MataElangController.updateGallery);
router.delete('/admin/galleries/:id', authenticate, requireSuperAdmin, MataElangController.deleteGallery);
router.post('/admin/galleries/:id/approve', authenticate, requireAdmin, MataElangController.approveGallery);
router.post('/admin/galleries/:id/reject', authenticate, requireAdmin, MataElangController.rejectGallery);

// Photo management routes
router.post('/admin/galleries/:galleryId/photos', authenticate, requireAdmin, MataElangController.addPhoto);
router.put('/admin/photos/:photoId', authenticate, requireAdmin, MataElangController.updatePhoto);
router.delete('/admin/photos/:photoId', authenticate, requireAdmin, MataElangController.deletePhoto);

// Image upload route
router.post('/admin/upload-image', authenticate, requireAdmin, uploadPostImages, handleUploadError, MataElangController.uploadImage);

module.exports = router;