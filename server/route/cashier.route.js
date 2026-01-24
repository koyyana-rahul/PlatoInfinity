import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

import {
  getPendingBillsController,
  getBillDetailController,
  processBillPaymentController,
  getCashierSummaryController,
  splitBillPaymentController,
  getPaymentHistoryController,
} from "../controller/cashier.controller.js";
import Bill from "../models/bill.model.js";
import Order from "../models/order.model.js";

const cashierRouter = express.Router();

// All routes require CASHIER role
cashierRouter.use(requireAuth, requireRole("CASHIER", "MANAGER"));

/* ======================================================
   CASHIER ROUTES
====================================================== */

/**
 * GET PENDING BILLS
 * GET /api/cashier/bills
 */
cashierRouter.get("/bills", getPendingBillsController);

/**
 * GET BILL DETAILS
 * GET /api/cashier/bills/:billId
 */
cashierRouter.get("/bills/:billId", getBillDetailController);

/**
 * PROCESS PAYMENT
 * POST /api/cashier/bills/:billId/pay
 * body: { paymentMethod, amountPaid, notes }
 */
cashierRouter.post("/bills/:billId/pay", processBillPaymentController);

/**
 * SPLIT PAYMENT
 * POST /api/cashier/bills/:billId/split
 * body: { payments: [{method, amount}, ...] }
 */
cashierRouter.post("/bills/:billId/split", splitBillPaymentController);

/**
 * CASHIER SUMMARY
 * GET /api/cashier/summary
 */
cashierRouter.get("/summary", getCashierSummaryController);

/**
 * PAYMENT HISTORY (For reconciliation)
 * GET /api/cashier/history?startDate=...&endDate=...
 */
cashierRouter.get("/history", getPaymentHistoryController);

/**
 * ===================================================
 * PHASE 3 ENHANCEMENTS - CASHIER DASHBOARD
 * ===================================================
 */

