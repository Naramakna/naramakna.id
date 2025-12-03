const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticate, requireAdmin, requireSuperAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/users
 * @desc    Get all users with filtering and pagination
 * @access  Admin+
 * @query   { page?, limit?, role?, status?, search?, sort_by?, sort_order? }
 */
router.get('/', authenticate, requireAdmin, UserController.getUsers);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics
 * @access  Admin+
 */
router.get('/stats', authenticate, requireAdmin, UserController.getUserStats);

/**
 * @route   GET /api/users/pending-writers
 * @desc    Get pending writer approvals
 * @access  Admin+
 */
router.get('/pending-writers', authenticate, requireAdmin, UserController.getPendingWriters);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (own profile) or Admin+ (any profile)
 */
router.get('/:id', authenticate, UserController.getUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (own profile) or Admin+ (any profile)
 * @body    { display_name?, user_email?, user_role?, user_status?, user_url?, bio? }
 */
router.put('/:id', authenticate, UserController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Admin+
 */
router.delete('/:id', authenticate, requireAdmin, UserController.deleteUser);

/**
 * @route   POST /api/users/:id/approve-writer
 * @desc    Approve or reject writer registration
 * @access  Admin+
 * @body    { approved }
 */
router.post('/:id/approve-writer', authenticate, requireAdmin, UserController.approveWriter);

/**
 * @route   POST /api/users/bulk-action
 * @desc    Perform bulk actions on users
 * @access  Admin+
 * @body    { user_ids, action, value? }
 */
router.post('/bulk-action', authenticate, requireAdmin, UserController.bulkUserAction);

module.exports = router;