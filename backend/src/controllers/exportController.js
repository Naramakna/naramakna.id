const { Post, User, Term, PostTermRelationship } = require('../models');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

class ExportController {
  /**
   * Export posts table to CSV
   * GET /api/export/posts
   */
  static async exportPosts(req, res) {
    try {
      console.log('📊 Starting posts export...');
      
      // Get all posts with author information
      const posts = await Post.findAll({
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['ID', 'user_login', 'display_name', 'user_email']
          }
        ],
        order: [['post_date', 'DESC']]
      });

      console.log(`📊 Found ${posts.length} posts to export`);

      // Convert to CSV format
      const csvHeaders = [
        'ID',
        'Title',
        'Content',
        'Excerpt',
        'Status',
        'Type',
        'Date',
        'Modified',
        'Author_ID',
        'Author_Login',
        'Author_Name',
        'Author_Email',
        'Slug',
        'Comment_Status',
        'Ping_Status',
        'Comment_Count'
      ];

      const csvRows = posts.map(post => [
        post.ID,
        `"${(post.post_title || '').replace(/"/g, '""')}"`,
        `"${(post.post_content || '').replace(/"/g, '""').substring(0, 1000)}"`, // Limit content length
        `"${(post.post_excerpt || '').replace(/"/g, '""')}"`,
        post.post_status,
        post.post_type,
        post.post_date,
        post.post_modified,
        post.post_author,
        post.author?.user_login || '',
        `"${(post.author?.display_name || '').replace(/"/g, '""')}"`,
        post.author?.user_email || '',
        `"${(post.post_name || '').replace(/"/g, '""')}"`,
        post.comment_status,
        post.ping_status,
        post.comment_count
      ]);

      // Create CSV content
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      // Set headers for file download
      const filename = `posts_export_${new Date().toISOString().split('T')[0]}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8'));

      console.log(`📊 Sending CSV file: ${filename}`);
      res.send(csvContent);

    } catch (error) {
      console.error('❌ Error exporting posts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export posts',
        error: error.message
      });
    }
  }

  /**
   * Export terms table to CSV
   * GET /api/export/terms
   */
  static async exportTerms(req, res) {
    try {
      console.log('📊 Starting terms export...');
      
      // Get all terms with post count
      const terms = await sequelize.query(`
        SELECT 
          t.*,
          COUNT(ptr.post_id) as post_count
        FROM terms t
        LEFT JOIN post_term_relationships ptr ON t.term_id = ptr.term_id
        GROUP BY t.term_id
        ORDER BY t.name ASC
      `, {
        type: QueryTypes.SELECT
      });

      console.log(`📊 Found ${terms.length} terms to export`);

      // Convert to CSV format
      const csvHeaders = [
        'Term_ID',
        'Name',
        'Slug',
        'Term_Group',
        'Type',
        'Description',
        'Parent',
        'Count',
        'Post_Count'
      ];

      const csvRows = terms.map(term => [
        term.term_id,
        `"${(term.name || '').replace(/"/g, '""')}"`,
        `"${(term.slug || '').replace(/"/g, '""')}"`,
        term.term_group || 0,
        `"${(term.type || '').replace(/"/g, '""')}"`,
        `"${(term.description || '').replace(/"/g, '""')}"`,
        term.parent || 0,
        term.count || 0,
        term.post_count || 0
      ]);

      // Create CSV content
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      // Set headers for file download
      const filename = `terms_export_${new Date().toISOString().split('T')[0]}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8'));

      console.log(`📊 Sending CSV file: ${filename}`);
      res.send(csvContent);

    } catch (error) {
      console.error('❌ Error exporting terms:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export terms',
        error: error.message
      });
    }
  }

  /**
   * Export post-term relationships to CSV
   * GET /api/export/post-terms
   */
  static async exportPostTerms(req, res) {
    try {
      console.log('📊 Starting post-terms export...');
      
      // Get all post-term relationships with details
      const relationships = await sequelize.query(`
        SELECT 
          ptr.post_id,
          ptr.term_id,
          p.post_title,
          p.post_status,
          p.post_type,
          p.post_date,
          t.name as term_name,
          t.slug as term_slug,
          t.type as term_type
        FROM post_term_relationships ptr
        JOIN posts p ON ptr.post_id = p.ID
        JOIN terms t ON ptr.term_id = t.term_id
        ORDER BY ptr.post_id, ptr.term_id
      `, {
        type: QueryTypes.SELECT
      });

      console.log(`📊 Found ${relationships.length} post-term relationships to export`);

      // Convert to CSV format
      const csvHeaders = [
        'Post_ID',
        'Term_ID',
        'Post_Title',
        'Post_Status',
        'Post_Type',
        'Post_Date',
        'Term_Name',
        'Term_Slug',
        'Term_Type'
      ];

      const csvRows = relationships.map(rel => [
        rel.post_id,
        rel.term_id,
        `"${(rel.post_title || '').replace(/"/g, '""')}"`,
        rel.post_status,
        rel.post_type,
        rel.post_date,
        `"${(rel.term_name || '').replace(/"/g, '""')}"`,
        `"${(rel.term_slug || '').replace(/"/g, '""')}"`,
        `"${(rel.term_type || '').replace(/"/g, '""')}"`,
      ]);

      // Create CSV content
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      // Set headers for file download
      const filename = `post_terms_export_${new Date().toISOString().split('T')[0]}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8'));

      console.log(`📊 Sending CSV file: ${filename}`);
      res.send(csvContent);

    } catch (error) {
      console.error('❌ Error exporting post-terms:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export post-terms',
        error: error.message
      });
    }
  }

  /**
   * Get export status/info
   * GET /api/export/info
   */
  static async getExportInfo(req, res) {
    try {
      const [postsCount, termsCount, relationshipsCount] = await Promise.all([
        Post.count(),
        Term.count(),
        PostTermRelationship.count()
      ]);

      res.json({
        success: true,
        data: {
          posts_count: postsCount,
          terms_count: termsCount,
          relationships_count: relationshipsCount,
          available_exports: [
            {
              name: 'Posts',
              endpoint: '/api/export/posts',
              description: 'Export all posts with author information'
            },
            {
              name: 'Terms',
              endpoint: '/api/export/terms',
              description: 'Export all terms (categories, tags) with post counts'
            },
            {
              name: 'Post-Term Relationships',
              endpoint: '/api/export/post-terms',
              description: 'Export post-term relationship mappings'
            }
          ]
        }
      });
    } catch (error) {
      console.error('❌ Error getting export info:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get export info',
        error: error.message
      });
    }
  }
}

module.exports = ExportController;
