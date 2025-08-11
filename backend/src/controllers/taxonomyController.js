const { Term, TermTaxonomy, Post, User, PostMeta, TermRelationship } = require('../models');
const { Op } = require('sequelize');

const taxonomyController = {
  // Get all terms for a specific taxonomy (for navigation)
  async getTermsByTaxonomy(req, res) {
    try {
      const { taxonomy } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      console.log(`🏷️ Getting terms for taxonomy: ${taxonomy}`);

      const terms = await Term.findAll({
        include: [{
          model: TermTaxonomy,
          as: 'taxonomies',
          where: { taxonomy },
          attributes: ['term_taxonomy_id', 'taxonomy', 'description', 'parent', 'count']
        }],
        order: [
          [{ model: TermTaxonomy, as: 'taxonomies' }, 'count', 'DESC'],
          ['name', 'ASC']
        ],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const formattedTerms = terms.map(term => ({
        id: term.term_id,
        name: term.name,
        slug: term.slug,
        taxonomy: term.taxonomies[0]?.taxonomy,
        count: term.taxonomies[0]?.count || 0,
        description: term.taxonomies[0]?.description || '',
        parent: term.taxonomies[0]?.parent || 0
      }));

      res.status(200).json({
        success: true,
        data: {
          terms: formattedTerms,
          taxonomy,
          total: formattedTerms.length
        }
      });

    } catch (error) {
      console.error('❌ Error getting terms by taxonomy:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get posts by term/category
  async getPostsByTerm(req, res) {
    try {
      const { taxonomy, slug } = req.params;
      const { limit = 10, offset = 0, status = 'publish' } = req.query;

      console.log(`📑 Getting posts for ${taxonomy}/${slug}`);

      // First, find the term
      const term = await Term.findOne({
        where: { slug },
        include: [{
          model: TermTaxonomy,
          as: 'taxonomies',
          where: { taxonomy },
          attributes: ['term_taxonomy_id', 'taxonomy', 'description', 'count']
        }]
      });

      if (!term || !term.taxonomies.length) {
        return res.status(404).json({
          success: false,
          message: 'Term not found'
        });
      }

      const termTaxonomyId = term.taxonomies[0].term_taxonomy_id;

      // Get posts associated with this term
      const posts = await Post.findAndCountAll({
        where: {
          post_status: status,
          post_type: 'post'
        },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['ID', 'display_name', 'user_login']
          },
          {
            model: PostMeta,
            as: 'meta',
            required: false
          },
          {
            model: TermRelationship,
            as: 'termRelationships',
            where: { term_taxonomy_id: termTaxonomyId },
            attributes: []
          }
        ],
        order: [['post_date', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      });

      // Format posts
      const formattedPosts = posts.rows.map(post => {
        const metadata = {};
        if (post.meta) {
          post.meta.forEach(meta => {
            metadata[meta.meta_key] = meta.meta_value;
          });
        }

        return {
          id: post.ID,
          title: post.post_title,
          content: post.post_content,
          excerpt: post.post_excerpt,
          slug: post.post_name,
          status: post.post_status,
          date: post.post_date,
          modified: post.post_modified,
          author: {
            id: post.author?.ID,
            name: post.author?.display_name || post.author?.user_login,
            login: post.author?.user_login
          },
          featured_image: metadata._thumbnail_id ? `/uploads/${metadata._thumbnail_id}` : null,
          metadata
        };
      });

      res.status(200).json({
        success: true,
        data: {
          posts: formattedPosts,
          term: {
            id: term.term_id,
            name: term.name,
            slug: term.slug,
            taxonomy,
            count: term.taxonomies[0].count,
            description: term.taxonomies[0].description
          },
          pagination: {
            total: posts.count,
            limit: parseInt(limit),
            offset: parseInt(offset),
            pages: Math.ceil(posts.count / parseInt(limit))
          }
        }
      });

    } catch (error) {
      console.error('❌ Error getting posts by term:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get main navigation categories (prioritized ones)
  async getNavigationCategories(req, res) {
    try {
      // Prioritized categories for main navigation
      const priorityCategories = [
        'News', 'Entertainment', 'Tekno & Sains', 'Bisnis', 
        'Bola & Sports', 'Otomotif', 'Woman', 'Food & Travel', 
        'Mom', 'Bolanita'
      ];

      console.log(`🧭 Getting navigation categories`);

      // Get existing categories and newstopics
      const categories = await Term.findAll({
        include: [{
          model: TermTaxonomy,
          as: 'taxonomies',
          where: { 
            taxonomy: { [Op.in]: ['category', 'newstopic'] },
            count: { [Op.gt]: 0 } // Only categories with posts
          },
          attributes: ['term_taxonomy_id', 'taxonomy', 'count']
        }],
        order: [
          [{ model: TermTaxonomy, as: 'taxonomies' }, 'count', 'DESC']
        ]
      });

      // Separate into priority and additional
      const priorityNavigation = [];
      const additionalNavigation = [];

      categories.forEach(term => {
        const categoryData = {
          id: term.term_id,
          name: term.name,
          slug: term.slug,
          taxonomy: term.taxonomies[0]?.taxonomy,
          count: term.taxonomies[0]?.count || 0
        };

        if (priorityCategories.includes(term.name)) {
          priorityNavigation.push(categoryData);
        } else {
          additionalNavigation.push(categoryData);
        }
      });

      // Sort priority navigation based on the predefined order
      priorityNavigation.sort((a, b) => {
        const aIndex = priorityCategories.indexOf(a.name);
        const bIndex = priorityCategories.indexOf(b.name);
        return aIndex - bIndex;
      });

      res.status(200).json({
        success: true,
        data: {
          priority: priorityNavigation,
          additional: additionalNavigation.slice(0, 20), // Limit additional to 20
          total: categories.length
        }
      });

    } catch (error) {
      console.error('❌ Error getting navigation categories:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Add/update terms when creating posts (from topic/keyword fields)
  async addTermsFromPost(req, res) {
    try {
      const { topic, keyword, channel } = req.body;
      const postId = req.params.postId;

      console.log(`🏷️ Adding terms from post ${postId}: topic="${topic}", keyword="${keyword}", channel="${channel}"`);

      const termsToAdd = [];

      // Add channel as category
      if (channel) {
        termsToAdd.push({ name: channel, taxonomy: 'category' });
      }

      // Add topic as newstopic
      if (topic) {
        termsToAdd.push({ name: topic, taxonomy: 'newstopic' });
      }

      // Add keywords as tags
      if (keyword) {
        const keywords = keyword.split(',').map(k => k.trim()).filter(k => k);
        keywords.forEach(kw => {
          termsToAdd.push({ name: kw, taxonomy: 'post_tag' });
        });
      }

      const addedTerms = [];

      for (const termData of termsToAdd) {
        // Find or create term
        let [term] = await Term.findOrCreate({
          where: { name: termData.name },
          defaults: {
            name: termData.name,
            slug: termData.name.toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .substring(0, 200)
          }
        });

        // Find or create term taxonomy
        let [termTaxonomy] = await TermTaxonomy.findOrCreate({
          where: { 
            term_id: term.term_id,
            taxonomy: termData.taxonomy 
          },
          defaults: {
            term_id: term.term_id,
            taxonomy: termData.taxonomy,
            description: '',
            parent: 0,
            count: 0
          }
        });

        // Create relationship if not exists
        await TermRelationship.findOrCreate({
          where: {
            object_id: postId,
            term_taxonomy_id: termTaxonomy.term_taxonomy_id
          },
          defaults: {
            object_id: postId,
            term_taxonomy_id: termTaxonomy.term_taxonomy_id,
            term_order: 0
          }
        });

        // Update count
        await TermTaxonomy.increment('count', {
          where: { term_taxonomy_id: termTaxonomy.term_taxonomy_id }
        });

        addedTerms.push({
          term: term.name,
          taxonomy: termData.taxonomy,
          slug: term.slug
        });
      }

      res.status(200).json({
        success: true,
        data: {
          added_terms: addedTerms,
          post_id: postId
        }
      });

    } catch (error) {
      console.error('❌ Error adding terms from post:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = taxonomyController;
