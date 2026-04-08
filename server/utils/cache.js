const NodeCache = require('node-cache');

// Simple in-memory cache (Redis removed to avoid dependency issues)
const memoryCache = new NodeCache({
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false
});

// Cache wrapper class
class CacheService {
  constructor() {
    this.useRedis = false; // Disabled for now
    this.prefix = process.env.CACHE_PREFIX || 'unifit:';
  }

  // Get value from cache
  async get(key) {
    try {
      if (this.useRedis && redisClient) {
        const fullKey = `${this.prefix}${key}`;
        const value = await redisClient.get(fullKey);
        return value ? JSON.parse(value) : null;
      } else {
        return memoryCache.get(key);
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Set value in cache
  async set(key, value, ttl = 300) {
    try {
      if (this.useRedis && redisClient) {
        const fullKey = `${this.prefix}${key}`;
        await redisClient.setEx(fullKey, ttl, JSON.stringify(value));
      } else {
        memoryCache.set(key, value, ttl);
      }
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // Delete value from cache
  async del(key) {
    try {
      if (this.useRedis && redisClient) {
        const fullKey = `${this.prefix}${key}`;
        await redisClient.del(fullKey);
      } else {
        memoryCache.del(key);
      }
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // Clear all cache
  async clear() {
    try {
      if (this.useRedis && redisClient) {
        const keys = await redisClient.keys(`${this.prefix}*`);
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
      } else {
        memoryCache.flushAll();
      }
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  // Check if key exists
  async exists(key) {
    try {
      if (this.useRedis && redisClient) {
        const fullKey = `${this.prefix}${key}`;
        const exists = await redisClient.exists(fullKey);
        return exists === 1;
      } else {
        return memoryCache.has(key);
      }
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  // Increment value
  async incr(key, amount = 1) {
    try {
      if (this.useRedis && redisClient) {
        const fullKey = `${this.prefix}${key}`;
        return await redisClient.incrBy(fullKey, amount);
      } else {
        const current = memoryCache.get(key) || 0;
        const newValue = current + amount;
        memoryCache.set(key, newValue);
        return newValue;
      }
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  // Get cache statistics
  async getStats() {
    try {
      if (this.useRedis && redisClient) {
        const info = await redisClient.info('memory');
        return {
          type: 'redis',
          info: info
        };
      } else {
        const keys = memoryCache.keys();
        const stats = memoryCache.getStats();
        return {
          type: 'memory',
          keys: keys.length,
          hits: stats.hits,
          misses: stats.misses,
          hitRate: stats.hits / (stats.hits + stats.misses) || 0
        };
      }
    } catch (error) {
      console.error('Cache stats error:', error);
      return null;
    }
  }
}

// Create cache instance
const cache = new CacheService();

// Cache middleware factory
const cacheMiddleware = (keyGenerator, ttl = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = typeof keyGenerator === 'function' 
      ? keyGenerator(req) 
      : `${req.originalUrl}`;

    try {
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        res.set('X-Cache', 'HIT');
        return res.json(cachedData);
      }

      // Store original res.json method
      const originalJson = res.json;
      
      // Override res.json to cache the response
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode === 200) {
          cache.set(cacheKey, data, ttl);
        }
        res.set('X-Cache', 'MISS');
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Cache invalidation middleware
const invalidateCache = (keyPattern) => {
  return async (req, res, next) => {
    // Run the main request first
    next();
    
    // Invalidate cache after successful request
    res.on('finish', async () => {
      if (res.statusCode < 400) {
        try {
          if (typeof keyPattern === 'function') {
            const keys = keyPattern(req);
            if (Array.isArray(keys)) {
              await Promise.all(keys.map(key => cache.del(key)));
            } else {
              await cache.del(keys);
            }
          } else {
            await cache.del(keyPattern);
          }
        } catch (error) {
          console.error('Cache invalidation error:', error);
        }
      }
    });
  };
};

// Rate limiting with cache
const createRateLimiter = (windowMs, maxRequests, keyGenerator = (req) => req.ip) => {
  return async (req, res, next) => {
    const key = `rate_limit:${keyGenerator(req)}`;
    
    try {
      const current = await cache.incr(key);
      
      if (current === 1) {
        // Set expiration for first request
        await cache.set(key, 1, Math.ceil(windowMs / 1000));
      }
      
      if (current > maxRequests) {
        return res.status(429).json({
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${Math.ceil(windowMs / 1000)} seconds.`,
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - current),
        'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
      });
      
      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next();
    }
  };
};

module.exports = {
  cache,
  cacheMiddleware,
  invalidateCache,
  createRateLimiter
};
