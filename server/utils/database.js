/**
 * database.js
 * Database optimization utilities - indexes, query optimization, pooling
 */

import mongoose from "mongoose";

/**
 * Initialize database indexes for optimal query performance
 * Call this once on server startup
 */
export async function initializeDatabaseIndexes() {
  try {
    const Restaurant = mongoose.model("Restaurant");
    const Order = mongoose.model("Order");
    const Bill = mongoose.model("Bill");
    const MenuItem = mongoose.model("MenuItem");
    const Table = mongoose.model("Table");
    const Staff = mongoose.model("Staff");
    const User = mongoose.model("User");

    // Restaurant indexes
    await Restaurant.collection.createIndex({ email: 1 }, { unique: true });
    await Restaurant.collection.createIndex({ phone: 1 });
    await Restaurant.collection.createIndex({ city: 1, state: 1 });
    await Restaurant.collection.createIndex({ isActive: 1 });
    await Restaurant.collection.createIndex({ createdAt: -1 });

    // Order indexes
    await Order.collection.createIndex({ restaurantId: 1, createdAt: -1 });
    await Order.collection.createIndex({ tableId: 1, status: 1 });
    await Order.collection.createIndex({ staffId: 1, status: 1 });
    await Order.collection.createIndex({ status: 1, createdAt: -1 });
    await Order.collection.createIndex({ customerId: 1 });
    await Order.collection.createIndex({
      restaurantId: 1,
      createdAt: -1,
      status: 1,
    });

    // Bill indexes
    await Bill.collection.createIndex({ restaurantId: 1, createdAt: -1 });
    await Bill.collection.createIndex({ orderId: 1 }, { unique: true });
    await Bill.collection.createIndex({ status: 1, createdAt: -1 });
    await Bill.collection.createIndex({ paymentMethod: 1 });
    await Bill.collection.createIndex({
      restaurantId: 1,
      createdAt: -1,
      paymentStatus: 1,
    });

    // MenuItem indexes
    await MenuItem.collection.createIndex({
      restaurantId: 1,
      category: 1,
      isAvailable: 1,
    });
    await MenuItem.collection.createIndex({ restaurantId: 1, name: 1 });
    await MenuItem.collection.createIndex({ restaurantId: 1, isActive: 1 });

    // Table indexes
    await Table.collection.createIndex({ restaurantId: 1, tableNumber: 1 });
    await Table.collection.createIndex({ restaurantId: 1, status: 1 });
    await Table.collection.createIndex({ restaurantId: 1 });

    // Staff indexes
    await Staff.collection.createIndex(
      { restaurantId: 1, email: 1 },
      { unique: true },
    );
    await Staff.collection.createIndex({ restaurantId: 1, role: 1 });
    await Staff.collection.createIndex({ restaurantId: 1, isActive: 1 });
    await Staff.collection.createIndex({ restaurantId: 1, phone: 1 });

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ phone: 1 });
    await User.collection.createIndex({ restaurantId: 1 });

    console.log("✅ All database indexes created successfully");
    return { success: true, message: "Indexes created" };
  } catch (error) {
    console.error("❌ Error creating indexes:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Get database statistics and slow query insights
 */
export async function getDatabaseStats() {
  try {
    const stats = {
      connected: mongoose.connection.readyState === 1,
      host: mongoose.connection.host,
      database: mongoose.connection.name,
      timestamp: new Date(),
      collections: {},
    };

    const collections = mongoose.connection.collections;
    for (const [name, collection] of Object.entries(collections)) {
      const count = await collection.countDocuments();
      const indexes = await collection.getIndexes();
      stats.collections[name] = {
        documents: count,
        indexes: Object.keys(indexes),
      };
    }

    return stats;
  } catch (error) {
    console.error("Error getting database stats:", error);
    return { error: error.message };
  }
}

/**
 * Paginated query helper with filtering and sorting
 */
export function createPaginatedQuery(model) {
  return async (filters = {}, options = {}) => {
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      select = null,
      lean = true,
    } = options;

    const skip = (page - 1) * limit;

    let query = model.find(filters);

    if (select) {
      query = query.select(select);
    }

    query = query.sort(sort).skip(skip).limit(limit);

    if (lean) {
      query = query.lean();
    }

    const [documents, total] = await Promise.all([
      query.exec(),
      model.countDocuments(filters),
    ]);

    return {
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  };
}

/**
 * Bulk operations helper
 */
export async function bulkWrite(model, operations) {
  try {
    const result = await model.collection.bulkWrite(operations);
    return {
      success: true,
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount,
      deleted: result.deletedCount,
    };
  } catch (error) {
    console.error("Bulk write error:", error);
    throw error;
  }
}

/**
 * Aggregation pipeline helpers
 */
export const aggregationPipelines = {
  // Dashboard analytics
  dashboardMetrics: (restaurantId, startDate, endDate) => [
    {
      $match: {
        restaurantId,
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
        avgOrderValue: { $avg: "$totalAmount" },
        completedOrders: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
      },
    },
  ],

  // Top menu items
  topMenuItems: (restaurantId, limit = 10) => [
    {
      $match: { restaurantId },
    },
    {
      $group: {
        _id: "$items.itemId",
        totalOrders: { $sum: 1 },
        totalQuantity: { $sum: "$items.quantity" },
        totalRevenue: { $sum: "$items.price" },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "MenuItems",
        localField: "_id",
        foreignField: "_id",
        as: "itemDetails",
      },
    },
  ],

  // Staff performance
  staffPerformance: (restaurantId, startDate, endDate) => [
    {
      $match: {
        restaurantId,
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$staffId",
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
        avgOrderValue: { $avg: "$totalAmount" },
        completedOrders: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
      },
    },
    { $sort: { totalRevenue: -1 } },
    {
      $lookup: {
        from: "Staff",
        localField: "_id",
        foreignField: "_id",
        as: "staffDetails",
      },
    },
  ],

  // Hourly revenue
  hourlyRevenue: (restaurantId, date) => [
    {
      $match: {
        restaurantId,
        createdAt: {
          $gte: new Date(date),
          $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
        },
      },
    },
    {
      $group: {
        _id: {
          $hour: "$createdAt",
        },
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ],

  // Payment method breakdown
  paymentBreakdown: (restaurantId, startDate, endDate) => [
    {
      $match: {
        restaurantId,
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$paymentMethod",
        count: { $sum: 1 },
        total: { $sum: "$totalAmount" },
        average: { $avg: "$totalAmount" },
      },
    },
    { $sort: { total: -1 } },
  ],
};

/**
 * Query performance analyzer
 */
export async function analyzeQueryPerformance(model, query, options = {}) {
  const startTime = Date.now();

  try {
    let q = model.find(query);

    if (options.select) q = q.select(options.select);
    if (options.sort) q = q.sort(options.sort);
    if (options.limit) q = q.limit(options.limit);

    const results = await q.exec();
    const duration = Date.now() - startTime;

    return {
      success: true,
      duration,
      resultCount: results.length,
      isOptimal: duration < 100, // Under 100ms is optimal
      recommendation:
        duration > 100
          ? "Consider adding indexes or limiting result set"
          : null,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Connection pool optimization
 */
export function configureConnectionPool() {
  const options = {
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 45000,
    waitQueueTimeoutMS: 10000,
  };

  return options;
}

/**
 * Database cleanup utilities
 */
export const databaseCleanup = {
  // Remove old logs
  removeOldLogs: async (model, daysOld = 30) => {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);

    try {
      const result = await model.deleteMany({
        createdAt: { $lt: date },
      });
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Remove abandoned orders
  removeAbandonedOrders: async (model, hoursOld = 24) => {
    const date = new Date();
    date.setHours(date.getHours() - hoursOld);

    try {
      const result = await model.deleteMany({
        status: "pending",
        createdAt: { $lt: date },
      });
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Archive old data
  archiveOldData: async (model, collectionName, daysOld = 90) => {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);

    try {
      const archiveCollection = `${collectionName}_archive`;
      const data = await model.find({ createdAt: { $lt: date } });

      if (data.length > 0) {
        await mongoose.connection
          .collection(archiveCollection)
          .insertMany(data);
        await model.deleteMany({ createdAt: { $lt: date } });
      }

      return {
        success: true,
        archived: data.length,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

/**
 * Export database helper for controllers
 */
export const dbHelper = {
  createPaginatedQuery,
  bulkWrite,
  analyzeQueryPerformance,
  getDatabaseStats,
  initializeDatabaseIndexes,
};

export default {
  initializeDatabaseIndexes,
  getDatabaseStats,
  createPaginatedQuery,
  bulkWrite,
  aggregationPipelines,
  analyzeQueryPerformance,
  configureConnectionPool,
  databaseCleanup,
  dbHelper,
};
