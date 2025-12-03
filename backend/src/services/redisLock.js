/**
 * Redis Lock Utility for Distributed Locking
 * Prevents duplicate cron jobs from running simultaneously
 */

const cacheService = require('./cacheService');

class RedisLock {
  /**
   * Ensure Redis connection is ready with retry
   * @param {number} maxRetries - Maximum retry attempts
   * @param {number} retryDelay - Delay between retries in ms
   * @returns {Promise<boolean>} True if connected
   */
  static async ensureConnected(maxRetries = 5, retryDelay = 500) {
    for (let i = 0; i < maxRetries; i++) {
      if (cacheService.isConnected) {
        return true;
      }
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    return cacheService.isConnected;
  }

  /**
   * Acquire a distributed lock
   * @param {string} lockKey - Unique key for the lock (e.g., 'cron:publish-posts')
   * @param {number} ttlSeconds - Lock expiration time in seconds (default: 120)
   * @param {string} lockValue - Unique value for this lock instance (default: random)
   * @returns {Promise<string|null>} Lock value if acquired, null if lock already exists
   */
  static async acquire(lockKey, ttlSeconds = 120, lockValue = null) {
    try {
      // Wait for Redis to be ready (with retry)
      const isReady = await this.ensureConnected();
      
      if (!isReady) {
        console.warn('🔒 Redis not connected after retries, skipping lock (allowing execution)');
        return 'no-redis-fallback'; // Allow execution if Redis is down
      }

      // Generate unique lock value if not provided
      const value = lockValue || `${process.pid}-${Date.now()}-${Math.random()}`;
      const fullKey = `lock:${lockKey}`;

      // Try to set the lock with NX (only if not exists) and EX (expiration)
      const result = await cacheService.client.set(
        fullKey,
        value,
        'EX',
        ttlSeconds,
        'NX'
      );

      if (result === 'OK') {
        console.log(`🔒 Lock acquired: ${lockKey} (TTL: ${ttlSeconds}s)`);
        return value;
      } else {
        // Lock already exists
        const existingTTL = await cacheService.client.ttl(fullKey);
        console.log(`🔒 Lock already held: ${lockKey} (remaining: ${existingTTL}s)`);
        return null;
      }
    } catch (error) {
      console.error(`🔒 Lock acquire error for ${lockKey}:`, error.message);
      // On error, allow execution (fail-open for availability)
      return 'error-fallback';
    }
  }

  /**
   * Release a distributed lock
   * @param {string} lockKey - The lock key to release
   * @param {string} lockValue - The value used when acquiring (for safety)
   * @returns {Promise<boolean>} True if released, false otherwise
   */
  static async release(lockKey, lockValue) {
    try {
      if (!cacheService.isConnected) {
        return true; // No Redis, nothing to release
      }

      const fullKey = `lock:${lockKey}`;

      // Only delete if the value matches (prevent releasing someone else's lock)
      if (lockValue === 'no-redis-fallback' || lockValue === 'error-fallback') {
        return true;
      }

      // Lua script to atomically check and delete
      const luaScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;

      const result = await cacheService.client.eval(
        luaScript,
        1,
        fullKey,
        lockValue
      );

      if (result === 1) {
        console.log(`🔓 Lock released: ${lockKey}`);
        return true;
      } else {
        console.warn(`🔓 Lock not released (value mismatch or expired): ${lockKey}`);
        return false;
      }
    } catch (error) {
      console.error(`🔓 Lock release error for ${lockKey}:`, error.message);
      return false;
    }
  }

  /**
   * Execute a function with automatic lock acquisition and release
   * @param {string} lockKey - The lock key
   * @param {Function} fn - Async function to execute
   * @param {Object} options - Options {ttl, onLockFailed}
   * @returns {Promise<any>} Result of the function
   */
  static async withLock(lockKey, fn, options = {}) {
    const { ttl = 120, onLockFailed = null } = options;

    const lockValue = await this.acquire(lockKey, ttl);

    if (!lockValue) {
      console.log(`⏭️  Skipping execution - lock already held: ${lockKey}`);
      if (onLockFailed) {
        return await onLockFailed();
      }
      return null;
    }

    try {
      console.log(`▶️  Executing with lock: ${lockKey}`);
      const result = await fn();
      return result;
    } finally {
      await this.release(lockKey, lockValue);
    }
  }

  /**
   * Check if a lock exists
   * @param {string} lockKey - The lock key to check
   * @returns {Promise<boolean>} True if lock exists
   */
  static async exists(lockKey) {
    try {
      if (!cacheService.isConnected) {
        return false;
      }

      const fullKey = `lock:${lockKey}`;
      const ttl = await cacheService.client.ttl(fullKey);
      return ttl > 0;
    } catch (error) {
      console.error(`Lock exists check error for ${lockKey}:`, error.message);
      return false;
    }
  }

  /**
   * Get remaining TTL for a lock
   * @param {string} lockKey - The lock key
   * @returns {Promise<number>} Remaining seconds (-1 if no expiration, -2 if not exists)
   */
  static async getTTL(lockKey) {
    try {
      if (!cacheService.isConnected) {
        return -2;
      }

      const fullKey = `lock:${lockKey}`;
      return await cacheService.client.ttl(fullKey);
    } catch (error) {
      console.error(`Lock TTL check error for ${lockKey}:`, error.message);
      return -2;
    }
  }
}

module.exports = RedisLock;
