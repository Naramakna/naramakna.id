// ========================================
// USER ROLES & PERMISSIONS SYSTEM
// ========================================

const USER_ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin', 
  WRITER: 'writer',
  USER: 'user'
};

const ROLE_HIERARCHY = {
  [USER_ROLES.SUPERADMIN]: 4,
  [USER_ROLES.ADMIN]: 3,
  [USER_ROLES.WRITER]: 2,
  [USER_ROLES.USER]: 1
};

const PERMISSIONS = {
  // Content Management
  CREATE_POST: 'create_post',
  EDIT_POST: 'edit_post', 
  DELETE_POST: 'delete_post',
  PUBLISH_POST: 'publish_post',
  APPROVE_POST: 'approve_post',
  
  // User Management
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  MANAGE_ROLES: 'manage_roles',
  
  // Comments
  CREATE_COMMENT: 'create_comment',
  MODERATE_COMMENT: 'moderate_comment',
  DELETE_COMMENT: 'delete_comment',
  
  // Analytics & Ads
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_ADS: 'manage_ads',
  
  // System
  MANAGE_SYSTEM: 'manage_system',
  VIEW_LOGS: 'view_logs'
};

const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPERADMIN]: [
    // All permissions
    ...Object.values(PERMISSIONS)
  ],
  
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.CREATE_POST,
    PERMISSIONS.EDIT_POST,
    PERMISSIONS.DELETE_POST,
    PERMISSIONS.PUBLISH_POST,
    PERMISSIONS.APPROVE_POST,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.CREATE_COMMENT,
    PERMISSIONS.MODERATE_COMMENT,
    PERMISSIONS.DELETE_COMMENT,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_ADS
  ],
  
  [USER_ROLES.WRITER]: [
    PERMISSIONS.CREATE_POST,
    PERMISSIONS.EDIT_POST, // own posts only
    PERMISSIONS.CREATE_COMMENT,
    PERMISSIONS.VIEW_ANALYTICS // own content only
  ],
  
  [USER_ROLES.USER]: [
    PERMISSIONS.CREATE_COMMENT
  ]
};

const POST_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PUBLISHED: 'publish',
  PRIVATE: 'private',
  REJECTED: 'rejected'
};

const COMMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  SPAM: 'spam',
  REJECTED: 'rejected'
};

// Helper functions
const hasPermission = (userRole, permission) => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

const canAccess = (userRole, requiredRole) => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

const isHigherRole = (userRole, targetRole) => {
  return ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[targetRole];
};

module.exports = {
  USER_ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  POST_STATUS,
  COMMENT_STATUS,
  hasPermission,
  canAccess,
  getRolePermissions,
  isHigherRole
};