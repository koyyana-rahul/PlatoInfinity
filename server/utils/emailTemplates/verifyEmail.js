/**
 * Email Verification Template
 * Sent during registration to verify email ownership
 */
import createEmailWrapper from "./emailWrapper.js";

export default function getVerifyEmailTemplate({
  name,
  verifyUrl,
  appName = "Plato",
}) {
  const html = createEmailWrapper({
    title: "Verify your email address",
    heading: "Verify your email",
    content: `
      <p style="margin-bottom: 16px;">
        ${name ? `Welcome <strong>${name}</strong>,` : "Welcome,"}
      </p>
      <p style="margin-bottom: 16px;">
        Thank you for joining <strong>${appName}</strong>. To complete your registration and activate your account, 
        please verify your email address by clicking the button below.
      </p>
      <p style="margin-bottom: 0; color: #9CA3AF; font-size: 13px;">
        For your security, this link is time-limited.
      </p>
    `,
    ctaButton: {
      text: "Verify email address",
      url: verifyUrl,
    },
    footerNote: `
      This verification link expires in <strong>24 hours</strong>.
      If you did not create this account, please ignore this email or contact support.
    `,
    appName,
  });

  return html;
}
