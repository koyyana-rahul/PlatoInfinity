// import Bill from "../models/bill.model.js";
// import Order from "../models/order.model.js";
// import Session from "../models/session.model.js";
// import Table from "../models/table.model.js";
// import mongoose from "mongoose";

// /**
//  * ============================
//  * GENERATE BILL
//  * POST /api/bill/generate/:sessionId
//  * ============================
//  */
// export async function generateBillController(req, res) {
//   try {
//     const { sessionId } = req.params;
//     const user = req.user;

//     const orders = await Order.find({
//       sessionId,
//       orderStatus: { $in: ["OPEN", "PARTIALLY_SERVED", "COMPLETED"] },
//     });

//     if (!orders.length) {
//       return res.status(400).json({
//         message: "No orders found",
//         error: true,
//         success: false,
//       });
//     }

//     let subTotal = 0;
//     const orderIds = [];

//     for (const order of orders) {
//       subTotal += order.totalAmount;
//       orderIds.push(order._id);
//     }

//     const taxAmount = Math.round(subTotal * 0.05); // 5% tax
//     const serviceCharge = 0; // optional
//     const totalAmount = subTotal + taxAmount + serviceCharge;

//     const bill = await Bill.create({
//       restaurantId: user.restaurantId,
//       sessionId,
//       tableId: orders[0].tableId,
//       orderIds,
//       subTotal,
//       taxAmount,
//       serviceCharge,
//       totalAmount,
//     });

//     return res.json({
//       success: true,
//       error: false,
//       data: bill,
//     });
//   } catch (err) {
//     console.error("generateBillController:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// }

// /**
//  * ============================
//  * PAY BILL & CLOSE SESSION
//  * POST /api/bill/pay/:billId
//  * ============================
//  */
// export async function payBillController(req, res) {
//   const mongoSession = await mongoose.startSession();
//   mongoSession.startTransaction();

//   try {
//     const { billId } = req.params;
//     const { paymentMethod } = req.body;
//     const user = req.user;

//     const bill = await Bill.findById(billId).session(mongoSession);
//     if (!bill || bill.paymentStatus === "PAID") {
//       throw new Error("Invalid bill");
//     }

//     bill.paymentStatus = "PAID";
//     bill.paymentMethod = paymentMethod;
//     bill.paidAt = new Date();
//     bill.paidByUserId = user._id;
//     await bill.save({ session: mongoSession });

//     // mark orders completed
//     await Order.updateMany(
//       { _id: { $in: bill.orderIds } },
//       { orderStatus: "COMPLETED" },
//       { session: mongoSession }
//     );

//     // close session
//     const sessionDoc = await Session.findById(bill.sessionId).session(
//       mongoSession
//     );
//     sessionDoc.status = "CLOSED";
//     sessionDoc.closedAt = new Date();
//     await sessionDoc.save({ session: mongoSession });

//     // free table
//     await Table.findByIdAndUpdate(
//       bill.tableId,
//       { status: "FREE" },
//       { session: mongoSession }
//     );

//     await mongoSession.commitTransaction();

//     return res.json({
//       success: true,
//       error: false,
//       message: "Payment successful. Session closed.",
//     });
//   } catch (err) {
//     await mongoSession.abortTransaction();
//     console.error("payBillController:", err);
//     res.status(400).json({
//       message: err.message,
//       error: true,
//       success: false,
//     });
//   } finally {
//     mongoSession.endSession();
//   }
// }






import mongoose from "mongoose";
import Bill from "../models/bill.model.js";
import Order from "../models/order.model.js";
import Session from "../models/session.model.js";
import Table from "../models/table.model.js";

/**
 * =========================
 * GENERATE BILL (WAITER)
 * =========================
 * POST /api/bill/session/:sessionId
 */
