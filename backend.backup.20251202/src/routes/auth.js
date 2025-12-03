const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticate, authRateLimit } = require('../middleware/auth');

// Rate limiting for auth endpoints
const loginRateLimit = authRateLimit(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
const registerRateLimit = authRateLimit(3, 60 * 60 * 1000); // 3 attempts per hour

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 * @body    { user_login, user_email, user_pass, display_name?, role_request? }
 */
router.post('/register', registerRateLimit, AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @body    { identifier, user_pass, remember_me? }
 */
router.post('/login', loginRateLimit, AuthController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post('/logout', AuthController.logout);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, AuthController.profile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user profile
 * @access  Private
 * @body    { display_name?, user_email?, user_url?, bio?, current_password?, new_password? }
 */
router.put('/profile', authenticate, AuthController.updateProfile);

/**
 * @route   POST /api/auth/request-reset
 * @desc    Request password reset
 * @access  Public
 * @body    { user_email }
 */
router.post('/request-reset', authRateLimit(3, 60 * 60 * 1000), AuthController.requestPasswordReset);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 * @body    { token, new_password }
 */
router.post('/reset-password', authRateLimit(5, 60 * 60 * 1000), AuthController.resetPassword);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify email address
 * @access  Public
 */
router.get('/verify-email/:token', AuthController.verifyEmail);

module.exports = router;