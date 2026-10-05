const test = require('node:test');
const assert = require('node:assert/strict');
const { Sequelize, DataTypes } = require('sequelize');
const { createScheduledPublisher } = require('../src/services/scheduledPublisher');

// Integration tests only connect to a disposable localhost database with this
// fixed name. They never load backend/.env or the application's database config.
test('transactional auto-publish with disposable MySQL', {
  skip: !process.env.SCHEDULER_TEST_MYSQL_PORT
}, async t => {
  const sequelize = new Sequelize('scheduler_test', 'root', 'scheduler-test-only', {
    host: '127.0.0.1', port: Number(process.env.SCHEDULER_TEST_MYSQL_PORT),
    dialect: 'mysql', timezone: '+07:00', logging: false,
    pool: { max: 5 }, dialectOptions: { connectTimeout: 5000 }
  });
  const Post = sequelize.define('Post', {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    post_title: DataTypes.STRING, post_excerpt: DataTypes.TEXT,
    post_status: DataTypes.STRING, post_type: { type: DataTypes.STRING, defaultValue: 'post' },
    post_author: DataTypes.INTEGER, scheduled_by: DataTypes.INTEGER,
    post_date: DataTypes.DATE, post_date_gmt: DataTypes.DATE,
    post_modified: DataTypes.DATE, post_modified_gmt: DataTypes.DATE,
    scheduled_publish_date: DataTypes.DATE, original_status: DataTypes.STRING,
    deleted_at: DataTypes.DATE
  }, { tableName: 'posts', timestamps: false });
  const PostMeta = sequelize.define('PostMeta', {
    meta_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    post_id: DataTypes.INTEGER, meta_key: DataTypes.STRING, meta_value: DataTypes.TEXT
  }, { tableName: 'postmeta', timestamps: false });
  const publish = createScheduledPublisher({ sequelize, Post, PostMeta });
  const now = new Date('2026-10-05T01:50:00Z');
  const earlier = new Date('2026-10-05T01:49:00Z');
  const later = new Date('2026-10-05T01:51:00Z');
  async function seed(overrides = {}) {
    return Post.create({ post_title: 'Scheduled test', post_status: 'scheduled',
      post_author: 1, scheduled_by: 1, scheduled_publish_date: earlier, post_date: earlier, ...overrides });
  }
  async function reset() {
    await sequelize.sync({ force: true });
    await sequelize.query('DROP TABLE IF EXISTS post_schedule_log');
    await sequelize.query(`CREATE TABLE post_schedule_log (
      id INT AUTO_INCREMENT PRIMARY KEY, post_id INT NOT NULL, action_type VARCHAR(30),
      scheduled_date DATETIME, scheduled_by INT NOT NULL, notes TEXT
    ) ENGINE=InnoDB`);
  }
  try {
    await t.test('publishes only due articles and excludes deleted, draft, and attachment records', async () => {
      await reset();
      const due = await seed();
      const ignored = await Promise.all([
        seed({ scheduled_publish_date: later }), seed({ deleted_at: now }),
        seed({ post_status: 'draft' }), seed({ post_type: 'attachment' })
      ]);
      const result = await publish({ now });
      assert.equal(result.published.length, 1);
      assert.equal(result.published[0].id, due.ID);
      assert.equal(+new Date(result.published[0].scheduled_date), +earlier);
      await due.reload();
      assert.equal(due.post_status, 'publish');
      assert.equal(due.scheduled_publish_date, null);
      for (const post of ignored) {
        await post.reload();
        assert.notEqual(post.post_status, 'publish');
      }
    });
    await t.test('future posts without scheduled_by use the author for the mandatory audit log', async () => {
      await reset();
      const post = await seed({ post_status: 'future', scheduled_by: null, scheduled_publish_date: null });
      await seed({ post_status: 'future', post_date: later });
      const result = await publish({ now });
      assert.equal(result.errors.length, 0);
      assert.equal(result.published.length, 1);
      const [logs] = await sequelize.query('SELECT * FROM post_schedule_log');
      assert.equal(logs[0].scheduled_by, 1);
      assert.equal(logs[0].post_id, post.ID);
    });
    await t.test('a failed audit insert rolls back the article and permits retry', async () => {
      await reset();
      const post = await seed({ scheduled_by: null, post_author: null });
      const result = await publish({ now });
      assert.equal(result.errors.length, 1);
      assert.equal(result.published.length, 0);
      await post.reload();
      assert.equal(post.post_status, 'scheduled');
      assert.equal(+post.scheduled_publish_date, +earlier);
      await post.update({ post_author: 1 });
      assert.equal((await publish({ now })).published.length, 1);
    });
    await t.test('rechecks cancellation after candidates have been selected', async () => {
      await reset();
      const post = await seed();
      const result = await publish({ now, beforePost: () => post.update({ post_status: 'draft' }) });
      assert.equal(result.published.length, 0);
    });
    await t.test('concurrent checks create one publication and one log', async () => {
      await reset();
      await seed();
      const results = await Promise.all([publish({ now }), publish({ now })]);
      assert.equal(results.reduce((sum, result) => sum + result.published.length, 0), 1);
      assert.equal(results.reduce((sum, result) => sum + result.errors.length, 0), 0);
      const [logs] = await sequelize.query('SELECT * FROM post_schedule_log');
      assert.equal(logs.length, 1);
      assert.equal((await publish({ now })).published.length, 0);
    });
    await t.test('preserves metadata and the featured image caption', async () => {
      await reset();
      const post = await seed();
      const image = await seed({ post_type: 'attachment', post_status: 'inherit' });
      await PostMeta.bulkCreate([
        { post_id: post.ID, meta_key: '_thumbnail_id', meta_value: String(image.ID) },
        { post_id: post.ID, meta_key: '_thumbnail_caption', meta_value: 'Image caption' },
        { post_id: post.ID, meta_key: '_image_captions', meta_value: '{"image":"caption"}' }
      ]);
      assert.equal((await publish({ now })).published.length, 1);
      await image.reload();
      assert.equal(image.post_title, 'Image caption');
      assert.equal(await PostMeta.count(), 3);
    });
  } finally {
    await sequelize.close();
  }
});
