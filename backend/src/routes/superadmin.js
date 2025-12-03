const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticate, requireSuperAdmin } = require('../middleware/auth');

// All superadmin routes require authentication + superadmin privileges
router.use(authenticate);
router.use(requireSuperAdmin);

// SuperAdmin specific endpoints
router.post('/demote-admin/:userId', AdminController.demoteAdmin);

module.exports = router;