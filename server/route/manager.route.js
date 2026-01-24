import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

import {
  listManagersController,
  inviteManagerController,
  removeManagerController,
  resendInviteController,
} from "../controller/manager.controller.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Bill from "../models/bill.model.js";
import Table from "../models/table.model.js";

/* 🔥 mergeParams IS REQUIRED */
const router = express.Router({ mergeParams: true });

/**
 * BASE PATH:
 * /api/restaurants/:restaurantId/managers
 */

router.get(
  "/",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  listManagersController,
);

router.post(
  "/invite",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  inviteManagerController,
);

router.post(
  "/:managerId/resend-invite",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  resendInviteController,
);

router.delete(
  "/:managerId",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  removeManagerController,
);

/**
 * ===================================================
 * PHASE 3 ENHANCEMENTS - MANAGER DASHBOARD ANALYTICS
 * ===================================================
 */

// ✅ Get extended analytics for ManagerDashboard.ENHANCED
router.get(
  "/dashboard/analytics",
  requireAuth,
  requireRole("MANAGER"),
  async (req, res) => {
    try {
      const restaurantId = req.user.restaurantId;
      const { startDate, endDate } = req.query;

      let matchQuery = { restaurantId };

      // Date filtering
      if (startDate || endDate) {
        matchQuery.createdAt = {};
        if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
        if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
      }

      const [orders, bills, staff] = await Promise.all([
        Order.find(matchQuery).lean(),
        Bill.find(matchQuery).lean(),
        User.find({
          restaurantId,
          role: { $in: ["CHEF", "WAITER", "CASHIER"] },
        }).lean(),
      ]);

      const paidBills = bills.filter((b) => b.paymentStatus === "PAID");
      const completedOrders = orders.filter((o) => o.orderStatus === "SERVED");

      // Calculate metrics
      const metrics = {
        totalOrders: orders.length,
        completedOrders: completedOrders.length,
        pendingOrders: orders.filter((o) => o.orderStatus !== "SERVED").length,
        cancelledOrders: orders.filter((o) => o.orderStatus === "CANCELLED")
          .length,
        completionRate:
          orders.length > 0
            ? ((completedOrders.length / orders.length) * 100).toFixed(2)
            : 0,
        averagePreparationTime: calculateAvgTime(completedOrders),
        totalRevenue: bills.reduce((sum, b) => sum + b.total, 0),
        collectedRevenue: paidBills.reduce((sum, b) => sum + b.total, 0),
        pendingPayments: bills
          .filter((b) => b.paymentStatus !== "PAID")
          .reduce((sum, b) => sum + b.total, 0),
        averageOrderValue:
          orders.length > 0
            ? (
                bills.reduce((sum, b) => sum + b.total, 0) / orders.length
              ).toFixed(2)
            : 0,
      };

      // Payment breakdown
      const paymentBreakdown = aggregatePaymentMethods(paidBills);

      // Hourly breakdown
      const hourlyData = aggregateByHour(orders, bills);

      res.json({
        success: true,
        data: {
          metrics,
          paymentBreakdown,
          hourlyData,
          staffCount: {
            total: staff.length,
            chefs: staff.filter((s) => s.role === "CHEF").length,
            waiters: staff.filter((s) => s.role === "WAITER").length,
            cashiers: staff.filter((s) => s.role === "CASHIER").length,
          },
        },
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

// ✅ Get staff performance metrics
router.get(
  "/dashboard/staff-performance",
  requireAuth,
  requireRole("MANAGER"),
  async (req, res) => {
    try {
      const restaurantId = req.user.restaurantId;

      const staff = await User.find({
        restaurantId,
        role: { $in: ["CHEF", "WAITER", "CASHIER"] },
      })
        .select("_id name email role")
        .lean();

      const orders = await Order.find({ restaurantId }).lean();
      const bills = await Bill.find({ restaurantId }).lean();

      const staffPerformance = staff.map((member) => {
        const memberOrders = orders.filter(
          (o) => o.chefId?.toString() === member._id.toString(),
        );
        const memberBills = bills.filter(
          (o) => o.cashierId?.toString() === member._id.toString(),
        );

        return {
          _id: member._id,
          name: member.name,
          email: member.email,
          role: member.role,
          metrics: {
            ordersProcessed: memberOrders.length,
            averageTime: calculateAvgTime(memberOrders),
            billsProcessed: memberBills.length,
            transactionAmount: memberBills.reduce((sum, b) => sum + b.total, 0),
          },
        };
      });

      res.json({
        success: true,
        data: {
          staff: staffPerformance.sort(
            (a, b) => b.metrics.ordersProcessed - a.metrics.ordersProcessed,
          ),
        },
      });
    } catch (error) {
      console.error("Staff performance error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

// ✅ Get operational metrics
router.get(
  "/dashboard/operational",
  requireAuth,
  requireRole("MANAGER"),
  async (req, res) => {
    try {
      const restaurantId = req.user.restaurantId;

      const [tables, orders, staff] = await Promise.all([
        Table.find({ restaurantId }).lean(),
        Order.find({ restaurantId }).lean(),
        User.find({ restaurantId }).lean(),
      ]);

      const occupiedTables = tables.filter(
        (t) => t.status === "OCCUPIED",
      ).length;
      const activeOrders = orders.filter(
        (o) => o.orderStatus !== "SERVED",
      ).length;

      res.json({
        success: true,
        data: {
          tables: {
            total: tables.length,
            occupied: occupiedTables,
            available: tables.length - occupiedTables,
            occupancyRate:
              tables.length > 0
                ? ((occupiedTables / tables.length) * 100).toFixed(2)
                : 0,
          },
          orders: {
            active: activeOrders,
            pending: orders.filter((o) => o.orderStatus === "PENDING").length,
            inProgress: orders.filter((o) => o.orderStatus === "IN_PROGRESS")
              .length,
            ready: orders.filter((o) => o.orderStatus === "READY").length,
          },
          staff: {
            total: staff.length,
            online: staff.filter((s) => s.status === "ACTIVE").length,
          },
        },
      });
    } catch (error) {
      console.error("Operational error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

// ✅ Get daily report
router.get(
  "/dashboard/daily-report",
  requireAuth,
  requireRole("MANAGER"),
  async (req, res) => {
    try {
      const restaurantId = req.user.restaurantId;
      const { date } = req.query;

      const targetDate = date ? new Date(date) : new Date();
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const [orders, bills] = await Promise.all([
        Order.find({
          restaurantId,
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        }).lean(),
        Bill.find({
          restaurantId,
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        }).lean(),
      ]);

      const paidBills = bills.filter((b) => b.paymentStatus === "PAID");

      res.json({
        success: true,
        data: {
          date: targetDate.toISOString().split("T")[0],
          summary: {
            ordersPlaced: orders.length,
            ordersCompleted: orders.filter((o) => o.orderStatus === "SERVED")
              .length,
            totalRevenue: bills.reduce((sum, b) => sum + b.total, 0),
            collectedRevenue: paidBills.reduce((sum, b) => sum + b.total, 0),
            pendingPayments: bills
              .filter((b) => b.paymentStatus !== "PAID")
              .reduce((sum, b) => sum + b.total, 0),
          },
          paymentMethods: aggregatePaymentMethods(paidBills),
          topItems: getTopItems(orders),
        },
      });
    } catch (error) {
      console.error("Daily report error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

// Helper functions

function calculateAvgTime(orders) {
  if (orders.length === 0) return 0;
  const totalTime = orders.reduce((sum, o) => {
    const createdAt = new Date(o.createdAt);
    const completedAt = o.completedAt ? new Date(o.completedAt) : new Date();
    return sum + (completedAt - createdAt) / 60000; // Convert to minutes
  }, 0);
  return (totalTime / orders.length).toFixed(2);
}

function aggregatePaymentMethods(bills) {
  const methods = {};
  bills.forEach((bill) => {
    const method = bill.paymentMethod || "UNKNOWN";
    if (!methods[method]) {
      methods[method] = { count: 0, amount: 0 };
    }
    methods[method].count += 1;
    methods[method].amount += bill.total;
  });

  return Object.entries(methods).map(([method, data]) => ({
    method,
    count: data.count,
    amount: data.amount,
  }));
}

function aggregateByHour(orders, bills) {
  const hourlyData = {};

  orders.forEach((order) => {
    const hour = new Date(order.createdAt).getHours();
    if (!hourlyData[hour]) {
      hourlyData[hour] = { hour, orders: 0, revenue: 0 };
    }
    hourlyData[hour].orders += 1;
  });

  bills.forEach((bill) => {
    const hour = new Date(bill.createdAt).getHours();
    if (!hourlyData[hour]) {
      hourlyData[hour] = { hour, orders: 0, revenue: 0 };
    }
    hourlyData[hour].revenue += bill.total;
  });

  return Object.values(hourlyData).sort((a, b) => a.hour - b.hour);
}

function getTopItems(orders) {
  const itemCount = {};
  orders.forEach((order) => {
    order.items?.forEach((item) => {
      if (!itemCount[item.name]) {
        itemCount[item.name] = 0;
      }
      itemCount[item.name] += item.quantity;
    });
  });

  return Object.entries(itemCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export default router;
