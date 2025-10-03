const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const getDbConfig = () => ({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

class MataElangController {

  /**
   * Get galleries created by the current user (for partner photographers)
   */
  static async getMyGalleries(req, res) {
    try {
      const userId = req.user.ID;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const connection = await mysql.createConnection(getDbConfig());

      // Get galleries created by the current user
      const [galleries] = await connection.query(`
        SELECT
          g.id, g.title, g.slug, g.description, g.cover_image,
          g.photographer, g.location, g.story_date, g.view_count,
          g.published_at, g.status, g.created_by, g.rejection_reason,
          g.created_at, g.updated_at,
          COUNT(p.id) as photo_count
        FROM mata_elang_galleries g
        LEFT JOIN mata_elang_photos p ON g.id = p.gallery_id
        WHERE g.created_by = ?
        GROUP BY g.id
        ORDER BY g.created_at DESC
        LIMIT ? OFFSET ?
      `, [userId, parseInt(limit), parseInt(offset)]);

      // Get total count for pagination
      const [countResult] = await connection.query(`
        SELECT COUNT(*) as total
        FROM mata_elang_galleries
        WHERE created_by = ?
      `, [userId]);

      await connection.end();

      res.json({
        success: true,
        data: {
          galleries,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: countResult[0].total,
            pages: Math.ceil(countResult[0].total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching user galleries:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch galleries',
        error: error.message
      });
    }
  }

  /**
   * Get all Mata Elang galleries for public display
   */
  static async getGalleries(req, res) {
    try {
      const { page = 1, limit = 12 } = req.query;
      const offset = (page - 1) * limit;

      const connection = await mysql.createConnection(getDbConfig());

      // Get galleries with photo count and uploader info
      const [galleries] = await connection.query(`
        SELECT
          g.id, g.title, g.slug, g.description, g.cover_image,
          g.photographer, g.location, g.story_date, g.view_count,
          g.published_at, u.display_name as uploader_name, u.user_role as uploader_role,
          COUNT(p.id) as photo_count
        FROM mata_elang_galleries g
        LEFT JOIN users u ON g.created_by = u.ID
        LEFT JOIN mata_elang_photos p ON g.id = p.gallery_id
        WHERE g.status = 'published'
        GROUP BY g.id
        ORDER BY g.published_at DESC
        LIMIT ? OFFSET ?
      `, [parseInt(limit), parseInt(offset)]);

      // Get total count for pagination
      const [countResult] = await connection.query(`
        SELECT COUNT(*) as total
        FROM mata_elang_galleries
        WHERE status = 'published'
      `);

      await connection.end();

      res.json({
        success: true,
        data: {
          galleries,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: countResult[0].total,
            pages: Math.ceil(countResult[0].total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error fetching galleries:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch galleries',
        error: error.message
      });
    }
  }

  /**
   * Get single gallery with all photos
   */
  static async getGallery(req, res) {
    try {
      const { slug } = req.params;
      const connection = await mysql.createConnection(getDbConfig());

      // Get gallery details
      const [galleries] = await connection.query(`
        SELECT * FROM mata_elang_galleries
        WHERE slug = ? AND status = 'published'
      `, [slug]);

      if (galleries.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Gallery not found'
        });
      }

      const gallery = galleries[0];

      // Get all photos for this gallery
      const [photos] = await connection.query(`
        SELECT * FROM mata_elang_photos
        WHERE gallery_id = ?
        ORDER BY sort_order ASC, id ASC
      `, [gallery.id]);

      // Update view count
      await connection.query(`
        UPDATE mata_elang_galleries
        SET view_count = view_count + 1
        WHERE id = ?
      `, [gallery.id]);

      await connection.end();

      res.json({
        success: true,
        data: {
          ...gallery,
          photos
        }
      });

    } catch (error) {
      console.error('Error fetching gallery:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch gallery',
        error: error.message
      });
    }
  }

  /**
   * Get single gallery by ID (for admin/partner fotografi)
   */
  static async getGalleryById(req, res) {
    try {
      const { id } = req.params;
      console.log('📷 getGalleryById called with ID:', id, 'User:', req.user.ID, 'Role:', req.user.user_role);
      const connection = await mysql.createConnection(getDbConfig());

      // Check if user has access to this gallery
      let query = `
        SELECT g.*, u.display_name as author_name
        FROM mata_elang_galleries g
        LEFT JOIN users u ON g.created_by = u.id
        WHERE g.id = ?
      `;

      const queryParams = [id];

      // Partner fotografi can only see their own galleries
      if (req.user.user_role === 'partner_fotografi') {
        query += ' AND g.created_by = ?';
        queryParams.push(req.user.ID);
      }

      const [galleries] = await connection.query(query, queryParams);

      if (galleries.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Gallery not found or access denied'
        });
      }

      const gallery = galleries[0];

      // Get all photos for this gallery
      const [photos] = await connection.query(`
        SELECT * FROM mata_elang_photos
        WHERE gallery_id = ?
        ORDER BY sort_order ASC, id ASC
      `, [gallery.id]);

      await connection.end();

      res.json({
        success: true,
        data: {
          ...gallery,
          photos
        }
      });

    } catch (error) {
      console.error('Error fetching gallery by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch gallery',
        error: error.message
      });
    }
  }

  /**
   * Get featured galleries
   */
  static async getFeaturedGalleries(req, res) {
    try {
      const { limit = 6 } = req.query;
      const connection = await mysql.createConnection(getDbConfig());

      const [galleries] = await connection.query(`
        SELECT
          g.id, g.title, g.slug, g.description, g.cover_image,
          g.photographer, g.location, g.story_date, g.view_count,
          g.published_at,
          COUNT(p.id) as photo_count
        FROM mata_elang_galleries g
        LEFT JOIN mata_elang_photos p ON g.id = p.gallery_id
        WHERE g.status = 'published' AND g.is_featured = true
        GROUP BY g.id
        ORDER BY g.published_at DESC
        LIMIT ?
      `, [parseInt(limit)]);

      await connection.end();

      res.json({
        success: true,
        data: galleries
      });

    } catch (error) {
      console.error('Error fetching featured galleries:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch featured galleries',
        error: error.message
      });
    }
  }

  // Admin methods

  /**
   * Get all galleries for admin (including drafts)
   */
  static async getAdminGalleries(req, res) {
    try {
      const { page = 1, limit = 20, status = 'all' } = req.query;
      const offset = (page - 1) * limit;

      const connection = await mysql.createConnection(getDbConfig());

      let whereClause = '';
      let params = [];

      if (status !== 'all') {
        whereClause = 'WHERE g.status = ?';
        params.push(status);
      }

      const [galleries] = await connection.query(`
        SELECT
          g.*, u.display_name as author_name, u.user_role as created_by_role,
          COUNT(p.id) as photo_count
        FROM mata_elang_galleries g
        LEFT JOIN users u ON g.created_by = u.ID
        LEFT JOIN mata_elang_photos p ON g.id = p.gallery_id
        ${whereClause}
        GROUP BY g.id
        ORDER BY g.created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), parseInt(offset)]);

      // Get total count
      const [countResult] = await connection.query(`
        SELECT COUNT(*) as total
        FROM mata_elang_galleries g
        ${whereClause}
      `, params);

      await connection.end();

      res.json({
        success: true,
        data: {
          galleries,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: countResult[0].total,
            pages: Math.ceil(countResult[0].total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error fetching admin galleries:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch galleries',
        error: error.message
      });
    }
  }

  /**
   * Create new gallery
   */
  static async createGallery(req, res) {
    try {
      const {
        title, description, photographer, location, story_date,
        status = 'draft', is_featured = false
      } = req.body;

      // Partner fotografi galleries start as NULL status, they can submit for approval later
      const finalStatus = req.user.user_role === 'partner_fotografi' ? null : status;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Title is required'
        });
      }

      // Generate slug from title
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');

      const connection = await mysql.createConnection(getDbConfig());

      // Check if slug exists
      const [existingSlugs] = await connection.query(
        'SELECT slug FROM mata_elang_galleries WHERE slug = ?',
        [slug]
      );

      let finalSlug = slug;
      if (existingSlugs.length > 0) {
        finalSlug = `${slug}-${Date.now()}`;
      }

      const [result] = await connection.query(`
        INSERT INTO mata_elang_galleries
        (title, slug, description, photographer, location, story_date,
         created_by, status, is_featured, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        title, finalSlug, description, photographer, location, story_date,
        req.user.ID, finalStatus, is_featured,
        finalStatus === 'published' ? new Date() : null
      ]);

      await connection.end();

      res.status(201).json({
        success: true,
        message: 'Gallery created successfully',
        data: {
          id: result.insertId,
          slug: finalSlug
        }
      });

    } catch (error) {
      console.error('Error creating gallery:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create gallery',
        error: error.message
      });
    }
  }

  /**
   * Approve gallery (Admin only)
   */
  static async approveGallery(req, res) {
    try {
      const { id } = req.params;
      const connection = await mysql.createConnection(getDbConfig());

      // Check if gallery exists and is pending approval
      const [galleries] = await connection.query(
        'SELECT * FROM mata_elang_galleries WHERE id = ? AND status = "pending_approval"',
        [id]
      );

      if (galleries.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Gallery not found or not pending approval'
        });
      }

      // Update status to published
      await connection.query(
        'UPDATE mata_elang_galleries SET status = "published", published_at = NOW() WHERE id = ?',
        [id]
      );

      await connection.end();

      res.json({
        success: true,
        message: 'Gallery approved and published successfully'
      });

    } catch (error) {
      console.error('Error approving gallery:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve gallery',
        error: error.message
      });
    }
  }

  /**
   * Reject gallery (Admin only)
   */
  static async rejectGallery(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      console.log('Rejecting gallery:', { id, reason, body: req.body });
      const connection = await mysql.createConnection(getDbConfig());

      // Check if gallery exists and is pending approval
      const [galleries] = await connection.query(
        'SELECT * FROM mata_elang_galleries WHERE id = ? AND status = "pending_approval"',
        [id]
      );

      if (galleries.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Gallery not found or not pending approval'
        });
      }

      // Update status to rejected with rejection reason
      console.log('Updating gallery with reason:', reason);
      const [updateResult] = await connection.query(
        'UPDATE mata_elang_galleries SET status = "rejected", rejection_reason = ? WHERE id = ?',
        [reason, id]
      );
      console.log('Update result:', updateResult);

      await connection.end();

      res.json({
        success: true,
        message: 'Gallery rejected successfully'
      });

    } catch (error) {
      console.error('Error rejecting gallery:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reject gallery',
        error: error.message
      });
    }
  }

  /**
   * Submit gallery for approval (Partner Fotografi only)
   */
  static async submitForApproval(req, res) {
    try {
      const { id } = req.params;
      const connection = await mysql.createConnection(getDbConfig());

      // Check if gallery exists and belongs to the user (status should be NULL for draft galleries)
      const [galleries] = await connection.query(
        'SELECT * FROM mata_elang_galleries WHERE id = ? AND created_by = ? AND (status IS NULL OR status = "draft")',
        [id, req.user.ID]
      );

      if (galleries.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Gallery not found, not owned by you, or not ready for submission'
        });
      }

      // Check if gallery has at least one photo
      const [photos] = await connection.query(
        'SELECT COUNT(*) as photo_count FROM mata_elang_photos WHERE gallery_id = ?',
        [id]
      );

      if (photos[0].photo_count === 0) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'Cannot submit gallery for approval without any photos'
        });
      }

      // Update status to pending_approval
      await connection.query(
        'UPDATE mata_elang_galleries SET status = "pending_approval" WHERE id = ?',
        [id]
      );

      await connection.end();

      res.json({
        success: true,
        message: 'Gallery submitted for admin approval successfully'
      });

    } catch (error) {
      console.error('Error submitting gallery for approval:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit gallery for approval',
        error: error.message
      });
    }
  }

  /**
   * Update gallery
   */
  static async updateGallery(req, res) {
    try {
      const { id } = req.params;
      const {
        title, description, photographer, location, story_date,
        status, is_featured, cover_image
      } = req.body;

      const connection = await mysql.createConnection(getDbConfig());

      // Check if gallery exists
      const [galleries] = await connection.query(
        'SELECT * FROM mata_elang_galleries WHERE id = ?',
        [id]
      );

      if (galleries.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Gallery not found'
        });
      }

      const currentGallery = galleries[0];

      // Check ownership for partner_fotografi
      if (req.user.user_role === 'partner_fotografi' && currentGallery.created_by !== req.user.ID) {
        await connection.end();
        return res.status(403).json({
          success: false,
          message: 'You can only edit galleries you created'
        });
      }

      // Update slug if title changed
      let newSlug = currentGallery.slug;
      if (title && title !== currentGallery.title) {
        newSlug = title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-');

        // Check if new slug exists
        const [existingSlugs] = await connection.query(
          'SELECT slug FROM mata_elang_galleries WHERE slug = ? AND id != ?',
          [newSlug, id]
        );

        if (existingSlugs.length > 0) {
          newSlug = `${newSlug}-${Date.now()}`;
        }
      }

      // Set published_at if status changed to published
      let publishedAt = currentGallery.published_at;
      if (status === 'published' && currentGallery.status !== 'published') {
        publishedAt = new Date();
      }

      // Security: If partner fotografi edits a published gallery, require re-approval
      let finalStatus = status || currentGallery.status;
      if (req.user.user_role === 'partner_fotografi' && currentGallery.status === 'published') {
        // Check if any content was actually changed (not just metadata)
        const hasContentChange =
          (title && title !== currentGallery.title) ||
          (description !== undefined && description !== currentGallery.description) ||
          (photographer && photographer !== currentGallery.photographer) ||
          (location && location !== currentGallery.location) ||
          (story_date && story_date !== currentGallery.story_date) ||
          (cover_image && cover_image !== currentGallery.cover_image);

        if (hasContentChange) {
          finalStatus = 'pending_approval';
          publishedAt = null; // Reset published date since it needs re-approval
          console.log(`🔒 Partner fotografi ${req.user.ID} edited published gallery ${id}, requiring re-approval`);
        }
      }

      await connection.query(`
        UPDATE mata_elang_galleries
        SET title = ?, slug = ?, description = ?, photographer = ?,
            location = ?, story_date = ?, status = ?, is_featured = ?,
            cover_image = ?, published_at = ?, updated_at = NOW()
        WHERE id = ?
      `, [
        title || currentGallery.title,
        newSlug,
        description !== undefined ? description : currentGallery.description,
        photographer !== undefined ? photographer : currentGallery.photographer,
        location !== undefined ? location : currentGallery.location,
        story_date !== undefined ? story_date : currentGallery.story_date,
        finalStatus,
        is_featured !== undefined ? is_featured : currentGallery.is_featured,
        cover_image !== undefined ? cover_image : currentGallery.cover_image,
        publishedAt,
        id
      ]);

      await connection.end();

      res.json({
        success: true,
        message: 'Gallery updated successfully',
        data: {
          id: parseInt(id),
          slug: newSlug
        }
      });

    } catch (error) {
      console.error('Error updating gallery:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update gallery',
        error: error.message
      });
    }
  }

  /**
   * Delete gallery
   */
  static async deleteGallery(req, res) {
    try {
      const { id } = req.params;
      const connection = await mysql.createConnection(getDbConfig());

      // Check if gallery exists
      const [galleries] = await connection.query(
        'SELECT * FROM mata_elang_galleries WHERE id = ?',
        [id]
      );

      if (galleries.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Gallery not found'
        });
      }

      const currentGallery = galleries[0];

      // Check ownership for partner_fotografi
      if (req.user.user_role === 'partner_fotografi' && currentGallery.created_by !== req.user.ID) {
        await connection.end();
        return res.status(403).json({
          success: false,
          message: 'You can only delete galleries you created'
        });
      }

      // Delete gallery (photos will be deleted via CASCADE)
      await connection.query('DELETE FROM mata_elang_galleries WHERE id = ?', [id]);

      await connection.end();

      res.json({
        success: true,
        message: 'Gallery deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting gallery:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete gallery',
        error: error.message
      });
    }
  }

  /**
   * Add photo to gallery
   */
  static async addPhoto(req, res) {
    try {
      const { galleryId } = req.params;
      const { image_url, caption, alt_text, photographer, is_cover = false } = req.body;

      if (!image_url) {
        return res.status(400).json({
          success: false,
          message: 'Image URL is required'
        });
      }

      const connection = await mysql.createConnection(getDbConfig());

      // Check if gallery exists
      const [galleries] = await connection.query(
        'SELECT * FROM mata_elang_galleries WHERE id = ?',
        [galleryId]
      );

      if (galleries.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Gallery not found'
        });
      }

      const gallery = galleries[0];

      // Security: If partner fotografi adds photo to published gallery, require re-approval
      if (req.user.user_role === 'partner_fotografi' &&
          gallery.status === 'published' &&
          gallery.created_by === req.user.ID) {
        await connection.query(
          'UPDATE mata_elang_galleries SET status = "pending_approval", published_at = NULL WHERE id = ?',
          [galleryId]
        );
        console.log(`🔒 Partner fotografi ${req.user.ID} added photo to published gallery ${galleryId}, requiring re-approval`);
      }

      // Get next sort order
      const [sortResult] = await connection.query(
        'SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM mata_elang_photos WHERE gallery_id = ?',
        [galleryId]
      );

      const sortOrder = sortResult[0].next_order;

      // If this is set as cover, remove cover from other photos
      if (is_cover) {
        await connection.query(
          'UPDATE mata_elang_photos SET is_cover = false WHERE gallery_id = ?',
          [galleryId]
        );

        // Also update gallery cover_image
        await connection.query(
          'UPDATE mata_elang_galleries SET cover_image = ? WHERE id = ?',
          [image_url, galleryId]
        );
      }

      const [result] = await connection.query(`
        INSERT INTO mata_elang_photos
        (gallery_id, image_url, caption, alt_text, photographer, sort_order, is_cover)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [galleryId, image_url, caption, alt_text, photographer, sortOrder, is_cover]);

      await connection.end();

      res.status(201).json({
        success: true,
        message: 'Photo added successfully',
        data: {
          id: result.insertId
        }
      });

    } catch (error) {
      console.error('Error adding photo:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add photo',
        error: error.message
      });
    }
  }

  /**
   * Update photo
   */
  static async updatePhoto(req, res) {
    try {
      const { photoId } = req.params;
      const { caption, alt_text, photographer, sort_order, is_cover } = req.body;

      const connection = await mysql.createConnection(getDbConfig());

      // Check if photo exists
      const [photos] = await connection.query(
        'SELECT * FROM mata_elang_photos WHERE id = ?',
        [photoId]
      );

      if (photos.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Photo not found'
        });
      }

      const photo = photos[0];

      // Get gallery info for security check
      const [galleries] = await connection.query(
        'SELECT * FROM mata_elang_galleries WHERE id = ?',
        [photo.gallery_id]
      );

      if (galleries.length > 0) {
        const gallery = galleries[0];

        // Security: If partner fotografi updates photo in published gallery, require re-approval
        if (req.user.user_role === 'partner_fotografi' &&
            gallery.status === 'published' &&
            gallery.created_by === req.user.ID) {
          await connection.query(
            'UPDATE mata_elang_galleries SET status = "pending_approval", published_at = NULL WHERE id = ?',
            [photo.gallery_id]
          );
          console.log(`🔒 Partner fotografi ${req.user.ID} updated photo in published gallery ${photo.gallery_id}, requiring re-approval`);
        }
      }

      // If this is set as cover, remove cover from other photos
      if (is_cover && !photo.is_cover) {
        await connection.query(
          'UPDATE mata_elang_photos SET is_cover = false WHERE gallery_id = ?',
          [photo.gallery_id]
        );

        // Also update gallery cover_image
        await connection.query(
          'UPDATE mata_elang_galleries SET cover_image = ? WHERE id = ?',
          [photo.image_url, photo.gallery_id]
        );
      }

      await connection.query(`
        UPDATE mata_elang_photos
        SET caption = ?, alt_text = ?, photographer = ?,
            sort_order = ?, is_cover = ?
        WHERE id = ?
      `, [
        caption !== undefined ? caption : photo.caption,
        alt_text !== undefined ? alt_text : photo.alt_text,
        photographer !== undefined ? photographer : photo.photographer,
        sort_order !== undefined ? sort_order : photo.sort_order,
        is_cover !== undefined ? is_cover : photo.is_cover,
        photoId
      ]);

      await connection.end();

      res.json({
        success: true,
        message: 'Photo updated successfully'
      });

    } catch (error) {
      console.error('Error updating photo:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update photo',
        error: error.message
      });
    }
  }

  /**
   * Delete photo
   */
  static async deletePhoto(req, res) {
    try {
      const { photoId } = req.params;
      const connection = await mysql.createConnection(getDbConfig());

      // Check if photo exists
      const [photos] = await connection.query(
        'SELECT * FROM mata_elang_photos WHERE id = ?',
        [photoId]
      );

      if (photos.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Photo not found'
        });
      }

      const photo = photos[0];

      // Get gallery info for security check
      const [galleries] = await connection.query(
        'SELECT * FROM mata_elang_galleries WHERE id = ?',
        [photo.gallery_id]
      );

      if (galleries.length > 0) {
        const gallery = galleries[0];

        // Security: If partner fotografi deletes photo from published gallery, require re-approval
        if (req.user.user_role === 'partner_fotografi' &&
            gallery.status === 'published' &&
            gallery.created_by === req.user.ID) {
          await connection.query(
            'UPDATE mata_elang_galleries SET status = "pending_approval", published_at = NULL WHERE id = ?',
            [photo.gallery_id]
          );
          console.log(`🔒 Partner fotografi ${req.user.ID} deleted photo from published gallery ${photo.gallery_id}, requiring re-approval`);
        }
      }

      // Delete photo
      await connection.query('DELETE FROM mata_elang_photos WHERE id = ?', [photoId]);

      // If this was the cover photo, set another photo as cover
      if (photo.is_cover) {
        const [remainingPhotos] = await connection.query(
          'SELECT * FROM mata_elang_photos WHERE gallery_id = ? ORDER BY sort_order ASC LIMIT 1',
          [photo.gallery_id]
        );

        if (remainingPhotos.length > 0) {
          const newCover = remainingPhotos[0];
          await connection.query(
            'UPDATE mata_elang_photos SET is_cover = true WHERE id = ?',
            [newCover.id]
          );
          await connection.query(
            'UPDATE mata_elang_galleries SET cover_image = ? WHERE id = ?',
            [newCover.image_url, photo.gallery_id]
          );
        } else {
          // No photos left, clear cover_image
          await connection.query(
            'UPDATE mata_elang_galleries SET cover_image = NULL WHERE id = ?',
            [photo.gallery_id]
          );
        }
      }

      await connection.end();

      res.json({
        success: true,
        message: 'Photo deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting photo:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete photo',
        error: error.message
      });
    }
  }

  /**
   * Upload image for gallery
   */
  static async uploadImage(req, res) {
    try {
      console.log('📝 Uploading image for Mata Elang gallery');

      if (!req.files || !req.files.image) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      const imageFile = req.files.image[0];

      // Force HTTPS in production, or use protocol from request
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
      const baseUrl = `${protocol}://${req.get('host')}`;

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

  /**
   * Download photo with watermark
   */
  static async downloadPhotoWithWatermark(req, res) {
    try {
      const { photoId } = req.params;
      const sharp = require('sharp');
      const path = require('path');
      const fs = require('fs');

      const connection = await mysql.createConnection(getDbConfig());

      // Get photo info from published gallery
      const [photos] = await connection.query(`
        SELECT p.*, g.status as gallery_status
        FROM mata_elang_photos p
        JOIN mata_elang_galleries g ON p.gallery_id = g.id
        WHERE p.id = ? AND g.status = 'published'
      `, [photoId]);

      if (photos.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Photo not found or not from published gallery'
        });
      }

      const photo = photos[0];
      console.log('📷 Photo data:', {
        id: photo.id,
        image_url: photo.image_url
      });
      await connection.end();

      // Get original image path - handle both full URL and relative path
      let imagePath;
      if (photo.image_url.startsWith('http')) {
        // Full URL like https://naramakna.id/uploads/2025/09/filename.jpg
        const url = new URL(photo.image_url);
        imagePath = url.pathname.replace('/uploads/', '');
      } else {
        // Relative path like /uploads/2025/09/filename.jpg
        imagePath = photo.image_url.replace('/uploads/', '');
      }

      const fullImagePath = path.join(__dirname, '../../../public/uploads', imagePath);
      console.log('🔍 Looking for image at:', fullImagePath);

      // Watermark path
      const watermarkPath = path.join(__dirname, '../../assets/watermark.png');

      // Check if files exist
      if (!fs.existsSync(fullImagePath)) {
        return res.status(404).json({
          success: false,
          message: 'Original image file not found'
        });
      }

      if (!fs.existsSync(watermarkPath)) {
        return res.status(404).json({
          success: false,
          message: 'Watermark file not found'
        });
      }

      // Get image metadata
      const metadata = await sharp(fullImagePath).metadata();
      const { width, height } = metadata;

      // Calculate watermark size based on image resolution (increased by 16%)
      let watermarkWidth;
      if (width >= 5000) {
        // High resolution (5000px+): 29% of width (25% + 16%), min 928px, max 1392px
        watermarkWidth = Math.max(Math.min(Math.floor(width * 0.29), 1392), 928);
      } else if (width >= 3000) {
        // Medium high resolution (3000-5000px): 35% of width (30% + 16%), min 696px, max 928px
        watermarkWidth = Math.max(Math.min(Math.floor(width * 0.35), 928), 696);
      } else if (width >= 1500) {
        // Medium resolution (1500-3000px): 29% of width (25% + 16%), min 348px, max 696px
        watermarkWidth = Math.max(Math.min(Math.floor(width * 0.29), 696), 348);
      } else {
        // Lower resolution (<1500px): 23% of width (20% + 16%), min 174px, max 464px
        watermarkWidth = Math.max(Math.min(Math.floor(width * 0.23), 464), 174);
      }
      console.log('🏷️ Watermark dimensions:', {
        originalWidth: width,
        originalHeight: height,
        watermarkWidth: watermarkWidth
      });

      // Resize watermark and get actual dimensions
      const watermarkBuffer = await sharp(watermarkPath)
        .resize(watermarkWidth)
        .png()
        .toBuffer();

      // Get watermark dimensions after resize
      const watermarkMeta = await sharp(watermarkBuffer).metadata();
      const watermarkHeight = watermarkMeta.height;

      // Center the watermark like a meme overlay
      const centerX = Math.floor((width - watermarkWidth) / 2);
      const centerY = Math.floor((height - watermarkHeight) / 2);

      console.log('🏷️ Final watermark size (centered like meme):', {
        width: watermarkWidth,
        height: watermarkHeight,
        position: `center (${centerX}, ${centerY})`,
        imageSize: `${width}x${height}`
      });

      const watermarkedImage = await sharp(fullImagePath)
        .composite([{
          input: watermarkBuffer,
          left: centerX,
          top: centerY,
          blend: 'over'
        }])
        .jpeg({ quality: 90 })
        .toBuffer();

      // Set response headers
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="naramakna-${photoId}.jpg"`,
        'Cache-Control': 'no-cache'
      });

      res.send(watermarkedImage);

    } catch (error) {
      console.error('❌ Error downloading photo with watermark:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process image',
        error: error.message
      });
    }
  }
}

module.exports = MataElangController;