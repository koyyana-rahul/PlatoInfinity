import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  serveOrderItemController,
  getWaiterOrdersController,
  getReadyItemsController,
} from "../controller/waiter.controller.js";
import Order from "../models/order.model.js";
import Table from "../models/table.model.js";
import Bill from "../models/bill.model.js";

const waiterRouter = express.Router();

waiterRouter.use(requireAuth, requireRole("WAITER", "MANAGER"));

// 📋 Get all orders for waiter
waiterRouter.get("/orders", getWaiterOrdersController);

// ✅ Get items ready to serve
waiterRouter.get("/ready-items", getReadyItemsController);

// 🍽️ Serve item
waiterRouter.post(
  "/order/:orderId/item/:itemId/serve",
  serveOrderItemController,
);

/**
 * ===================================================
 * PHASE 3 ENHANCEMENTS - WAITER DASHBOARD
 * ===================================================
 */

// ✅ Get table status for WaiterDashboard.ENHANCED
waiterRouter.get("/dashboard/tables", async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { status } = req.query;

    let tableQuery = { restaurantId };
    if (status && status !== "all") {
      tableQuery.status = status;
    }

    const [tables, orders, bills] = await Promise.all([
      Table.find(tableQuery).lean(),
      Order.find({ restaurantId, orderStatus: { $ne: "SERVED" } }).lean(),
      Bill.find({
        restaurantId,
        paymentStatus: { $in: ["PENDING", "PARTIAL"] },
      }).lean(),
    ]);

    const tablesWithDetails = tables.map((table) => {
      const tableOrders = orders.filter(
        (o) => o.tableId?.toString() === table._id.toString(),
      );
      const tableBills = bills.filter(
        (b) => b.tableId?.toString() === table._id.toString(),
      );

      return {
        _id: table._id,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        status: table.status,
        guests: table.occupantCount || 0,
        orders: tableOrders.length,
        pendingItems: tableOrders.reduce(
          (sum, o) =>
            sum + o.items.filter((i) => i.itemStatus !== "READY").length,
          0,
        ),
        hasPendingBill: tableBills.length > 0,
        billAmount: tableBills.reduce((sum, b) => sum + b.total, 0),
        waiterId: table.assignedWaiterId,
      };
    });

    res.json({
      success: true,
      data: {
        tables: tablesWithDetails,
        stats: {
          total: tables.length,
          occupied: tables.filter((t) => t.status === "OCCUPIED").length,
          available: tables.filter((t) => t.status === "AVAILABLE").length,
          reserved: tables.filter((t) => t.status === "RESERVED").length,
        },
      },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Get tables error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Get pending bills for waiter
waiterRouter.get("/pending-bills", async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;

    const bills = await Bill.find({
      restaurantId,
      paymentStatus: { $in: ["PENDING", "PARTIAL"] },
    })
      .populate("tableId", "tableNumber occupantCount")
      .sort({ createdAt: -1 })
      .lean();

    const formattedBills = bills.map((bill) => ({
      _id: bill._id,
      tableNumber: bill.tableId?.tableNumber,
      guests: bill.tableId?.occupantCount,
      total: bill.total,
      paid: bill.paidAmount || 0,
      pending: bill.total - (bill.paidAmount || 0),
      paymentStatus: bill.paymentStatus,
      items: bill.items?.length || 0,
      createdAt: bill.createdAt,
      status: "AWAITING_PAYMENT",
    }));

    res.json({
      success: true,
      data: {
        bills: formattedBills,
        total: bills.length,
        pendingAmount: formattedBills.reduce((sum, b) => sum + b.pending, 0),
      },
    });
  } catch (error) {
    console.error("Pending bills error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Get table details with orders and bill
waiterRouter.get("/table/:tableId/details", async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { tableId } = req.params;

    const [table, orders, bill] = await Promise.all([
      Table.findOne({ _id: tableId, restaurantId }).lean(),
      Order.find({ tableId, restaurantId }).lean(),
      Bill.findOne({
        tableId,
        restaurantId,
        paymentStatus: { $ne: "PAID" },
      }).lean(),
    ]);

    if (!table) {
      return res.status(404).json({ success: false, error: "Table not found" });
    }

    const allItems = orders.flatMap((order) =>
      order.items.map((item) => ({
        ...item,
        orderId: order._id,
        orderNumber: order.orderNumber,
      })),
    );

    res.json({
      success: true,
      data: {
        table: {
          _id: table._id,
          tableNumber: table.tableNumber,
          capacity: table.capacity,
          status: table.status,
          guests: table.occupantCount || 0,
          assignedWaiterId: table.assignedWaiterId,
        },
        orders: {
          total: orders.length,
          items: allItems,
          readyToServe: allItems.filter((i) => i.itemStatus === "READY"),
          inProgress: allItems.filter((i) => i.itemStatus === "IN_PROGRESS"),
        },
        bill: bill
          ? {
              _id: bill._id,
              total: bill.total,
              paid: bill.paidAmount || 0,
              pending: bill.total - (bill.paidAmount || 0),
              paymentStatus: bill.paymentStatus,
              items: bill.items?.length || 0,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Table details error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Call waiter (alert system)
waiterRouter.post("/table/:tableId/call-waiter", async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { tableId } = req.params;
    const { reason } = req.body;

    const table = await Table.findOne({ _id: tableId, restaurantId });
    if (!table) {
      return res.status(404).json({ success: false, error: "Table not found" });
    }

    // Emit socket event for real-time notification
    // This would be handled by your socket.io setup
    res.json({
      success: true,
      message: `Waiter call for table ${table.tableNumber}`,
      data: {
        tableNumber: table.tableNumber,
        reason: reason || "GENERAL",
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Call waiter error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Get waiter's assigned tables
waiterRouter.get("/my-tables", async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const waiterId = req.user.userId;

    const tables = await Table.find({
      restaurantId,
      assignedWaiterId: waiterId,
    }).lean();

    const orders = await Order.find({
      restaurantId,
      tableId: { $in: tables.map((t) => t._id) },
    }).lean();

    const tablesData = tables.map((table) => {
      const tableOrders = orders.filter(
        (o) => o.tableId?.toString() === table._id.toString(),
      );
      return {
        _id: table._id,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        status: table.status,
        guests: table.occupantCount || 0,
        activeOrders: tableOrders.filter((o) => o.orderStatus !== "SERVED")
          .length,
      };
    });

    res.json({
      success: true,
      data: {
        tables: tablesData,
        stats: {
          assignedTables: tables.length,
          occupiedTables: tables.filter((t) => t.status === "OCCUPIED").length,
          activeOrders: orders.filter((o) => o.orderStatus !== "SERVED").length,
        },
      },
    });
  } catch (error) {
    console.error("My tables error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default waiterRouter;
