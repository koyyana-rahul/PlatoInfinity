import axios from "axios";
import crypto from "crypto";

/**
 * UPI PAYMENT INTEGRATION
 * Supports Razorpay for payment processing
 * Fallback to manual cash entry
 */

/**
 * Initialize Razorpay payment order
 * @param {Object} bill - Bill object with orderId, amount, etc.
 * @returns {Promise<Object>} - { orderId, amount, key }
 */
export async function initializeRazorpayOrder(bill) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials not configured");
  }

  const auth = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
  ).toString("base64");

  try {
    const response = await axios.post(
      "https://api.razorpay.com/v1/orders",
      {
        amount: Math.round(bill.totalAmount * 100), // Convert to paise
        currency: "INR",
        receipt: `bill_${bill._id}`,
        notes: {
          billId: bill._id.toString(),
          restaurantId: bill.restaurantId?.toString(),
          tableId: bill.tableId?.toString(),
        },
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      },
    );

    return {
      orderId: response.data.id,
      amount: response.data.amount,
      currency: response.data.currency,
      key: process.env.RAZORPAY_KEY_ID,
    };
  } catch (error) {
    console.error("Razorpay order creation failed:", error.message);
    throw error;
  }
}

/**
 * Verify UPI payment signature from Razorpay
 * @param {Object} paymentData - { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * @returns {boolean} - True if signature is valid
 */
export function verifyRazorpaySignature(paymentData) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    paymentData;

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  return expectedSignature === razorpay_signature;
}

/**
 * Fetch payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} - Payment details
 */
export async function fetchRazorpayPayment(paymentId) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials not configured");
  }

  const auth = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
  ).toString("base64");

  try {
    const response = await axios.get(
      `https://api.razorpay.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Razorpay payment fetch failed:", error.message);
    throw error;
  }
}

/**
 * Process cash payment (manual entry)
 * Simple wrapper for cash-only transactions
 * @param {Object} bill - Bill object
 * @param {number} amountReceived - Cash amount received
 * @returns {Object} - { success, change, orderId }
 */
export async function processCashPayment(bill, amountReceived) {
  const dueAmount = bill.totalAmount || 0;

  if (amountReceived < dueAmount) {
    return {
      success: false,
      message: `Insufficient amount. Due: ₹${dueAmount}, Received: ₹${amountReceived}`,
      change: 0,
    };
  }

  const change = amountReceived - dueAmount;

  // Record payment entry
  const Payment = (await import("../models/payment.model.js")).default;
  const payment = await Payment.create({
    billId: bill._id,
    restaurantId: bill.restaurantId,
    amount: dueAmount,
    paymentMethod: "CASH",
    status: "COMPLETED",
    processedAt: new Date(),
    notes: `Cash payment received. Change: ₹${change}`,
  });

  return {
    success: true,
    message: "Payment processed successfully",
    paymentId: payment._id,
    change,
  };
}

/**
 * Validate UPI string format (optional VPA validation)
 * @param {string} upiId - UPI ID (e.g., user@bank)
 * @returns {boolean} - True if valid format
 */
export function isValidUPI(upiId) {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
  return upiRegex.test(upiId);
}

/**
 * Generate payment receipt/invoice
 * Used for WhatsApp bill sharing and email
 * @param {Object} bill - Bill object
 * @param {Object} payment - Payment record
 * @returns {string} - Formatted receipt text
 */
export function generatePaymentReceipt(bill, payment) {
  const receipt = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        PLATO MENU - INVOICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bill ID: ${bill._id}
Date: ${new Date().toLocaleDateString("en-IN")}
Time: ${new Date().toLocaleTimeString("en-IN")}

TABLE: ${bill.tableId?.tableName || "N/A"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITEMS:
${bill.items?.map((item) => `${item.name} x${item.quantity} - ₹${item.price * item.quantity}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUBTOTAL: ₹${bill.subtotal || bill.totalAmount}
TAX (GST): ₹${bill.tax || 0}
────────────────────────────────
TOTAL: ₹${bill.totalAmount}

Payment Method: ${payment?.paymentMethod || "CASH"}
Status: ${payment?.status || "PAID"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Thank you for your order!
Visit: www.platoinfinity.xyz
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `;

  return receipt;
}

/**
 * Calculate payment summary for manager reports
 * @param {string} restaurantId - Restaurant ID
 * @param {Object} dateRange - { startDate, endDate }
 * @returns {Promise<Object>} - Payment stats
 */
export async function getPaymentStats(restaurantId, dateRange = {}) {
  const Bill = (await import("../models/bill.model.js")).default;

  const matchStage = {
    restaurantId,
  };

  if (dateRange.startDate || dateRange.endDate) {
    matchStage.createdAt = {};
    if (dateRange.startDate)
      matchStage.createdAt.$gte = new Date(dateRange.startDate);
    if (dateRange.endDate)
      matchStage.createdAt.$lte = new Date(dateRange.endDate);
  }

  const stats = await Bill.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$paymentMethod",
        count: { $sum: 1 },
        totalAmount: { $sum: "$totalAmount" },
        avgAmount: { $avg: "$totalAmount" },
      },
    },
  ]);

  return {
    byMethod: stats,
    totalRevenue: stats.reduce((sum, s) => sum + s.totalAmount, 0),
    totalTransactions: stats.reduce((sum, s) => sum + s.count, 0),
  };
}
