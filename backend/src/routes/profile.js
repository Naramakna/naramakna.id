const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');
const { User, UserProfile } = require('../models');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../public/uploads/profiles');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `profile-${req.user.ID}-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

/**
 * @route   GET /api/profile
 * @desc    Get current user's extended profile
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    // Get user with profile data
    const user = await User.findByPk(req.user.ID, {
      include: [{
        model: UserProfile,
        as: 'profile',
        required: false
      }],
      attributes: { exclude: ['user_pass', 'user_activation_key'] }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If no profile exists, create one
    if (!user.profile) {
      const profile = await UserProfile.create({ user_id: req.user.ID });
      user.profile = profile;
    }

    res.json({
      success: true,
      data: {
        user: user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/profile
 * @desc    Update current user's extended profile
 * @access  Private
 */
router.put('/', authenticate, async (req, res) => {
  try {
    const {
      // Basic user fields
      display_name,
      bio,
      user_url,
      
      // Extended profile fields
      birth_date,
      gender,
      phone_number,
      address,
      city,
      province,
      postal_code,
      country,
      profession,
      company,
      education,
      facebook_url,
      twitter_url,
      instagram_url,
      linkedin_url,
      tiktok_url,
      youtube_url,
      writer_category,
      writing_experience,
      portfolio_url,
      show_email,
      show_phone,
      show_address,
      show_birth_date
    } = req.body;

    // Update basic user data if provided
    const userUpdateData = {};
    if (display_name !== undefined) userUpdateData.display_name = display_name;
    if (bio !== undefined) userUpdateData.bio = bio;
    if (user_url !== undefined) userUpdateData.user_url = user_url;

    if (Object.keys(userUpdateData).length > 0) {
      await User.update(userUpdateData, { where: { ID: req.user.ID } });
    }

    // Update extended profile data
    const profileUpdateData = {};
    if (birth_date !== undefined) profileUpdateData.birth_date = birth_date;
    if (gender !== undefined) profileUpdateData.gender = gender;
    if (phone_number !== undefined) profileUpdateData.phone_number = phone_number;
    if (address !== undefined) profileUpdateData.address = address;
    if (city !== undefined) profileUpdateData.city = city;
    if (province !== undefined) profileUpdateData.province = province;
    if (postal_code !== undefined) profileUpdateData.postal_code = postal_code;
    if (country !== undefined) profileUpdateData.country = country;
    if (profession !== undefined) profileUpdateData.profession = profession;
    if (company !== undefined) profileUpdateData.company = company;
    if (education !== undefined) profileUpdateData.education = education;
    if (facebook_url !== undefined) profileUpdateData.facebook_url = facebook_url;
    if (twitter_url !== undefined) profileUpdateData.twitter_url = twitter_url;
    if (instagram_url !== undefined) profileUpdateData.instagram_url = instagram_url;
    if (linkedin_url !== undefined) profileUpdateData.linkedin_url = linkedin_url;
    if (tiktok_url !== undefined) profileUpdateData.tiktok_url = tiktok_url;
    if (youtube_url !== undefined) profileUpdateData.youtube_url = youtube_url;
    if (writer_category !== undefined) profileUpdateData.writer_category = writer_category;
    if (writing_experience !== undefined) profileUpdateData.writing_experience = writing_experience;
    if (portfolio_url !== undefined) profileUpdateData.portfolio_url = portfolio_url;
    if (show_email !== undefined) profileUpdateData.show_email = show_email;
    if (show_phone !== undefined) profileUpdateData.show_phone = show_phone;
    if (show_address !== undefined) profileUpdateData.show_address = show_address;
    if (show_birth_date !== undefined) profileUpdateData.show_birth_date = show_birth_date;

    if (Object.keys(profileUpdateData).length > 0) {
      await UserProfile.upsert({
        user_id: req.user.ID,
        ...profileUpdateData
      });
    }

    // Get updated data
    const updatedUser = await User.findByPk(req.user.ID, {
      include: [{
        model: UserProfile,
        as: 'profile',
        required: false
      }],
      attributes: { exclude: ['user_pass', 'user_activation_key'] }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/profile/upload-image
 * @desc    Upload profile image
 * @access  Private
 */
router.post('/upload-image', authenticate, upload.single('profile_image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Generate relative path for database storage
    const imagePath = `/uploads/profiles/${req.file.filename}`;
    
    // Update user profile with new image path
    await UserProfile.update({ profile_image: imagePath }, { where: { user_id: req.user.ID } });

    // Also update basic user table if needed (for backward compatibility)
    await User.update({ profile_image: imagePath }, { where: { ID: req.user.ID } });

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        profile_image: imagePath,
        file_size: req.file.size,
        file_type: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload image error:', error.message);
    
    // Clean up uploaded file if database update fails
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError.message);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/profile/image
 * @desc    Delete profile image
 * @access  Private
 */
router.delete('/image', authenticate, async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ where: { user_id: req.user.ID } });
    
    if (profile && profile.profile_image) {
      // Delete file from filesystem
      const filePath = path.join(__dirname, '../../public', profile.profile_image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Update database
      await UserProfile.update({ profile_image: null }, { where: { user_id: req.user.ID } });
      await User.update({ profile_image: null }, { where: { ID: req.user.ID } });
    }

    res.json({
      success: true,
      message: 'Profile image deleted successfully'
    });
  } catch (error) {
    console.error('Delete image error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile image',
      error: error.message
    });
  }
});

module.exports = router;
