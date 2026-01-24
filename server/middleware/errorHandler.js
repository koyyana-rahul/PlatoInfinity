/**
 * PHASE 4: ERROR HANDLING & LOGGING MIDDLEWARE
 * Production-grade error handling and request logging
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.join(__dirname, "../../logs");

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ✅ Request logging middleware
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Store requestId for later use
  req.id = requestId;

  // Log request
  const logEntry = {
    timestamp: new Date().toISOString(),
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    userId: req.user?.userId || "anonymous",
  };

  // Intercept response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Add response info to log
    logEntry.statusCode = statusCode;
    logEntry.duration = `${duration}ms`;

    // Log to file
    logToFile("requests.log", JSON.stringify(logEntry));

    // Log errors to separate file
    if (statusCode >= 400) {
      logToFile("errors.log", JSON.stringify(logEntry));
    }

    // Console log
    const color =
      statusCode >= 500
        ? "\x1b[31m" // Red
        : statusCode >= 400
          ? "\x1b[33m" // Yellow
          : "\x1b[32m"; // Green
    console.log(
      `${color}[${statusCode}]\x1b[0m ${req.method} ${req.originalUrl} - ${duration}ms`,
    );

    return originalSend.call(this, data);
  };

  next();
};

// ✅ Error handler middleware (must be last)
export const errorHandler = (err, req, res, next) => {
  const requestId = req.id || "unknown";
  const errorEntry = {
    timestamp: new Date().toISOString(),
    requestId,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.userId || "anonymous",
    type: err.constructor.name,
  };

  // Log error to file
  logToFile("errors.log", JSON.stringify(errorEntry));
  console.error("Error:", err.message);

  // Determine status code
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  } else if (err.name === "MongooseError") {
    statusCode = 500;
    message = "Database Error";
  } else if (err.name === "UnauthorizedError") {
    statusCode = 401;
    message = "Unauthorized";
  } else if (err.name === "ForbiddenError") {
    statusCode = 403;
    message = "Forbidden";
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    requestId, // Include for debugging
    ...(process.env.NODE_ENV !== "production" && { details: err.message }),
  });
};

// ✅ Async error wrapper (prevents unhandled rejections)
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ✅ Log to file helper
const logToFile = (filename, content) => {
  const logPath = path.join(logsDir, filename);
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${content}\n`;

  fs.appendFile(logPath, logLine, (err) => {
    if (err) {
      console.error("Failed to write to log file:", err);
    }
  });
};

// ✅ API response formatter middleware
export const responseFormatter = (req, res, next) => {
  // Standard success response
  res.success = (data, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  };

  // Standard error response
  res.error = (message, statusCode = 500, details = null) => {
    return res.status(statusCode).json({
      success: false,
      error: message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  };

  next();
};

// ✅ Not found middleware
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
};

// ✅ Security headers middleware
export const securityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Disable framing
  res.setHeader("X-Frame-Options", "DENY");

  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  );

  // HSTS (HTTP Strict Transport Security)
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }

  next();
};

// ✅ Request size limiter
export const requestSizeLimit = (maxSize = "10kb") => {
  return (req, res, next) => {
    const size = req.get("content-length");
    if (size && parseInt(size) > parseInt(maxSize)) {
      return res.status(413).json({
        success: false,
        error: `Request body too large. Maximum size: ${maxSize}`,
      });
    }
    next();
  };
};

// ✅ Performance monitoring middleware
export const performanceMonitor = (req, res, next) => {
  const startTime = process.hrtime.bigint();

  const originalSend = res.send;
  res.send = function (data) {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to ms

    // Log slow requests (> 1000ms)
    if (duration > 1000) {
      logToFile(
        "performance.log",
        JSON.stringify({
          timestamp: new Date().toISOString(),
          method: req.method,
          url: req.originalUrl,
          duration: `${duration.toFixed(2)}ms`,
          statusCode: res.statusCode,
        }),
      );
    }

    res.setHeader("X-Response-Time", `${duration.toFixed(2)}ms`);
    return originalSend.call(this, data);
  };

  next();
};

/**
 * MIDDLEWARE USAGE GUIDE
 * =====================
 *
 * In your main server.js or app.js file:
 *
 * // Security
 * app.use(securityHeaders);
 *
 * // Logging
 * app.use(requestLogger);
 *
 * // Performance
 * app.use(performanceMonitor);
 *
 * // Response formatter
 * app.use(responseFormatter);
 *
 * // Rate limiting (on specific routes)
 * app.post('/api/auth/login', authLimiter, loginRoute);
 *
 * // Your routes
 * app.use('/api', routes);
 *
 * // 404 handler
 * app.use(notFoundHandler);
 *
 * // Error handler (MUST be last)
 * app.use(errorHandler);
 *
 *
 * USAGE IN CONTROLLERS:
 * =====================
 *
 * // Success response
 * res.success(data, 'Data fetched successfully', 200);
 *
 * // Error response
 * res.error('Something went wrong', 500);
 *
 * // With details
 * res.error('Validation failed', 400, errors);
 *
 *
 * LOG FILES:
 * ===========
 * - logs/requests.log       → All HTTP requests
 * - logs/errors.log         → All errors (4xx, 5xx)
 * - logs/performance.log    → Slow requests (>1000ms)
 */

export default {
  requestLogger,
  errorHandler,
  asyncHandler,
  responseFormatter,
  notFoundHandler,
  securityHeaders,
  requestSizeLimit,
  performanceMonitor,
};
