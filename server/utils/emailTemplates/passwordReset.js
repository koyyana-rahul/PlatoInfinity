/**
 * Password Reset Email Template
 * Sent when user initiates password reset flow
 */
import createEmailWrapper from "./emailWrapper.js";

export default function getPasswordResetTemplate({
  name,
  resetUrl,
  appName = "Plato",
}) {
  const html = createEmailWrapper({
    title: "Reset your password",
    heading: "Password Reset Request",
    content: `
      <p style="margin-bottom: 16px;">
        Hi ${name || "there"},
      </p>
      <p style="margin-bottom: 16px;">
        We received a request to reset your password. Click the button below to create a new password.
        This link is valid for <strong>1 hour</strong> only.
      </p>
      <p style="margin-bottom: 0; color: #9CA3AF; font-size: 13px;">
        If you didn’t request a password reset, your account is still secure. You can ignore this email.
      </p>
    `,
    ctaButton: {
      text: "Reset Password",
      url: resetUrl,
    },
    footerNote: `
      This password reset link will expire in <strong>1 hour</strong>. 
      If you need another link, visit the login page and select "Forgot Password" again.
      Never share this link with anyone.
    `,
    appName,
  });

  return html;
}
