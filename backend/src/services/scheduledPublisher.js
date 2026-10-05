const { Op } = require('sequelize');

// Each article and its audit log commit together. Row locks also protect against
// an older BullMQ worker or a manual publish check running at the same time.
function createScheduledPublisher({ sequelize, Post, PostMeta }) {
  return async function publishDuePosts({ now = new Date(), beforePost = async () => {} } = {}) {
    const where = {
      post_type: 'post',
      deleted_at: null,
      [Op.or]: [
        { post_status: 'scheduled', scheduled_publish_date: { [Op.lte]: now } },
        { post_status: 'future', post_date: { [Op.lte]: now } }
      ]
    };
    const candidates = await Post.findAll({
      attributes: ['ID'], where, limit: 100, order: [['ID', 'ASC']]
    });
    const published = [];
    const errors = [];

    for (const candidate of candidates) {
      await beforePost();
      try {
        const result = await sequelize.transaction(async transaction => {
          // Recheck eligibility under a lock: it may have been cancelled or published.
          const post = await Post.findOne({
            attributes: ['ID', 'post_title', 'post_status', 'scheduled_publish_date', 'post_date', 'scheduled_by', 'post_author'],
            where: { ...where, ID: candidate.ID }, transaction, lock: transaction.LOCK.UPDATE
          });
          if (!post) return null;
          const publishTime = post.post_status === 'scheduled' ? post.scheduled_publish_date : post.post_date;
          const update = {
            post_status: 'publish', post_date: publishTime, post_date_gmt: publishTime,
            post_modified: publishTime, post_modified_gmt: publishTime,
            scheduled_publish_date: null, original_status: null
          };
          await post.update(update, { transaction });

          const thumbnail = await PostMeta.findOne({
            where: { post_id: post.ID, meta_key: '_thumbnail_id' }, transaction
          });
          if (thumbnail) {
            const caption = await PostMeta.findOne({
              where: { post_id: post.ID, meta_key: '_thumbnail_caption' }, transaction
            });
            if (caption?.meta_value) {
              const attachment = await Post.findByPk(thumbnail.meta_value, { attributes: ['ID'], transaction });
              if (attachment) await attachment.update({
                post_title: caption.meta_value, post_excerpt: caption.meta_value,
                post_modified: publishTime, post_modified_gmt: publishTime
              }, { transaction });
            }
          }
          // Metadata (including editor image captions) stays on the existing post.
          await sequelize.query(
            `INSERT INTO post_schedule_log (post_id, action_type, scheduled_date, scheduled_by, notes)
             VALUES (:postId, 'published', :scheduledDate, :scheduledBy, 'Auto-published by scheduler')`,
            { replacements: {
              postId: post.ID, scheduledDate: publishTime,
              scheduledBy: post.scheduled_by || post.post_author
            }, transaction }
          );
          return { id: post.ID, title: post.post_title, scheduled_date: publishTime };
        });
        if (result) published.push(result);
      } catch (error) {
        errors.push({ id: candidate.ID, message: error.message });
      }
    }
    return { published, errors };
  };
}

module.exports = { createScheduledPublisher };
