import Bill from "../models/bill.model.js";
import Order from "../models/order.model.js";
import Session from "../models/session.model.js";

/* ======================================================
   GET PENDING BILLS (Cashier dashboard)
====================================================== */
export async function getPendingBillsController(req, res) {
  try {
    const restaurantId = req.user.restaurantId;

    const bills = await Bill.find({
      restaurantId,
      status: "OPEN",
    })
      .select("_id sessionId tableName total items createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: bills,
    });
  } catch (err) {
    console.error("getPendingBillsController:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/* ======================================================
   GET BILL DETAILS
====================================================== */
export async function getBillDetailController(req, res) {
  try {
    const { billId } = req.params;
    const restaurantId = req.user.restaurantId;

    const bill = await Bill.findOne({
      _id: billId,
      restaurantId,
    }).lean();

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    return res.json({
      success: true,
      data: bill,
    });
  } catch (err) {
    console.error("getBillDetailController:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/* ======================================================
   PROCESS BILL PAYMENT
====================================================== */
export async function processBillPaymentController(req, res) {
  try {
    const { billId } = req.params;
    const { paymentMethod = "CASH", amountPaid = 0, notes = "" } = req.body;
    const restaurantId = req.user.restaurantId;
    const cashierId = req.user._id;

    // ✅ VALIDATE PAYMENT METHOD
    if (!["CASH", "CARD", "UPI", "CHEQUE"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // 🔍 FIND BILL
    const bill = await Bill.findOne({
      _id: billId,
      restaurantId,
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    if (bill.status !== "OPEN") {
      return res.status(400).json({
        success: false,
        message: "Bill already paid or closed",
      });
    }

    // 💰 VALIDATE AMOUNT
    const billTotal = bill.total || 0;
    const finalAmountPaid = amountPaid > 0 ? amountPaid : billTotal;

    if (finalAmountPaid < billTotal && paymentMethod !== "CHEQUE") {
      return res.status(400).json({
        success: false,
        message: `Insufficient payment. Bill total: ${billTotal}, Paid: ${finalAmountPaid}`,
      });
    }

    // 🔄 UPDATE BILL
    bill.status = "PAID";
    bill.paymentMethod = paymentMethod;
    bill.amountPaid = finalAmountPaid;
    bill.paidAt = new Date();
    bill.paidBy = cashierId;
    bill.closedAt = new Date();
    bill.notes = notes || "";

    // 📝 CALCULATE CHANGE
    bill.change = finalAmountPaid - billTotal;

    await bill.save();

    // 🔗 CLOSE SESSION if all bills paid
    const openBills = await Bill.countDocuments({
      sessionId: bill.sessionId,
      status: "OPEN",
    });

    if (openBills === 0) {
      await Session.updateOne(
        { _id: bill.sessionId },
        {
          sessionStatus: "CLOSED",
          closedAt: new Date(),
        },
      );
    }

    return res.json({
      success: true,
      message: "Payment processed",
      data: {
        billId: bill._id,
        status: bill.status,
        amountPaid: bill.amountPaid,
        change: bill.change,
        paymentMethod: bill.paymentMethod,
        paidAt: bill.paidAt,
      },
    });
  } catch (err) {
    console.error("processBillPaymentController:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/* ======================================================
   GET CASHIER SUMMARY (Daily stats)
====================================================== */
export async function getCashierSummaryController(req, res) {
  try {
    const restaurantId = req.user.restaurantId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bills = await Bill.find({
      restaurantId,
      status: "PAID",
      paidAt: { $gte: today },
    }).lean();

    const summary = {
      totalBillsPaid: bills.length,
      totalCash: bills
        .filter((b) => b.paymentMethod === "CASH")
        .reduce((sum, b) => sum + (b.amountPaid || 0), 0),
      totalCard: bills
        .filter((b) => b.paymentMethod === "CARD")
        .reduce((sum, b) => sum + (b.amountPaid || 0), 0),
      totalUPI: bills
        .filter((b) => b.paymentMethod === "UPI")
        .reduce((sum, b) => sum + (b.amountPaid || 0), 0),
      totalRevenue: bills.reduce((sum, b) => sum + (b.total || 0), 0),
      totalCheques: bills.filter((b) => b.paymentMethod === "CHEQUE").length,
    };

    summary.totalCollected =
      summary.totalCash + summary.totalCard + summary.totalUPI;

    return res.json({
      success: true,
      data: summary,
    });
  } catch (err) {
    console.error("getCashierSummaryController:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/* ======================================================
   SPLIT BILL (Multiple payment methods)
====================================================== */
export async function splitBillPaymentController(req, res) {
  try {
    const { billId } = req.params;
    const { payments = [] } = req.body; // [{ method, amount }, ...]
    const restaurantId = req.user.restaurantId;
    const cashierId = req.user._id;

    // 🔍 FIND BILL
    const bill = await Bill.findOne({
      _id: billId,
      restaurantId,
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    if (bill.status !== "OPEN") {
      return res.status(400).json({
        success: false,
        message: "Bill already paid or closed",
      });
    }

    // 💰 VALIDATE TOTAL
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const billTotal = bill.total || 0;

    if (totalPaid < billTotal) {
      return res.status(400).json({
        success: false,
        message: `Insufficient payment. Bill total: ${billTotal}, Paid: ${totalPaid}`,
      });
    }

    // ✅ SPLIT PAYMENT
    bill.status = "PAID";
    bill.splitPayment = payments; // Store split details
    bill.amountPaid = totalPaid;
    bill.paidAt = new Date();
    bill.paidBy = cashierId;
    bill.closedAt = new Date();
    bill.change = totalPaid - billTotal;

    await bill.save();

    // 🔗 CLOSE SESSION if all bills paid
    const openBills = await Bill.countDocuments({
      sessionId: bill.sessionId,
      status: "OPEN",
    });

    if (openBills === 0) {
      await Session.updateOne(
        { _id: bill.sessionId },
        {
          sessionStatus: "CLOSED",
          closedAt: new Date(),
        },
      );
    }

    return res.json({
      success: true,
      message: "Split payment processed",
      data: {
        billId: bill._id,
        status: bill.status,
        splitPayments: bill.splitPayment,
        totalPaid: bill.amountPaid,
        change: bill.change,
        paidAt: bill.paidAt,
      },
    });
  } catch (err) {
    console.error("splitBillPaymentController:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/* ======================================================
   GET PAYMENT HISTORY (For reconciliation)
====================================================== */
export async function getPaymentHistoryController(req, res) {
  try {
    const restaurantId = req.user.restaurantId;
    const { startDate, endDate } = req.query;

    const query = { restaurantId, status: "PAID" };

    if (startDate || endDate) {
      query.paidAt = {};
      if (startDate) query.paidAt.$gte = new Date(startDate);
      if (endDate) query.paidAt.$lte = new Date(endDate);
    }

    const bills = await Bill.find(query)
      .select("_id tableName total amountPaid paymentMethod paidAt paidBy")
      .sort({ paidAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: bills,
    });
  } catch (err) {
    console.error("getPaymentHistoryController:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
