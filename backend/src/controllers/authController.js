const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/User');
const { USER_ROLES, POST_STATUS } = require('../../../shared/constants/roles.cjs');

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      const {
        user_login,
        user_email,
        user_pass,
        display_name,
        role_request = 'user' // user, writer
      } = req.body;

      // Validation
      if (!user_login || !user_email || !user_pass) {
        return res.status(400).json({
          success: false,
          message: 'Username, email, and password are required'
        });
      }

      if (user_pass.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { user_email },
            { user_login }
          ]
        }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: existingUser.user_email === user_email 
            ? 'Email already registered' 
            : 'Username already taken'
        });
      }

      // Determine role
      let userRole = USER_ROLES.USER;
      if (role_request === 'writer') {
        userRole = USER_ROLES.WRITER;
      }

      // Create user
      const user = await User.create({
        user_login: user_login.toLowerCase(),
        user_email: user_email.toLowerCase(),
        user_pass,
        display_name: display_name || user_login,
        user_role: userRole,
        user_status: userRole === USER_ROLES.WRITER ? 0 : 1, // Writers need approval
        email_verified: false
      });

      // Generate token
      const token = user.generateToken();

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
      });

      res.status(201).json({
        success: true,
        message: userRole === USER_ROLES.WRITER 
          ? 'Writer account created. Awaiting admin approval.' 
          : 'Account created successfully',
        data: {
          user: user.toSafeJSON(),
          token,
          requires_approval: userRole === USER_ROLES.WRITER
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      
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
        message: 'Registration failed'
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { identifier, user_pass, remember_me = false } = req.body;

      if (!identifier || !user_pass) {
        return res.status(400).json({
          success: false,
          message: 'Email/username and password are required'
        });
      }

      // Find user by email or username
      const user = await User.findByEmailOrLogin(identifier);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if account is locked
      if (user.isLocked()) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked. Please try again later.'
        });
      }

      // Verify password
      const isValidPassword = await user.comparePassword(user_pass);

      if (!isValidPassword) {
        // Increment failed attempts
        await User.incrementFailedAttempts(user.ID);
        
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if account is blocked (but allow suspended users to login)
      if (user.user_status === 'inactive' || user.user_status === 'banned') {
        return res.status(403).json({
          success: false,
          message: user.user_status === 'banned' 
            ? 'Account is permanently banned' 
            : 'Account is inactive and pending approval'
        });
      }
      
      // Still require email verification (can be disabled via env var)
      if (!user.email_verified && process.env.REQUIRE_EMAIL_VERIFICATION !== 'false') {
        return res.status(403).json({
          success: false,
          message: 'Please verify your email address before logging in'
        });
      }

      // Reset failed attempts and update last login
      await Promise.all([
        User.resetFailedAttempts(user.ID),
        user.update({ last_login: new Date() })
      ]);

      // Generate token
      const tokenExpiry = remember_me ? '30d' : '7d';
      const token = jwt.sign(
        { 
          id: user.ID, 
          email: user.user_email,
          role: user.user_role,
          login: user.user_login
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: tokenExpiry }
      );

      // Set cookie
      const cookieAge = remember_me ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: cookieAge,
        domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toSafeJSON(),
          token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  }

  // Logout user
  static async logout(req, res) {
    try {
      res.clearCookie('token');
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }

  // Get current user profile
  static async profile(req, res) {
    try {
      const userData = req.user.toSafeJSON();
      
      // Get profile image from UserProfile table
      const UserProfile = require('../models/UserProfile');
      const userProfile = await UserProfile.findOne({
        where: { user_id: req.user.ID }
      });
      
      if (userProfile && userProfile.profile_image) {
        userData.profile_image = `http://localhost:3001${userProfile.profile_image}`;
      }
      
      res.json({
        success: true,
        data: {
          user: userData
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const {
        display_name,
        user_email,
        user_url,
        bio,
        current_password,
        new_password
      } = req.body;

      const user = req.user;
      const updates = {};

      // Update basic info
      if (display_name !== undefined) updates.display_name = display_name;
      if (user_url !== undefined) updates.user_url = user_url;
      if (bio !== undefined) updates.bio = bio;

      // Update email (check for uniqueness)
      if (user_email && user_email !== user.user_email) {
        const existingUser = await User.findOne({
          where: { 
            user_email,
            ID: { [Op.ne]: user.ID }
          }
        });

        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: 'Email already in use'
          });
        }

        updates.user_email = user_email.toLowerCase();
        updates.email_verified = false; // Reset verification status
      }

      // Update password
      if (new_password) {
        if (!current_password) {
          return res.status(400).json({
            success: false,
            message: 'Current password required to set new password'
          });
        }

        const isValidPassword = await user.comparePassword(current_password);
        if (!isValidPassword) {
          return res.status(401).json({
            success: false,
            message: 'Current password is incorrect'
          });
        }

        if (new_password.length < 6) {
          return res.status(400).json({
            success: false,
            message: 'New password must be at least 6 characters long'
          });
        }

        updates.user_pass = new_password;
      }

      // Apply updates
      await user.update(updates);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: user.toSafeJSON()
        }
      });

    } catch (error) {
      console.error('Profile update error:', error);
      
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
        message: 'Failed to update profile'
      });
    }
  }

  // Request password reset
  static async requestPasswordReset(req, res) {
    try {
      const { user_email } = req.body;

      if (!user_email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      const user = await User.findOne({ where: { user_email } });

      // Always return success to prevent email enumeration
      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });

      if (user) {
        // Generate reset token
        const resetToken = jwt.sign(
          { id: user.ID, type: 'password_reset' },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '1h' }
        );

        // Save reset token
        await user.update({
          user_activation_key: resetToken
        });

        // TODO: Send email with reset link
        console.log(`Password reset token for ${user_email}: ${resetToken}`);
      }

    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process password reset request'
      });
    }
  }

  // Reset password with token
  static async resetPassword(req, res) {
    try {
      const { token, new_password } = req.body;

      if (!token || !new_password) {
        return res.status(400).json({
          success: false,
          message: 'Token and new password are required'
        });
      }

      if (new_password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      
      if (decoded.type !== 'password_reset') {
        return res.status(400).json({
          success: false,
          message: 'Invalid reset token'
        });
      }

      // Find user with matching token
      const user = await User.findOne({
        where: {
          ID: decoded.id,
          user_activation_key: token
        }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      // Update password and clear reset token
      await user.update({
        user_pass: new_password,
        user_activation_key: '',
        failed_login_attempts: 0,
        locked_until: null
      });

      res.json({
        success: true,
        message: 'Password reset successful'
      });

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({
          success: false,
          message: 'Reset token has expired'
        });
      }

      console.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset password'
      });
    }
  }

  // Verify email
  static async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      
      if (decoded.type !== 'email_verification') {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification token'
        });
      }

      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.update({ email_verified: true });

      res.json({
        success: true,
        message: 'Email verified successfully'
      });

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({
          success: false,
          message: 'Verification token has expired'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Email verification failed'
      });
    }
  }
}

module.exports = AuthController;