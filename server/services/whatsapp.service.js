import axios from "axios";

/**
 * WhatsApp Service
 *
 * This file is PROVIDER-INDEPENDENT
 * Currently using CallMeBot API for simple WhatsApp messaging
 *
 * Production alternatives:
 * - Meta WhatsApp Cloud API
 * - Twilio WhatsApp API
 * - Gupshup
 *
 * CallMeBot Setup Instructions:
 * 1. Add the CallMeBot phone number to your contacts: +34 644 01 85 61
 * 2. Send this message to activate: "I allow callmebot to send me messages"
 * 3. Wait for API key in response
 * 4. Add CALLMEBOT_API_KEY to your .env file
 */

export async function sendWhatsAppMessage({ phone, message }) {
  if (!phone) throw new Error("Phone required");
  if (!message) throw new Error("Message required");

  try {
    // Remove any spaces, dashes, or special characters from phone number
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

    // Check if we're in production or have API key configured
    const apiKey = process.env.CALLMEBOT_API_KEY;

    if (!apiKey) {
      // Development/Testing: Just log the message
      console.log("📲 WhatsApp Message (DEV MODE - No API Key)");
      console.log("To:", cleanPhone);
      console.log("Message:", message);
      console.log("\n⚠️ To enable real WhatsApp messages:");
      console.log("1. Add CallMeBot number (+34 644 01 85 61) to contacts");
      console.log("2. Send: 'I allow callmebot to send me messages'");
      console.log("3. Add CALLMEBOT_API_KEY to .env file\n");
      return { success: true, mode: "development" };
    }

    // Production: Send actual WhatsApp message via CallMeBot
    const encodedMessage = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedMessage}&apikey=${apiKey}`;

    const response = await axios.get(url);

    console.log("✅ WhatsApp message sent successfully to:", cleanPhone);

    return {
      success: true,
      mode: "production",
      response: response.data,
    };
  } catch (error) {
    console.error("❌ WhatsApp send error:", error.message);

    // Log but don't fail - we still want the contact form to work
    console.log("📲 WhatsApp Message (FALLBACK - Error occurred)");
    console.log("To:", phone);
    console.log("Message:", message);

    return {
      success: false,
      error: error.message,
      fallback: true,
    };
  }
}
