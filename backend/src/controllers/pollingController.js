const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

class PollingController {
  /**
   * Get trending posts that are candidates for polling
   * GET /api/polling/trending-candidates
   */
  static async getTrendingCandidates(req, res) {
    try {
      const { limit = 10 } = req.query;

      const trendingPosts = await sequelize.query(`
        SELECT 
          ID,
          post_title,
          post_excerpt,
          view_count,
          trending_score,
          categories,
          has_poll,
          post_date
        FROM trending_posts_analysis 
        WHERE has_poll = 0
        ORDER BY trending_score DESC
        LIMIT ${parseInt(limit)}
      `, {
        type: sequelize.QueryTypes.SELECT
      });

      res.json({
        success: true,
        data: {
          candidates: trendingPosts,
          total: trendingPosts.length
        }
      });

    } catch (error) {
      console.error('Error getting trending candidates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get trending candidates',
        error: error.message
      });
    }
  }

  /**
   * Generate polling question from article using templates
   * POST /api/polling/generate
   */
  static async generatePolling(req, res) {
    try {
      const { article_id, template_id, custom_question, custom_options } = req.body;

      // Get article details
      const article = await sequelize.query(`
        SELECT ID, post_title, post_excerpt, post_content, view_count
        FROM posts 
        WHERE ID = ? AND post_status = 'publish'
      `, {
        replacements: [article_id],
        type: sequelize.QueryTypes.SELECT
      });

      if (!article.length) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      const articleData = article[0];

      let question, options;

      if (custom_question && custom_options) {
        // Manual custom polling
        question = custom_question;
        options = custom_options;
      } else if (template_id) {
        // Template-based generation
        const template = await sequelize.query(`
          SELECT question_template, options_template 
          FROM poll_templates 
          WHERE id = ? AND is_active = TRUE
        `, {
          replacements: [template_id],
          type: sequelize.QueryTypes.SELECT
        });

        if (!template.length) {
          return res.status(404).json({
            success: false,
            message: 'Template not found'
          });
        }

        // Extract key entities from article title for template variables
        const entities = PollingController.extractEntities(articleData.post_title);
        
        question = PollingController.applyTemplate(template[0].question_template, entities);
        options = JSON.parse(template[0].options_template);
      } else {
        // Auto-generate using smart templates
        const smartPoll = await PollingController.generateSmartPoll(articleData);
        question = smartPoll.question;
        options = smartPoll.options;
      }

      res.json({
        success: true,
        data: {
          article: {
            id: articleData.ID,
            title: articleData.post_title,
            excerpt: articleData.post_excerpt
          },
          generated_poll: {
            question,
            options,
            estimated_engagement: Math.floor(articleData.view_count * 0.05) // 5% vote rate
          }
        }
      });

    } catch (error) {
      console.error('Error generating polling:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate polling',
        error: error.message
      });
    }
  }

  /**
   * Create new poll
   * POST /api/polling/create
   */
  static async createPoll(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { 
        source_article_id, 
        title, 
        question, 
        options, 
        category, 
        source_channel,
        expires_in_days = 7,
        created_by 
      } = req.body;

      // Validate required fields
      if (!title || !question || !options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields or invalid options'
        });
      }

      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expires_in_days);

      // Create poll
      const poll = await sequelize.query(`
        INSERT INTO polls (
          source_article_id, title, question, category, source_channel, 
          expires_at, created_by, generation_method
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'template')
      `, {
        replacements: [
          source_article_id, title, question, category, source_channel,
          expiresAt, created_by
        ],
        transaction
      });

      const pollId = poll[0].insertId;

      // Create poll options
      for (let i = 0; i < options.length; i++) {
        await sequelize.query(`
          INSERT INTO poll_options (poll_id, option_text, option_order)
          VALUES (?, ?, ?)
        `, {
          replacements: [pollId, options[i], i],
          transaction
        });
      }

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: 'Poll created successfully',
        data: {
          poll_id: pollId,
          title,
          question,
          options,
          expires_at: expiresAt
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error creating poll:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create poll',
        error: error.message
      });
    }
  }

  /**
   * Get active polls for frontend
   * GET /api/polling/active
   */
  static async getActivePolls(req, res) {
    try {
      const { limit = 10, offset = 0 } = req.query;

      const polls = await sequelize.query(`
        SELECT 
          p.id,
          p.title,
          p.question,
          p.source_channel,
          p.total_votes,
          p.view_count,
          p.created_at,
          p.expires_at,
          DATEDIFF(p.expires_at, NOW()) as days_left,
          DATE_FORMAT(p.created_at, '%d %b %Y') as formatted_date,
          DATE_FORMAT(p.created_at, '%e hari') as time_ago,
          
          -- Get options with vote percentages
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', po.id,
              'text', po.option_text,
              'vote_count', po.vote_count,
              'percentage', po.percentage
            ) ORDER BY po.option_order
          ) as options
          
        FROM polls p
        LEFT JOIN poll_options po ON p.id = po.poll_id
        WHERE p.status = 'active' 
        AND (p.expires_at IS NULL OR p.expires_at > NOW())
        GROUP BY p.id
        ORDER BY p.trending_score DESC, p.created_at DESC
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `, {
        type: sequelize.QueryTypes.SELECT
      });

      // Format data for frontend compatibility
      const formattedPolls = polls.map(poll => ({
        id: poll.id.toString(),
        title: poll.title,
        source: poll.source_channel || 'naramaknaBISNIS',
        timeAgo: poll.time_ago,
        options: poll.options.map(opt => ({
          id: `${poll.id}-${opt.id}`,
          text: opt.text,
          percentage: parseFloat(opt.percentage) || 0
        })),
        totalVotes: poll.total_votes,
        daysLeft: Math.max(poll.days_left, 0),
        date: poll.formatted_date
      }));

      res.json({
        success: true,
        data: {
          polls: formattedPolls,
          total: formattedPolls.length
        }
      });

    } catch (error) {
      console.error('Error getting active polls:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get active polls',
        error: error.message
      });
    }
  }

  /**
   * Vote on a poll
   * POST /api/polling/vote
   */
  static async vote(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { poll_id, option_id, user_id } = req.body;
      const ip_address = req.ip || req.connection.remoteAddress;
      const user_agent = req.headers['user-agent'];

      // Check if poll exists and is active
      const poll = await sequelize.query(`
        SELECT id, status, expires_at FROM polls 
        WHERE id = ? AND status = 'active'
        AND (expires_at IS NULL OR expires_at > NOW())
      `, {
        replacements: [poll_id],
        type: sequelize.QueryTypes.SELECT,
        transaction
      });

      if (!poll.length) {
        return res.status(404).json({
          success: false,
          message: 'Poll not found or expired'
        });
      }

      // Check for duplicate vote
      const existingVote = await sequelize.query(`
        SELECT id FROM poll_votes 
        WHERE poll_id = ? AND (user_id = ? OR ip_address = ?)
      `, {
        replacements: [poll_id, user_id, ip_address],
        type: sequelize.QueryTypes.SELECT,
        transaction
      });

      if (existingVote.length) {
        return res.status(400).json({
          success: false,
          message: 'You have already voted on this poll'
        });
      }

      // Record vote
      await sequelize.query(`
        INSERT INTO poll_votes (poll_id, option_id, user_id, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?)
      `, {
        replacements: [poll_id, option_id, user_id, ip_address, user_agent],
        transaction
      });

      // Update option vote count
      await sequelize.query(`
        UPDATE poll_options 
        SET vote_count = vote_count + 1
        WHERE id = ?
      `, {
        replacements: [option_id],
        transaction
      });

      // Update poll total votes
      await sequelize.query(`
        UPDATE polls 
        SET total_votes = total_votes + 1
        WHERE id = ?
      `, {
        replacements: [poll_id],
        transaction
      });

      // Recalculate percentages
      await sequelize.query(`
        UPDATE poll_options po
        JOIN (
          SELECT poll_id, SUM(vote_count) as total
          FROM poll_options 
          WHERE poll_id = ?
          GROUP BY poll_id
        ) totals ON po.poll_id = totals.poll_id
        SET po.percentage = CASE 
          WHEN totals.total > 0 THEN (po.vote_count / totals.total) * 100
          ELSE 0
        END
        WHERE po.poll_id = ?
      `, {
        replacements: [poll_id, poll_id],
        transaction
      });

      await transaction.commit();

      res.json({
        success: true,
        message: 'Vote recorded successfully'
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error recording vote:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record vote',
        error: error.message
      });
    }
  }

  /**
   * Get poll templates
   * GET /api/polling/templates
   */
  static async getTemplates(req, res) {
    try {
      const { category } = req.query;

      let whereClause = 'WHERE is_active = TRUE';
      let replacements = [];

      if (category) {
        whereClause += ' AND category = ?';
        replacements.push(category);
      }

      const templates = await sequelize.query(`
        SELECT id, template_name, category, question_template, options_template,
               usage_count, success_rate, avg_engagement
        FROM poll_templates 
        ${whereClause}
        ORDER BY success_rate DESC, usage_count DESC
      `, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      });

      res.json({
        success: true,
        data: {
          templates: templates.map(t => ({
            ...t,
            options_template: JSON.parse(t.options_template)
          }))
        }
      });

    } catch (error) {
      console.error('Error getting templates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get templates',
        error: error.message
      });
    }
  }

  // Helper methods
  static extractEntities(title) {
    // Simple entity extraction - can be enhanced with NLP
    const entities = {
      topic: title,
      subject: title.split(' ').slice(0, 3).join(' '),
      decision: title.includes('kebijakan') ? title : 'keputusan ini',
      target: 'masyarakat'
    };
    return entities;
  }

  static applyTemplate(template, entities) {
    let result = template;
    Object.keys(entities).forEach(key => {
      result = result.replace(new RegExp(`{${key}}`, 'g'), entities[key]);
    });
    return result;
  }

  static async generateSmartPoll(article) {
    // Smart poll generation based on article content
    const title = article.post_title.toLowerCase();
    
    // Business/Economy keywords
    if (title.includes('ekonomi') || title.includes('bisnis') || title.includes('perusahaan')) {
      return {
        question: `Bagaimana dampak ${article.post_title} terhadap perekonomian?`,
        options: ['Positif', 'Negatif', 'Netral', 'Tidak tahu']
      };
    }
    
    // Politics/Government keywords  
    if (title.includes('pemerintah') || title.includes('kebijakan') || title.includes('politik')) {
      return {
        question: `Apakah Anda setuju dengan ${article.post_title}?`,
        options: ['Sangat setuju', 'Setuju', 'Tidak setuju', 'Sangat tidak setuju']
      };
    }
    
    // Technology keywords
    if (title.includes('teknologi') || title.includes('digital') || title.includes('ai')) {
      return {
        question: `Apakah Anda tertarik menggunakan teknologi dalam ${article.post_title}?`,
        options: ['Sangat tertarik', 'Tertarik', 'Tidak tertarik', 'Tidak tahu']
      };
    }
    
    // Default general poll
    return {
      question: `Bagaimana tanggapan Anda tentang ${article.post_title}?`,
      options: ['Sangat baik', 'Baik', 'Biasa saja', 'Kurang baik']
    };
  }
}

module.exports = PollingController;
