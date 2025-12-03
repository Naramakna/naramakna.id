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
      if (!advertiser_id || !campaign_name || !start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: advertiser_id, campaign_name, start_date, end_date'
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

      // Create advertisement
      const ad = await Advertisement.create({
        advertiser_id,
        campaign_name,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
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

      const now = new Date();

      // Get active ads for the placement
      const ads = await Advertisement.findAll({
        where: {
          placement_type: placement,
          status: 'active',
          start_date: { [Op.lte]: now },
          end_date: { [Op.gte]: now }
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

      // Increment impressions
      if (ads.length > 0) {
        const adIds = ads.map(ad => ad.id);
        await Advertisement.increment('impressions', {
          where: {
            id: { [Op.in]: adIds }
          }
        });
      }

      const formattedAds = ads.map(ad => ({
        id: ad.id,
        campaign_name: ad.campaign_name,
        media_type: ad.media_type,
        media_url: ad.media_url || ad.image_url, // Prefer media_url, fallback to image_url
        image_url: ad.image_url, // Legacy support
        target_url: ad.target_url,
        ad_content: ad.ad_content,
        google_ads_code: ad.google_ads_code,
        placement_type: ad.placement_type,
        advertiser: ad.advertiser?.display_name,
        start_date: ad.start_date,
        end_date: ad.end_date,
        status: ad.status, // Include status for frontend filtering
        impressions: ad.impressions,
        clicks: ad.clicks
      }));

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
  getStats: AdsController.getStats
};