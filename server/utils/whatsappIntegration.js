import axios from "axios";

/**
 * WHATSAPP BILL SHARING INTEGRATION
 * Sends bill/invoice to customer via WhatsApp
 * Uses Twilio or official WhatsApp Business API
 */

/**
 * Send bill via WhatsApp using Twilio
 * @param {Object} bill - Bill object
 * @param {string} phoneNumber - Customer phone (format: +91XXXXXXXXXX)
 * @param {Object} payment - Payment details
 * @returns {Promise<Object>} - { success, messageId, status }
 */
export async function sendBillViaWhatsApp(bill, phoneNumber, payment = {}) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn("WhatsApp integration not configured. Skipping send.");
    return {
      success: false,
      message: "WhatsApp integration not configured",
    };
  }

  // Format phone number
  const formattedPhone = formatPhoneNumber(phoneNumber);
  if (!formattedPhone) {
    return {
      success: false,
      message: "Invalid phone number",
    };
  }

  const billSummary = generateBillSummary(bill, payment);

  try {
    // Using Twilio's WhatsApp integration
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        From: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        To: `whatsapp:${formattedPhone}`,
        Body: billSummary,
      },
      {
        auth: {
          username: process.env.TWILIO_ACCOUNT_SID,
          password: process.env.TWILIO_AUTH_TOKEN,
        },
      },
    );

    return {
      success: true,
      messageId: response.data.sid,
      status: response.data.status,
      sentAt: new Date(),
    };
  } catch (error) {
    console.error(
      "WhatsApp bill send failed:",
      error.response?.data || error.message,
    );
    return {
      success: false,
      error: error.message,
      message: "Failed to send bill via WhatsApp",
    };
  }
}

/**
 * Alternative: Send using official WhatsApp Business API
 * @param {Object} bill - Bill object
 * @param {string} phoneNumber - Customer phone
 * @param {Object} payment - Payment details
 * @returns {Promise<Object>} - { success, messageId }
 */
export async function sendBillViaWhatsAppBusinessAPI(
  bill,
  phoneNumber,
  payment = {},
) {
  if (
    !process.env.WHATSAPP_BUSINESS_PHONE_ID ||
    !process.env.WHATSAPP_BUSINESS_API_TOKEN
  ) {
    console.warn("WhatsApp Business API not configured. Skipping send.");
    return {
      success: false,
      message: "WhatsApp Business API not configured",
    };
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  if (!formattedPhone) {
    return {
      success: false,
      message: "Invalid phone number",
    };
  }

  const billText = generateBillSummary(bill, payment);

  try {
    const response = await axios.post(
      `https://graph.instagram.com/v18.0/${process.env.WHATSAPP_BUSINESS_PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "text",
        text: {
          body: billText,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_BUSINESS_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    return {
      success: true,
      messageId: response.data.messages?.[0]?.id,
      status: "sent",
      sentAt: new Date(),
    };
  } catch (error) {
    console.error(
      "WhatsApp Business API send failed:",
      error.response?.data || error.message,
    );
    return {
      success: false,
      error: error.message,
      message: "Failed to send bill via WhatsApp Business API",
    };
  }
}

/**
 * Format phone number to international format
 * @param {string} phone - Phone number (various formats accepted)
 * @returns {string|null} - Formatted phone or null if invalid
 */
export function formatPhoneNumber(phone) {
  if (!phone) return null;

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Handle Indian numbers (10 digits)
  if (digits.length === 10) {
    return `+91${digits}`;
  }

  // Already formatted
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  // International format
  if (digits.length > 10 && !digits.startsWith("0")) {
    return digits.startsWith("+") ? digits : `+${digits}`;
  }

  return null;
}

/**
 * Generate formatted bill summary for WhatsApp
 * @param {Object} bill - Bill object
 * @param {Object} payment - Payment details
 * @returns {string} - Formatted bill message
 */
export function generateBillSummary(bill, payment = {}) {
  const restaurantName = bill.restaurantId?.name || "Plato Menu";
  const billId = bill._id?.toString().slice(-8).toUpperCase() || "N/A";
  const date = new Date(bill.createdAt).toLocaleDateString("en-IN");
  const time = new Date(bill.createdAt).toLocaleTimeString("en-IN");

  const itemsText = bill.items?.map(
    (item) =>
      `${item.name}\n  ${item.quantity}x ₹${item.price} = ₹${item.quantity * item.price}`,
  ) || ["No items"];

  const summary = `
*${restaurantName}*
━━━━━━━━━━━━━━━━━━━━━
📋 *BILL DETAILS*
━━━━━━━━━━━━━━━━━━━━━

🧾 Bill ID: ${billId}
📅 Date: ${date}
⏰ Time: ${time}
🪑 Table: ${bill.tableId?.tableName || "N/A"}

━━━━━━━━━━━━━━━━━━━━━
*ITEMS:*
${itemsText.join("\n")}

━━━━━━━━━━━━━━━━━━━━━
💰 *AMOUNT DETAILS*
━━━━━━━━━━━━━━━━━━━━━

Subtotal: ₹${bill.subtotal || bill.totalAmount}
Tax (GST 5%): ₹${bill.tax || 0}
*───────────────────*
*TOTAL: ₹${bill.totalAmount}*
*───────────────────*

✅ Status: ${payment?.status || "PENDING"}
💳 Method: ${payment?.paymentMethod || "CASH"}

━━━━━━━━━━━━━━━━━━━━━
🙏 Thank you for dining with us!
🌐 www.platoinfinity.xyz
━━━━━━━━━━━━━━━━━━━━━
`;

  return summary;
}

/**
 * Track WhatsApp message status
 * @param {string} messageId - Twilio/WhatsApp message ID
 * @returns {Promise<Object>} - Message status
 */
export async function getWhatsAppMessageStatus(messageId) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return {
      success: false,
      message: "WhatsApp integration not configured",
    };
  }

  try {
    const response = await axios.get(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages/${messageId}.json`,
      {
        auth: {
          username: process.env.TWILIO_ACCOUNT_SID,
          password: process.env.TWILIO_AUTH_TOKEN,
        },
      },
    );

    return {
      success: true,
      status: response.data.status, // "queued", "sending", "sent", "failed", etc.
      direction: response.data.direction,
      sentAt: response.data.date_sent,
    };
  } catch (error) {
    console.error("Failed to get WhatsApp message status:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send OTP via WhatsApp for staff PIN verification
 * @param {string} phoneNumber - Staff phone number
 * @param {string} staffName - Staff name
 * @param {string} pin - Staff PIN (last 4 digits)
 * @returns {Promise<Object>} - { success, messageId }
 */
export async function sendStaffPINViaWhatsApp(phoneNumber, staffName, pin) {
  const msg = `
Hello ${staffName},

🔐 Your Plato Menu Staff PIN:
${pin}

⚠️ Do not share this PIN with anyone
Valid for: 24 hours

Plato Menu - Restaurant OS
`;

  const formattedPhone = formatPhoneNumber(phoneNumber);
  if (!formattedPhone) {
    return {
      success: false,
      message: "Invalid phone number",
    };
  }

  try {
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        From: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        To: `whatsapp:${formattedPhone}`,
        Body: msg,
      },
      {
        auth: {
          username: process.env.TWILIO_ACCOUNT_SID,
          password: process.env.TWILIO_AUTH_TOKEN,
        },
      },
    );

    return {
      success: true,
      messageId: response.data.sid,
      sentAt: new Date(),
    };
  } catch (error) {
    console.error("WhatsApp PIN send failed:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}
