const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const ContentController = require('../controllers/contentController');
const CommentController = require('../controllers/commentController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication + admin privileges
router.use(authenticate);
router.use(requireAdmin);

// User Management
router.get('/users', AdminController.getAllUsers);
router.delete('/users/:id', AdminController.deleteUser);
router.patch('/users/:id/suspend', AdminController.suspendUser);

// Article Management
router.delete('/articles/:id', ContentController.adminDeleteArticle);

// Comment Management  
router.delete('/comments/:id', CommentController.adminDeleteComment);

// Analytics Management
router.get('/analytics/overview', AdminController.getAnalyticsOverview);
router.get('/analytics/posts', AdminController.getPostsForBoost);
router.post('/analytics/boost-views', AdminController.boostViews);
router.post('/analytics/boost-single', AdminController.boostSinglePost);

module.exports = router;