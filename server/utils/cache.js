import redis from "redis";

/**
 * PHASE 4: REDIS CACHING UTILITIES
 * Production-grade caching for frequently accessed data
 */

// Initialize Redis client (production mode)
let redisClient;

export const initializeRedis = async () => {
  try {
    redisClient = redis.createClient({
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB || 0,
      retryStrategy: (options) => {
        if (options.error?.code === "ECONNREFUSED") {
          return new Error("Redis connection refused");
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error("Retry time exhausted");
        }
        return Math.min(options.attempt * 100, 3000);
      },
    });

    redisClient.on("error", (err) => console.error("Redis error:", err));
    redisClient.on("connect", () => console.log("Redis connected"));

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error("Failed to initialize Redis:", error);
    // Gracefully degrade - continue without Redis
    return null;
  }
};

// ✅ Get cached value
export const getCache = async (key) => {
  try {
    if (!redisClient) return null;
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
};

// ✅ Set cached value
export const setCache = async (key, value, ttl = 3600) => {
  try {
    if (!redisClient) return false;
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Cache set error:", error);
    return false;
  }
};

// ✅ Delete cached value
export const deleteCache = async (key) => {
  try {
    if (!redisClient) return false;
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error("Cache delete error:", error);
    return false;
  }
};

// ✅ Clear all cached values matching pattern
export const clearCachePattern = async (pattern) => {
  try {
    if (!redisClient) return false;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error("Cache clear error:", error);
    return false;
  }
};

// ✅ Cache middleware for GET endpoints
export const cacheMiddleware = (duration = 3600) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== "GET") {
      return next();
    }

    try {
      const cacheKey = `${req.originalUrl}`;
      const cachedData = await getCache(cacheKey);

      if (cachedData) {
        res.set("X-Cache", "HIT");
        return res.json(cachedData);
      }

      // Store original json method
      const originalJson = res.json;

      // Override json method to cache response
      res.json = function (data) {
        setCache(cacheKey, data, duration).catch((err) =>
          console.error("Cache set error:", err),
        );
        res.set("X-Cache", "MISS");
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next(); // Continue without caching on error
    }
  };
};

// ✅ Dashboard analytics cache
export const getCachedDashboardAnalytics = async (restaurantId, dateRange) => {
  const cacheKey = `dashboard:analytics:${restaurantId}:${dateRange}`;
  return getCache(cacheKey);
};

export const setCachedDashboardAnalytics = async (
  restaurantId,
  dateRange,
  data,
) => {
  const cacheKey = `dashboard:analytics:${restaurantId}:${dateRange}`;
  return setCache(cacheKey, data, 600); // 10 minutes
};

// ✅ Menu items cache
export const getCachedMenuItems = async (restaurantId) => {
  const cacheKey = `menu:items:${restaurantId}`;
  return getCache(cacheKey);
};

export const setCachedMenuItems = async (restaurantId, data) => {
  const cacheKey = `menu:items:${restaurantId}`;
  return setCache(cacheKey, data, 3600); // 1 hour
};

// ✅ Orders cache (shorter TTL, frequently changing)
export const getCachedOrders = async (restaurantId, status) => {
  const cacheKey = `orders:${restaurantId}:${status || "all"}`;
  return getCache(cacheKey);
};

export const setCachedOrders = async (restaurantId, status, data) => {
  const cacheKey = `orders:${restaurantId}:${status || "all"}`;
  return setCache(cacheKey, data, 60); // 1 minute - frequently changes
};

// ✅ Bills cache
export const getCachedBills = async (restaurantId, status) => {
  const cacheKey = `bills:${restaurantId}:${status || "all"}`;
  return getCache(cacheKey);
};

export const setCachedBills = async (restaurantId, status, data) => {
  const cacheKey = `bills:${restaurantId}:${status || "all"}`;
  return setCache(cacheKey, data, 300); // 5 minutes
};

// ✅ Staff cache
export const getCachedStaff = async (restaurantId) => {
  const cacheKey = `staff:${restaurantId}`;
  return getCache(cacheKey);
};

export const setCachedStaff = async (restaurantId, data) => {
  const cacheKey = `staff:${restaurantId}`;
  return setCache(cacheKey, data, 1800); // 30 minutes
};

// ✅ Invalidate restaurant cache (when data changes)
export const invalidateRestaurantCache = async (restaurantId) => {
  await Promise.all([
    clearCachePattern(`*:${restaurantId}:*`),
    clearCachePattern(`*${restaurantId}*`),
  ]);
};

// ✅ Cache statistics
export const getCacheStats = async () => {
  try {
    if (!redisClient) return null;
    const info = await redisClient.info("stats");
    return info;
  } catch (error) {
    console.error("Cache stats error:", error);
    return null;
  }
};

// ✅ Flush all cache (admin only)
export const flushAllCache = async () => {
  try {
    if (!redisClient) return false;
    await redisClient.flushAll();
    return true;
  } catch (error) {
    console.error("Cache flush error:", error);
    return false;
  }
};

// ✅ Get Redis client
export const getRedisClient = () => {
  return redisClient;
};

/**
 * CACHING STRATEGY GUIDE
 * ====================
 *
 * CACHE TTL (Time To Live) Strategy:
 * - Dashboard analytics: 10 minutes (users want reasonably fresh data)
 * - Menu items: 1 hour (rarely changes)
 * - Orders: 1 minute (frequently changes, real-time important)
 * - Bills: 5 minutes (moderate change frequency)
 * - Staff: 30 minutes (rarely changes)
 * - Search results: 5 minutes
 * - Tables: 1 minute (status changes frequently)
 *
 * Cache Invalidation:
 * - When data is created/updated/deleted
 * - Use invalidateRestaurantCache() to clear all for restaurant
 * - Use deleteCache() for specific keys
 * - Use clearCachePattern() for pattern matching
 *
 * Usage in controllers:
 * 1. Check cache first
 * 2. If not found, fetch from DB
 * 3. Set cache before returning
 * 4. On update, invalidate cache
 *
 * Example:
 * const cached = await getCachedMenuItems(restaurantId);
 * if (cached) return cached;
 *
 * const items = await MenuItem.find({ restaurantId });
 * await setCachedMenuItems(restaurantId, items);
 * return items;
 */

export default {
  initializeRedis,
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
  cacheMiddleware,
  getCachedDashboardAnalytics,
  setCachedDashboardAnalytics,
  getCachedMenuItems,
  setCachedMenuItems,
  getCachedOrders,
  setCachedOrders,
  getCachedBills,
  setCachedBills,
  getCachedStaff,
  setCachedStaff,
  invalidateRestaurantCache,
  getCacheStats,
  flushAllCache,
  getRedisClient,
};
