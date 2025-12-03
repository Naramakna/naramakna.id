/**
 * Helper functions for Universal Content Container (posts table)
 * 
 * This file provides utilities for working with the hybrid content approach
 * where posts table contains articles, YouTube videos, and TikTok videos
 */

const { Post, PostMeta } = require('./index');

class ContentHelpers {
  
  /**
   * Content type constants
   */
  static CONTENT_TYPES = {
    POST: 'post',
    YOUTUBE_VIDEO: 'youtube_video', 
    TIKTOK_VIDEO: 'tiktok_video',
    PAGE: 'page'
  };

  /**
   * Meta keys for different content types
   */
  static META_KEYS = {
    // YouTube specific
    YOUTUBE_CHANNEL_TITLE: '_youtube_channel_title',
    YOUTUBE_VIEW_COUNT: '_youtube_view_count',
    YOUTUBE_LIKE_COUNT: '_youtube_like_count',
    YOUTUBE_COMMENT_COUNT: '_youtube_comment_count',
    YOUTUBE_DURATION: '_youtube_duration',
    YOUTUBE_PUBLISHED_AT: '_youtube_published_at',
    
    // TikTok specific
    TIKTOK_AUTHOR_USERNAME: '_tiktok_author_username',
    TIKTOK_AUTHOR_DISPLAY_NAME: '_tiktok_author_display_name',
    TIKTOK_PLAY_COUNT: '_tiktok_play_count',
    TIKTOK_LIKE_COUNT: '_tiktok_like_count',
    TIKTOK_SHARE_COUNT: '_tiktok_share_count',
    TIKTOK_COMMENT_COUNT: '_tiktok_comment_count',
    TIKTOK_COVER_URL: '_tiktok_cover_url',
    TIKTOK_CREATED_TIME: '_tiktok_created_time',
    
    // Universal
    THUMBNAIL_URL: '_thumbnail_url',
    SOURCE_URL: '_source_url',
    EXTERNAL_ID: '_external_id', // YouTube ID or TikTok ID
    FEATURED_IMAGE: '_featured_image',
    SEO_TITLE: '_seo_title',
    SEO_DESCRIPTION: '_seo_description'
  };

  /**
   * Create YouTube video post
   */
  static async createYouTubeVideo(videoData, authorId) {
    const post = await Post.create({
      post_author: authorId,
      post_title: videoData.title,
      post_content: videoData.description || '',
      post_name: videoData.videoId, // YouTube video ID as slug
      post_type: this.CONTENT_TYPES.YOUTUBE_VIDEO,
      post_status: 'publish',
      post_date: videoData.publishedAt || new Date(),
      guid: `https://youtube.com/watch?v=${videoData.videoId}`
    });

    // Add YouTube-specific metadata
    const metaData = [
      { meta_key: this.META_KEYS.EXTERNAL_ID, meta_value: videoData.videoId },
      { meta_key: this.META_KEYS.YOUTUBE_CHANNEL_TITLE, meta_value: videoData.channelTitle },
      { meta_key: this.META_KEYS.YOUTUBE_VIEW_COUNT, meta_value: videoData.viewCount?.toString() || '0' },
      { meta_key: this.META_KEYS.YOUTUBE_LIKE_COUNT, meta_value: videoData.likeCount?.toString() || '0' },
      { meta_key: this.META_KEYS.YOUTUBE_COMMENT_COUNT, meta_value: videoData.commentCount?.toString() || '0' },
      { meta_key: this.META_KEYS.YOUTUBE_DURATION, meta_value: videoData.duration || '' },
      { meta_key: this.META_KEYS.THUMBNAIL_URL, meta_value: videoData.thumbnailUrl || '' },
      { meta_key: this.META_KEYS.SOURCE_URL, meta_value: `https://youtube.com/watch?v=${videoData.videoId}` }
    ];

    for (const meta of metaData) {
      if (meta.meta_value) {
        await PostMeta.create({
          post_id: post.ID,
          ...meta
        });
      }
    }

    return post;
  }

  /**
   * Create TikTok video post
   */
  static async createTikTokVideo(videoData, authorId) {
    const post = await Post.create({
      post_author: authorId,
      post_title: videoData.description || 'TikTok Video',
      post_content: videoData.description || '',
      post_name: videoData.videoId, // TikTok video ID as slug
      post_type: this.CONTENT_TYPES.TIKTOK_VIDEO,
      post_status: 'publish',
      post_date: videoData.createdTime || new Date(),
      guid: `https://tiktok.com/@${videoData.username}/video/${videoData.videoId}`
    });

    // Add TikTok-specific metadata
    const metaData = [
      { meta_key: this.META_KEYS.EXTERNAL_ID, meta_value: videoData.videoId },
      { meta_key: this.META_KEYS.TIKTOK_AUTHOR_USERNAME, meta_value: videoData.username },
      { meta_key: this.META_KEYS.TIKTOK_AUTHOR_DISPLAY_NAME, meta_value: videoData.displayName },
      { meta_key: this.META_KEYS.TIKTOK_PLAY_COUNT, meta_value: videoData.playCount?.toString() || '0' },
      { meta_key: this.META_KEYS.TIKTOK_LIKE_COUNT, meta_value: videoData.likeCount?.toString() || '0' },
      { meta_key: this.META_KEYS.TIKTOK_SHARE_COUNT, meta_value: videoData.shareCount?.toString() || '0' },
      { meta_key: this.META_KEYS.TIKTOK_COMMENT_COUNT, meta_value: videoData.commentCount?.toString() || '0' },
      { meta_key: this.META_KEYS.TIKTOK_COVER_URL, meta_value: videoData.coverUrl || '' },
      { meta_key: this.META_KEYS.SOURCE_URL, meta_value: `https://tiktok.com/@${videoData.username}/video/${videoData.videoId}` }
    ];

    for (const meta of metaData) {
      if (meta.meta_value) {
        await PostMeta.create({
          post_id: post.ID,
          ...meta
        });
      }
    }

    return post;
  }

  /**
   * Get content with metadata by type
   */
  static async getContentByType(contentType, options = {}) {
    const { limit = 10, offset = 0, status = 'publish' } = options;
    
    return await Post.findAndCountAll({
      where: {
        post_type: contentType,
        post_status: status
      },
      include: [{
        model: PostMeta,
        as: 'meta'
      }],
      limit,
      offset,
      order: [['post_date', 'DESC']]
    });
  }

  /**
   * Get mixed content feed (all types)
   */
  static async getMixedContentFeed(options = {}) {
    const { limit = 20, offset = 0, contentTypes = null } = options;
    
    const whereClause = {
      post_status: 'publish'
    };

    if (contentTypes && contentTypes.length > 0) {
      whereClause.post_type = contentTypes;
    }
    
    return await Post.findAndCountAll({
      where: whereClause,
      include: [{
        model: PostMeta,
        as: 'meta'
      }],
      limit,
      offset,
      order: [['post_date', 'DESC']]
    });
  }

  /**
   * Update video metadata (for sync operations)
   */
  static async updateVideoMetadata(postId, metaUpdates) {
    for (const [metaKey, metaValue] of Object.entries(metaUpdates)) {
      await PostMeta.upsert({
        post_id: postId,
        meta_key: metaKey,
        meta_value: metaValue?.toString() || ''
      });
    }
  }
}

module.exports = ContentHelpers;