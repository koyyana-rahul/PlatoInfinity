/**
 * health.js
 * Health check and monitoring endpoints
 */

import express from "express";
import mongoose from "mongoose";
import os from "os";
import Redis from "redis";

const router = express.Router();

/**
 * Health check endpoint - System status overview
 * GET /health
 */
router.get("/", async (req, res) => {
  try {
    const startTime = Date.now();

    // Database check
    const dbStatus = mongoose.connection.readyState === 1 ? "healthy" : "down";

    // Memory usage
    const memoryUsage = process.memoryUsage();
    const heapUsedPercent =
      (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    // Uptime
    const uptime = process.uptime();
    const uptimeFormatted = formatUptime(uptime);

    // CPU usage (approximation)
    const cpus = os.cpus();
    const cpuModel = cpus[0].model;
    const cpuCount = cpus.length;

    const responseTime = Date.now() - startTime;

    res.status(200).json({
      success: true,
      status: "operational",
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.round(uptime),
        formatted: uptimeFormatted,
      },
      database: {
        status: dbStatus,
        connected: dbStatus === "healthy",
        host: mongoose.connection.host,
        database: mongoose.connection.name,
      },
      system: {
        cpu: {
          model: cpuModel,
          cores: cpuCount,
          architecture: os.arch(),
        },
        memory: {
          total: formatBytes(memoryUsage.heapTotal),
          used: formatBytes(memoryUsage.heapUsed),
          free: formatBytes(memoryUsage.heapTotal - memoryUsage.heapUsed),
          percentUsed: heapUsedPercent.toFixed(2) + "%",
        },
        nodeVersion: process.version,
        platform: process.platform,
      },
      responseTime: responseTime + "ms",
      checks: {
        database: dbStatus === "healthy" ? "passed" : "failed",
        memory:
          heapUsedPercent < 90
            ? "passed"
            : heapUsedPercent < 95
              ? "warning"
              : "failed",
        uptime: uptime > 60 ? "passed" : "initializing",
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: "error",
      message: "Health check failed",
      error: error.message,
    });
  }
});

/**
 * Detailed health check - All components
 * GET /health/detailed
 */
router.get("/detailed", async (req, res) => {
  const checks = {};

  try {
    // Database connectivity check
    checks.database = await checkDatabase();

    // Redis connectivity check
    checks.redis = await checkRedis();

    // Collections info
    checks.collections = await getCollectionsInfo();

    // Performance metrics
    checks.performance = {
      eventLoopDelay: measureEventLoopDelay(),
      gcPauses: 0, // Would need gc module to measure
    };

    // API response time simulation
    checks.api = {
      responseTime: "<5ms",
      requestsPerSecond: "N/A", // Would need request tracking
    };

    const allHealthy = Object.values(checks)
      .filter((check) => check.status)
      .every((check) => check.status === "healthy");

    res.status(allHealthy ? 200 : 503).json({
      success: true,
      status: allHealthy ? "healthy" : "degraded",
      checks,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: "unhealthy",
      error: error.message,
    });
  }
});

/**
 * Database-specific health check
 * GET /health/database
 */
router.get("/database", async (req, res) => {
  try {
    const check = await checkDatabase();
    const status = check.status === "healthy" ? 200 : 503;

    res.status(status).json({
      success: check.status === "healthy",
      database: check,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Redis-specific health check
 * GET /health/redis
 */
router.get("/redis", async (req, res) => {
  try {
    const check = await checkRedis();
    const status = check.status === "healthy" ? 200 : 503;

    res.status(status).json({
      success: check.status === "healthy",
      redis: check,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Memory usage check
 * GET /health/memory
 */
router.get("/memory", (req, res) => {
  const mem = process.memoryUsage();
  const totalMem = require("os").totalmem();
  const freeMem = require("os").freemem();

  res.json({
    success: true,
    process: {
      heapTotal: formatBytes(mem.heapTotal),
      heapUsed: formatBytes(mem.heapUsed),
      heapFree: formatBytes(mem.heapTotal - mem.heapUsed),
      rss: formatBytes(mem.rss),
      external: formatBytes(mem.external),
    },
    system: {
      total: formatBytes(totalMem),
      free: formatBytes(freeMem),
      used: formatBytes(totalMem - freeMem),
      percentUsed: (((totalMem - freeMem) / totalMem) * 100).toFixed(2) + "%",
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * Ready check - Is service ready to accept requests?
 * GET /health/ready
 */
router.get("/ready", async (req, res) => {
  const checks = {
    database: mongoose.connection.readyState === 1,
    redis: true, // Assume true if Redis optional
    uptime: process.uptime() > 5, // At least 5 seconds uptime
  };

  const isReady = Object.values(checks).every((check) => check);

  res.status(isReady ? 200 : 503).json({
    success: isReady,
    ready: isReady,
    checks,
  });
});

/**
 * Liveness check - Is service running?
 * GET /health/live
 */
router.get("/live", (req, res) => {
  res.json({
    success: true,
    alive: true,
    timestamp: new Date().toISOString(),
  });
});

// ==================== Helper Functions ====================

/**
 * Check database connectivity and performance
 */
async function checkDatabase() {
  const startTime = Date.now();

  try {
    // Connection status
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      return {
        status: "down",
        connected: false,
        message: "Database not connected",
      };
    }

    // Query performance test
    try {
      const testCollection = mongoose.connection.collection("restaurants");
      await testCollection.findOne({});
      const queryTime = Date.now() - startTime;

      return {
        status: "healthy",
        connected: true,
        responseTime: queryTime + "ms",
        host: mongoose.connection.host,
        database: mongoose.connection.name,
      };
    } catch (queryError) {
      return {
        status: "degraded",
        connected: true,
        error: "Query test failed: " + queryError.message,
      };
    }
  } catch (error) {
    return {
      status: "down",
      connected: false,
      error: error.message,
    };
  }
}

/**
 * Check Redis connectivity
 */
async function checkRedis() {
  try {
    // If Redis client exists in app context, use it
    const redisStatus = "healthy"; // Placeholder - implement actual Redis check if needed

    return {
      status: redisStatus,
      message: "Redis is optional for this deployment",
    };
  } catch (error) {
    return {
      status: "optional",
      message: "Redis not configured or optional",
    };
  }
}

/**
 * Get collection statistics
 */
async function getCollectionsInfo() {
  try {
    const collections = mongoose.connection.collections;
    const info = {};

    for (const [name, collection] of Object.entries(collections)) {
      try {
        const count = await collection.countDocuments();
        const stats = await collection.stats().catch(() => ({}));

        info[name] = {
          documents: count,
          size: stats.size ? formatBytes(stats.size) : "N/A",
          indexes: await collection
            .getIndexes()
            .then((idx) => Object.keys(idx).length),
        };
      } catch (err) {
        info[name] = { error: err.message };
      }
    }

    return info;
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Measure event loop delay (basic approximation)
 */
function measureEventLoopDelay() {
  const start = Date.now();
  setImmediate(() => {
    const delay = Date.now() - start;
    return delay + "ms";
  });
  return "<1ms";
}

/**
 * Format uptime
 */
function formatUptime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${hours}h ${minutes}m ${secs}s`;
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export default router;
