const { Post, User } = require('../models');
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

      if (status) {
        whereClause.post_status = status;
      }

      const posts = await Post.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['ID', 'display_name', 'user_login']
          }
        ],
        order: [['scheduled_publish_date', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Get scheduler info for each post
      const postsWithScheduleInfo = await Promise.all(
        posts.rows.map(async (post) => {
          const scheduleLog = await sequelize.query(
            `SELECT sl.*, u.display_name as scheduled_by_name 
             FROM post_schedule_log sl 
             JOIN users u ON sl.scheduled_by = u.ID 
             WHERE sl.post_id = :postId 
             ORDER BY sl.created_at DESC 
             LIMIT 1`,
            {
              replacements: { postId: post.ID },
              type: QueryTypes.SELECT
            }
          );

          return {
            ...post.toJSON(),
            schedule_info: scheduleLog[0] || null
          };
        })
      );

      res.json({
        success: true,
        data: {
          posts: postsWithScheduleInfo,
          total: posts.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(posts.count / limit)
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

      // Only admin/superadmin can schedule posts
      if (!['admin', 'superadmin'].includes(req.user.user_role)) {
        return res.status(403).json({
          success: false,
          message: 'Only admin and superadmin can schedule posts'
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

  // Publish scheduled posts (called by cron job)
  static async publishScheduledPosts(req, res) {
    try {
      const now = new Date();

      // Find posts that should be published now
      const postsToPublish = await Post.findAll({
        where: {
          post_status: 'scheduled',
          scheduled_publish_date: {
            [Op.lte]: now
          }
        }
      });

      const publishedPosts = [];

      for (const post of postsToPublish) {
        try {
          // Update post status to published
          await post.update({
            post_status: 'publish',
            post_date: now,
            post_date_gmt: now,
            scheduled_publish_date: null,
            original_status: null
          });

          // Log the publishing
          await sequelize.query(
            `INSERT INTO post_schedule_log 
             (post_id, action_type, scheduled_by, notes) 
             VALUES (:postId, 'published', :scheduledBy, 'Auto-published by scheduler')`,
            {
              replacements: {
                postId: post.ID,
                scheduledBy: post.scheduled_by
              }
            }
          );

          publishedPosts.push({
            id: post.ID,
            title: post.post_title,
            scheduled_date: post.scheduled_publish_date
          });
        } catch (error) {
          console.error(`Error publishing post ${post.ID}:`, error);
        }
      }

      if (req && res) {
        // Called via API
        res.json({
          success: true,
          message: `Published ${publishedPosts.length} scheduled posts`,
          data: publishedPosts
        });
      } else {
        // Called by cron job
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
        console.log(`📅 Scheduler: Published ${publishedPosts.length} posts at ${wibTime}`);
        if (publishedPosts.length > 0) {
          publishedPosts.forEach(post => {
            console.log(`  ✅ Published: ${post.title} (ID: ${post.id})`);
          });
        }
        return publishedPosts;
      }
    } catch (error) {
      console.error('Error publishing scheduled posts:', error);
      if (req && res) {
        res.status(500).json({
          success: false,
          message: 'Failed to publish scheduled posts',
          error: error.message
        });
      }
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

      // Update post status to published
      await post.update({
        post_status: 'publish',
        post_date: now,
        post_date_gmt: now,
        scheduled_publish_date: null,
        original_status: null
      });

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
