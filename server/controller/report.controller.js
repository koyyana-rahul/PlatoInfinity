import Order from "../models/order.model.js";
import Bill from "../models/bill.model.js";
import Session from "../models/session.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import BranchMenuItem from "../models/branchMenuItem.model.js";

/**
 * ============================
 * DAILY SALES SUMMARY
 * ============================
 * GET /api/reports/sales?from=&to=
 */

import {
  getGSTReport,
  getTopSellingItems,
} from "../services/reports.service.js";

/**
 * GET /api/reports/gst
 */
export async function gstReportController(req, res) {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        message: "from & to required",
        error: true,
        success: false,
      });
    }

    const data = await getGSTReport({
      restaurantId: req.user.restaurantId,
      from,
      to,
    });

    res.json({
      success: true,
      error: false,
      data,
    });
  } catch (err) {
    console.error("gstReportController:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * GET /api/reports/top-items
 */
export async function topItemsReportController(req, res) {
  try {
    const { from, to, limit } = req.query;

    const data = await getTopSellingItems({
      restaurantId: req.user.restaurantId,
      from,
      to,
      limit: Number(limit) || 10,
    });

    res.json({
      success: true,
      error: false,
      data,
    });
  } catch (err) {
    console.error("topItemsReportController:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function salesSummaryController(req, res) {
  try {
    const { from, to } = req.query;
    const restaurantId = req.user.restaurantId;

    const start = from ? new Date(from) : new Date().setHours(0, 0, 0, 0);
    const end = to ? new Date(to) : new Date().setHours(23, 59, 59, 999);

    const bills = await Bill.find({
      restaurantId,
      paymentStatus: "PAID",
      createdAt: { $gte: start, $lte: end },
    });

    let totalSales = 0;
    let cash = 0,
      upi = 0,
      card = 0;

    for (const bill of bills) {
      totalSales += bill.totalAmount;

      if (bill.paymentMethod === "CASH") cash += bill.totalAmount;
      if (bill.paymentMethod === "UPI") upi += bill.totalAmount;
      if (bill.paymentMethod === "CARD") card += bill.totalAmount;
    }

    const sessionsCount = await Session.countDocuments({
      restaurantId,
      createdAt: { $gte: start, $lte: end },
    });

    return res.json({
      success: true,
      error: false,
      data: {
        totalSales,
        paymentSplit: { cash, upi, card },
        totalBills: bills.length,
        sessionsCount,
        avgBillValue:
          bills.length > 0 ? Math.round(totalSales / bills.length) : 0,
      },
    });
  } catch (err) {
    console.error("salesSummaryController:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * ============================
 * ITEM SALES REPORT
 * ============================
 * GET /api/reports/items?from=&to=
 */
export async function itemSalesReportController(req, res) {
  try {
    const restaurantId = req.user.restaurantId;
    const { from, to } = req.query;

    const start = from ? new Date(from) : new Date().setHours(0, 0, 0, 0);
    const end = to ? new Date(to) : new Date().setHours(23, 59, 59, 999);

    const result = await Order.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          createdAt: { $gte: new Date(start), $lte: new Date(end) },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.branchMenuItemId",
          name: { $first: "$items.name" },
          quantity: { $sum: "$items.quantity" },
          revenue: {
            $sum: {
              $multiply: ["$items.price", "$items.quantity"],
            },
          },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    return res.json({
      success: true,
      error: false,
      data: result,
    });
  } catch (err) {
    console.error("itemSalesReportController:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * ============================
 * WAITER REPORT
 * ============================
 * GET /api/reports/waiters
 */
export async function waiterReportController(req, res) {
  try {
    const restaurantId = req.user.restaurantId;

    const result = await Bill.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          paymentStatus: "PAID",
        },
      },
      {
        $group: {
          _id: "$paidByUserId",
          totalCollected: { $sum: "$totalAmount" },
          billsCount: { $sum: 1 },
        },
      },
    ]);

    return res.json({
      success: true,
      error: false,
      data: result,
    });
  } catch (err) {
    console.error("waiterReportController:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function dailySalesReport(req, res) {
  const { date } = req.query;
  const start = new Date(date);
  const end = new Date(date);
  end.setHours(23, 59, 59);

  const bills = await Bill.find({
    status: "PAID",
    createdAt: { $gte: start, $lte: end },
  }).lean();

  const totalSales = bills.reduce((sum, b) => sum + b.total, 0);

  res.json({
    success: true,
    totalBills: bills.length,
    totalSales,
    bills,
  });
}

/**
 * ===============================
 * HOURLY SALES REPORT
 * ===============================
 * GET /api/reports/hourly-sales
 * Query:
 *   date=YYYY-MM-DD
 * Access: MANAGER / OWNER
 */
export async function hourlySalesReportController(req, res) {
  try {
    const restaurantId = req.user.restaurantId;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "date is required (YYYY-MM-DD)",
        error: true,
        success: false,
      });
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const hourlySales = await Bill.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          status: "PAID",
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          totalSales: { $sum: "$total" },
          billCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 🔥 Fill missing hours (0–23)
    const result = Array.from({ length: 24 }, (_, hour) => {
      const found = hourlySales.find((h) => h._id === hour);
      return {
        hour,
        totalSales: found ? found.totalSales : 0,
        billCount: found ? found.billCount : 0,
      };
    });

    return res.json({
      success: true,
      error: false,
      data: result,
    });
  } catch (err) {
    console.error("hourlySalesReportController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

/**
 * ===============================
 * GST / TAX BREAKUP REPORT
 * ===============================
 * GET /api/reports/tax-breakup
 * Query:
 *   startDate=YYYY-MM-DD
 *   endDate=YYYY-MM-DD
 * Access: MANAGER / OWNER
 */
export async function taxBreakupReportController(req, res) {
  try {
    const restaurantId = req.user.restaurantId;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "startDate and endDate are required",
        error: true,
        success: false,
      });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const taxReport = await Bill.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          status: "PAID",
          createdAt: { $gte: start, $lte: end },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.taxPercent",
          taxableAmount: {
            $sum: {
              $multiply: ["$items.rate", "$items.quantity"],
            },
          },
          taxAmount: {
            $sum: {
              $multiply: [
                {
                  $divide: ["$items.taxPercent", 100],
                },
                {
                  $multiply: ["$items.rate", "$items.quantity"],
                },
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    let grandTaxable = 0;
    let grandTax = 0;

    const formatted = taxReport.map((t) => {
      grandTaxable += t.taxableAmount;
      grandTax += t.taxAmount;

      return {
        taxPercent: t._id,
        taxableAmount: Number(t.taxableAmount.toFixed(2)),
        taxAmount: Number(t.taxAmount.toFixed(2)),
      };
    });

    return res.json({
      success: true,
      error: false,
      data: {
        period: { startDate, endDate },
        breakup: formatted,
        totals: {
          taxableAmount: Number(grandTaxable.toFixed(2)),
          taxAmount: Number(grandTax.toFixed(2)),
        },
      },
    });
  } catch (err) {
    console.error("taxBreakupReportController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

/**
 * ===============================
 * MONTHLY P&L REPORT
 * ===============================
 * GET /api/reports/monthly-pl
 * Query:
 *   year=2025
 *   month=1 (1-12)
 * Access: OWNER only
 */
export async function monthlyPLReportController(req, res) {
  try {
    const restaurantId = req.user.restaurantId;
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({
        message: "year and month are required",
        error: true,
        success: false,
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    /**
     * 1️⃣ FETCH PAID BILLS
     */
    const bills = await Bill.find({
      restaurantId,
      status: "PAID",
      createdAt: { $gte: startDate, $lte: endDate },
    }).lean();

    if (!bills.length) {
      return res.json({
        success: true,
        error: false,
        data: {
          revenue: 0,
          discounts: 0,
          taxes: 0,
          foodCost: 0,
          profit: 0,
          billsCount: 0,
        },
      });
    }

    let grossRevenue = 0;
    let totalDiscounts = 0;
    let totalTaxes = 0;
    let foodCost = 0;

    /**
     * 2️⃣ PRELOAD MENU COST PRICES
     */
    const menuMap = {};
    const menuItems = await BranchMenuItem.find({
      restaurantId,
    }).lean();

    for (const m of menuItems) {
      menuMap[String(m._id)] = m.costPrice || 0;
    }

    /**
     * 3️⃣ CALCULATE TOTALS
     */
    for (const bill of bills) {
      grossRevenue += bill.subtotal || 0;
      totalDiscounts += bill.discounts || 0;
      totalTaxes += bill.taxes || 0;

      for (const item of bill.items) {
        const costPrice = menuMap[String(item.branchMenuItemId)] || 0;
        foodCost += costPrice * item.quantity;
      }
    }

    const netSales = grossRevenue - totalDiscounts;
    const profit = netSales - foodCost - totalTaxes;

    return res.json({
      success: true,
      error: false,
      data: {
        period: {
          year: Number(year),
          month: Number(month),
        },
        summary: {
          grossRevenue: Number(grossRevenue.toFixed(2)),
          discounts: Number(totalDiscounts.toFixed(2)),
          netSales: Number(netSales.toFixed(2)),
          taxes: Number(totalTaxes.toFixed(2)),
          foodCost: Number(foodCost.toFixed(2)),
          profit: Number(profit.toFixed(2)),
          billsCount: bills.length,
        },
      },
    });
  } catch (err) {
    console.error("monthlyPLReportController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

/**
 * ============================
 * EXPORT DASHBOARD REPORT
 * ============================
 * GET /api/dashboard/report/export
 * Access: ADMIN / MANAGER / BRAND_ADMIN
 */
export async function exportDashboardReportController(req, res) {
  try {
    const user = req.user;
    const { range = "today" } = req.query;

    // Build filter based on user
    const filter = {};
    if (user.restaurantId) {
      filter.restaurantId = user.restaurantId;
    }

    // Date range
    let startDate = new Date();
    let endDate = new Date();

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

    // Fetch data
    const [bills, orders, staff] = await Promise.all([
      Bill.find({
        ...filter,
        status: "PAID",
        createdAt: { $gte: startDate, $lte: endDate },
      })
        .select("_id total createdAt")
        .lean(),

      Order.find({
        ...filter,
        createdAt: { $gte: startDate, $lte: endDate },
      })
        .select("_id totalAmount orderStatus items createdAt")
        .lean(),

      User.find({
        role: { $in: ["CHEF", "WAITER", "CASHIER"] },
        ...filter,
      })
        .select("_id name role isActive")
        .lean(),
    ]);

    // Calculate metrics
    const totalSales = bills.reduce((sum, b) => sum + (b.total || 0), 0);
    const completedOrders = orders.filter((o) => o.orderStatus === "SERVED");
    const totalOrders = orders.length;
    const avgOrderValue =
      totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

    // Create report data
    const reportData = [
      {
        Metric: "Total Sales",
        Value: totalSales.toFixed(2),
        Unit: "Currency",
        Date: new Date().toLocaleDateString(),
      },
      {
        Metric: "Total Orders",
        Value: totalOrders,
        Unit: "Count",
        Date: new Date().toLocaleDateString(),
      },
      {
        Metric: "Completed Orders",
        Value: completedOrders.length,
        Unit: "Count",
        Date: new Date().toLocaleDateString(),
      },
      {
        Metric: "Average Order Value",
        Value: avgOrderValue.toFixed(2),
        Unit: "Currency",
        Date: new Date().toLocaleDateString(),
      },
      {
        Metric: "Total Bills",
        Value: bills.length,
        Unit: "Count",
        Date: new Date().toLocaleDateString(),
      },
      {
        Metric: "Active Staff",
        Value: staff.filter((s) => s.isActive).length,
        Unit: "Count",
        Date: new Date().toLocaleDateString(),
      },
      {
        Metric: "Completion Rate",
        Value: `${totalOrders > 0 ? Math.round((completedOrders.length / totalOrders) * 100) : 0}%`,
        Unit: "Percentage",
        Date: new Date().toLocaleDateString(),
      },
    ];

    return res.json({
      success: true,
      error: false,
      data: reportData,
      summary: {
        totalSales: totalSales.toFixed(2),
        totalOrders,
        completedOrders: completedOrders.length,
        avgOrderValue,
        totalStaff: staff.length,
        activeStaff: staff.filter((s) => s.isActive).length,
      },
    });
  } catch (err) {
    console.error("exportDashboardReportController:", err);
    return res.status(500).json({
      message: "Failed to export report",
      error: true,
      success: false,
    });
  }
}
