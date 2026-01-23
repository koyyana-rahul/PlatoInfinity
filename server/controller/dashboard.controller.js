import Bill from "../models/bill.model.js";
import Order from "../models/order.model.js";
import Session from "../models/session.model.js";
import Table from "../models/table.model.js";
import User from "../models/user.model.js";
import {
  kpiMetricsController,
  performanceMetricsController,
  operationalMetricsController,
  revenueBreakdownController,
} from "./dashboard.extended.js";

/**
 * ============================
 * DASHBOARD SUMMARY
 * ============================
 * GET /api/dashboard/summary
 * Access: MANAGER / OWNER
 */
export async function dashboardSummaryController(req, res) {
  try {
    const restaurantId = req.user.restaurantId;

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    // Parallel queries (FAST)
    const [todayBills, totalOrders, openSessions, tables, kitchenPending] =
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

        Session.countDocuments({
          restaurantId,
          status: "OPEN",
        }),

        Table.find({ restaurantId }).lean(),

        Order.countDocuments({
          restaurantId,
          orderStatus: "OPEN",
          "items.itemStatus": { $in: ["NEW", "IN_PROGRESS"] },
        }),
      ]);

    const totalSales = todayBills.reduce((sum, b) => sum + b.total, 0);
    const avgBillValue =
      todayBills.length > 0 ? totalSales / todayBills.length : 0;

    const occupiedTables = tables.filter((t) => t.status === "OCCUPIED").length;
    const freeTables = tables.filter((t) => t.status === "FREE").length;

    return res.json({
      success: true,
      error: false,
      data: {
        today: {
          totalSales,
          totalBills: todayBills.length,
          avgBillValue: Math.round(avgBillValue),
          totalOrders,
        },
        tables: {
          total: tables.length,
          occupied: occupiedTables,
          free: freeTables,
        },
        sessions: {
          activeSessions: openSessions,
        },
        kitchen: {
          pendingItems: kitchenPending,
        },
      },
    });
  } catch (err) {
    console.error("dashboardSummaryController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

/**
 * ============================
 * ADMIN DASHBOARD STATS
 * ============================
 * GET /api/dashboard/stats?range=today
 * Access: ADMIN / OWNER
 */
export async function dashboardStatsController(req, res) {
  try {
    console.log("\n✅ ============ 📊 STATS CONTROLLER REACHED ============");
    console.log("   This means requireAuth PASSED!");
    console.log("   req.user:", req.user);
    console.log("   req.cookies:", req.cookies);

    const { range = "today" } = req.query;
    console.log("   range:", range);
    let startDate = new Date();
    let endDate = new Date();

    // Parse date range
    if (range === "today") {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (range === "week") {
      const day = startDate.getDay();
      startDate.setDate(startDate.getDate() - day);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (range === "month") {
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    // Get all restaurants bills for stats
    const [bills, orders, tables, activeSessions] = await Promise.all([
      Bill.find({
        status: "PAID",
        createdAt: { $gte: startDate, $lte: endDate },
      }).lean(),

      Order.find({
        createdAt: { $gte: startDate, $lte: endDate },
      }).lean(),

      Table.find({}).lean(),

      Session.countDocuments({
        status: "OPEN",
      }),
    ]);

    const totalSales = bills.reduce((sum, b) => sum + (b.total || 0), 0);
    const completedOrders = orders.filter((o) => o.orderStatus === "SERVED");
    const completionRate =
      orders.length > 0 ? (completedOrders.length / orders.length) * 100 : 0;

    return res.json({
      success: true,
      error: false,
      data: {
        totalSales: Math.round(totalSales),
        ordersToday: orders.length,
        activeTables: tables.filter((t) => t.status === "OCCUPIED").length,
        activeUsers: activeSessions,
        averageOrderValue:
          orders.length > 0
            ? Math.round(
                orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) /
                  orders.length,
              )
            : 0,
        completionRate: Math.round(completionRate),
      },
    });
  } catch (err) {
    console.error("dashboardStatsController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

// Export extended controllers
export {
  kpiMetricsController,
  performanceMetricsController,
  operationalMetricsController,
  revenueBreakdownController,
};
