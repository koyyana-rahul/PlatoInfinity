import Bill from "../models/bill.model.js";
import Order from "../models/order.model.js";

/**
 * =========================
 * GENERATE BILL (STAFF)
 * =========================
 * POST /bill/session/:sessionId
 */
export async function generateBillController(req, res) {
  try {
    const { sessionId } = req.params;

    const existing = await Bill.findOne({ sessionId, status: "OPEN" });
    if (existing) {
      return res.json({
        success: true,
        error: false,
        data: existing,
      });
    }

    const orders = await Order.find({
      sessionId,
      orderStatus: { $ne: "CANCELLED" },
    }).lean();

    if (!orders.length) {
      return res.status(400).json({
        message: "No orders to bill",
        error: true,
        success: false,
      });
    }

    const billItems = [];

    for (const order of orders) {
      order.items.forEach((item, index) => {
        billItems.push({
          orderId: order._id,
          orderItemIndex: index,
          name: item.name,
          quantity: item.quantity,
          rate: item.price,
          taxPercent: item.taxPercent || 0,
          lineTotal: item.price * item.quantity,
        });
      });
    }

    const bill = await Bill.create({
      restaurantId: orders[0].restaurantId,
      sessionId,
      items: billItems,
      status: "OPEN",
    });

    return res.status(201).json({
      success: true,
      error: false,
      data: bill,
    });
  } catch (err) {
    console.error("generateBillController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

/**
 * =========================
 * PAY BILL (STAFF)
 * =========================
 * POST /bill/:billId/pay
 */
export async function payBillController(req, res) {
  try {
    const { billId } = req.params;
    const { paymentMethod = "CASH" } = req.body;

    const bill = await Bill.findById(billId);
    if (!bill || bill.status !== "OPEN") {
      return res.status(400).json({
        message: "Bill not payable",
        error: true,
        success: false,
      });
    }

    bill.status = "PAID";
    bill.paymentMethod = paymentMethod;
    bill.paidAt = new Date();
    bill.paidAmount = bill.total;
    bill.closedAt = new Date();
    bill.closedByUserId = req.user._id;

    await bill.save();

    await Order.updateMany(
      {
        sessionId: bill.sessionId,
        orderStatus: { $ne: "CANCELLED" },
      },
      {
        $set: {
          orderStatus: "PAID",
          paymentMethod: bill.paymentMethod,
          closedAt: bill.closedAt,
          closedByUserId: req.user._id,
        },
      }
    );

    return res.json({
      success: true,
      error: false,
      message: "Payment successful",
      data: bill,
    });
  } catch (err) {
    console.error("payBillController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

/**
 * =========================
 * STAFF VIEW BILL
 * =========================
 */
export async function getBillBySessionController(req, res) {
  const { sessionId } = req.params;

  const bill = await Bill.findOne({ sessionId }).lean();

  res.json({
    success: true,
    error: false,
    data: bill,
  });
}

/**
 * =========================
 * CUSTOMER VIEW BILL (🔥 IMPORTANT)
 * =========================
 * GET /customer/bill
 * Session auth via cookie / header
 */
export async function getCustomerBillController(req, res) {
  try {
    const session = req.sessionDoc;

    const bill = await Bill.findOne({
      sessionId: session._id,
    }).lean();

    if (!bill) {
      return res.status(404).json({
        message: "Bill not generated yet",
        error: true,
        success: false,
      });
    }

    return res.json({
      success: true,
      error: false,
      data: {
        items: bill.items,
        subtotal: bill.subtotal,
        taxes: bill.taxes,
        serviceCharge: bill.serviceCharge,
        discounts: bill.discounts,
        total: bill.total,
        status: bill.status,
      },
    });
  } catch (err) {
    console.error("getCustomerBillController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}
