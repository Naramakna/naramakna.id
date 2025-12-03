const express = require('express');
const router = express.Router();
const ContentApprovalController = require('../controllers/contentApprovalController');
const { authenticate, requireAdmin, requireWriter } = require('../middleware/auth');

/**
 * Content Approval Routes
 * For managing the content review and approval workflow
 */

/**
 * @route   GET /api/approval/pending
 * @desc    Get pending posts for review
 * @access  Admin+
 * @query   { page?, limit?, author_id?, post_type? }
 */
router.get('/pending', authenticate, requireAdmin, ContentApprovalController.getPendingPosts);

/**
 * @route   GET /api/approval/stats
 * @desc    Get review queue statistics
 * @access  Admin+
 */
router.get('/stats', authenticate, requireAdmin, ContentApprovalController.getReviewStats);

/**
 * @route   GET /api/approval/my-pending
 * @desc    Get current user's pending posts
 * @access  Writer+ (own posts only)
 */
router.get('/my-pending', authenticate, requireWriter, ContentApprovalController.getMyPendingPosts);

/**
 * @route   POST /api/approval/:id/review
 * @desc    Approve or reject a post
 * @access  Admin+
 * @body    { action: 'approve' | 'reject', feedback? }
 */
router.post('/:id/review', authenticate, requireAdmin, ContentApprovalController.reviewPost);

/**
 * @route   POST /api/approval/bulk-review
 * @desc    Bulk approve or reject posts
 * @access  Admin+
 * @body    { post_ids: number[], action: 'approve' | 'reject', feedback? }
 */
router.post('/bulk-review', authenticate, requireAdmin, ContentApprovalController.bulkReviewPosts);

/**
 * @route   GET /api/approval/:id/details
 * @desc    Get post details for review/editing
 * @access  Admin+
 */
router.get('/:id/details', authenticate, requireAdmin, ContentApprovalController.getPostForReview);

/**
 * @route   PUT /api/approval/:id/edit
 * @desc    Edit writer post content
 * @access  Admin+
 * @body    { title?, content?, description?, summary_social?, channel?, topic?, keyword?, location?, mark_as_18_plus?, edit_reason? }
 */
router.put('/:id/edit', authenticate, requireAdmin, ContentApprovalController.editWriterPost);

/**
 * @route   POST /api/approval/:id/review-with-edit
 * @desc    Review post with optional editing
 * @access  Admin+
 * @body    { action: 'approve' | 'reject' | 'request-changes', feedback?, title?, content?, description?, ... }
 */
router.post('/:id/review-with-edit', authenticate, requireAdmin, ContentApprovalController.reviewWithEdit);

module.exports = router;