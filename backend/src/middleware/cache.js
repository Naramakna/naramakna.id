const cacheService = require("../services/cacheService");

const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedData = await cacheService.get(key);

      if (cachedData) {
        console.log(`✅ Redis Cache HIT: ${key}`);
        return res.json(cachedData);
      }

      console.log(`❌ Redis Cache MISS: ${key}`);

      // Intercept res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Cache successful responses only
        if (res.statusCode === 200 && body) {
          cacheService.set(key, body, duration).catch(err => {
            console.error("Cache set error:", err.message);
          });
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error.message);
      next();
    }
  };
};

const clearCache = async (pattern = "*") => {
  try {
    await cacheService.clear(pattern);
    console.log(`Cache cleared for pattern: ${pattern}`);
  } catch (error) {
    console.error("Error clearing cache:", error.message);
  }
};

module.exports = { cacheMiddleware, clearCache };
