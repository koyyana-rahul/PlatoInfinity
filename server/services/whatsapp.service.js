/**
 * This file is PROVIDER-INDEPENDENT
 * Later you can plug:
 * - Meta WhatsApp Cloud API
 * - Twilio
 * - Gupshup
 */

export async function sendWhatsAppMessage({ phone, message }) {
  if (!phone) throw new Error("Phone required");

  // 🔥 MOCK IMPLEMENTATION (DEV)
  console.log("📲 WhatsApp Message");
  console.log("To:", phone);
  console.log("Message:", message);

  // In production:
  // await axios.post(WHATSAPP_API_URL, {...})

  return { success: true };
}
