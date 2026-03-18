/**
 * OTP Email Template
 * Sends a 6-digit OTP for password reset or secure operations
 */
import createEmailWrapper from "./emailWrapper.js";

export default function getOtpEmailTemplate({ name, otp, appName = "Plato" }) {
  const html = createEmailWrapper({
    title: "Your verification code",
    heading: "Secure Verification Code",
    content: `
      <p style="margin-bottom: 16px;">
        Hi ${name || "there"},
      </p>
      <p style="margin-bottom: 24px;">
        Your verification code for password reset is:
      </p>
      <div style="
        background-color: #F3F4F6;
        border: 2px solid #FC8019;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        margin-bottom: 24px;
      ">
        <div style="
          font-size: 36px;
          font-weight: 900;
          letter-spacing: 8px;
          color: #1F2937;
          font-family: 'Courier New', monospace;
        ">
          ${otp}
        </div>
      </div>
      <p style="margin-bottom: 12px; color: #9CA3AF; font-size: 13px;">
        ✓ This code is valid for <strong>1 hour</strong>
      </p>
      <p style="margin-bottom: 12px; color: #9CA3AF; font-size: 13px;">
        ✓ Never share this code with anyone
      </p>
      <p style="margin-bottom: 0; color: #9CA3AF; font-size: 13px;">
        ✓ If you didn't request this, ignore this email
      </p>
    `,
    footerNote: `
      This is an automated email from ${appName}. 
      If you did not request a password reset, your account is safe. 
      Please report suspicious activity by contacting support.
    `,
    appName,
  });

  return html;
}
