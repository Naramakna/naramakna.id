const Redis = require("ioredis");
require("dotenv").config();

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.initializeRedis();
  }

  initializeRedis() {
    const redisConfig = {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        console.log(`Redis retry attempt ${times}, waiting ${delay}ms`);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      connectTimeout: 10000,
      lazyConnect: false,
    };

    this.client = new Redis(redisConfig);

    this.client.on("connect", () => {
      console.log("✅ Redis: Connected");
      this.isConnected = true;
    });

    this.client.on("ready", () => {
      console.log("✅ Redis: Ready to accept commands");
    });

    this.client.on("error", (err) => {
      console.error("❌ Redis Error:", err.message);
      this.isConnected = false;
    });

    this.client.on("close", () => {
      console.log("⚠️  Redis: Connection closed");
      this.isConnected = false;
    });

    this.client.on("reconnecting", () => {
      console.log("🔄 Redis: Reconnecting...");
    });
  }

  async get(key) {
    if (!this.isConnected) {
      console.log("Redis not connected, skipping get");
      return null;
    }

    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Redis get error for key ${key}:`, error.message);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 300) {
    if (!this.isConnected) {
      console.log("Redis not connected, skipping set");
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error(`Redis set error for key ${key}:`, error.message);
      return false;
    }
  }

  async delete(key) {
    if (!this.isConnected) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`Redis delete error for key ${key}:`, error.message);
      return false;
    }
  }

  async clear(pattern = "*") {
    if (!this.isConnected) return false;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
        console.log(`Cleared ${keys.length} keys matching pattern: ${pattern}`);
      }
      return true;
    } catch (error) {
      console.error("Redis clear error:", error.message);
      return false;
    }
  }

  async getStats() {
    if (!this.isConnected) {
      return { connected: false };
    }

    try {
      const info = await this.client.info("stats");
      return {
        connected: true,
        info: info,
      };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  disconnect() {
    if (this.client) {
      this.client.disconnect();
    }
  }
}

// Singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
