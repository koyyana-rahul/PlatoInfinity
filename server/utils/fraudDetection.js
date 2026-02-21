import Order from "../models/order.model.js";
import SuspiciousOrder from "../models/suspiciousOrder.model.js";

/**
 * FRAUD DETECTION SYSTEM
 * Flags anomalies in orders for manager review
 * Uses pattern-based detection + statistical analysis
 */

/**
 * Analyze order for fraudulent patterns
 * @param {Object} order - Order object
 * @param {Object} restaurant - Restaurant config
 * @returns {Object} - { isFraudulent, reasons, riskScore }
 */
export async function detectOrderFraud(order, restaurant) {
  const fraudIndicators = [];
  let riskScore = 0; // 0-100

  // 1️⃣ HIGH QUANTITY CHECK (>10 items)
  const highQtyItems = order.items?.filter((item) => item.quantity > 10) || [];
  if (highQtyItems.length > 0) {
    fraudIndicators.push(
      `QUANTITY_ALERT: ${highQtyItems.length} item(s) with qty > 10`,
    );
    riskScore += 35;
  }

  // 2️⃣ UNUSUAL PRICE PATTERNS (orders >5x avg for table)
  if (order.totalAmount > 0) {
    const avgOrderValue = await getAverageOrderValue(
      order.restaurantId,
      31, // last 31 days
    );
    if (order.totalAmount > avgOrderValue * 5) {
      fraudIndicators.push(
        `PRICE_ANOMALY: Order ₹${order.totalAmount} vs avg ₹${avgOrderValue}`,
      );
      riskScore += 25;
    }
  }

  // 3️⃣ SPEED ANOMALY (order placed very quickly after session open)
  if (order.createdAt && order.sessionId) {
    // Assuming session has createdAt
    const timeDiff = new Date(order.createdAt) - new Date(order.sessionId); // Will need session passed
    if (timeDiff < 10000) {
      // <10 seconds
      fraudIndicators.push("SPEED_ANOMALY: Order placed within 10 seconds");
      riskScore += 15;
    }
  }

  // 4️⃣ TIME-BASED (unusual hours for restaurant)
  const hour = new Date().getHours();
  if ((hour < 6 || hour > 23) && restaurant?.operatingHours) {
    fraudIndicators.push("TIME_ANOMALY: Order outside typical operating hours");
    riskScore += 10;
  }

  // 5️⃣ SAME-ITEM REPETITION (all orders are same item, qty 1)
  const uniqueItems = new Set(order.items?.map((i) => i.name)).size;
  if (order.items?.length > 5 && uniqueItems === 1) {
    fraudIndicators.push("PATTERN_ANOMALY: Bulk single-item order");
    riskScore += 20;
  }

  // 6️⃣ ZERO AMOUNT ORDERS (check for legitimate promos)
  if (order.totalAmount === 0 && order.items?.length > 0) {
    fraudIndicators.push("ZERO_AMOUNT: Free order without promo code");
    riskScore += 20;
  }

  const isFraudulent = riskScore >= 50; // Threshold: 50+

  return {
    isFraudulent,
    riskScore,
    reasons: fraudIndicators,
    recommendedAction: isFraudulent ? "HOLD_FOR_REVIEW" : "APPROVE",
  };
}

/**
 * Get average order value for restaurant (last N days)
 * @param {ObjectId} restaurantId
 * @param {number} days - Number of days to look back
 * @returns {number} - Average order amount
 */
async function getAverageOrderValue(restaurantId, days = 31) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const result = await Order.aggregate([
    {
      $match: {
        restaurantId,
        createdAt: { $gte: since },
        orderStatus: { $ne: "CANCELLED" },
      },
    },
    {
      $group: {
        _id: null,
        avgAmount: { $avg: "$totalAmount" },
        count: { $sum: 1 },
      },
    },
  ]);

  return result?.[0]?.avgAmount || 0;
}

/**
 * Log suspicious order for manager review
 * @param {Object} order - Order object
 * @param {Object} fraudData - Fraud detection result
 * @returns {Promise<Object>} - Created suspicious order record
 */
export async function logSuspiciousOrder(order, fraudData) {
  const suspiciousRecord = await SuspiciousOrder.create({
    orderId: order._id,
    restaurantId: order.restaurantId,
    tableId: order.tableId,
    totalAmount: order.totalAmount,
    itemCount: order.items?.length || 0,
    fraudIndicators: fraudData.reasons,
    riskScore: fraudData.riskScore,
    status: "PENDING_REVIEW",
    managerNotes: "",
  });

  return suspiciousRecord;
}

/**
 * Auto-approve orders below risk threshold
 * @param {Object} fraudData - Fraud detection result
 * @returns {boolean} - True if should auto-approve
 */
export function shouldAutoApprove(fraudData) {
  return fraudData.riskScore < 30;
}

/**
 * Batch analyze recent orders for patterns (ML training data)
 * Used for improving fraud detection model
 */
export async function analyzeOrderPatterns(restaurantId, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const stats = await Order.aggregate([
    {
      $match: {
        restaurantId,
        createdAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        avgAmount: { $avg: "$totalAmount" },
        maxAmount: { $max: "$totalAmount" },
        minAmount: { $min: "$totalAmount" },
        avgItemCount: { $avg: { $size: "$items" } },
        maxItemCount: { $max: { $size: "$items" } },
      },
    },
  ]);

  return stats?.[0] || {};
}
