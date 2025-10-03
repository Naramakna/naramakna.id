const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticate, requireSuperAdmin } = require('../middleware/auth');

// Public settings (no authentication required)
router.get('/public', AdminController.getPublicSettings);

// Toggle views count display (SuperAdmin only)
router.post('/toggle-views-count', authenticate, requireSuperAdmin, AdminController.toggleViewsCount);

module.exports = router;