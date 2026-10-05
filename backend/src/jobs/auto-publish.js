require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs');
const os = require('os');
const cron = require('node-cron');
const Redis = require('ioredis');
const sequelize = require('../config/database');
const Post = require('../models/Post');
const PostMeta = require('../models/PostMeta');
const { createScheduledPublisher } = require('../services/scheduledPublisher');
const { STATUS_KEY } = require('../services/schedulerStatus');
const { invalidatePublishedContent } = require('../services/publishCache');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || undefined,
  connectTimeout: 5000, commandTimeout: 5000, maxRetriesPerRequest: 1
});
const publish = createScheduledPublisher({ sequelize, Post, PostMeta });
const lockKey = 'lock:cron:publish-scheduled-posts';
const instanceId = `${os.hostname()}:${process.pid}`;
const healthFile = '/tmp/naramakna-scheduler-health.json';
const snapshot = {
  instanceId, state: 'starting', intervalSeconds: 60, timezone: 'Asia/Jakarta',
  startedAt: new Date().toISOString(), lastHeartbeatAt: null, lastCheckAt: null,
  lastSuccessAt: null, lastError: null, lastPublishedCount: 0,
  totalPublished: 0, consecutiveFailures: 0, recentPublished: []
};
let stopping = false;
let inFlight = null;
let task;
let cacheInvalidationPending = false;

function log(event, data = {}) {
  console.log(JSON.stringify({ time: new Date().toISOString(), service: 'auto-publish', event, ...data }));
}
redis.on('error', error => log('redis_error', { message: error.message }));

async function heartbeat() {
  snapshot.lastHeartbeatAt = new Date().toISOString();
  await redis.set(STATUS_KEY, JSON.stringify(snapshot), 'EX', 604800);
  fs.writeFileSync(healthFile, JSON.stringify(snapshot));
}

async function runCycle() {
  const lockValue = `${instanceId}:${Date.now()}`;
  let ownsLock = false;
  let renewal;
  let leaseLost = false;
  try {
    ownsLock = (await redis.set(lockKey, lockValue, 'EX', 180, 'NX')) === 'OK';
    if (!ownsLock) {
      log('skipped', { reason: 'another_publisher_holds_lock' });
      return;
    }
    snapshot.state = 'running';
    snapshot.lastCheckAt = new Date().toISOString();
    await heartbeat();
    renewal = setInterval(() => {
      redis.eval('if redis.call("get",KEYS[1]) == ARGV[1] then return redis.call("expire",KEYS[1],180) else return 0 end',
        1, lockKey, lockValue).then(async result => {
          if (!result) leaseLost = true;
          else await heartbeat();
        })
        .catch(() => { leaseLost = true; });
    }, 30000);
    const result = await publish({ beforePost: async () => {
      if (stopping || leaseLost || await redis.get(lockKey) !== lockValue) {
        throw new Error('Publish interrupted: scheduler stopped or lock lost');
      }
    } });
    snapshot.lastPublishedCount = result.published.length;
    snapshot.totalPublished += result.published.length;
    snapshot.recentPublished = [...result.published.map(post => ({
      ...post, publishedAt: new Date().toISOString()
    })), ...snapshot.recentPublished].slice(0, 10);
    cacheInvalidationPending ||= result.published.length > 0;
    if (cacheInvalidationPending) {
      await invalidatePublishedContent(redis);
      cacheInvalidationPending = false;
    }
    if (result.errors.length) {
      log('publish_errors', { errors: result.errors });
      throw new Error(`${result.errors.length} artikel gagal dipublish. Artikel ID: ${result.errors.map(e => e.id).join(', ')}`);
    }
    snapshot.state = 'idle';
    snapshot.lastSuccessAt = new Date().toISOString();
    snapshot.consecutiveFailures = 0;
    snapshot.lastError = null;
    log('check_completed', { published: result.published.length, posts: result.published });
  } catch (error) {
    snapshot.state = 'error';
    snapshot.lastError = error.message;
    snapshot.consecutiveFailures += 1;
    log('check_failed', { message: error.message });
  } finally {
    clearInterval(renewal);
    // Only the current lease owner writes the shared status.
    if (ownsLock) {
      try {
        if (await redis.get(lockKey) === lockValue) await heartbeat();
      } catch (error) { log('heartbeat_failed', { message: error.message }); }
      try {
        await redis.eval('if redis.call("get",KEYS[1]) == ARGV[1] then return redis.call("del",KEYS[1]) else return 0 end',
          1, lockKey, lockValue);
      } catch (error) { log('unlock_failed', { message: error.message }); }
    }
  }
}

function tick() {
  if (stopping || inFlight) return;
  inFlight = runCycle().finally(() => { inFlight = null; });
}

async function shutdown() {
  if (stopping) return;
  stopping = true;
  task?.stop();
  if (inFlight) await inFlight;
  snapshot.state = 'stopped';
  try { await heartbeat(); } catch (_) { /* Redis may already be unavailable. */ }
  await sequelize.close();
  redis.disconnect();
  log('stopped');
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
task = cron.schedule('* * * * *', tick, { timezone: 'Asia/Jakarta' });
log('started', { instanceId, intervalSeconds: 60 });
// Catch up overdue articles immediately after a restart.
tick();
