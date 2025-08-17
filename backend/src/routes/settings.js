const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');

// Public settings (no authentication required)
router.get('/public', AdminController.getPublicSettings);

module.exports = router;