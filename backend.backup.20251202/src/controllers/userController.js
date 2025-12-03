const { Op } = require('sequelize');
const User = require('../models/User');
const Post = require('../models/Post');
const { USER_ROLES, hasPermission, canAccess } = require('../../../shared/constants/roles.cjs');

class UserController {
  // Get all users (admin only)
  static async getUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        role,
        status,
        search,
        sort_by = 'user_registered',
        sort_order = 'DESC'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {};

      // Filters
      if (role && Object.values(USER_ROLES).includes(role)) {
        where.user_role = role;
      }

      if (status !== undefined) {
        where.user_status = parseInt(status);
      }

      if (search) {
        where[Op.or] = [
          { user_login: { [Op.like]: `%${search}%` } },
          { user_email: { [Op.like]: `%${search}%` } },
          { display_name: { [Op.like]: `%${search}%` } }
        ];
      }

      const users = await User.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [[sort_by, sort_order.toUpperCase()]],
        attributes: { exclude: ['user_pass', 'user_activation_key'] }
      });

      res.json({
        success: true,
        data: {
          users: users.rows,
          pagination: {
            total: users.count,
            page: parseInt(page),
            limit: parseInt(limit),
            total_pages: Math.ceil(users.count / parseInt(limit))
          }
        }
      });

    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }

  // Get user by ID
  static async getUser(req, res) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      // Users can only view their own profile unless they're admin+
      if (parseInt(id) !== currentUser.ID && !canAccess(currentUser.user_role, USER_ROLES.ADMIN)) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied'
        });
      }

      const user = await User.findByPk(id, {
        attributes: { exclude: ['user_pass', 'user_activation_key'] },
        include: [
          {
            model: Post,
            as: 'posts',
            attributes: ['ID', 'post_title', 'post_status', 'post_date'],
            limit: 5,
            order: [['post_date', 'DESC']]
          }
        ]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user }
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user'
      });
    }
  }

  // Update user (admin can update others, users can update themselves)
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const currentUser = req.user;
      const {
        display_name,
        user_email,
        user_role,
        user_status,
        user_url,
        bio
      } = req.body;

      const targetUser = await User.findByPk(id);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Permission checks
      const isOwnProfile = parseInt(id) === currentUser.ID;
      const isAdmin = canAccess(currentUser.user_role, USER_ROLES.ADMIN);

      if (!isOwnProfile && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied'
        });
      }

      // Prepare updates
      const updates = {};

      // Basic fields that users can update on their own profile
      if (display_name !== undefined) updates.display_name = display_name;
      if (user_url !== undefined) updates.user_url = user_url;
      if (bio !== undefined) updates.bio = bio;

      // Email update with uniqueness check
      if (user_email && user_email !== targetUser.user_email) {
        const existingUser = await User.findOne({
          where: { 
            user_email,
            ID: { [Op.ne]: targetUser.ID }
          }
        });

        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: 'Email already in use'
          });
        }

        updates.user_email = user_email.toLowerCase();
        if (isOwnProfile) {
          updates.email_verified = false; // Reset verification if user changes their own email
        }
      }

      // Admin-only fields
      if (isAdmin) {
        if (user_role !== undefined) {
          // Prevent users from promoting themselves to superadmin
          if (user_role === USER_ROLES.SUPERADMIN && currentUser.user_role !== USER_ROLES.SUPERADMIN) {
            return res.status(403).json({
              success: false,
              message: 'Only superadmin can promote to superadmin'
            });
          }

          // Prevent users from modifying superadmin accounts unless they are superadmin
          if (targetUser.user_role === USER_ROLES.SUPERADMIN && currentUser.user_role !== USER_ROLES.SUPERADMIN) {
            return res.status(403).json({
              success: false,
              message: 'Only superadmin can modify superadmin accounts'
            });
          }

          updates.user_role = user_role;
        }

        if (user_status !== undefined) {
          updates.user_status = parseInt(user_status);
        }
      }

      // Apply updates
      await targetUser.update(updates);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: {
          user: targetUser.toSafeJSON()
        }
      });

    } catch (error) {
      console.error('Update user error:', error);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map(e => ({
            field: e.path,
            message: e.message
          }))
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  }

  // Delete user (admin only)
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      // Prevent self-deletion
      if (parseInt(id) === currentUser.ID) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      const targetUser = await User.findByPk(id);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Prevent non-superadmin from deleting superadmin
      if (targetUser.user_role === USER_ROLES.SUPERADMIN && currentUser.user_role !== USER_ROLES.SUPERADMIN) {
        return res.status(403).json({
          success: false,
          message: 'Only superadmin can delete superadmin accounts'
        });
      }

      // TODO: Handle user's content (assign to another user or delete)
      // For now, we'll just delete the user
      await targetUser.destroy();

      res.json({
        success: true,
        message: 'User deleted successfully'
      });

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  }

  // Approve writer registration (admin only)
  static async approveWriter(req, res) {
    try {
      const { id } = req.params;
      const { approved } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.user_role !== USER_ROLES.WRITER) {
        return res.status(400).json({
          success: false,
          message: 'User is not a writer'
        });
      }

      const updates = {
        user_status: approved ? 1 : 2 // 1=active, 2=suspended
      };

      await user.update(updates);

      res.json({
        success: true,
        message: `Writer ${approved ? 'approved' : 'rejected'} successfully`,
        data: {
          user: user.toSafeJSON()
        }
      });

    } catch (error) {
      console.error('Approve writer error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update writer status'
      });
    }
  }

  // Get pending writers (admin only)
  static async getPendingWriters(req, res) {
    try {
      const pendingWriters = await User.findAll({
        where: {
          user_role: USER_ROLES.WRITER,
          user_status: 0 // pending
        },
        attributes: { exclude: ['user_pass', 'user_activation_key'] },
        order: [['user_registered', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          pending_writers: pendingWriters
        }
      });

    } catch (error) {
      console.error('Get pending writers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pending writers'
      });
    }
  }

  // Get user statistics (admin only)
  static async getUserStats(req, res) {
    try {
      const stats = await Promise.all([
        // Total users by role
        User.count({ where: { user_role: USER_ROLES.USER } }),
        User.count({ where: { user_role: USER_ROLES.WRITER } }),
        User.count({ where: { user_role: USER_ROLES.ADMIN } }),
        User.count({ where: { user_role: USER_ROLES.SUPERADMIN } }),
        
        // Users by status
        User.count({ where: { user_status: 0 } }), // pending
        User.count({ where: { user_status: 1 } }), // active
        User.count({ where: { user_status: 2 } }), // suspended
        
        // Recent registrations (last 7 days)
        User.count({
          where: {
            user_registered: {
              [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        
        // Email verification stats
        User.count({ where: { email_verified: true } }),
        User.count({ where: { email_verified: false } })
      ]);

      res.json({
        success: true,
        data: {
          roles: {
            users: stats[0],
            writers: stats[1],
            admins: stats[2],
            superadmins: stats[3]
          },
          status: {
            pending: stats[4],
            active: stats[5],
            suspended: stats[6]
          },
          recent_registrations: stats[7],
          email_verification: {
            verified: stats[8],
            unverified: stats[9]
          }
        }
      });

    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user statistics'
      });
    }
  }

  // Bulk user actions (admin only)
  static async bulkUserAction(req, res) {
    try {
      const { user_ids, action, value } = req.body;

      if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'User IDs array is required'
        });
      }

      if (!action || !['activate', 'suspend', 'delete', 'change_role'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
      }

      const currentUser = req.user;
      
      // Prevent bulk actions on own account
      if (user_ids.includes(currentUser.ID)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot perform bulk actions on your own account'
        });
      }

      let updates = {};
      
      switch (action) {
        case 'activate':
          updates.user_status = 1;
          break;
        case 'suspend':
          updates.user_status = 2;
          break;
case 'change_role':
          if (!value || !Object.values(USER_ROLES).includes(value)) {
            return res.status(400).json({
              success: false,
              message: 'Valid role value is required'
            });
          }
          
          // Prevent promoting to superadmin unless current user is superadmin
          if (value === USER_ROLES.SUPERADMIN && currentUser.user_role !== USER_ROLES.SUPERADMIN) {
            return res.status(403).json({
              success: false,
              message: 'Only superadmin can promote to superadmin'
            });
          }
          
          updates.user_role = value;
          break;
      }

      if (action === 'delete') {
        // Check for superadmin accounts in the list
        const superAdmins = await User.findAll({
          where: {
            ID: { [Op.in]: user_ids },
            user_role: USER_ROLES.SUPERADMIN
          }
        });

        if (superAdmins.length > 0 && currentUser.user_role !== USER_ROLES.SUPERADMIN) {
          return res.status(403).json({
            success: false,
            message: 'Cannot delete superadmin accounts'
          });
        }

        await User.destroy({
          where: { ID: { [Op.in]: user_ids } }
        });
      } else {
        await User.update(updates, {
          where: { ID: { [Op.in]: user_ids } }
        });
      }

      res.json({
        success: true,
        message: `Bulk ${action} completed successfully`,
        data: {
          affected_users: user_ids.length
        }
      });

    } catch (error) {
      console.error('Bulk user action error:', error);
      res.status(500).json({
        success: false,
        message: 'Bulk action failed'
      });
    }
  }
}

module.exports = UserController;