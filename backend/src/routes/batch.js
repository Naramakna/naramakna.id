const express = require('express');
const router = express.Router();
const BatchController = require('../controllers/batchController');

/**
 * Batch API Endpoint
 * POST /api/batch
 * 
 * Allows batching multiple API requests into one HTTP call
 * This reduces connection overhead and CPU spikes from concurrent requests
 */
router.post('/', BatchController.processBatch);

module.exports = router;
