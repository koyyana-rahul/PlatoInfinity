/**
 * kitchen.display.service.js
 *
 * Provides kitchen staff with order information WITHOUT pricing:
 * - Item names, quantities, modifiers
 * - Preparation status only
 * - Timing information
 * - No customer details, no order totals
 *
 * Ensures kitchen staff see only what they need to prepare food
 */

import OrderModel from "../models/order.model.js";

/* ========== SAFE KITCHEN DISPLAY FORMAT ========== */
/**
 * Converts order item to kitchen-safe display
 * Removes: price, payment info, customer details
 * Keeps: name, quantity, modifiers, status
 */
function formatKitchenOrderItem(item) {
  return {
    itemId: item._id || undefined,
    name: item.name,
    quantity: item.quantity,
    modifiers: (item.selectedModifiers || []).map((mod) => ({
      name: mod.title || mod.optionName,
      // ❌ Don't include mod.price
    })),
    station: item.station,
    status: item.itemStatus, // NEW, IN_PROGRESS, READY, SERVED, CANCELLED
    claimedBy: item.chefId ? item.chefId.toString() : null,
    claimedAt: item.claimedAt,
    readyAt: item.readyAt,
    notes: item.meta?.notes || "", // Special instructions only
  };
}

/* ========== SAFE KITCHEN DISPLAY FORMAT FOR ORDER ========== */
function formatKitchenOrder(order) {
  return {
    orderId: order._id,
    tableNumber: order.tableName, // ✅ Show table number
    // ❌ Don't show: totalAmount, paymentMethod, sessionId
    items: (order.items || []).map(formatKitchenOrderItem),
    status: order.orderStatus,
    createdAt: order.createdAt,
    orderAge: calculateOrderAge(order.createdAt),
    priority: calculateOrderAge(order.createdAt) > 15 ? "URGENT" : "NORMAL", // Minutes
  };
}

/* ========== GET KITCHEN ORDERS (FOR STATION) ========== */
export async function getKitchenOrders({ restaurantId, stationFilter = null }) {
  try {
    // Get all OPEN orders that have items for this station
    const query = {
      restaurantId,
      orderStatus: { $in: ["OPEN", "APPROVED"] },
    };

    const orders = await OrderModel.find(query)
      .populate("tableId", "tableNumber")
      .lean();

    // Filter to only orders with items in this station (if specified)
    let filtered = orders;
    if (stationFilter) {
      filtered = orders.filter((order) =>
        order.items.some((item) => item.station === stationFilter),
      );
    }

    // Format for kitchen display (no pricing)
    const kitchenOrders = filtered.map(formatKitchenOrder);

    // Sort by: URGENT first, then by creation time
    kitchenOrders.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority === "URGENT" ? -1 : 1;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return {
      success: true,
      orders: kitchenOrders,
      count: kitchenOrders.length,
    };
  } catch (err) {
    console.error("❌ Failed to fetch kitchen orders:", err);
    throw {
      success: false,
      message: "Failed to fetch kitchen orders",
    };
  }
}

/* ========== GET SINGLE ORDER FOR KITCHEN ========== */
export async function getKitchenOrderDetail(orderId) {
  try {
    const order = await OrderModel.findById(orderId)
      .populate("tableId", "tableNumber")
      .lean();

    if (!order) {
      throw new Error("Order not found");
    }

    return {
      success: true,
      order: formatKitchenOrder(order),
    };
  } catch (err) {
    console.error("❌ Failed to fetch kitchen order:", err);
    throw {
      success: false,
      message: "Order not found",
    };
  }
}

/* ========== UPDATE ITEM STATUS (KITCHEN) ========== */
export async function updateItemStatusKitchen({
  orderId,
  itemIndex,
  newStatus, // IN_PROGRESS, READY, SERVED, CANCELLED
  chefId = null,
}) {
  try {
    const validStatuses = ["IN_PROGRESS", "READY", "SERVED", "CANCELLED"];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const item = order.items[itemIndex];
    if (!item) {
      throw new Error("Item not found in order");
    }

    // Update item status
    item.itemStatus = newStatus;

    // Track who is working on this item
    if (newStatus === "IN_PROGRESS" && !item.chefId) {
      item.chefId = chefId;
      item.claimedAt = new Date();
    }

    if (newStatus === "READY") {
      item.readyAt = new Date();
    }

    if (newStatus === "SERVED") {
      item.servedAt = new Date();
    }

    // Update order status if all items are served
    const allServed = order.items.every(
      (i) => i.itemStatus === "SERVED" || i.itemStatus === "CANCELLED",
    );
    if (allServed && order.orderStatus === "OPEN") {
      order.orderStatus = "APPROVED";
    }

    await order.save();

    console.log(
      `✅ ITEM STATUS: Order ${orderId} Item #${itemIndex} → ${newStatus}`,
    );

    return {
      success: true,
      order: formatKitchenOrder(order),
    };
  } catch (err) {
    console.error("❌ Failed to update item status:", err);
    throw {
      success: false,
      message: err.message || "Failed to update item status",
    };
  }
}

/* ========== HELPER: Calculate order age in minutes ========== */
function calculateOrderAge(createdAt) {
  return Math.floor((Date.now() - new Date(createdAt)) / 1000 / 60);
}

export default {
  getKitchenOrders,
  getKitchenOrderDetail,
  updateItemStatusKitchen,
  formatKitchenOrder,
  formatKitchenOrderItem,
};
