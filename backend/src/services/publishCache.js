// Remove public feed/detail caches after publication without touching sessions,
// locks, scheduler monitoring, or BullMQ jobs in the same Redis database.
async function invalidatePublishedContent(redis) {
  for (const pattern of ['cache:/api/content/*', 'cache:/api/trending/*']) {
    let cursor = '0';
    do {
      const page = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = page[0];
      if (page[1].length) await redis.del(...page[1]);
    } while (cursor !== '0');
  }
}

module.exports = { invalidatePublishedContent };
