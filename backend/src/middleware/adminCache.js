/**
 * Admin-specific cache middleware
 * Short TTL cache for read-only admin endpoints
 * Safe: only caches GET requests that show stats/lists
 */

const cache = new Map();
const ADMIN_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

// Cleanup every 5 minutes
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
    console.log(\`Admin cache: cleaned \${cleaned} entries\`);
  }
}, 5 * 60 * 1000);

const adminCache = (ttl = ADMIN_CACHE_TTL) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Include user role in cache key for security
    const userRole = req.user?.user_role || "unknown";
    const key = \`admin:\${userRole}:\${req.originalUrl || req.url}\`;
    const now = Date.now();
    const cached = cache.get(key);

    if (cached && now < cached.expiry) {
      console.log(\`✅ Admin cache HIT: \${key}\`);
      return res.json(cached.data);
    }

    console.log(\`❌ Admin cache MISS: \${key}\`);

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode === 200 && data) {
        cache.set(key, {
          data,
          expiry: now + ttl
        });
        
        // Limit to 30 entries
        if (cache.size > 30) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
      }
      return originalJson(data);
    };

    next();
  };
};

const clearAdminCache = () => {
  cache.clear();
  console.log("Admin cache cleared");
};

module.exports = { adminCache, clearAdminCache };
