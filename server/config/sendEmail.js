// src/config/sendEmail.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * sendEmail - Resend Mailer
 *
 * @param {Object} param0
 * @param {string} param0.sendTo
 * @param {string} param0.subject
 * @param {string} param0.html
 *
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export default async function sendEmail({ sendTo, subject, html }) {
  try {
    const response = await resend.emails.send({
      // FIXME: The domain name must be verified in your Resend account.
      from: "Plato Infinity <noreply@platoinfinity.xyz>", // e.g. "Plato <noreply@yourdomain.com>"
      to: [sendTo],
      subject,
      html,
    });

    if (response.error) {
      console.error("❌ Resend error:", response.error);
      return { success: false, error: response.error.message };
    }

    console.log("📧 Email sent:", response.data?.id);

    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Resend sendEmail failed:", error.message);
    return { success: false, error: error.message };
  }
}
