/**
 * Advertisement Controller
 * Handles ad campaign management and serving
 */

const { Advertisement, User } = require('../models');
const { Op } = require('sequelize');

class AdsController {

  /**
   * Create new advertisement campaign
   * POST /api/ads
   */
  static async create(req, res) {
    try {
      const {
        advertiser_id,
        campaign_name,
        start_date,
        end_date,
        duration_hours,
        rotation_mode = 'global', // Default to global settings
        rotation_duration = null, // Only for manual mode
        budget,
        placement_type = 'regular',
        media_type = 'image',
        media_url,
        image_url, // legacy support
        target_url,
        ad_content,
        google_ads_code
      } = req.body;

      // Validate required fields
      if (!advertiser_id || !campaign_name) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: advertiser_id, campaign_name'
        });
      }

      // Validate that either end_date or duration_hours is provided
      if (!end_date && !duration_hours) {
        return res.status(400).json({
          success: false,
          message: 'Either end_date or duration_hours must be provided'
        });
      }

      // For duration_hours mode, start_date is optional (will use current time)
      if (duration_hours && (!start_date || start_date === '')) {
        console.log('🕒 Duration mode: Using current time as start_date');
      } else if (!start_date) {
        return res.status(400).json({
          success: false,
          message: 'start_date is required when not using duration_hours mode'
        });
      }

      // Verify advertiser exists
      const advertiser = await User.findByPk(advertiser_id);
      if (!advertiser) {
        return res.status(404).json({
          success: false,
          message: 'Advertiser not found'
        });
      }

      // Validate media requirements
      if (media_type === 'google_ads' && !google_ads_code) {
        return res.status(400).json({
          success: false,
          message: 'Google Ads code is required for google_ads media type'
        });
      }

      if ((media_type === 'image' || media_type === 'gif' || media_type === 'video') && !media_url && !image_url) {
        return res.status(400).json({
          success: false,
          message: 'Media URL is required for image, gif, or video ads'
        });
      }

      // Helper function to get current WIB time (GMT+7)
      const getWIBTime = () => {
        const now = new Date();
        return new Date(now.getTime() + (7 * 60 * 60 * 1000));
      };

      // Helper function to parse WIB datetime string to UTC
      const parseWIBToUTC = (dateTimeString) => {
        if (dateTimeString.includes('+07:00')) {
          // Already has timezone offset, parse directly
          return new Date(dateTimeString);
        } else {
          // Assume WIB timezone, convert to UTC
          const date = new Date(dateTimeString);
          return new Date(date.getTime() - (7 * 60 * 60 * 1000));
        }
      };

      // Calculate start and end dates based on different input modes
      let calculatedStartDate, calculatedEndDate;
      
      if (duration_hours) {
        // Duration mode: start immediately, calculate end date
        if (!start_date || start_date === '') {
          calculatedStartDate = new Date(); // Current UTC time
        } else {
          calculatedStartDate = parseWIBToUTC(start_date);
        }
        calculatedEndDate = new Date(calculatedStartDate.getTime() + (duration_hours * 60 * 60 * 1000));
      } else {
        // Date/datetime mode: use provided start and end dates
        if (start_date && start_date.includes('T') && start_date.includes('+07:00')) {
          // Datetime with timezone (from new UI)
          calculatedStartDate = parseWIBToUTC(start_date);
          calculatedEndDate = parseWIBToUTC(end_date);
        } else {
          // Legacy date-only format
          calculatedStartDate = new Date(start_date);
          calculatedEndDate = new Date(end_date);
        }
      }

      // Log timezone conversion for debugging
      console.log('🕒 Ad creation timezone info:');
      console.log('  Input start_date:', start_date);
      console.log('  Input end_date:', end_date);
      console.log('  Input duration_hours:', duration_hours);
      console.log('  Current WIB time:', getWIBTime().toISOString());
      console.log('  Calculated start date (UTC for storage):', calculatedStartDate.toISOString());
      console.log('  Calculated end date (UTC for storage):', calculatedEndDate.toISOString());
      console.log('  Start date in WIB:', new Date(calculatedStartDate.getTime() + (7 * 60 * 60 * 1000)).toISOString());
      console.log('  End date in WIB:', new Date(calculatedEndDate.getTime() + (7 * 60 * 60 * 1000)).toISOString());
      
      const ad = await Advertisement.create({
        advertiser_id,
        campaign_name,
        start_date: calculatedStartDate,
        end_date: calculatedEndDate,
        duration_hours: duration_hours || null,
        rotation_mode: rotation_mode || 'global',
        rotation_duration: rotation_mode === 'manual' ? parseInt(rotation_duration) || 30 : null,
        budget: budget || null,
        placement_type,
        media_type,
        media_url: media_url || image_url, // Use media_url first, fallback to image_url
        image_url: image_url || media_url, // Keep for legacy compatibility, use media_url as fallback
        target_url,
        ad_content,
        google_ads_code,
        status: 'pending'
      });

      res.status(201).json({
        success: true,
        message: 'Advertisement created successfully',
        data: {
          id: ad.id,
          campaign_name: ad.campaign_name,
          status: ad.status,
          placement_type: ad.placement_type
        }
      });

    } catch (error) {
      console.error('Error creating advertisement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create advertisement',
        error: error.message
      });
    }
  }

  /**
   * Get advertisements for display
   * GET /api/ads/serve
   */
  static async serve(req, res) {
    try {
      const { 
        placement = 'sidebar',
        limit = 5
      } = req.query;

      // Use current WIB time for ads comparison (convert to UTC for database comparison)
      const nowWIB = new Date(Date.now() + (7 * 60 * 60 * 1000));
      const nowUTC = new Date();
      // console.log(`🎯 AdsController: Serving ads for placement "${placement}" at ${nowWIB.toISOString()} WIB (UTC: ${nowUTC.toISOString()})`);

      // Get active ads for the placement (database stores in UTC, so compare with UTC)
      const ads = await Advertisement.findAll({
        where: {
          placement_type: placement,
          status: 'active',
          start_date: { [Op.lte]: nowUTC },
          end_date: { [Op.gte]: nowUTC }
        },
        include: [{
          model: User,
          as: 'advertiser',
          attributes: ['display_name']
        }],
        limit: parseInt(limit),
        order: [
          // Prioritize by budget (if available), then by creation date
          ['budget', 'DESC'],
          ['created_at', 'ASC']
        ]
      });

      // Debug: Log all ads for this placement regardless of date/status
      const allAdsForPlacement = await Advertisement.findAll({
        where: {
          placement_type: placement
        },
        attributes: ['id', 'campaign_name', 'status', 'start_date', 'end_date', 'placement_type', 'media_type']
      });
      
      // console.log(`🎯 AdsController: Found ${allAdsForPlacement.length} total ads for placement "${placement}":`,
      
      // console.log(`🎯 AdsController: After date/status filtering: ${ads.length} ads for "${placement}"`);

      // Increment impressions
      if (ads.length > 0) {
        const adIds = ads.map(ad => ad.id);
        await Advertisement.increment('impressions', {
          where: {
            id: { [Op.in]: adIds }
          }
        });
      }

      // Global rotation settings (in seconds)
      const GLOBAL_ROTATION_SETTINGS = {
        'hero-banner': 3,
        'header': 5,
        'mid-content': 5,
        'bottom-content': 5,
        'popup': 5,
        'sidebar': 10,
        'regular': 10,
        'article-top': 10,
        'article-mid': 10,
        'article-bottom': 10,
        'article-final': 10,
        'article-ads': 10,
        'breaking-pre': 10,
        'breaking-post': 10
      };

      // Calculate current rotation based on time and rotation durations
      const getRotationIndex = (ads) => {
        if (ads.length <= 1) return 0;
        
        // Check if all ads use global settings
        const allUseGlobalSettings = ads.every(ad => ad.rotation_mode === 'global' || !ad.rotation_duration);
        
        if (allUseGlobalSettings) {
          // Use global rotation timing (faster rotation in seconds)
          const globalDuration = GLOBAL_ROTATION_SETTINGS[placement] || 10;
          const currentTime = Math.floor(Date.now() / 1000); // seconds
          const cyclePosition = Math.floor(currentTime / globalDuration) % ads.length;
          return cyclePosition;
        }
        
        // Mixed mode: some manual, some global - use individual rotation durations (minutes)
        const getAdDuration = (ad) => {
          if (ad.rotation_mode === 'manual' && ad.rotation_duration) {
            return ad.rotation_duration; // minutes
          }
          // Convert global seconds to minutes for consistency
          const globalSeconds = GLOBAL_ROTATION_SETTINGS[placement] || 10;
          return Math.max(1, Math.round(globalSeconds / 60)); // minimum 1 minute
        };
        
        const totalCycleTime = ads.reduce((sum, ad) => sum + getAdDuration(ad), 0);
        const currentTime = Math.floor(Date.now() / (1000 * 60)); // minutes
        const cyclePosition = currentTime % totalCycleTime;
        
        // Find which ad should be showing based on cycle position
        let timeAccumulator = 0;
        for (let i = 0; i < ads.length; i++) {
          timeAccumulator += getAdDuration(ads[i]);
          if (cyclePosition < timeAccumulator) {
            return i;
          }
        }
        return 0; // fallback
      };

      // Sort ads by rotation timing and get current active ad
      const rotationIndex = getRotationIndex(ads);
      const currentAd = ads[rotationIndex];
      
      // Enhanced logging for hybrid rotation
      const rotationMode = ads.every(ad => ad.rotation_mode === 'global' || !ad.rotation_duration) ? 'global' : 'mixed';
      const currentAdMode = currentAd?.rotation_mode || 'global';
      const currentAdDuration = currentAd?.rotation_duration || GLOBAL_ROTATION_SETTINGS[placement];
      
      // console.log(`🎯 AdsController: Rotation (${rotationMode}) - showing ad ${rotationIndex + 1}/${ads.length}: "${currentAd?.campaign_name}" (${currentAdMode} mode, ${currentAdDuration}${currentAdMode === 'global' ? 's' : 'min'})`);

      const formattedAds = ads.length > 0 ? [{
        id: currentAd.id,
        campaign_name: currentAd.campaign_name,
        media_type: currentAd.media_type,
        media_url: currentAd.media_url || currentAd.image_url,
        image_url: currentAd.image_url,
        target_url: currentAd.target_url,
        ad_content: currentAd.ad_content,
        google_ads_code: currentAd.google_ads_code,
        placement_type: currentAd.placement_type,
        advertiser: currentAd.advertiser?.display_name,
        start_date: currentAd.start_date,
        end_date: currentAd.end_date,
        status: currentAd.status,
        impressions: currentAd.impressions,
        clicks: currentAd.clicks,
        rotation_mode: currentAd.rotation_mode,
        rotation_duration: currentAd.rotation_duration,
        // Debug info for rotation
        rotation_info: {
          current_index: rotationIndex,
          total_ads: ads.length,
          rotation_mode: rotationMode,
          global_setting: GLOBAL_ROTATION_SETTINGS[placement],
          current_ad_mode: currentAdMode,
          current_ad_duration: currentAdDuration,
          duration_unit: currentAdMode === 'global' ? 'seconds' : 'minutes'
        }
      }] : [];

      res.json({
        success: true,
        data: {
          placement,
          ads: formattedAds
        }
      });

    } catch (error) {
      console.error('Error serving advertisements:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to serve advertisements',
        error: error.message
      });
    }
  }

  /**
   * Track ad click
   * POST /api/ads/:id/click
   */
  static async trackClick(req, res) {
    try {
      const { id } = req.params;

      const ad = await Advertisement.findByPk(id);
      if (!ad) {
        return res.status(404).json({
          success: false,
          message: 'Advertisement not found'
        });
      }

      // Increment clicks
      await ad.increment('clicks');

      res.json({
        success: true,
        message: 'Click tracked successfully',
        redirect_url: ad.target_url
      });

    } catch (error) {
      console.error('Error tracking ad click:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to track click',
        error: error.message
      });
    }
  }

  /**
   * Get all advertisements (admin)
   * GET /api/ads
   */
  static async getAll(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status = null,
        advertiser_id = null
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      if (status) {
        whereClause.status = status;
      }

      if (advertiser_id) {
        whereClause.advertiser_id = advertiser_id;
      }

      const result = await Advertisement.findAndCountAll({
        where: whereClause,
        include: [{
          model: User,
          as: 'advertiser',
          attributes: ['ID', 'display_name', 'user_email']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      const formattedAds = result.rows.map(ad => ({
        id: ad.id,
        campaign_name: ad.campaign_name,
        media_type: ad.media_type,
        media_url: ad.media_url || ad.image_url,
        image_url: ad.image_url,
        target_url: ad.target_url,
        ad_content: ad.ad_content,
        google_ads_code: ad.google_ads_code,
        placement_type: ad.placement_type,
        advertiser: ad.advertiser?.display_name,
        start_date: ad.start_date,
        end_date: ad.end_date,
        budget: ad.budget,
        status: ad.status,
        clicks: ad.clicks || 0,
        impressions: ad.impressions || 0,
        ctr: ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00',
        created_at: ad.created_at
      }));

      res.json({
        success: true,
        data: {
          ads: formattedAds,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(result.count / limit),
            totalItems: result.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Error fetching advertisements:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch advertisements',
        error: error.message
      });
    }
  }

  /**
   * Get single advertisement
   * GET /api/ads/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const ad = await Advertisement.findByPk(id, {
        include: [{
          model: User,
          as: 'advertiser',
          attributes: ['ID', 'display_name', 'user_email']
        }]
      });

      if (!ad) {
        return res.status(404).json({
          success: false,
          message: 'Advertisement not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: ad.id,
          campaign_name: ad.campaign_name,
          advertiser: ad.advertiser,
          start_date: ad.start_date,
          end_date: ad.end_date,
          budget: ad.budget,
          placement_type: ad.placement_type,
          image_url: ad.image_url,
          target_url: ad.target_url,
          ad_content: ad.ad_content,
          payment_proof_url: ad.payment_proof_url,
          status: ad.status,
          clicks: ad.clicks,
          impressions: ad.impressions,
          ctr: ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : 0,
          created_at: ad.created_at,
          updated_at: ad.updated_at
        }
      });

    } catch (error) {
      console.error('Error fetching advertisement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch advertisement',
        error: error.message
      });
    }
  }

  /**
   * Update advertisement
   * PUT /api/ads/:id
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const ad = await Advertisement.findByPk(id);
      if (!ad) {
        return res.status(404).json({
          success: false,
          message: 'Advertisement not found'
        });
      }

      // Update advertisement
      await ad.update(updateData);

      res.json({
        success: true,
        message: 'Advertisement updated successfully',
        data: {
          id: ad.id,
          campaign_name: ad.campaign_name,
          status: ad.status
        }
      });

    } catch (error) {
      console.error('Error updating advertisement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update advertisement',
        error: error.message
      });
    }
  }

  /**
   * Delete advertisement
   * DELETE /api/ads/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const ad = await Advertisement.findByPk(id);
      if (!ad) {
        return res.status(404).json({
          success: false,
          message: 'Advertisement not found'
        });
      }

      await ad.destroy();

      res.json({
        success: true,
        message: 'Advertisement deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting advertisement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete advertisement',
        error: error.message
      });
    }
  }

  /**
   * Get advertisement statistics
   * GET /api/ads/stats
   */
  static async getStats(req, res) {
    try {
      const stats = await Promise.all([
        Advertisement.count({ where: { status: 'active' } }),
        Advertisement.count({ where: { status: 'pending' } }),
        Advertisement.count({ where: { status: 'finished' } }),
        Advertisement.sum('impressions'),
        Advertisement.sum('clicks')
      ]);

      const totalImpressions = stats[3] || 0;
      const totalClicks = stats[4] || 0;
      const overallCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;

      res.json({
        success: true,
        data: {
          active_campaigns: stats[0],
          pending_campaigns: stats[1],
          finished_campaigns: stats[2],
          total_impressions: totalImpressions,
          total_clicks: totalClicks,
          overall_ctr: parseFloat(overallCTR)
        }
      });

    } catch (error) {
      console.error('Error fetching advertisement stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch advertisement statistics',
        error: error.message
      });
    }
  }

  /**
   * Update advertisement status (admin only)
   * PATCH /api/ads/:id/status
   */
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const validStatuses = ['pending', 'active', 'paused', 'finished', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const ad = await Advertisement.findByPk(id);
      if (!ad) {
        return res.status(404).json({
          success: false,
          message: 'Advertisement not found'
        });
      }

      await ad.update({ status });

      res.json({
        success: true,
        message: `Advertisement status updated to ${status}`,
        data: {
          id: ad.id,
          status: ad.status
        }
      });

    } catch (error) {
      console.error('Error updating advertisement status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update advertisement status',
        error: error.message
      });
    }
  }

  /**
   * Upload advertisement image
   * POST /api/ads/upload
   */
  static async uploadImage(req, res) {
    try {
      const multer = require('multer');
      const path = require('path');
      const fs = require('fs');

      // Configure multer for ad images
      const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          const uploadPath = path.join(__dirname, '../../../public/ads');
          // Ensure directory exists
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: function (req, file, cb) {
          // Generate unique filename with timestamp
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const ext = path.extname(file.originalname);
          cb(null, 'ad-' + uniqueSuffix + ext);
        }
      });

      const fileFilter = (req, file, cb) => {
        // Allow image, gif and video files
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image, gif and video files are allowed'), false);
        }
      };

      const upload = multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: {
          fileSize: 50 * 1024 * 1024 // 50MB limit
        }
      }).single('adImage');

      upload(req, res, function (err) {
        if (err) {
          console.error('📸 Upload error:', err);
          let message = err.message || 'Upload failed';
          if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File too large. Maximum size is 50MB';
          }
          return res.status(400).json({
            success: false,
            message: message
          });
        }

        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: 'No file provided'
          });
        }

        // Generate the URL path for the uploaded image
        const imageUrl = `/ads/${req.file.filename}`;
        // Force HTTPS for production (naramakna.id always uses HTTPS)
        const protocol = 'https';
        const fullUrl = `${protocol}://${req.get('host')}${imageUrl}`;

        console.log('📸 Ad image uploaded:', {
          filename: req.file.filename,
          path: req.file.path,
          url: fullUrl
        });

        res.json({
          success: true,
          message: 'Image uploaded successfully',
          data: {
            filename: req.file.filename,
            imageUrl: imageUrl,
            fullUrl: fullUrl,
            size: req.file.size
          }
        });
      });

    } catch (error) {
      console.error('📸 Upload controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  /**
   * Get active popup advertisement for homepage
   * GET /api/ads/popup-active
   */
  static async getActivePopupAd(req, res) {
    try {
      // console.log('🎯 Getting active popup ad for homepage');

      // Use current WIB time for ads comparison (convert to UTC for database comparison)
      const nowWIB = new Date(Date.now() + (7 * 60 * 60 * 1000));
      const nowUTC = new Date();
      
      // Find active popup ads that are within date range (database stores in UTC)
      const popupAd = await Advertisement.findOne({
        where: {
          status: 'active',
          placement_type: 'popup',
          start_date: { [Op.lte]: nowUTC },
          end_date: { [Op.gte]: nowUTC }
        },
        include: [{
          model: User,
          as: 'advertiser',
          attributes: ['ID', 'display_name', 'user_login']
        }],
        order: [['created_at', 'DESC']], // Get most recent if multiple
        attributes: [
          'id', 'campaign_name', 'media_url', 'image_url', 'target_url',
          'start_date', 'end_date', 'status', 'placement_type'
        ]
      });

      if (!popupAd) {
        return res.json({
          success: true,
          message: 'No active popup ad found',
          data: null
        });
      }

      // Use media_url if available, fallback to image_url for legacy support
      const imageUrl = popupAd.media_url || popupAd.image_url;

      const responseData = {
        id: popupAd.id,
        title: popupAd.campaign_name,
        image_url: imageUrl,
        target_url: popupAd.target_url || '#',
        status: popupAd.status,
        start_date: popupAd.start_date,
        end_date: popupAd.end_date
      };

      // console.log('🎯 Found popup ad:', responseData.title);

      res.json({
        success: true,
        message: 'Active popup ad retrieved',
        data: responseData
      });

    } catch (error) {
      console.error('❌ Error getting popup ad:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get popup ad',
        error: error.message
      });
    }
  }
}

module.exports = {
  create: AdsController.create,
  serve: AdsController.serve,
  trackClick: AdsController.trackClick,
  getAll: AdsController.getAll,
  getById: AdsController.getById,
  update: AdsController.update,
  updateStatus: AdsController.updateStatus,
  delete: AdsController.delete,
  getStats: AdsController.getStats,
  uploadImage: AdsController.uploadImage,
  getActivePopupAd: AdsController.getActivePopupAd
};