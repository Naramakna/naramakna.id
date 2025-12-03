/**
 * Simple In-Memory Cache Middleware
 * Replaces Redis for resource-constrained VPS
 * Features:
 * - LRU (Least Recently Used) eviction
 * - Automatic cleanup of expired entries
 * - Memory limit to prevent overflow
 */

class MemoryCache {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 100; // Max 100 entries
    this.maxMemory = options.maxMemory || 50 * 1024 * 1024; // 50MB max
    this.cache = new Map();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
    
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // Update access time for LRU
    entry.lastAccess = Date.now();
    this.stats.hits++;
    
    return entry.data;
  }

  set(key, data, ttlSeconds = 300) {
    // Check memory limit before adding
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    const entry = {
      data,
      expiry: Date.now() + (ttlSeconds * 1000),
      lastAccess: Date.now(),
      size: JSON.stringify(data).length
    };
    
    this.cache.set(key, entry);
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear(pattern = null) {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    // Pattern matching (simple wildcard support)
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`Cleared ${keysToDelete.length} cache entries matching: ${pattern}`);
  }

  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`Cache cleanup: removed \${cleaned} expired entries`);
    }
  }

  evictLRU() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  getStats() {
    const totalSize = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.size, 0);
    
    return {
      ...this.stats,
      entries: this.cache.size,
      maxSize: this.maxSize,
      memoryUsed: totalSize,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
    };
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// Singleton instance
const memoryCache = new MemoryCache({
  maxSize: 100,      // Max 100 cached responses
  maxMemory: 50 * 1024 * 1024  // 50MB limit
});

// Middleware factory
const memoryCacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const key = `cache:\${req.originalUrl || req.url}`;

    try {
      const cachedData = memoryCache.get(key);
      
      if (cachedData) {
        console.log(`✅ Cache HIT: \${key}`);
        return res.json(cachedData);
      }

      console.log(`❌ Cache MISS: \${key}`);
      
      // Intercept res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Cache successful responses only
        if (res.statusCode === 200 && body) {
          memoryCache.set(key, body, duration);
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error("Memory cache error:", error.message);
      next();
    }
  };
};

// Clear cache helper
const clearMemoryCache = async (pattern = null) => {
  try {
    if (pattern) {
      memoryCache.clear(pattern);
    } else {
      memoryCache.clear();
      console.log("All memory cache cleared");
    }
  } catch (error) {
    console.error("Error clearing memory cache:", error.message);
  }
};

// Stats endpoint helper
const getCacheStats = () => memoryCache.getStats();

module.exports = {
  memoryCacheMiddleware,
  clearMemoryCache,
  getCacheStats,
  memoryCache
};
