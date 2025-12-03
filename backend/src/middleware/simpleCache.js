/**
 * Ultra-simple response cache - Plain JavaScript object
 * Safe, no dependencies, no complexity
 */

const cache = new Map();
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiry) {
      cache.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(\`Simple cache: cleaned \${cleaned} expired entries\`);
  }
}, 5 * 60 * 1000);

const simpleCache = (ttl = CACHE_TTL) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const key = \`cache:\${req.originalUrl || req.url}\`;
    const now = Date.now();
    const cached = cache.get(key);

    // Return cached response if valid
    if (cached && now < cached.expiry) {
      console.log(\`✅ Cache HIT: \${key}\`);
      return res.json(cached.data);
    }

    console.log(\`❌ Cache MISS: \${key}\`);

    // Intercept res.json to cache response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      // Only cache successful responses
      if (res.statusCode === 200 && data) {
        cache.set(key, {
          data,
          expiry: now + ttl
        });
        
        // Limit cache size to 50 entries (FIFO eviction)
        if (cache.size > 50) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
      }
      return originalJson(data);
    };

    next();
  };
};

// Clear cache helper
const clearSimpleCache = (pattern) => {
  if (!pattern) {
    cache.clear();
    console.log("Simple cache cleared");
    return;
  }
  
  const regex = new RegExp(pattern.replace(/\*/g, ".*"));
  let cleared = 0;
  
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
      cleared++;
    }
  }
  
  console.log(\`Simple cache: cleared \${cleared} entries matching \${pattern}\`);
};

module.exports = { simpleCache, clearSimpleCache };
