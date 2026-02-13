const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

const termsController = {
  async getCategories(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const safeLimit = Math.max(1, Math.min(parseInt(limit), 5000));
      const safePage = Math.max(1, parseInt(page));
      const offset = (safePage - 1) * safeLimit;

      const allowedSlugs = [
        'narapandang', 'horison', 'laga-gaya', 'cerita-rasa', 'pendidikan',
        'teknologi', 'budaya', 'wahana', 'olah-bola', 'jagat-kita',
        'liputan-khusus', 'mata-elang'
      ];

      let categories = await sequelize.query(
        `
        SELECT 
          MIN(tt.term_taxonomy_id) AS id,
          MIN(t.name) AS name,
          t.slug
        FROM term_taxonomy tt
        JOIN terms t ON t.term_id = tt.term_id
        WHERE tt.taxonomy = 'category' AND t.slug IN (:slugs)
        GROUP BY t.slug
        ORDER BY name ASC
        LIMIT :limit OFFSET :offset
        `,
        { 
          type: QueryTypes.SELECT,
          replacements: { slugs: allowedSlugs, limit: safeLimit, offset }
        }
      );

      const toTitleCase = (s) => {
        if (!s || typeof s !== 'string') return s;
        return s
          .split(' ')
          .map(part => part
            .split('-')
            .map(p => p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : p)
            .join('-')
          )
          .join(' ');
      };

      categories = categories.map(c => ({ ...c, name: toTitleCase(c.name) }));

      const totalResult = await sequelize.query(
        `
        SELECT COUNT(DISTINCT t.slug) AS total
        FROM term_taxonomy tt
        JOIN terms t ON t.term_id = tt.term_id
        WHERE tt.taxonomy = 'category' AND t.slug IN (:slugs)
        `,
        { type: QueryTypes.SELECT, replacements: { slugs: allowedSlugs } }
      );
      const total = parseInt(totalResult[0]?.total || 0);
      const totalPages = Math.max(1, Math.ceil(total / safeLimit));
      const hasMore = safePage < totalPages;

      res.json({
        success: true,
        data: {
          categories,
          total,
          pagination: {
            page: safePage,
            limit: safeLimit,
            totalPages,
            hasMore
          }
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to get categories', error: error.message });
    }
  }
};

module.exports = termsController;
