const express = require('express');
const router = express.Router();
const ExportController = require('../controllers/exportController');
const { authenticate: auth, requireAdmin } = require('../middleware/auth');

// All export endpoints require admin access for security
// GET /api/export/info - Get export information
router.get('/info', auth, requireAdmin, ExportController.getExportInfo);

// GET /api/export/posts - Export posts table to CSV
router.get('/posts', auth, requireAdmin, ExportController.exportPosts);

// GET /api/export/terms - Export terms table to CSV
router.get('/terms', auth, requireAdmin, ExportController.exportTerms);

// GET /api/export/post-terms - Export post-term relationships to CSV
router.get('/post-terms', auth, requireAdmin, ExportController.exportPostTerms);

module.exports = router;
