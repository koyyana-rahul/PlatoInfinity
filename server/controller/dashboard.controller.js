import Bill from "../models/bill.model.js";
import Order from "../models/order.model.js";
import Session from "../models/session.model.js";
import Table from "../models/table.model.js";

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
          "items.status": { $in: ["PENDING", "PREPARING"] },
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
