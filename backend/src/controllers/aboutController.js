const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

const aboutController = {
  // Get about page content
  async getAboutPage(req, res) {
    try {
      console.log('📄 Getting about page content');

      const aboutData = await sequelize.query(
        'SELECT * FROM about_page ORDER BY id DESC LIMIT 1',
        { type: QueryTypes.SELECT }
      );

      if (aboutData.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'About page content not found'
        });
      }

      // Parse dynamic_sections JSON if it exists
      const data = aboutData[0];
      if (data.dynamic_sections) {
        // If it's already a JSON object, keep it as is
        if (typeof data.dynamic_sections === 'object') {
          // Already parsed by MySQL JSON type
          data.dynamic_sections = data.dynamic_sections;
        } else if (typeof data.dynamic_sections === 'string' && data.dynamic_sections.trim() !== '') {
          // If it's a string, try to parse it
          try {
            data.dynamic_sections = JSON.parse(data.dynamic_sections);
          } catch (e) {
            data.dynamic_sections = [];
          }
        } else {
          data.dynamic_sections = [];
        }
      } else {
        data.dynamic_sections = [];
      }

      res.json({
        success: true,
        data: data
      });

    } catch (error) {
      console.error('❌ Error getting about page:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get about page content',
        error: error.message
      });
    }
  },

  // Update about page content (superadmin only)
  async updateAboutPage(req, res) {
    try {
      console.log('📝 Updating about page content');
      console.log('🔍 Received req.body:', JSON.stringify(req.body, null, 2));

      const {
        title,
        hero_title,
        hero_subtitle,
        mission_title,
        mission_content,
        vision_title,
        vision_content,
        values_title,
        values_content,
        team_title,
        team_content,
        dynamic_sections,
        hero_hidden,
        mission_hidden,
        vision_hidden,
        values_hidden,
        team_hidden
      } = req.body;

      // Check if user is superadmin
      if (req.user.user_role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Superadmin role required.'
        });
      }

      // Serialize dynamic_sections to JSON
      const dynamicSectionsJson = dynamic_sections ? JSON.stringify(dynamic_sections) : null;

      // Update or insert about page content
      const updateQuery = `
        UPDATE about_page SET
          title = ?,
          hero_title = ?,
          hero_subtitle = ?,
          mission_title = ?,
          mission_content = ?,
          vision_title = ?,
          vision_content = ?,
          values_title = ?,
          values_content = ?,
          team_title = ?,
          team_content = ?,
          dynamic_sections = ?,
          hero_hidden = ?,
          mission_hidden = ?,
          vision_hidden = ?,
          values_hidden = ?,
          team_hidden = ?,
          updated_at = NOW()
        WHERE id = 1
      `;

      await sequelize.query(updateQuery, {
        replacements: [
          title || 'Tentang Kami',
          hero_title || 'Tentang Naramakna',
          hero_subtitle || '',
          mission_title || 'Misi Kami',
          mission_content || '',
          vision_title || 'Visi Kami',
          vision_content || '',
          values_title || 'Nilai-Nilai Kami',
          values_content || '',
          team_title || 'Tim Kami',
          team_content || '',
          dynamicSectionsJson,
          hero_hidden || false,
          mission_hidden || false,
          vision_hidden || false,
          values_hidden || false,
          team_hidden || false
        ],
        type: QueryTypes.UPDATE
      });

      console.log('✅ About page updated successfully');

      res.json({
        success: true,
        message: 'About page updated successfully'
      });

    } catch (error) {
      console.error('❌ Error updating about page:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update about page content',
        error: error.message
      });
    }
  },

  // Upload image for about page content
  async uploadImage(req, res) {
    try {
      console.log('📝 Uploading image for about page');

      if (!req.files || !req.files.image) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      const imageFile = req.files.image[0];
      const baseUrl = `${req.protocol}://${req.get('host')}`;

      // Get relative path from uploads directory
      const path = require('path');
      const relativePath = path.relative(
        path.join(__dirname, '../../../public'),
        imageFile.path
      );
      const imageUrl = `${baseUrl}/${relativePath.replace(/\\/g, '/')}`;

      console.log('✅ Image uploaded successfully:', imageUrl);

      res.json({
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
      console.error('❌ Error uploading image:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload image',
        error: error.message
      });
    }
  }
};

module.exports = aboutController;