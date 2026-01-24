import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  dashboardSummaryController,
  dashboardStatsController,
  kpiMetricsController,
  performanceMetricsController,
  operationalMetricsController,
  revenueBreakdownController,
} from "../controller/dashboard.controller.js";
import { exportDashboardReportController } from "../controller/report.controller.js";

const dashboardRouter = express.Router();

// Debug middleware
dashboardRouter.use((req, res, next) => {
  console.log(
    "📍 Dashboard router middleware hit:",
    req.method,
    req.originalUrl,
  );
  next();
});

// ✅ Admin Dashboard - Stats (no role check needed)
dashboardRouter.get("/stats", requireAuth, dashboardStatsController);

// ✅ Manager Dashboard - Summary (requires MANAGER or BRAND_ADMIN role)
dashboardRouter.get(
  "/summary",
  requireAuth,
  requireRole("MANAGER", "BRAND_ADMIN"),
  dashboardSummaryController,
);

// ✅ Professional Dashboard - KPI Metrics
dashboardRouter.get(
  "/kpi",
  requireAuth,
  requireRole("MANAGER", "BRAND_ADMIN"),
  kpiMetricsController,
);

// ✅ Professional Dashboard - Performance Metrics
dashboardRouter.get(
  "/performance",
  requireAuth,
  requireRole("MANAGER", "BRAND_ADMIN"),
  performanceMetricsController,
);

// ✅ Professional Dashboard - Operational Metrics
dashboardRouter.get(
  "/operational",
  requireAuth,
  requireRole("MANAGER", "BRAND_ADMIN"),
  operationalMetricsController,
);

// ✅ Professional Dashboard - Revenue Breakdown
dashboardRouter.get(
  "/revenue-breakdown",
  requireAuth,
  requireRole("MANAGER", "BRAND_ADMIN"),
  revenueBreakdownController,
);

// ✅ Export Dashboard Report (CSV/JSON)
dashboardRouter.get(
  "/report/export",
  requireAuth,
  requireRole("MANAGER", "BRAND_ADMIN"),
  exportDashboardReportController,
);

/**
 * ===================================================
 * PHASE 3 ENHANCEMENTS - REAL-TIME ANALYTICS
 * ===================================================
 */

// ✅ Analytics with date range filtering
dashboardRouter.get(
  "/analytics",
  requireAuth,
  requireRole("MANAGER", "BRAND_ADMIN"),
  async (req, res) => {
    try {
      const restaurantId = req.user.restaurantId;
      const { startDate, endDate } = req.query;

      // Parse dates
      const start = startDate ? new Date(startDate) : new Date();
      start.setHours(0, 0, 0, 0);

      const end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999);

      // Get all required data in parallel
      const [bills, orders, sessions, tables, staff] = await Promise.all([
        Bill.find({
          restaurantId,
          createdAt: { $gte: start, $lte: end },
        }).lean(),
        Order.find({
          restaurantId,
          createdAt: { $gte: start, $lte: end },
        }).lean(),
        Session.find({
          restaurantId,
          createdAt: { $gte: start, $lte: end },
        }).lean(),
        Table.find({ restaurantId }).lean(),
        User.find({ restaurantId, role: "MANAGER" }).lean(),
      ]);

      // Calculate metrics
      const totalOrders = orders.length;
      const completedOrders = orders.filter(
        (o) => o.orderStatus === "SERVED",
      ).length;
      const pendingOrders = orders.filter(
        (o) => o.orderStatus !== "SERVED",
      ).length;
      const totalRevenue = bills.reduce((sum, b) => sum + b.total, 0);
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      res.json({
        success: true,
        data: {
          period: { startDate: start, endDate: end },
          orders: {
            total: totalOrders,
            completed: completedOrders,
            pending: pendingOrders,
            completionRate:
              totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
          },
          revenue: {
            total: totalRevenue,
            average: avgOrderValue,
          },
          tables: {
            total: tables.length,
            active: sessions.filter((s) => s.status === "OPEN").length,
          },
          staff: {
            total: staff.length,
          },
          chartData: {
            ordersTimeline: aggregateOrdersByHour(orders),
            revenueTimeline: aggregateRevenueByHour(bills),
            paymentMethods: aggregatePaymentMethods(bills),
          },
        },
      });
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

// ✅ Real-time stats update (for live dashboard)
dashboardRouter.get(
  "/stats/live",
  requireAuth,
  requireRole("MANAGER", "BRAND_ADMIN"),
  async (req, res) => {
    try {
      const restaurantId = req.user.restaurantId;
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const [paidBills, totalOrders, pendingOrders, openSessions] =
        await Promise.all([
          Bill.find({
            restaurantId,
            status: "PAID",
            createdAt: { $gte: start, $lte: end },
          }).lean(),
          Order.countDocuments({
            restaurantId,
            createdAt: { $gte: start, $lte: end },
          }),
          Order.countDocuments({
            restaurantId,
            orderStatus: { $ne: "SERVED" },
          }),
          Session.countDocuments({
            restaurantId,
            status: "OPEN",
          }),
        ]);

      const totalRevenue = paidBills.reduce((sum, b) => sum + b.total, 0);

      res.json({
        success: true,
        data: {
          orders: totalOrders,
          pending: pendingOrders,
          revenue: totalRevenue,
          activeSessions: openSessions,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error("Live stats error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
);

// Helper functions for aggregation
function aggregateOrdersByHour(orders) {
  const hourly = {};
  orders.forEach((order) => {
    const hour = new Date(order.createdAt).getHours();
    hourly[hour] = (hourly[hour] || 0) + 1;
  });
  return hourly;
}

function aggregateRevenueByHour(bills) {
  const hourly = {};
  bills.forEach((bill) => {
    const hour = new Date(bill.createdAt).getHours();
    hourly[hour] = (hourly[hour] || 0) + bill.total;
  });
  return hourly;
}

function aggregatePaymentMethods(bills) {
  const methods = {};
  bills.forEach((bill) => {
    const method = bill.paymentMethod || "CASH";
    methods[method] = (methods[method] || 0) + bill.total;
  });
  return methods;
}

export default dashboardRouter;
