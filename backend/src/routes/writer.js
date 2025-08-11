const express = require('express');
const router = express.Router();
const WriterController = require('../controllers/writerController');
const { authenticate, requireWriter, canPost } = require('../middleware/auth');
const { uploadPostImages, handleUploadError } = require('../middleware/upload');

// Article management routes
router.post('/articles', authenticate, requireWriter, canPost, uploadPostImages, handleUploadError, WriterController.createArticle);
router.put('/articles/:id', authenticate, requireWriter, canPost, uploadPostImages, handleUploadError, WriterController.updateArticle);
router.get('/articles', authenticate, requireWriter, WriterController.getMyArticles);
router.get('/articles/:id', authenticate, requireWriter, WriterController.getArticle);
router.delete('/articles/:id', authenticate, requireWriter, canPost, WriterController.deleteArticle);

// Auto-save endpoint
router.post('/articles/:id/autosave', authenticate, requireWriter, canPost, WriterController.autoSaveArticle);

// Submit for review endpoint
router.post('/articles/:id/submit', authenticate, requireWriter, canPost, WriterController.submitForReview);

// Image upload endpoint
router.post('/upload-image', authenticate, requireWriter, canPost, uploadPostImages, handleUploadError, WriterController.uploadImage);

module.exports = router;
