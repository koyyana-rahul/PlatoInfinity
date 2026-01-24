import rateLimit from "express-rate-limit";

/**
 * PHASE 4: RATE LIMITING MIDDLEWARE
 * Production-grade rate limiting for API endpoints
 */

// ✅ General API rate limiter (global)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for admin users
    return req.user?.role === "BRAND_ADMIN";
  },
});

// ✅ Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 login attempts per windowMs
  message: "Too many login attempts, please try again later.",
  skipSuccessfulRequests: true, // Don't count successful requests
  keyGenerator: (req) => {
    // Rate limit by email instead of IP for more accurate tracking
    return req.body?.email || req.ip;
  },
});

// ✅ Rate limiter for payment endpoints (stricter)
export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Max 10 requests per minute
  message: "Too many payment requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Rate limiter for file upload endpoints
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Max 20 uploads per hour
  message: "Upload limit exceeded, please try again later.",
});

// ✅ Rate limiter for search endpoints (generous)
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // Max 50 searches per minute
  message: "Too many search requests, please try again later.",
  skipSuccessfulRequests: false,
});

// ✅ Per-user rate limiter (using userId from token)
export const createUserLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    keyGenerator: (req) => {
      // Use userId from authenticated request
      return req.user?.userId || req.ip;
    },
    skip: (req) => {
      // Skip for admin users
      return req.user?.role === "BRAND_ADMIN";
    },
  });
};

// ✅ Restaurant-specific rate limiter
export const createRestaurantLimiter = (
  windowMs = 15 * 60 * 1000,
  max = 200,
) => {
  return rateLimit({
    windowMs,
    max,
    keyGenerator: (req) => {
      // Rate limit by restaurantId
      return req.user?.restaurantId || req.ip;
    },
    message: "Restaurant API limit exceeded. Please try again later.",
  });
};

/**
 * RATE LIMIT USAGE GUIDE
 * =====================
 *
 * Import and use in route files:
 *
 * ✅ Authentication endpoints:
 *    router.post('/login', authLimiter, loginController);
 *
 * ✅ General endpoints:
 *    router.get('/data', generalLimiter, dataController);
 *
 * ✅ Payment endpoints (stricter):
 *    router.post('/pay', paymentLimiter, paymentController);
 *
 * ✅ Search endpoints (generous):
 *    router.get('/search', searchLimiter, searchController);
 *
 * ✅ Upload endpoints:
 *    router.post('/upload', uploadLimiter, uploadController);
 *
 * ✅ Custom per-route limiters:
 *    const customLimiter = createUserLimiter(5 * 60 * 1000, 30);
 *    router.get('/expensive', customLimiter, expensiveController);
 */

export default {
  generalLimiter,
  authLimiter,
  paymentLimiter,
  uploadLimiter,
  searchLimiter,
  createUserLimiter,
  createRestaurantLimiter,
};
