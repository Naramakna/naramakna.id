const express = require('express');
const router = express.Router();
const termsController = require('../controllers/termsController');

router.get('/categories', termsController.getCategories);

module.exports = router;
