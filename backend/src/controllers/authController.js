const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { google } = require('googleapis');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const emailService = require('../utils/emailService');
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
        email_verified: process.env.REQUIRE_EMAIL_VERIFICATION === 'true' ? false : true
      });

      // Generate token
      const token = user.generateToken();

      // Set cookie
      res.cookie('naramakna_auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        domain: process.env.NODE_ENV === 'production' ? '.naramakna.id' : 'localhost'
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
      
      // Email verification is optional (disabled by default)
      if (!user.email_verified && process.env.REQUIRE_EMAIL_VERIFICATION === 'true') {
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
        process.env.JWT_SECRET,
        { expiresIn: tokenExpiry }
      );

      // Set cookie
      const cookieAge = remember_me ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
      res.cookie('naramakna_auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: cookieAge,
        domain: process.env.NODE_ENV === 'production' ? '.naramakna.id' : 'localhost'
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
      // Clear cookies with proper options
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        domain: process.env.NODE_ENV === 'production' ? '.naramakna.id' : 'localhost'
      };

      res.clearCookie('naramakna_auth', cookieOptions);
      res.clearCookie('token', cookieOptions); // Also clear old cookie for compatibility
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
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
        userData.profile_image = `${process.env.BACKEND_URL}${userProfile.profile_image}`;
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
        message: 'If the email exists, an OTP code has been sent'
      });

      if (user) {
        // Create OTP for password reset
        const passwordReset = await PasswordReset.createOTP(user_email);

        // Send OTP via email
        const emailResult = await emailService.sendOTP(
          user_email, 
          passwordReset.otp_code, 
          user.display_name || user.user_login
        );

        if (!emailResult.success) {
          console.error('Failed to send OTP email:', emailResult.error);
        }

        console.log(`🔐 Password reset OTP sent to ${user_email}: ${passwordReset.otp_code}`);
      }

    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process password reset request'
      });
    }
  }

  // Verify OTP for password reset
  static async verifyOTP(req, res) {
    try {
      const { user_email, otp_code } = req.body;

      if (!user_email || !otp_code) {
        return res.status(400).json({
          success: false,
          message: 'Email and OTP code are required'
        });
      }

      // Verify OTP
      const result = await PasswordReset.verifyOTP(user_email, otp_code);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      // Generate reset token for password change
      const user = await User.findOne({ where: { user_email } });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'User not found'
        });
      }

      const resetToken = jwt.sign(
        { id: user.ID, email: user_email, type: 'password_reset_verified' },
        process.env.JWT_SECRET,
        { expiresIn: '10m' } // Short-lived token after OTP verification
      );

      res.json({
        success: true,
        message: 'OTP verified successfully',
        data: {
          reset_token: resetToken
        }
      });

    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify OTP'
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.type !== 'password_reset_verified') {
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

      // Send password reset confirmation email
      try {
        await emailService.sendPasswordResetConfirmation(
          user.user_email,
          user.display_name || user.user_login
        );
      } catch (emailError) {
        console.error('Failed to send password reset confirmation email:', emailError);
      }

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

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
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

  // Get Google OAuth URL
  static async getGoogleAuthUrl(req, res) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ];

      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
      });

      res.json({
        success: true,
        data: {
          auth_url: authUrl
        }
      });

    } catch (error) {
      console.error('Google auth URL error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate Google auth URL'
      });
    }
  }

  // Get Google Admin OAuth URL for Google Ads access
  static async getGoogleAdminAuthUrl(req, res) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_ADS_CLIENT_ID,
        process.env.GOOGLE_ADS_CLIENT_SECRET,
        `https://naramakna.id/api/auth/google/admin/callback`
      );

      const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/adwords'
      ];

      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
        state: 'admin_login'
      });

      res.json({
        success: true,
        data: {
          auth_url: authUrl
        }
      });

    } catch (error) {
      console.error('Google admin auth URL error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate Google admin auth URL'
      });
    }
  }

  // Handle Google OAuth callback
  static async handleGoogleCallback(req, res) {
    try {
      const { code } = req.query;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Authorization code not provided'
        });
      }

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      // Exchange code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Get user info from Google
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data: googleUser } = await oauth2.userinfo.get();

      // Check if user exists
      let user = await User.findOne({ where: { user_email: googleUser.email } });

      if (user) {
        // User exists, log them in
        const jwtToken = jwt.sign(
          { id: user.ID, email: user.user_email, role: user.user_role },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        // Set cookie
        res.cookie('naramakna_auth', jwtToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          domain: process.env.NODE_ENV === 'production' ? '.naramakna.id' : 'localhost'
        });

        // Redirect to frontend with success
        res.redirect(`${process.env.FRONTEND_URL}/auth/success`);
      } else {
        // User doesn't exist, create new account
        const newUser = await User.create({
          user_login: googleUser.email.split('@')[0],
          user_email: googleUser.email,
          user_pass: 'google_oauth', // Placeholder password
          display_name: googleUser.name,
          user_role: 'user',
          user_status: 1,
          email_verified: true, // Google emails are verified
          user_registered: new Date(),
          profile_image: googleUser.picture
        });

        const jwtToken = jwt.sign(
          { id: newUser.ID, email: newUser.user_email, role: newUser.user_role },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        // Set cookie
        res.cookie('naramakna_auth', jwtToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          domain: process.env.NODE_ENV === 'production' ? '.naramakna.id' : 'localhost'
        });

        // Redirect to frontend with success
        res.redirect(`${process.env.FRONTEND_URL}/auth/success`);
      }

    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=Google authentication failed`);
    }
  }

  // Handle Google Admin OAuth callback for Google Ads access
  static async handleGoogleAdminCallback(req, res) {
    try {
      console.log('🔍 Google Admin Callback - Query params:', req.query);
      const { code, state } = req.query;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Authorization code not provided'
        });
      }

      if (state !== 'admin_login') {
        return res.status(400).json({
          success: false,
          message: 'Invalid state parameter'
        });
      }

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_ADS_CLIENT_ID,
        process.env.GOOGLE_ADS_CLIENT_SECRET,
        `https://naramakna.id/api/auth/google/admin/callback`
      );

      // Exchange code for tokens
      console.log('🔍 Exchanging code for tokens...');
      const { tokens } = await oauth2Client.getToken(code);
      console.log('✅ Tokens received:', { 
        access_token: tokens.access_token ? 'present' : 'missing',
        refresh_token: tokens.refresh_token ? 'present' : 'missing' 
      });
      oauth2Client.setCredentials(tokens);

      // Get user info from Google
      console.log('🔍 Getting user info from Google...');
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data: googleUser } = await oauth2.userinfo.get();
      console.log('✅ Google user info:', { email: googleUser.email, name: googleUser.name });

      // Check if user exists and is admin
      const user = await User.findOne({ where: { user_email: googleUser.email } });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Admin account not found'
        });
      }

      // Check if user is admin or superadmin
      if (!['admin', 'superadmin'].includes(user.user_role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }

      // Store Google Ads tokens in user account
      console.log('🔍 Storing Google Ads tokens for user:', user.user_email);
      try {
        const tokenData = JSON.stringify({
          google_ads_access_token: tokens.access_token,
          google_ads_refresh_token: tokens.refresh_token,
          google_ads_token_expiry: tokens.expiry_date
        });
        console.log('🔍 Token data length:', tokenData.length);
        
        await user.update({
          user_activation_key: tokenData
        });
        console.log('✅ Google Ads tokens stored successfully');
      } catch (updateError) {
        console.error('❌ Error storing tokens:', updateError);
        throw updateError;
      }

      // Generate JWT token with Google Ads permissions
      const jwtToken = jwt.sign(
        { 
          id: user.ID, 
          email: user.user_email, 
          role: user.user_role,
          google_ads_authorized: true
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Set cookie
      res.cookie('naramakna_auth', jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        domain: process.env.NODE_ENV === 'production' ? '.naramakna.id' : 'localhost'
      });

      console.log(`✅ Google Ads admin login successful for: ${user.user_email}`);
      
      // Redirect back to Google Ads page with success parameter
      res.redirect(`${process.env.FRONTEND_URL}/superadmin/dashboard/google-ads?connected=true`);

    } catch (error) {
      console.error('Google admin callback error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      res.redirect(`${process.env.FRONTEND_URL}/superadmin/dashboard/google-ads?error=auth_failed`);
    }
  }

  // Test Google Ads connection
  static async testGoogleAdsConnection(req, res) {
    try {
      // Check if user is authenticated and has admin role
      if (!req.user || !['admin', 'superadmin'].includes(req.user.user_role)) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      // For testing purposes, allow direct connection test using environment variables
      // This bypasses the OAuth requirement for now
      const googleAdsService = require('../services/googleAds');
      const testResult = await googleAdsService.testConnection();

      // If connection test fails but we have env variables, provide helpful info
      if (!testResult.success && testResult.error) {
        let authRequired = false;
        let helpMessage = '';

        if (testResult.error.includes('Authentication required') || 
            testResult.error.includes('Invalid authentication credentials')) {
          authRequired = true;
          helpMessage = 'Google Ads OAuth tokens may be expired or invalid. You can try refreshing tokens or re-authenticating.';
        }

        return res.status(400).json({
          success: false,
          message: 'Google Ads connection failed',
          error: testResult.error,
          auth_required: authRequired,
          help: helpMessage,
          debug: testResult.details || null
        });
      }

      res.json({
        success: testResult.success,
        message: testResult.success ? 'Google Ads connection successful' : 'Google Ads connection failed',
        data: testResult.success ? testResult.account : null,
        error: testResult.error || null
      });

    } catch (error) {
      console.error('Google Ads connection test error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to test Google Ads connection',
        error: error.message
      });
    }
  }
}

module.exports = AuthController;