export async function generateBillController(req, res) {
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    const { sessionId } = req.params;
    const user = req.user;

    const sessionDoc = await Session.findOne({
      _id: sessionId,
      status: "OPEN",
    }).session(mongoSession);

    if (!sessionDoc)
      return res.status(404).json({
        message: "Session not found or closed",
        error: true,
        success: false,
      });

    // 🚨 Prevent duplicate bill
    const existingBill = await Bill.findOne({ sessionId }).lean();
    if (existingBill)
      return res.status(409).json({
        message: "Bill already generated",
        error: true,
        success: false,
      });

    // Fetch only SERVED items
    const orders = await Order.find({
      sessionId,
      orderStatus: "OPEN",
    }).session(mongoSession);

    if (!orders.length)
      return res.status(400).json({
        message: "No orders found for billing",
        error: true,
        success: false,
      });

    let billItems = [];

    orders.forEach((order) => {
      order.items.forEach((item, idx) => {
        if (item.status === "SERVED") {
          billItems.push({
            orderId: order._id,
            orderItemIndex: idx,
            name: item.name,
            quantity: item.quantity,
            rate: item.price,
            taxPercent: item.taxPercent || 0,
            lineTotal: 0,
          });
        }
      });
    });

    if (!billItems.length)
      return res.status(400).json({
        message: "No served items to bill",
        error: true,
        success: false,
      });

    const bill = await Bill.create(
      [
        {
          restaurantId: sessionDoc.restaurantId,
          sessionId,
          items: billItems,
        },
      ],
      { session: mongoSession }
    );

    await mongoSession.commitTransaction();

    return res.status(201).json({
      success: true,
      error: false,
      data: bill[0],
    });
  } catch (err) {
    await mongoSession.abortTransaction();
    console.error("generateBillController:", err);
    return res.status(500).json({
      message: err.message,
      error: true,
      success: false,
    });
  } finally {
    mongoSession.endSession();
  }
}

/**
 * =========================
 * PAY BILL
 * =========================
 * POST /api/bill/:billId/pay
 */
export async function payBillController(req, res) {
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    const { billId } = req.params;
    const { paymentMethod, paidAmount, paymentReference } = req.body;
    const user = req.user;

    const bill = await Bill.findById(billId).session(mongoSession);
    if (!bill || bill.status !== "OPEN")
      return res.status(400).json({
        message: "Invalid or already paid bill",
        error: true,
        success: false,
      });

    if (paidAmount < bill.total)
      return res.status(400).json({
        message: "Paid amount is less than bill total",
        error: true,
        success: false,
      });

    bill.status = "PAID";
    bill.paymentMethod = paymentMethod;
    bill.paymentReference = paymentReference || null;
    bill.paidAmount = paidAmount;
    bill.paidAt = new Date();
    bill.closedByUserId = user._id;
    bill.closedAt = new Date();

    await bill.save({ session: mongoSession });

    // ✅ Close session
    await Session.findByIdAndUpdate(
      bill.sessionId,
      { status: "CLOSED", closedAt: new Date() },
      { session: mongoSession }
    );

    // ✅ Free table
    await Table.findByIdAndUpdate(
      bill.tableId,
      { status: "FREE" },
      { session: mongoSession }
    );

    await mongoSession.commitTransaction();

    return res.json({
      success: true,
      error: false,
      message: "Bill paid successfully",
      data: bill,
    });
  } catch (err) {
    await mongoSession.abortTransaction();
    console.error("payBillController:", err);
    return res.status(500).json({
      message: err.message,
      error: true,
      success: false,
    });
  } finally {
    mongoSession.endSession();
  }
}

/**
 * =========================
 * GET BILL
 * =========================
 * GET /api/bill/session/:sessionId
 */
export async function getBillBySessionController(req, res) {
  const { sessionId } = req.params;

  const bill = await Bill.findOne({ sessionId }).lean();
  if (!bill)
    return res.status(404).json({
      message: "Bill not found",
      error: true,
      success: false,
    });

  return res.json({
    success: true,
    error: false,
    data: bill,
  });
}
