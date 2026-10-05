const { Post, PostMeta } = require('../models');
const { Op } = require('sequelize');

function validateCreate(body, userRole) {
  const { title, content, channel, description, summary_social, status } = body;
  if (!title || !content || !channel) {
    return { valid: false, code: 400, message: 'Title, content, and channel are required' };
  }
  const desiredStatus = status || ((userRole === 'admin' || userRole === 'superadmin') ? 'published' : 'draft');
  if (desiredStatus === 'published' && (!description || !summary_social)) {
    return { valid: false, code: 400, message: 'Description and summary social are required for published posts' };
  }
  return { valid: true, desiredStatus };
}

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 50);
}

async function findRecentDuplicate(userId, title) {
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  return await Post.findOne({
    where: {
      post_author: userId,
      post_title: title,
      post_type: 'post',
      post_status: { [Op.in]: ['draft', 'pending', 'future'] },
      post_date: { [Op.gte]: twoMinutesAgo }
    },
    order: [['post_date', 'DESC']]
  });
}

async function findDraftDuplicate(userId, title) {
  return await Post.findOne({
    where: {
      post_author: userId,
      post_title: title,
      post_status: 'draft',
      post_type: 'post'
    }
  });
}

async function updatePostMeta(postId, metaKey, metaValue) {
  await PostMeta.upsert({ post_id: postId, meta_key: metaKey, meta_value: metaValue });
}

async function updateExistingPost(existingPost, body) {
  const {
    content,
    description,
    summary_social,
    channel,
    publish_date,
    location,
    mark_as_18_plus,
    featured_image,
    featured_image_caption,
    image_captions
  } = body;

  await existingPost.update({
    post_content: content,
    post_excerpt: description || '',
    post_modified: new Date(),
    post_date_gmt: new Date()
  });

  if (summary_social) await updatePostMeta(existingPost.ID, '_summary_social', summary_social);
  if (channel) await updatePostMeta(existingPost.ID, '_channel', channel);
  if (publish_date) {
    await updatePostMeta(existingPost.ID, '_publish_date', publish_date);
    const scheduledDate = new Date(publish_date);
    if (scheduledDate > new Date()) {
      await updatePostMeta(existingPost.ID, '_scheduled_publish_date', publish_date);
    }
  }
  if (location) await updatePostMeta(existingPost.ID, '_location', location);
  if (mark_as_18_plus !== undefined) await updatePostMeta(existingPost.ID, '_mark_as_18_plus', mark_as_18_plus ? '1' : '0');

  if (featured_image) {
    const attachment = await Post.findOne({ where: { guid: featured_image, post_type: 'attachment' } });
    if (attachment) {
      await updatePostMeta(existingPost.ID, '_thumbnail_id', attachment.ID);
    }
  }
  if (featured_image_caption !== undefined) {
    await updatePostMeta(existingPost.ID, '_thumbnail_caption', featured_image_caption || '');
    if (featured_image) {
      const existingAttachment = await Post.findOne({ where: { guid: featured_image, post_type: 'attachment' } });
      if (existingAttachment && featured_image_caption) {
        await existingAttachment.update({ post_title: featured_image_caption, post_excerpt: featured_image_caption });
      }
    }
  }

  if (image_captions && typeof image_captions === 'object') {
    await updatePostMeta(existingPost.ID, '_image_captions', JSON.stringify(image_captions));
  }

  return existingPost;
}

function parsePublishDateWIB(publish_date) {
  let publishDate;
  if (publish_date) {
    publishDate = new Date(publish_date);
    if (!publish_date.includes('Z') && !publish_date.match(/[+-]\d{2}:?\d{2}$/)) {
      const wibOffset = 7 * 60;
      const localOffset = publishDate.getTimezoneOffset();
      const adjustmentMinutes = wibOffset + localOffset;
      publishDate = new Date(publishDate.getTime() + (adjustmentMinutes * 60 * 1000));
    }
  } else {
    publishDate = new Date();
  }
  const isFuturePost = publishDate > new Date();
  return { publishDate, isFuturePost };
}

function determinePostStatus(userRole, desiredStatus, isFuturePost, publishDate) {
  let postStatus;
  let scheduledPublishDate = null;
  if (userRole === 'admin' || userRole === 'superadmin') {
    if (desiredStatus === 'published') {
      if (isFuturePost) {
        postStatus = 'future';
        scheduledPublishDate = publishDate;
      } else {
        postStatus = 'publish';
      }
    } else {
      postStatus = 'draft';
    }
  } else {
    if (desiredStatus === 'published') {
      postStatus = 'pending';
      if (isFuturePost) scheduledPublishDate = publishDate;
    } else {
      postStatus = 'draft';
    }
  }
  return { postStatus, scheduledPublishDate };
}

async function handleFeaturedImage({ featured_image, featured_image_caption, userId, title, transaction }) {
  let thumbnailId = null;
  if (!featured_image) return null;
  try {
    const existingAttachment = await Post.findOne({ where: { guid: featured_image, post_type: 'attachment' } });
    if (existingAttachment) {
      thumbnailId = existingAttachment.ID;
      if (featured_image_caption) {
        await existingAttachment.update({ post_title: featured_image_caption, post_excerpt: featured_image_caption }, { transaction });
      }
    } else {
      const attachmentPost = await Post.create({
        post_author: userId,
        post_date: new Date(),
        post_date_gmt: new Date(),
        post_content: '',
        post_title: featured_image_caption || `Featured image for ${title}`,
        post_excerpt: featured_image_caption || '',
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
  } catch {
    thumbnailId = null;
  }
  return thumbnailId;
}

function buildMetaData({ postId, description, summary_social, channel, topic, keyword, location, mark_as_18_plus, editUserId, scheduledPublishDate, thumbnailId, featured_image_caption, image_captions }) {
  const metaData = [
    { post_id: postId, meta_key: '_aioseo_description', meta_value: description },
    { post_id: postId, meta_key: '_summary_social', meta_value: summary_social },
    { post_id: postId, meta_key: '_channel', meta_value: channel },
    { post_id: postId, meta_key: '_topic', meta_value: topic || '' },
    { post_id: postId, meta_key: '_keyword', meta_value: keyword || '' },
    { post_id: postId, meta_key: '_location', meta_value: location || '' },
    { post_id: postId, meta_key: '_mark_as_18_plus', meta_value: mark_as_18_plus ? '1' : '0' },
    { post_id: postId, meta_key: '_edit_last', meta_value: editUserId.toString() }
  ];

  if (scheduledPublishDate) {
    metaData.push({ post_id: postId, meta_key: '_scheduled_publish_date', meta_value: scheduledPublishDate.toISOString() });
  }
  if (thumbnailId) {
    metaData.push({ post_id: postId, meta_key: '_thumbnail_id', meta_value: thumbnailId.toString() });
  }
  if (featured_image_caption !== undefined) {
    metaData.push({ post_id: postId, meta_key: '_thumbnail_caption', meta_value: featured_image_caption || '' });
  }
  if (image_captions && typeof image_captions === 'object') {
    metaData.push({ post_id: postId, meta_key: '_image_captions', meta_value: JSON.stringify(image_captions) });
  }
  return metaData;
}

async function saveMeta(metaData, transaction) {
  await PostMeta.bulkCreate(metaData, { transaction });
}

module.exports = {
  validateCreate,
  generateSlug,
  findRecentDuplicate,
  findDraftDuplicate,
  updateExistingPost,
  parsePublishDateWIB,
  determinePostStatus,
  handleFeaturedImage,
  buildMetaData,
  saveMeta
};
