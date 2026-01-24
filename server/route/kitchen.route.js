import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  listKitchenOrders,
  updateKitchenItemStatus,
} from "../controller/kitchen.controller.js";
import Order from "../models/order.model.js";

const kitchenRouter = express.Router();

kitchenRouter.use(requireAuth, requireRole("CHEF"));

kitchenRouter.get("/orders", listKitchenOrders);
kitchenRouter.post(
  "/order/:orderId/item/:itemId/status",
  updateKitchenItemStatus,
);

/**
 * ===================================================
 * PHASE 3 ENHANCEMENTS - REAL-TIME KITCHEN DISPLAY
 * ===================================================
 */

// ✅ Get kitchen orders with filtering (for KitchenDisplay.ENHANCED)
kitchenRouter.get("/display/orders", async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { station, status } = req.query;

    let query = {
      restaurantId,
      orderStatus: { $ne: "SERVED" },
    };

    // Filter by station if provided
    if (station) {
      query["items.station"] = station;
    }

    // Filter by status if provided
    if (status && status !== "all") {
      query["items.itemStatus"] = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    // Transform data for frontend
    const transformedOrders = orders.map((order) => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      tableNumber: order.tableId?.toString(),
      status: getOrderStatus(order.items),
      items: order.items.map((item) => ({
        _id: item._id,
        name: item.name,
        quantity: item.quantity,
        itemStatus: item.itemStatus,
        station: item.station || "GENERAL",
        specialInstructions: item.specialInstructions,
      })),
      placedAt: order.createdAt,
      timeElapsed: Math.floor((Date.now() - new Date(order.createdAt)) / 60000),
    }));

    res.json({
      success: true,
      data: transformedOrders,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Kitchen display orders error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Get stations for filtering
kitchenRouter.get("/stations", async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;

    // Get unique stations from orders
    const stations = await Order.distinct("items.station", {
      restaurantId,
    });

    res.json({
      success: true,
      data: {
        stations: [
          { id: "ALL", name: "All Stations" },
          ...stations.filter((s) => s).map((s) => ({ id: s, name: s })),
        ],
      },
    });
  } catch (error) {
    console.error("Stations error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Bulk update item statuses
kitchenRouter.post("/orders/bulk-update", async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { updates } = req.body; // [{orderId, itemId, status}, ...]

    for (const update of updates) {
      await Order.updateOne(
        {
          _id: update.orderId,
          restaurantId,
          "items._id": update.itemId,
        },
        {
          $set: { "items.$.itemStatus": update.status },
        },
      );
    }

    res.json({
      success: true,
      message: `Updated ${updates.length} items`,
    });
  } catch (error) {
    console.error("Bulk update error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to get overall order status
function getOrderStatus(items) {
  if (!items || items.length === 0) return "NEW";
  const statuses = items.map((i) => i.itemStatus);
  if (statuses.includes("NEW")) return "NEW";
  if (statuses.includes("IN_PROGRESS")) return "IN_PROGRESS";
  if (statuses.every((s) => s === "READY")) return "READY";
  return "IN_PROGRESS";
}

export default kitchenRouter;
