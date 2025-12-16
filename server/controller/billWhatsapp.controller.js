import Bill from "../models/bill.model.js";
import Session from "../models/session.model.js";

/**
 * ============================
 * GENERATE BILL & SEND WHATSAPP
 * ============================
 * POST /api/bill/:sessionId/generate
 */

import { generateBillPDF } from "../services/billPdf.service.js";
import { sendWhatsAppMessage } from "../services/whatsapp.service.js";

export async function sendBillOnWhatsAppController(req, res) {
  try {
    const { billId } = req.params;
    const { customerPhone } = req.body;

    const bill = await Bill.findById(billId);
    if (!bill || bill.status !== "PAID") {
      return res.status(400).json({
        message: "Bill not paid or invalid",
        error: true,
        success: false,
      });
    }

    // 1️⃣ Generate PDF
    const { filePath } = await generateBillPDF(bill);

    const pdfUrl = `${process.env.BASE_URL}/${filePath}`;

    // 2️⃣ Send WhatsApp
    await sendWhatsAppBill({
      phone: customerPhone,
      pdfUrl,
    });

    // 3️⃣ Save reference
    bill.customerPhone = customerPhone;
    bill.whatsappVerified = true;
    bill.externalInvoiceUrl = pdfUrl;
    await bill.save();

    return res.json({
      success: true,
      error: false,
      message: "Bill sent on WhatsApp",
      data: { pdfUrl },
    });
  } catch (err) {
    console.error("sendBillOnWhatsAppController:", err);
    return res.status(500).json({
      message: err.message,
      error: true,
      success: false,
    });
  }
}

export async function generateBillController(req, res) {
  try {
    const { sessionId } = req.params;
    const { customerPhone } = req.body;

    const session = await Session.findById(sessionId);
    if (!session || session.status !== "OPEN") {
      return res.status(400).json({
        message: "Invalid or closed session",
        error: true,
        success: false,
      });
    }

    // Calculate bill from orders
    const orders = await Order.find({
      sessionId,
      orderStatus: { $ne: "CANCELLED" },
    });

    if (!orders.length) {
      return res.status(400).json({
        message: "No orders to bill",
        error: true,
        success: false,
      });
    }

    const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    const bill = await Bill.create({
      restaurantId: session.restaurantId,
      sessionId,
      tableId: session.tableId,
      totalAmount,
      customerPhone,
    });

    // 🔥 SEND WHATSAPP
    if (customerPhone) {
      await sendWhatsAppMessage({
        phone: customerPhone,
        message: `🧾 Your bill amount is ₹${totalAmount}\nThank you for dining with us 🙏`,
      });

      bill.whatsappSent = true;
      await bill.save();
    }

    return res.json({
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
