const { Post, User, PostMeta } = require('../models');
const sequelize = require('../config/database');
const { QueryTypes, Op } = require('sequelize');

class SchedulerController {
  // Get all scheduled posts
  static async getScheduledPosts(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {
        post_type: 'post',
        scheduled_publish_date: {
          [Op.not]: null
        }
      };

      // If no specific status is requested, default to only show non-published posts
      if (status) {
        whereClause.post_status = status;
      } else {
        // Only show scheduled posts that haven't been published yet
        whereClause.post_status = {
          [Op.in]: ['scheduled', 'future', 'draft']
        };
      }

      // OPTIMIZED: Single query with subquery (MySQL compatible - no LATERAL)
      const postsRaw = await sequelize.query(
        `SELECT
          p.*,
          u.display_name as author_display_name,
          u.user_login as author_user_login,
          sl.id as schedule_log_id,
          sl.scheduled_by,
          sl.action_type,
          sl.scheduled_date,
          sl.created_at as schedule_created_at,
          sl.created_at as schedule_updated_at,
          u2.display_name as scheduled_by_name
        FROM posts p
        LEFT JOIN users u ON p.post_author = u.ID
        LEFT JOIN (
          SELECT psl.*
          FROM post_schedule_log psl
          INNER JOIN (
            SELECT post_id, MAX(created_at) as max_created
            FROM post_schedule_log
            GROUP BY post_id
          ) latest ON psl.post_id = latest.post_id AND psl.created_at = latest.max_created
        ) sl ON sl.post_id = p.ID
        LEFT JOIN users u2 ON sl.scheduled_by = u2.ID
        WHERE p.post_type = 'post'
          AND p.scheduled_publish_date IS NOT NULL
          AND p.deleted_at IS NULL
          ${status ? 'AND p.post_status = :status' : 'AND p.post_status IN ("scheduled", "future", "draft")'}
        ORDER BY p.scheduled_publish_date ASC
        LIMIT :limit OFFSET :offset`,
        {
          replacements: {
            status: status || null,
            limit: parseInt(limit),
            offset: parseInt(offset)
          },
          type: QueryTypes.SELECT
        }
      );

      // Get total count for pagination
      const countResult = await sequelize.query(
        `SELECT COUNT(*) as total FROM posts p
        WHERE p.post_type = 'post'
          AND p.scheduled_publish_date IS NOT NULL
          AND p.deleted_at IS NULL
          ${status ? 'AND p.post_status = :status' : 'AND p.post_status IN ("scheduled", "future", "draft")'}`,
        {
          replacements: { status: status || null },
          type: QueryTypes.SELECT
        }
      );

      // Transform results to match original format
      const postsWithScheduleInfo = postsRaw.map(row => {
        const post = { ...row };

        // Extract author info
        const author = row.author_display_name ? {
          ID: row.post_author,
          display_name: row.author_display_name,
          user_login: row.author_user_login
        } : null;

        // Extract schedule info
        const schedule_info = row.schedule_log_id ? {
          id: row.schedule_log_id,
          scheduled_by: row.scheduled_by,
          original_status: row.original_status,
          scheduled_date: row.scheduled_date,
          created_at: row.schedule_created_at,
          updated_at: row.schedule_updated_at,
          scheduled_by_name: row.scheduled_by_name
        } : null;

        // Clean up temporary fields
        delete post.author_display_name;
        delete post.author_user_login;
        delete post.schedule_log_id;
        delete post.scheduled_by;
        delete post.original_status;
        delete post.scheduled_date;
        delete post.schedule_created_at;
        delete post.schedule_updated_at;
        delete post.scheduled_by_name;

        return {
          ...post,
          author,
          schedule_info
        };
      });

      const totalCount = countResult[0].total;

      res.json({
        success: true,
        data: {
          posts: postsWithScheduleInfo,
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error('Error getting scheduled posts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get scheduled posts',
        error: error.message
      });
    }
  }

  // Schedule a post
  static async schedulePost(req, res) {
    try {
      const { postId } = req.params;
      const { scheduledDate, notes } = req.body;
      const scheduledBy = req.user.ID;

      // Validate scheduled date
      const scheduleDateTime = new Date(scheduledDate);
      if (scheduleDateTime <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Scheduled date must be in the future'
        });
      }

      // Check if post exists and user has permission
      const post = await Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      // Allow admin and superadmin to schedule posts
      if (!['admin', 'superadmin'].includes(req.user.user_role)) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied. Only admin and superadmin can schedule posts'
        });
      }

      // Update post with schedule info
      const originalStatus = post.post_status;
      await post.update({
        scheduled_publish_date: scheduleDateTime,
        scheduled_by: scheduledBy,
        scheduling_notes: notes,
        post_status: 'scheduled',
        original_status: originalStatus
      });

      // Log the scheduling action
      await sequelize.query(
        `INSERT INTO post_schedule_log 
         (post_id, action_type, scheduled_date, scheduled_by, notes) 
         VALUES (:postId, 'scheduled', :scheduledDate, :scheduledBy, :notes)`,
        {
          replacements: {
            postId,
            scheduledDate: scheduleDateTime,
            scheduledBy,
            notes: notes || null
          }
        }
      );

      res.json({
        success: true,
        message: 'Post scheduled successfully',
        data: {
          post_id: postId,
          scheduled_date: scheduleDateTime,
          original_status: originalStatus
        }
      });
    } catch (error) {
      console.error('Error scheduling post:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to schedule post',
        error: error.message
      });
    }
  }

  // Reschedule a post
  static async reschedulePost(req, res) {
    try {
      const { postId } = req.params;
      const { scheduledDate, notes } = req.body;
      const scheduledBy = req.user.ID;

      const post = await Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      if (!['admin', 'superadmin'].includes(req.user.user_role)) {
        return res.status(403).json({
          success: false,
          message: 'Only admin and superadmin can reschedule posts'
        });
      }

      const newScheduleDateTime = new Date(scheduledDate);
      if (newScheduleDateTime <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Scheduled date must be in the future'
        });
      }

      const previousScheduledDate = post.scheduled_publish_date;

      // Update post schedule
      await post.update({
        scheduled_publish_date: newScheduleDateTime,
        scheduled_by: scheduledBy,
        scheduling_notes: notes
      });

      // Log the rescheduling action
      await sequelize.query(
        `INSERT INTO post_schedule_log 
         (post_id, action_type, scheduled_date, previous_scheduled_date, scheduled_by, notes) 
         VALUES (:postId, 'rescheduled', :scheduledDate, :previousScheduledDate, :scheduledBy, :notes)`,
        {
          replacements: {
            postId,
            scheduledDate: newScheduleDateTime,
            previousScheduledDate,
            scheduledBy,
            notes: notes || null
          }
        }
      );

      res.json({
        success: true,
        message: 'Post rescheduled successfully',
        data: {
          post_id: postId,
          new_scheduled_date: newScheduleDateTime,
          previous_scheduled_date: previousScheduledDate
        }
      });
    } catch (error) {
      console.error('Error rescheduling post:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reschedule post',
        error: error.message
      });
    }
  }

  // Cancel scheduled post
  static async cancelSchedule(req, res) {
    try {
      const { postId } = req.params;
      const { notes } = req.body;
      const scheduledBy = req.user.ID;

      const post = await Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      if (!['admin', 'superadmin'].includes(req.user.user_role)) {
        return res.status(403).json({
          success: false,
          message: 'Only admin and superadmin can cancel scheduled posts'
        });
      }

      const originalScheduledDate = post.scheduled_publish_date;
      const originalStatus = post.original_status || 'draft';

      // Reset post to original status
      await post.update({
        scheduled_publish_date: null,
        scheduled_by: null,
        scheduling_notes: null,
        post_status: originalStatus,
        original_status: null
      });

      // Log the cancellation
      await sequelize.query(
        `INSERT INTO post_schedule_log 
         (post_id, action_type, previous_scheduled_date, scheduled_by, notes) 
         VALUES (:postId, 'cancelled', :previousScheduledDate, :scheduledBy, :notes)`,
        {
          replacements: {
            postId,
            previousScheduledDate: originalScheduledDate,
            scheduledBy,
            notes: notes || null
          }
        }
      );

      res.json({
        success: true,
        message: 'Post schedule cancelled successfully',
        data: {
          post_id: postId,
          restored_status: originalStatus,
          cancelled_scheduled_date: originalScheduledDate
        }
      });
    } catch (error) {
      console.error('Error cancelling schedule:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel schedule',
        error: error.message
      });
    }
  }

  // Get posts that can be scheduled (drafts, pending)
  static async getSchedulablePosts(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {
        post_type: 'post',
        post_status: status ? [status] : ['draft', 'pending'],
        scheduled_publish_date: null // Not already scheduled
      };

      const posts = await Post.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['ID', 'display_name', 'user_login']
          }
        ],
        order: [['post_date', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          posts: posts.rows,
          total: posts.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(posts.count / limit)
        }
      });
    } catch (error) {
      console.error('Error getting schedulable posts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get schedulable posts',
        error: error.message
      });
    }
  }

  // Get schedule history for a post
  static async getScheduleHistory(req, res) {
    try {
      const { postId } = req.params;

      const history = await sequelize.query(
        `SELECT sl.*, u.display_name as scheduled_by_name 
         FROM post_schedule_log sl 
         JOIN users u ON sl.scheduled_by = u.ID 
         WHERE sl.post_id = :postId 
         ORDER BY sl.created_at DESC`,
        {
          replacements: { postId },
          type: QueryTypes.SELECT
        }
      );

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Error getting schedule history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get schedule history',
        error: error.message
      });
    }
  }

  // Shared transactional publisher used by Docker, BullMQ, and manual checks.
  static async publishScheduledPosts(req, res) {
    try {
      const { createScheduledPublisher } = require('../services/scheduledPublisher');
      const publish = createScheduledPublisher({ sequelize, Post, PostMeta });
      const result = await publish();
      if (result.published.length) {
        const cacheService = require('../services/cacheService');
        if (cacheService.isConnected) {
          const { invalidatePublishedContent } = require('../services/publishCache');
          await invalidatePublishedContent(cacheService.client);
        }
      }
      if (result.errors.length) {
        const error = new Error(`${result.errors.length} posts failed to publish`);
        error.result = result;
        throw error;
      }
      if (req && res) {
        return res.json({
          success: true,
          message: `Published ${result.published.length} scheduled posts`,
          data: result.published
        });
      }
      return result.published;
    } catch (error) {
      console.error('Error publishing scheduled posts:', error);
      if (req && res) {
        return res.status(500).json({
          success: false, message: 'Failed to publish scheduled posts',
          error: error.message, data: error.result?.published || []
        });
      }
      throw error;
    }
  }

  // Force publish a specific scheduled post immediately
  static async forcePublishPost(req, res) {
    try {
      const { postId } = req.params;
      const forcedBy = req.user.ID;

      // Find the scheduled post
      const post = await Post.findByPk(postId);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      // Check if post is scheduled
      if (post.post_status !== 'scheduled') {
        return res.status(400).json({
          success: false,
          message: 'Post is not scheduled for publishing'
        });
      }

      // Only admin/superadmin can force publish
      if (!['admin', 'superadmin'].includes(req.user.user_role)) {
        return res.status(403).json({
          success: false,
          message: 'Only admin and superadmin can force publish posts'
        });
      }

      const now = new Date();

      // Check if post has featured image metadata before force publishing
      const featuredImageMeta = await PostMeta.findOne({
        where: {
          post_id: postId,
          meta_key: '_thumbnail_id'
        }
      });

      // Update post status to published
      await post.update({
        post_status: 'publish',
        post_date: now,
        post_date_gmt: now,
        scheduled_publish_date: null,
        original_status: null
      });

      // Log featured image preservation if exists
      if (featuredImageMeta) {
        console.log(`🖼️ Featured image preserved for force published post ${postId}: ${featuredImageMeta.meta_value}`);
      }

      // Preserve image captions from Quill editor for force published posts
      const imageCaptionsMeta = await PostMeta.findOne({
        where: {
          post_id: postId,
          meta_key: '_image_captions'
        }
      });

      if (imageCaptionsMeta && imageCaptionsMeta.meta_value) {
        try {
          const imageCaptions = JSON.parse(imageCaptionsMeta.meta_value);
          console.log(`📸 Image captions preserved for force published post ${postId}:`, Object.keys(imageCaptions).length, 'images');
        } catch (error) {
          console.warn(`⚠️ Failed to parse image captions for force published post ${postId}:`, error);
        }
      }

      // Log the force publishing action
      await sequelize.query(
        `INSERT INTO post_schedule_log 
         (post_id, action_type, scheduled_by, notes) 
         VALUES (:postId, 'published', :scheduledBy, 'Force published by admin')`,
        {
          replacements: {
            postId: postId,
            scheduledBy: forcedBy
          }
        }
      );

      const wibTime = now.toLocaleString('id-ID', { 
        timeZone: 'Asia/Jakarta',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });

      console.log(`🚀 Force published post "${post.post_title}" (ID: ${postId}) by ${req.user.user_login} at ${wibTime}`);

      res.json({
        success: true,
        message: 'Post force published successfully',
        data: {
          post_id: postId,
          post_title: post.post_title,
          published_at: now,
          forced_by: req.user.user_login
        }
      });
    } catch (error) {
      console.error('Error force publishing post:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to force publish post',
        error: error.message
      });
    }
  }
}

module.exports = SchedulerController;
