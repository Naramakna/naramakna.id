const { Post, PostMeta, User, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');
const path = require('path');

class WriterController {
  /**
   * Create new article
   * POST /api/writer/articles
   */
  static async createArticle(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      // console.log('🔧 Debug: Create article called');
      // console.log('🔧 Debug: Request user:', req.user?.ID, req.user?.login);
      
      const {
        title,
        content,
        description,
        summary_social,
        channel,
        topic,
        keyword,
        publish_date,
        location,
        mark_as_18_plus,
        status = 'draft',
        featured_image
      } = req.body;



      // Validate required fields - relaxed for drafts
      if (!title || !content || !channel) {
        return res.status(400).json({
          success: false,
          message: 'Title, content, and channel are required'
        });
      }
      
      // For published posts, require additional fields
      if (status === 'published' && (!description || !summary_social)) {
        return res.status(400).json({
          success: false,
          message: 'Description and summary social are required for published posts'
        });
      }

      // Generate slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);

      // For drafts, check if user already has a draft with the same title
      // If found, update instead of creating duplicate
      if (status === 'draft') {
        const existingDraft = await Post.findOne({
          where: {
            post_author: req.user.ID,
            post_title: title,
            post_status: 'draft',
            post_type: 'post'
          }
        });

        if (existingDraft) {
          // Update existing draft instead of creating new one
          console.log('🔄 Updating existing draft:', existingDraft.ID);
          
          await existingDraft.update({
            post_content: content,
            post_excerpt: description || '',
            post_modified: new Date(),
            post_date_gmt: new Date()
          });

          // Helper function to update post metadata
          const updatePostMeta = async (postId, metaKey, metaValue) => {
            await PostMeta.upsert({
              post_id: postId,
              meta_key: metaKey,
              meta_value: metaValue
            });
          };

          // Update metadata
          if (summary_social) {
            await updatePostMeta(existingDraft.ID, '_summary_social', summary_social);
          }
          if (channel) {
            await updatePostMeta(existingDraft.ID, '_channel', channel);
          }
          if (publish_date) {
            await updatePostMeta(existingDraft.ID, '_publish_date', publish_date);
          }
          if (location) {
            await updatePostMeta(existingDraft.ID, '_location', location);
          }
          if (mark_as_18_plus !== undefined) {
            await updatePostMeta(existingDraft.ID, '_mark_as_18_plus', mark_as_18_plus ? '1' : '0');
          }
          if (featured_image) {
            await updatePostMeta(existingDraft.ID, '_thumbnail_id', featured_image);
          }

          return res.status(200).json({
            success: true,
            message: 'Draft updated successfully',
            data: {
              id: existingDraft.ID,
              title: existingDraft.post_title,
              status: existingDraft.post_status,
              isUpdate: true
            }
          });
        }
      }

      // Create post
      const post = await Post.create({
        post_author: req.user.ID,
        post_date: publish_date ? new Date(publish_date) : new Date(),
        post_date_gmt: publish_date ? new Date(publish_date) : new Date(),
        post_content: content,
        post_title: title,
        post_excerpt: description,
        post_status: (() => {
          // Admin and SuperAdmin can publish directly
          if (req.user.user_role === 'admin' || req.user.user_role === 'superadmin') {
            return status === 'published' ? 'publish' : 'draft';
          }
          // Writers need approval for publishing
          return status === 'published' ? 'pending' : 'draft';
        })(), // Role-based publishing
        comment_status: 'closed',
        ping_status: 'closed',
        post_name: slug,
        post_type: 'post',
        to_ping: '', // Required field
        pinged: '', // Required field
        post_content_filtered: '', // Required field
        guid: '', // Will be updated after creation
        post_password: ''
      }, { transaction });

      // Handle featured image
      let thumbnailId = null;
      
      if (featured_image) {
        
        try {
          // Find existing attachment post for the image
          const existingAttachment = await Post.findOne({
            where: { guid: featured_image, post_type: 'attachment' }
          });

          if (existingAttachment) {
            thumbnailId = existingAttachment.ID;
          } else {
            // Create new attachment post
            const attachmentPost = await Post.create({
              post_author: req.user.ID,
              post_date: new Date(),
              post_date_gmt: new Date(),
              post_content: '',
              post_title: `Attachment for ${title}`,
              post_excerpt: '',
              post_status: 'inherit',
              comment_status: 'closed',
              ping_status: 'closed',
              post_name: '',
              post_type: 'attachment',
              to_ping: '',
              pinged: '',
              post_content_filtered: '',
              guid: featured_image,
              post_password: '',
              post_mime_type: 'image/jpeg'
            }, { transaction });
            
            thumbnailId = attachmentPost.ID;
          }
        } catch (attachmentError) {
          console.error('❌ Error handling featured image attachment:', attachmentError);
          // Continue without featured image instead of failing entire article creation
          thumbnailId = null;
        }
      }

      // Create post meta
      const metaData = [
        { post_id: post.ID, meta_key: '_aioseo_description', meta_value: description },
        { post_id: post.ID, meta_key: '_summary_social', meta_value: summary_social },
        { post_id: post.ID, meta_key: '_channel', meta_value: channel },
        { post_id: post.ID, meta_key: '_topic', meta_value: topic || '' },
        { post_id: post.ID, meta_key: '_keyword', meta_value: keyword || '' },
        { post_id: post.ID, meta_key: '_location', meta_value: location || '' },
        { post_id: post.ID, meta_key: '_mark_as_18_plus', meta_value: mark_as_18_plus ? '1' : '0' },
        { post_id: post.ID, meta_key: '_edit_last', meta_value: req.user.ID.toString() }
      ];

      // Add thumbnail ID if we have featured image
      if (thumbnailId) {
        metaData.push({ post_id: post.ID, meta_key: '_thumbnail_id', meta_value: thumbnailId.toString() });
      }

      await PostMeta.bulkCreate(metaData, { transaction });

      await transaction.commit();

      // Auto-add terms from topic, keyword, and channel (outside transaction)
      await WriterController.addTermsFromPost(post.ID, { channel, topic, keyword });

      res.status(201).json({
        success: true,
        message: 'Article created successfully',
        data: {
          id: post.ID,
          slug: post.post_name,
          status: post.post_status
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating article:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Update article
   * PUT /api/writer/articles/:id
   */
  static async updateArticle(req, res) {
    console.log('🚀 Debug: updateArticle method called for ID:', req.params.id);
    console.log('🚀 Debug: Request method:', req.method);
    console.log('🚀 Debug: User:', req.user?.ID, req.user?.user_login);
    
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      
      // console.log('🔧 Debug: Update article called for ID:', id);
      // console.log('🔧 Debug: Request user:', req.user?.ID, req.user?.login);
      const {
        title,
        content,
        description,
        summary_social,
        channel,
        topic,
        keyword,
        publish_date,
        location,
        mark_as_18_plus,
        status,
        featured_image
      } = req.body;

      // Debug log untuk featured image
      console.log('🔧 Debug Update Article - featured_image:', featured_image);

      // Find article - Admin and SuperAdmin can edit any post
      const whereClause = { 
        ID: id,
        post_type: 'post'
      };

      // Only add author restriction for regular writers
      if (req.user.user_role === 'writer') {
        whereClause.post_author = req.user.ID;
      }

      const post = await Post.findOne({
        where: whereClause
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      // Update slug if title changed
      let slug = post.post_name;
      if (title && title !== post.post_title) {
        slug = title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50);
      }

      // Determine new status based on user role and current post status
      let newStatus;
      if (req.user.user_role === 'writer') {
        // Writer logic: published posts go back to pending when edited
        if (post.post_status === 'publish') {
          newStatus = 'pending'; // Published posts edited by writer need re-approval
        } else if (status === 'published') {
          newStatus = 'pending'; // Writers can't publish directly, goes to pending
        } else {
          newStatus = post.post_status; // Keep current status (draft, pending)
        }
      } else {
        // Admin/SuperAdmin can publish directly
        if (status === 'published') {
          newStatus = 'publish';
        } else if (status === 'draft') {
          newStatus = 'draft';
        } else if (status === 'pending') {
          newStatus = 'pending';
        } else {
          // Default: keep current status unless explicitly changed
          newStatus = post.post_status;
        }
      }

      // Update post
      await post.update({
        post_title: title || post.post_title,
        post_content: content || post.post_content,
        post_excerpt: description || post.post_excerpt,
        post_name: slug,
        post_status: newStatus,
        post_date: publish_date ? new Date(publish_date) : post.post_date,
        post_modified: new Date(),
        post_modified_gmt: new Date()
      }, { transaction });

      // Handle featured image for update
      console.log('🖼️ Debug: Checking featured_image:', featured_image);
      let thumbnailId = null;
      if (featured_image) {
        console.log('🖼️ Debug: Processing featured_image:', featured_image);
        // Find or create attachment post for the image
        const existingAttachment = await Post.findOne({
          where: { guid: featured_image, post_type: 'attachment' }
        });

        if (existingAttachment) {
          thumbnailId = existingAttachment.ID;
        } else {
          // Create new attachment post
          const attachmentPost = await Post.create({
            post_author: req.user.ID,
            post_date: new Date(),
            post_date_gmt: new Date(),
            post_content: '',
            post_title: `Attachment for ${title}`,
            post_excerpt: '',
            post_status: 'inherit',
            comment_status: 'closed',
            ping_status: 'closed',
            post_name: '',
            post_type: 'attachment',
            to_ping: '',
            pinged: '',
            post_content_filtered: '',
            guid: featured_image,
            post_password: '',
            post_mime_type: 'image/jpeg'
          }, { transaction });
          
          thumbnailId = attachmentPost.ID;
        }
      }

      // Update meta data
      const metaUpdates = [
        { key: '_aioseo_description', value: description },
        { key: '_summary_social', value: summary_social },
        { key: '_channel', value: channel },
        { key: '_topic', value: topic },
        { key: '_keyword', value: keyword },
        { key: '_location', value: location },
        { key: '_mark_as_18_plus', value: mark_as_18_plus ? '1' : '0' },
        { key: '_edit_last', value: req.user.ID.toString() }
      ].filter(item => item.value !== undefined);

      // Add thumbnail ID if we have featured image
      console.log('🖼️ Debug: thumbnailId result:', thumbnailId);
      if (thumbnailId) {
        console.log('🖼️ Debug: Adding _thumbnail_id to metaUpdates:', thumbnailId);
        metaUpdates.push({ key: '_thumbnail_id', value: thumbnailId.toString() });
      }

      for (const meta of metaUpdates) {
        await PostMeta.upsert({
          post_id: post.ID,
          meta_key: meta.key,
          meta_value: meta.value || ''
        }, { transaction });
      }

      await transaction.commit();

      // Auto-add/update terms from topic, keyword, and channel (outside transaction)
      await WriterController.addTermsFromPost(post.ID, { channel, topic, keyword });

      res.status(200).json({
        success: true,
        message: 'Article updated successfully',
        data: {
          id: post.ID,
          slug: post.post_name,
          status: post.post_status
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error updating article:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Auto-save article
   * POST /api/writer/articles/:id/autosave
   */
  static async autoSaveArticle(req, res) {
    console.log('🔄 Debug: autoSaveArticle method called for ID:', req.params.id);
    console.log('🔄 Debug: autoSave body:', req.body);
    try {
      const { id } = req.params;
      const { title, content, description } = req.body;

      // Find article
      const post = await Post.findOne({
        where: { 
          ID: id,
          post_author: req.user.ID,
          post_type: 'post'
        }
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      // Update only basic fields for auto-save
      await post.update({
        post_title: title || post.post_title,
        post_content: content || post.post_content,
        post_excerpt: description || post.post_excerpt,
        post_modified: new Date(),
        post_modified_gmt: new Date()
      });

      res.status(200).json({
        success: true,
        message: 'Article auto-saved',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error auto-saving article:', error);
      res.status(500).json({
        success: false,
        message: 'Auto-save failed'
      });
    }
  }

  /**
   * Get writer's articles
   * GET /api/writer/articles
   */
  static async getMyArticles(req, res) {
    try {
      const { page = 1, limit = 10, status = 'all' } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {
        post_author: req.user.ID,
        post_type: 'post'
      };

      if (status !== 'all') {
        whereClause.post_status = status === 'published' ? 'publish' : 'draft';
      }

      const { count, rows } = await Post.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: PostMeta,
            as: 'meta'
          }
        ],
        order: [['post_modified', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.status(200).json({
        success: true,
        data: {
          articles: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get single article
   * GET /api/writer/articles/:id
   */
  static async getArticle(req, res) {
    try {
      const { id } = req.params;

      // Build where clause based on user role
      const whereClause = { 
        ID: id,
        post_type: 'post'
      };

      // Only add author restriction for regular writers
      // Admin and SuperAdmin can access any post
      if (req.user.user_role === 'writer') {
        whereClause.post_author = req.user.ID;
      }

      const post = await Post.findOne({
        where: whereClause,
        include: [
          {
            model: PostMeta,
            as: 'meta'
          }
        ]
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      // Process metadata
      const metadata = {};
      if (post.meta) {
        post.meta.forEach(meta => {
          metadata[meta.meta_key] = meta.meta_value;
        });
      }

      // Get featured image if thumbnail_id exists
      let featuredImageUrl = '';
      if (metadata._thumbnail_id) {
        const thumbnailPost = await Post.findOne({
          where: { ID: metadata._thumbnail_id, post_type: 'attachment' }
        });
        if (thumbnailPost) {
          featuredImageUrl = thumbnailPost.guid || '';
        }
      }

      // console.log('🔧 Debug: Found post for edit:', {
      //   ID: post.ID,
      //   title: post.post_title,
      //   content: post.post_content,
      //   status: post.post_status
      // });

      res.status(200).json({
        success: true,
        data: {
          id: post.ID,
          title: post.post_title,
          content: post.post_content,
          excerpt: post.post_excerpt,
          slug: post.post_name,
          status: post.post_status,
          type: post.post_type,
          date: post.post_date,
          modified: post.post_modified,
          author_id: post.post_author,
          publish_date: post.post_date,
          location: metadata._location || '',
          channel: metadata._channel || 'news',
          topic: metadata._topic || '',
          keyword: metadata._keyword || '',
          summary_social: metadata._summary_social || '',
          mark_as_18_plus: metadata._mark_as_18_plus === '1' || false,
          featured_image: featuredImageUrl,
          metadata
        }
      });
    } catch (error) {
      console.error('Error fetching article:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Upload image for article
   * POST /api/writer/upload-image
   */
  static async uploadImage(req, res) {
    try {
      if (!req.files || !req.files.image) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      const imageFile = req.files.image[0]; // Get first file from array
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      // Get relative path from uploads directory
      const relativePath = path.relative(
        path.join(__dirname, '../../../public'), 
        imageFile.path
      );
      const imageUrl = `${baseUrl}/${relativePath.replace(/\\/g, '/')}`;

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: imageUrl,
          filename: imageFile.filename,
          originalName: imageFile.originalname,
          size: imageFile.size
        }
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Delete article
   * DELETE /api/writer/articles/:id
   */
  static async deleteArticle(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;

      const post = await Post.findOne({
        where: { 
          ID: id,
          post_author: req.user.ID,
          post_type: 'post'
        }
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Article not found'
        });
      }

      // Delete meta data
      await PostMeta.destroy({
        where: { post_id: post.ID },
        transaction
      });

      // Delete post
      await post.destroy({ transaction });

      await transaction.commit();

      res.status(200).json({
        success: true,
        message: 'Article deleted successfully'
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error deleting article:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Submit article for review
   * POST /api/writer/articles/:id/submit
   */
  static async submitForReview(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { submission_notes } = req.body;

      // Find the article
      const article = await Post.findOne({
        where: {
          ID: id,
          post_author: req.user.ID,
          post_status: 'draft'
        },
        transaction
      });

      if (!article) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Draft article not found or you do not have permission to submit it'
        });
      }

      // Update status to pending
      await article.update({
        post_status: 'pending',
        post_modified: new Date()
      }, { transaction });

      // Add submission metadata
      await PostMeta.create({
        post_id: article.ID,
        meta_key: '_submission_notes',
        meta_value: JSON.stringify({
          writer_id: req.user.ID,
          writer_name: req.user.display_name,
          submission_date: new Date(),
          notes: submission_notes || 'Submitted for review'
        })
      }, { transaction });

      await transaction.commit();

      res.json({
        success: true,
        message: 'Article submitted for review successfully',
        data: {
          id: article.ID,
          title: article.post_title,
          status: 'pending',
          submission_date: new Date()
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Submit for review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit article for review'
      });
    }
  }

  /**
   * Add terms from post fields (topic, keyword, channel) to database
   * @param {number} postId - The post ID
   * @param {object} fields - Object containing channel, topic, keyword
   */
  static async addTermsFromPost(postId, { channel, topic, keyword }) {
    try {
      console.log(`🏷️ Adding terms from post ${postId}: channel="${channel}", topic="${topic}", keyword="${keyword}"`);

      const termsToAdd = [];

      // Add channel as category
      if (channel) {
        termsToAdd.push({ name: channel, taxonomy: 'category' });
      }

      // Add topic as newstopic
      if (topic) {
        termsToAdd.push({ name: topic, taxonomy: 'newstopic' });
      }

      // Add keywords as tags (split by comma)
      if (keyword) {
        const keywords = keyword.split(',').map(k => k.trim()).filter(k => k);
        keywords.forEach(kw => {
          termsToAdd.push({ name: kw, taxonomy: 'post_tag' });
        });
      }

      const addedTerms = [];

      for (const termData of termsToAdd) {
        try {
          // Check if term already exists
          const existingTermQuery = `
            SELECT t.term_id, tt.term_taxonomy_id 
            FROM terms t 
            JOIN term_taxonomy tt ON t.term_id = tt.term_id 
            WHERE t.name = ? AND tt.taxonomy = ?
          `;
          
          const existingTerm = await sequelize.query(existingTermQuery, {
            replacements: [termData.name, termData.taxonomy],
            type: QueryTypes.SELECT
          });

          let termTaxonomyId;

          if (existingTerm.length > 0) {
            // Term exists, use existing term_taxonomy_id
            termTaxonomyId = existingTerm[0].term_taxonomy_id;
            console.log(`✅ Using existing term: ${termData.name} (${termData.taxonomy})`);
          } else {
            // Create new term
            const slug = termData.name.toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-');

            // Insert into terms table
            const insertTermQuery = `
              INSERT INTO terms (name, slug, term_group) 
              VALUES (?, ?, 0)
            `;
            
            const termResult = await sequelize.query(insertTermQuery, {
              replacements: [termData.name, slug],
              type: QueryTypes.INSERT
            });

            const termId = termResult[0];

            // Insert into term_taxonomy table
            const insertTaxonomyQuery = `
              INSERT INTO term_taxonomy (term_id, taxonomy, description, parent, count) 
              VALUES (?, ?, '', 0, 0)
            `;
            
            const taxonomyResult = await sequelize.query(insertTaxonomyQuery, {
              replacements: [termId, termData.taxonomy],
              type: QueryTypes.INSERT
            });

            termTaxonomyId = taxonomyResult[0];
            console.log(`🆕 Created new term: ${termData.name} (${termData.taxonomy})`);
          }

          // Check if relationship already exists
          const existingRelQuery = `
            SELECT * FROM term_relationships 
            WHERE object_id = ? AND term_taxonomy_id = ?
          `;
          
          const existingRel = await sequelize.query(existingRelQuery, {
            replacements: [postId, termTaxonomyId],
            type: QueryTypes.SELECT
          });

          if (existingRel.length === 0) {
            // Create term relationship
            const insertRelQuery = `
              INSERT INTO term_relationships (object_id, term_taxonomy_id, term_order) 
              VALUES (?, ?, 0)
            `;
            
            await sequelize.query(insertRelQuery, {
              replacements: [postId, termTaxonomyId],
              type: QueryTypes.INSERT
            });

            // Update count
            const updateCountQuery = `
              UPDATE term_taxonomy 
              SET count = count + 1 
              WHERE term_taxonomy_id = ?
            `;
            
            await sequelize.query(updateCountQuery, {
              replacements: [termTaxonomyId],
              type: QueryTypes.UPDATE
            });

            addedTerms.push(termData);
            console.log(`🔗 Linked post ${postId} to term: ${termData.name}`);
          } else {
            console.log(`⚠️ Relationship already exists for post ${postId} and term: ${termData.name}`);
          }

        } catch (termError) {
          console.error(`❌ Error processing term ${termData.name}:`, termError);
        }
      }

      console.log(`✅ Successfully processed ${addedTerms.length} terms for post ${postId}`);
      return addedTerms;

    } catch (error) {
      console.error('❌ Error in addTermsFromPost:', error);
      throw error;
    }
  }
}

module.exports = WriterController;
