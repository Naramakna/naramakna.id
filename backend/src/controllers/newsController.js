const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

const newsController = {
  async getNews(req, res) {
    try {
      const { search = '' } = req.query;
      const LIMIT = 10;

      const searchCondition = search.trim()
        ? `AND (LOWER(p.post_title) LIKE :keyword OR EXISTS (
            SELECT 1
            FROM term_relationships tr3
            JOIN term_taxonomy tt3 ON tr3.term_taxonomy_id = tt3.term_taxonomy_id AND tt3.taxonomy = 'category'
            JOIN terms t3 ON tt3.term_id = t3.term_id
            WHERE tr3.object_id = p.ID AND LOWER(t3.name) LIKE :keyword
          ))`
        : '';

      const query = `
        SELECT
          p.ID as id,
          p.post_title as title,
          p.post_name as slug,
          (
            SELECT t2.name
            FROM term_relationships tr2
            JOIN term_taxonomy tt2 ON tr2.term_taxonomy_id = tt2.term_taxonomy_id AND tt2.taxonomy = 'category'
            JOIN terms t2 ON tt2.term_id = t2.term_id
            WHERE tr2.object_id = p.ID
            LIMIT 1
          ) as category,
          (
            SELECT att.guid
            FROM postmeta pm2
            JOIN posts att ON pm2.meta_value = att.ID
            WHERE pm2.post_id = p.ID AND pm2.meta_key = '_thumbnail_id'
            LIMIT 1
          ) as image
        FROM posts p
        WHERE p.post_status = 'publish'
        AND p.post_type = 'post'
        ${searchCondition}
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
