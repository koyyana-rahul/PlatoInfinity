import KitchenStation from "../models/kitchenStation.model.js";
import BranchMenuItem from "../models/branchMenuItem.model.js";

/**
 * KITCHEN ROUTING SYSTEM
 * Routes orders to appropriate kitchen stations based on item categories
 * E.g., Paneer Tikka → Tandoor, Biryani → Rice Station
 */

/**
 * Get kitchen station for an order item
 * @param {Object} branchMenuItem - Menu item with category info
 * @param {string} restaurantId - Restaurant ID
 * @returns {Promise<Object|null>} - Kitchen station or null
 */
export async function getKitchenStationForItem(branchMenuItem, restaurantId) {
  if (!branchMenuItem?.category) {
    return null;
  }

  // Map categories to stations (configurable per restaurant)
  const categoryStationMap = {
    TANDOORI: "TANDOOR",
    BIRYANI: "BIRYANI",
    CURRY: "GRIDDLE", // or similar
    BREADS: "TANDOOR",
    DESSERTS: "DESSERTS",
    BEVERAGES: "BEVERAGES",
    PAKORAS: "FRY_STATION",
    RICE: "RICE_STATION",
  };

  const stationType =
    categoryStationMap[branchMenuItem.category?.toUpperCase()] ||
    branchMenuItem.station || // fallback to item.station
    "GENERAL"; // default station

  // Find station by restaurant + type
  const station = await KitchenStation.findOne({
    restaurantId,
    stationType,
    isActive: true,
  });

  return station || null;
}

/**
 * Route order items to stations
 * Returns items grouped by kitchen station
 * @param {Array} orderItems - Order items
 * @param {string} restaurantId - Restaurant ID
 * @returns {Promise<Object>} - { stationId: [items], ... }
 */
export async function routeOrderToStations(orderItems, restaurantId) {
  const routing = {}; // stationId -> [items]

  for (const item of orderItems) {
    const menuItem = await BranchMenuItem.findById(
      item.branchMenuItemId,
    ).lean();

    if (!menuItem) continue;

    const station = await getKitchenStationForItem(menuItem, restaurantId);
    const stationType = station?.stationType || "GENERAL";
    const stationId = station?._id?.toString() || "UNASSIGNED";

    if (!routing[stationId]) {
      routing[stationId] = [];
    }

    routing[stationId].push({
      ...item,
      stationType,
      targetStationId: stationId,
    });
  }

  return routing;
}

/**
 * Get kitchen queue status for a station
 * Used by manager dashboard to show busy times
 * @param {string} stationId - Kitchen station ID
 * @returns {Promise<Object>} - { pending, inProgress, ready, avgWaitTime }
 */
export async function getStationQueueStatus(stationId) {
  const Order = (await import("../models/order.model.js")).default;

  const result = await Order.aggregate([
    {
      $unwind: "$items",
    },
    {
      $match: {
        "items.station": stationId,
        "items.itemStatus": { $in: ["NEW", "IN_PROGRESS"] },
      },
    },
    {
      $group: {
        _id: "$items.itemStatus",
        count: { $sum: 1 },
        avgPrepTime: {
          $avg: {
            $cond: [
              { $eq: ["$items.itemStatus", "IN_PROGRESS"] },
              {
                $subtract: [new Date(), "$items.claimedAt"],
              },
              0,
            ],
          },
        },
      },
    },
  ]);

  let queueStatus = {
    pending: 0,
    inProgress: 0,
    ready: 0,
    avgWaitTime: 0,
  };

  for (const stat of result) {
    if (stat._id === "NEW") {
      queueStatus.pending = stat.count;
    } else if (stat._id === "IN_PROGRESS") {
      queueStatus.inProgress = stat.count;
      queueStatus.avgWaitTime = Math.round(stat.avgPrepTime / 1000); // seconds
    }
  }

  return queueStatus;
}

/**
 * Get chef's pending items for their station
 * @param {string} chefId - Chef user ID
 * @param {string} restaurantId - Restaurant ID
 * @returns {Promise<Array>} - Pending order items
 */
export async function getChefPendingItems(chefId, restaurantId) {
  const Order = (await import("../models/order.model.js")).default;

  const orders = await Order.find({
    restaurantId,
    "items.station": { $exists: true },
    "items.itemStatus": { $in: ["NEW", "IN_PROGRESS"] },
  })
    .populate("tableId", "tableName")
    .lean();

  // Flatten and filter items for this chef's station
  const allItems = [];
  for (const order of orders) {
    for (const item of order.items) {
      if (item.itemStatus !== "CANCELLED") {
        allItems.push({
          ...item,
          orderId: order._id,
          tableName: order.tableId?.tableName,
          createdAt: order.createdAt,
        });
      }
    }
  }

  // Sort by priority (NEW first, then by age)
  allItems.sort((a, b) => {
    if (a.itemStatus === "NEW" && b.itemStatus !== "NEW") return -1;
    if (a.itemStatus !== "NEW" && b.itemStatus === "NEW") return 1;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  return allItems;
}

/**
 * Estimate preparation time for items
 * Based on item complexity and station load
 * @param {Array} items - Items to estimate
 * @param {string} restaurantId - Restaurant ID
 * @returns {Promise<number>} - Estimated minutes
 */
export async function estimatePrepTime(items, restaurantId) {
  // Base prep times by category (in minutes)
  const basePrepTimes = {
    TANDOORI: 12,
    BIRYANI: 15,
    CURRY: 8,
    BREADS: 3,
    DESSERTS: 5,
    BEVERAGES: 2,
    PAKORAS: 5,
    RICE: 10,
  };

  let totalTime = 0;

  for (const item of items) {
    const category = item.category || "GENERAL";
    const baseTime = basePrepTimes[category] || 8;
    const qtyFactor = 1 + (item.quantity - 1) * 0.2; // Add 20% per additional qty
    totalTime += baseTime * qtyFactor;
  }

  // Check station load and add buffer
  const stations = await KitchenStation.find({
    restaurantId,
    isActive: true,
  });

  for (const station of stations) {
    const queueStatus = await getStationQueueStatus(station._id.toString());
    if (queueStatus.inProgress > 3) {
      totalTime += 5; // Add 5 min buffer if station is busy
    }
  }

  return Math.ceil(totalTime);
}
