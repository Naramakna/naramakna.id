const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

const newsController = {
  async getNews(req, res) {
    try {
      const { search = '' } = req.query;
      const LIMIT = 10;

      const searchCondition = search.trim()
        ? `AND (LOWER(p.post_title) LIKE :keyword OR LOWER(t.name) LIKE :keyword)`
        : '';

      const query = `
        SELECT
          p.ID as id,
          p.post_title as title,
          t.name as category,
          attachment.guid as image
        FROM posts p
        LEFT JOIN term_relationships tr ON p.ID = tr.object_id
        LEFT JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id AND tt.taxonomy = 'category'
        LEFT JOIN terms t ON tt.term_id = t.term_id
        LEFT JOIN postmeta thumb
          ON p.ID = thumb.post_id
         AND thumb.meta_key = '_thumbnail_id'
         AND thumb.meta_id = (
           SELECT MAX(pm.meta_id)
           FROM postmeta pm
           WHERE pm.post_id = p.ID AND pm.meta_key = '_thumbnail_id'
         )
        LEFT JOIN posts attachment ON thumb.meta_value = attachment.ID
        WHERE p.post_status = 'publish'
        AND p.post_type = 'post'
        ${searchCondition}
        GROUP BY p.ID
        ORDER BY p.post_date DESC
        LIMIT :limit
      `;

      const replacements = {
        limit: LIMIT,
        ...(search.trim() ? { keyword: `%${search.trim().toLowerCase()}%` } : {})
      };

      const data = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements
      });

      res.json({
        success: true,
        data,
        total: data.length,
        limit: LIMIT
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get news',
        error: error.message
      });
    }
  }
};

module.exports = newsController;
