const express = require('express');
const router = express.Router();
const SchedulerController = require('../controllers/schedulerController');
const { authenticate: auth, requireAdmin } = require('../middleware/auth');
const cacheService = require('../services/cacheService');
const { STATUS_KEY, describeStatus } = require('../services/schedulerStatus');

router.get('/status', auth, requireAdmin, async (req, res) => {
  if (!cacheService.isConnected) {
    return res.status(503).json({ success: false, message: 'Monitoring scheduler tidak dapat terhubung ke Redis.' });
  }
  try {
    const raw = await cacheService.client.get(STATUS_KEY);
    res.json({ success: true, data: describeStatus(raw ? JSON.parse(raw) : null) });
  } catch (error) {
    res.status(503).json({ success: false, message: 'Status scheduler tidak dapat dibaca.' });
  }
});

// requireAdmin is imported from auth middleware

// Get all scheduled posts
router.get('/scheduled', auth, requireAdmin, SchedulerController.getScheduledPosts);

// Get posts that can be scheduled
router.get('/schedulable', auth, requireAdmin, SchedulerController.getSchedulablePosts);

// Schedule a post
router.post('/schedule/:postId', auth, requireAdmin, SchedulerController.schedulePost);

// Reschedule a post
router.put('/reschedule/:postId', auth, requireAdmin, SchedulerController.reschedulePost);

// Cancel scheduled post
router.delete('/cancel/:postId', auth, requireAdmin, SchedulerController.cancelSchedule);

// Get schedule history for a post
router.get('/history/:postId', auth, requireAdmin, SchedulerController.getScheduleHistory);

// Manually trigger publishing of scheduled posts (for testing)
router.post('/publish-now', auth, requireAdmin, SchedulerController.publishScheduledPosts);

// Force publish a specific post immediately
router.post('/force-publish/:postId', auth, requireAdmin, SchedulerController.forcePublishPost);

module.exports = router;
