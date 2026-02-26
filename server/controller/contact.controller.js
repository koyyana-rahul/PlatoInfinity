import { sendWhatsAppMessage } from "../services/whatsapp.service.js";

/**
 * ============================
 * CONTACT FORM SUBMISSION
 * ============================
 * POST /api/public/contact
 *
 * Receives contact form data and sends it via WhatsApp
 */
export async function submitContactFormController(req, res) {
  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        message: "Name, email, and message are required",
        error: true,
        success: false,
      });
    }

    // Format message for WhatsApp
    const whatsappMessage =
      `🔔 *New Contact Form Submission*\n\n` +
      `👤 *Name:* ${name}\n` +
      `📧 *Email:* ${email}\n` +
      `📱 *Phone:* ${phone || "Not provided"}\n\n` +
      `💬 *Message:*\n${message}\n\n` +
      `⏰ Submitted: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`;

    // Send WhatsApp notification to admin
    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || "7893780667";

    await sendWhatsAppMessage({
      phone: adminPhone,
      message: whatsappMessage,
    });

    return res.json({
      success: true,
      error: false,
      message:
        "Thank you for contacting us! We'll get back to you within 24 hours.",
    });
  } catch (err) {
    console.error("submitContactFormController:", err);
    return res.status(500).json({
      message: "Failed to send message. Please try again.",
      error: true,
      success: false,
    });
  }
}
