const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { USER_ROLES, hasPermission, canAccess } = require('../../../shared/constants/roles.cjs');

// Basic authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    
    console.log('🔍 Auth Debug - Token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    console.log('🔍 Auth Debug - Decoded JWT:', decoded);
    
    const user = await User.findByPk(decoded.id);
    console.log('🔍 Auth Debug - User lookup result:', user ? `Found ID=${user.ID}` : 'Not found');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Allow suspended users to login (they just can't post)
    // Only block if truly inactive or banned
    if (user.user_status === 'inactive' || user.user_status === 'banned' || user.isLocked()) {
      console.log('🔍 Auth Debug - User blocked:', user.user_status);
      return res.status(401).json({
        success: false,
        message: user.user_status === 'banned' ? 'Account is banned' : 
                user.isLocked() ? 'Account is temporarily locked' : 'Account is inactive'
      });
    }
    
    // Still require email verification
    if (!user.email_verified) {
      console.log('🔍 Auth Debug - Email not verified');
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address'
      });
    }

    console.log('🔍 Auth Debug - Setting req.user:', { ID: user.ID, login: user.user_login, role: user.user_role });
    req.user = user;
    next();
  } catch (error) {
    console.error('🚨 Auth middleware error:', error.message, error.stack);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Optional authentication - doesn't require token but sets user if present
const optionalAuth = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      const user = await User.findByPk(decoded.id);
      
      if (user && user.isActive()) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Ignore errors in optional auth
    next();
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.user_role;
    const hasRequiredRole = roles.some(role => canAccess(userRole, role));

    if (!hasRequiredRole) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required_roles: roles,
        user_role: userRole
      });
    }

    next();
  };
};

// Permission-based authorization middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied',
        required_permission: permission,
        user_role: req.user.user_role
      });
    }

    next();
  };
};

// Middleware to check if user can edit specific post
const canEditPost = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const postId = req.params.id || req.body.id;
    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID required'
      });
    }

    const Post = require('../models/Post');
    const post = await Post.findByPk(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (!req.user.canEditPost(post)) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own posts'
      });
    }

    req.post = post;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

// Middleware for content writers (must be writer or higher)
const requireWriter = authorize(USER_ROLES.WRITER, USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN);

// Middleware for admins (admin or superadmin)
const requireAdmin = authorize(USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN);

// Middleware for superadmin only
const requireSuperAdmin = authorize(USER_ROLES.SUPERADMIN);

// Helper function to extract token from request
function getTokenFromRequest(req) {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookie
  if (req.cookies && req.cookies.naramakna_auth) {
    return req.cookies.naramakna_auth;
  }
  
  // Fallback to old cookie name for compatibility
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  // Check query parameter (not recommended for production)
  if (req.query.token) {
    return req.query.token;
  }

  return null;
}

// Check if user can create video content
const canCreateVideo = (req, res, next) => {
  const user = req.user;
  // Handle both JSON and FormData
  const type = req.body.type || req.body.get?.('type');

  console.log('canCreateVideo middleware - type:', type, 'user role:', user.role);

  // Only admin and superadmin can create video content
  if (['youtube_video', 'tiktok_video'].includes(type)) {
    if (!['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admin and superadmin can create video content',
        required_roles: ['admin', 'superadmin'],
        user_role: user.role
      });
    }
  }

  next();
};

// Check if user can manage ads
const canManageAds = (req, res, next) => {
  const user = req.user;

  // Only superadmin can manage ads
  if (user.user_role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Only superadmin can manage advertisements',
      required_roles: ['superadmin'],
      user_role: user.user_role
    });
  }

  next();
};

// Rate limiting for auth endpoints
const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Clean up old entries
    for (const [ip, data] of attempts.entries()) {
      if (now - data.firstAttempt > windowMs) {
        attempts.delete(ip);
      }
    }

    const userAttempts = attempts.get(key);
    
    if (!userAttempts) {
      attempts.set(key, { count: 1, firstAttempt: now });
      return next();
    }

    if (now - userAttempts.firstAttempt > windowMs) {
      attempts.set(key, { count: 1, firstAttempt: now });
      return next();
    }

    if (userAttempts.count >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Please try again later.',
        retryAfter: Math.ceil((windowMs - (now - userAttempts.firstAttempt)) / 1000)
      });
    }

    userAttempts.count++;
    next();
  };
};

// Check if user can post content (not suspended)
const canPost = (req, res, next) => {
  const user = req.user;
  
  if (user.user_status === 'suspended') {
    return res.status(403).json({
      success: false,
      message: 'Your account is suspended. You cannot create or edit content.',
      user_status: 'suspended'
    });
  }
  
  next();
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  requirePermission,
  canEditPost,
  canCreateVideo,
  canManageAds,
  requireWriter,
  requireAdmin,
  requireSuperAdmin,
  authRateLimit,
  getTokenFromRequest,
  canPost,
  // Aliases for consistency
  requireAuth: authenticate,
  requireRole: authorize
};