// ✅ Get transactions for CashierDashboard.ENHANCED
cashierRouter.get("/dashboard/transactions", async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { startDate, endDate, paymentMethod, status } = req.query;

    let billQuery = { restaurantId };

    // Date range filtering
    if (startDate || endDate) {
      billQuery.createdAt = {};
      if (startDate) billQuery.createdAt.$gte = new Date(startDate);
      if (endDate) billQuery.createdAt.$lte = new Date(endDate);
    }

    // Payment method filtering
    if (paymentMethod && paymentMethod !== "all") {
      billQuery.paymentMethod = paymentMethod;
    }

    // Status filtering
    if (status && status !== "all") {
      billQuery.paymentStatus = status;
    }

    const bills = await Bill.find(billQuery)
      .populate("tableId", "tableNumber")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const transactions = bills.map((bill) => ({
      _id: bill._id,
      tableNumber: bill.tableId?.tableNumber,
      total: bill.total,
      paid: bill.paidAmount || 0,
      pending: bill.total - (bill.paidAmount || 0),
      paymentMethod: bill.paymentMethod,
      paymentStatus: bill.paymentStatus,
      items: bill.items?.length || 0,
      createdAt: bill.createdAt,
      paymentDate: bill.paymentDate,
    }));

    const stats = {
      totalTransactions: transactions.length,
      totalAmount: transactions.reduce((sum, t) => sum + t.total, 0),
      totalPaid: transactions.reduce((sum, t) => sum + t.paid, 0),
      totalPending: transactions.reduce((sum, t) => sum + t.pending, 0),
    };

    res.json({
      success: true,
      data: {
        transactions,
        stats,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Transactions error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Get payment breakdown statistics
cashierRouter.get("/dashboard/payment-breakdown", async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { startDate, endDate } = req.query;

    let matchQuery = {
      restaurantId,
      paymentStatus: "PAID",
    };

    // Date filtering
    if (startDate || endDate) {
      matchQuery.paymentDate = {};
      if (startDate) matchQuery.paymentDate.$gte = new Date(startDate);
      if (endDate) matchQuery.paymentDate.$lte = new Date(endDate);
    }

    const bills = await Bill.find(matchQuery).lean();

    // Group by payment method
    const breakdown = {};
    bills.forEach((bill) => {
      const method = bill.paymentMethod || "UNKNOWN";
      if (!breakdown[method]) {
        breakdown[method] = {
          method,
          count: 0,
          total: 0,
          percentage: 0,
        };
      }
      breakdown[method].count += 1;
      breakdown[method].total += bill.total;
    });

    const grandTotal = bills.reduce((sum, b) => sum + b.total, 0);

    const paymentMethods = Object.values(breakdown).map((item) => ({
      ...item,
      percentage:
        grandTotal > 0 ? ((item.total / grandTotal) * 100).toFixed(2) : 0,
    }));

    res.json({
      success: true,
      data: {
        paymentMethods: paymentMethods.sort((a, b) => b.total - a.total),
        totals: {
          grandTotal,
          transactionCount: bills.length,
          averageTransaction:
            bills.length > 0 ? (grandTotal / bills.length).toFixed(2) : 0,
        },
      },
    });
  } catch (error) {
    console.error("Payment breakdown error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Get daily reconciliation
cashierRouter.get("/dashboard/reconciliation", async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [bills, orders] = await Promise.all([
      Bill.find({
        restaurantId,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }).lean(),
      Order.find({
        restaurantId,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }).lean(),
    ]);

    const paidBills = bills.filter((b) => b.paymentStatus === "PAID");
    const pendingBills = bills.filter((b) => b.paymentStatus === "PENDING");
    const partialBills = bills.filter((b) => b.paymentStatus === "PARTIAL");

    res.json({
      success: true,
      data: {
        date: targetDate.toISOString().split("T")[0],
        bills: {
          total: bills.length,
          paid: paidBills.length,
          pending: pendingBills.length,
          partial: partialBills.length,
        },
        revenue: {
          gross: bills.reduce((sum, b) => sum + b.total, 0),
          collected: paidBills.reduce((sum, b) => sum + b.total, 0),
          partial: partialBills.reduce(
            (sum, b) => sum + (b.paidAmount || 0),
            0,
          ),
          pending: pendingBills.reduce((sum, b) => sum + b.total, 0),
        },
        orders: {
          total: orders.length,
          completed: orders.filter((o) => o.orderStatus === "SERVED").length,
          pending: orders.filter((o) => o.orderStatus !== "SERVED").length,
        },
        paymentMethods: aggregatePaymentMethods(paidBills),
      },
    });
  } catch (error) {
    console.error("Reconciliation error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Export transactions (CSV format)
cashierRouter.get("/dashboard/export-transactions", async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId;
    const { startDate, endDate, format = "json" } = req.query;

    let billQuery = { restaurantId };

    if (startDate || endDate) {
      billQuery.createdAt = {};
      if (startDate) billQuery.createdAt.$gte = new Date(startDate);
      if (endDate) billQuery.createdAt.$lte = new Date(endDate);
    }

    const bills = await Bill.find(billQuery)
      .populate("tableId", "tableNumber")
      .sort({ createdAt: -1 })
      .lean();

    if (format === "csv") {
      // Generate CSV
      const headers = [
        "Date",
        "Table",
        "Amount",
        "Paid",
        "Pending",
        "Method",
        "Status",
        "Items",
      ];
      const rows = bills.map((b) => [
        new Date(b.createdAt).toLocaleString(),
        b.tableId?.tableNumber || "N/A",
        b.total,
        b.paidAmount || 0,
        b.total - (b.paidAmount || 0),
        b.paymentMethod,
        b.paymentStatus,
        b.items?.length || 0,
      ]);

      const csv = [headers, ...rows]
        .map((row) => row.map((v) => `"${v}"`).join(","))
        .join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="transactions-${new Date().toISOString().split("T")[0]}.csv"`,
      );
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: {
          transactions: bills.map((b) => ({
            date: b.createdAt,
            table: b.tableId?.tableNumber,
            total: b.total,
            paid: b.paidAmount || 0,
            pending: b.total - (b.paidAmount || 0),
            method: b.paymentMethod,
            status: b.paymentStatus,
            items: b.items?.length,
          })),
          exportDate: new Date(),
        },
      });
    }
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to aggregate payment methods
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

export default cashierRouter;
