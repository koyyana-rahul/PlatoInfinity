import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { getCustomerMenuController } from "../controller/customerMenu.controller.js";
import Order from "../models/order.model.js";
import Bill from "../models/bill.model.js";
import MenuItem from "../models/MenuItem.model.js";

const customerMenuRouter = express.Router();

/**
 * PUBLIC CUSTOMER MENU
 * Used by:
 * - QR scan
 * - Customer phone
 * - Waiter tablet
 *
 * No auth required
 */
customerMenuRouter.get("/menu/:restaurantId", getCustomerMenuController);

/**
 * ===================================================
 * PHASE 3 ENHANCEMENTS - CUSTOMER MENU FEATURES
 * ===================================================
 */

// ✅ Get customer order history (for authenticated customers)
customerMenuRouter.get("/orders/history", requireAuth, async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const userId = req.user.userId;

    const orders = await Order.find({
      restaurantId,
      customerId: userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    const orderHistory = orders.map((order) => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      date: order.createdAt,
      items: order.items,
      total: order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
      status: order.orderStatus,
      table: order.tableId,
    }));

    res.json({
      success: true,
      data: {
        orders: orderHistory,
        totalOrders: orderHistory.length,
      },
    });
  } catch (error) {
    console.error("Order history error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Get customer favorite items (reorder suggestions)
customerMenuRouter.get(
  "/favorites/suggestions",
  requireAuth,
  async (req, res) => {
    try {
      const restaurantId = req.user.restaurantId;
      const userId = req.user.userId;

      const orders = await Order.find({
        restaurantId,
        customerId: userId,
      }).lean();

      // Count item frequency
      const itemFrequency = {};
      orders.forEach((order) => {
        order.items?.forEach((item) => {
          if (!itemFrequency[item._id]) {
            itemFrequency[item._id] = {
              id: item._id,
              name: item.name,
              price: item.price,
              count: 0,
            };
          }
          itemFrequency[item._id].count += item.quantity;
        });
      });

      const favorites = Object.values(itemFrequency)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      res.json({
        success: true,
        data: {
          favorites,
          totalOrders: orders.length,
        },
      });
    } catch (error) {
      console.error("Favorites error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

// ✅ Quick reorder from previous order
customerMenuRouter.post("/reorder/:orderId", requireAuth, async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const userId = req.user.userId;
    const { orderId } = req.params;

    const previousOrder = await Order.findOne({
      _id: orderId,
      customerId: userId,
      restaurantId,
    }).lean();

    if (!previousOrder) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    // Return items from previous order for quick ordering
    res.json({
      success: true,
      data: {
        items: previousOrder.items,
        orderDate: previousOrder.createdAt,
        message: `Reordering from your order on ${new Date(previousOrder.createdAt).toLocaleDateString()}`,
      },
    });
  } catch (error) {
    console.error("Reorder error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Get customer current bill
customerMenuRouter.get("/bill/current", requireAuth, async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { tableId } = req.query;

    if (!tableId) {
      return res.status(400).json({
        success: false,
        error: "Table ID is required",
      });
    }

    const bill = await Bill.findOne({
      restaurantId,
      tableId,
      paymentStatus: { $ne: "PAID" },
    }).lean();

    if (!bill) {
      return res.json({
        success: true,
        data: {
          bill: null,
          message: "No pending bill",
        },
      });
    }

    const billDetails = {
      _id: bill._id,
      tableId: bill.tableId,
      items: bill.items || [],
      subtotal: bill.subtotal || bill.total,
      tax: bill.tax || 0,
      discount: bill.discount || 0,
      total: bill.total,
      paymentStatus: bill.paymentStatus,
      paymentMethod: bill.paymentMethod,
      createdAt: bill.createdAt,
    };

    res.json({
      success: true,
      data: { bill: billDetails },
    });
  } catch (error) {
    console.error("Current bill error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Get menu items by category (for better browsing)
customerMenuRouter.get(
  "/menu/:restaurantId/category/:categoryId",
  async (req, res) => {
    try {
      const { restaurantId, categoryId } = req.params;

      const items = await MenuItem.find({
        restaurantId,
        category: categoryId,
        isAvailable: true,
      })
        .select("_id name description price image category rating")
        .lean();

      res.json({
        success: true,
        data: {
          items,
          count: items.length,
        },
      });
    } catch (error) {
      console.error("Category items error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

// ✅ Search menu items
customerMenuRouter.get("/menu/:restaurantId/search", async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json({
        success: true,
        data: { items: [] },
      });
    }

    const items = await MenuItem.find(
      {
        restaurantId,
        isAvailable: true,
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      },
      { score: { $meta: "textScore" } },
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(20)
      .lean();

    res.json({
      success: true,
      data: {
        items,
        count: items.length,
        query,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Get menu statistics (popular items, ratings)
customerMenuRouter.get("/menu/:restaurantId/stats", async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const items = await MenuItem.find({
      restaurantId,
      isAvailable: true,
    })
      .select("name rating orderCount")
      .sort({ orderCount: -1, rating: -1 })
      .limit(15)
      .lean();

    const stats = {
      totalItems: await MenuItem.countDocuments({
        restaurantId,
        isAvailable: true,
      }),
      topRatedItems: items.filter((i) => i.rating >= 4.5).slice(0, 5),
      mostOrderedItems: items.slice(0, 5),
      averageRating: (
        items.reduce((sum, i) => sum + (i.rating || 0), 0) / items.length
      ).toFixed(2),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default customerMenuRouter;
