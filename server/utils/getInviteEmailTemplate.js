import createEmailWrapper from "./emailTemplates/emailWrapper.js";

export default function getInviteEmailTemplate({ name, verifyUrl, appName }) {
  const html = createEmailWrapper({
    title: "Confirm your email",
    heading: "You’re invited",
    content: `
      <p style="margin-bottom: 16px;">
        ${name ? `Hi <strong>${name}</strong>,` : "Hi,"}
      </p>
      <p style="margin-bottom: 16px;">
        You’ve been invited to join <strong>${appName}</strong> to help manage restaurant operations.
        To activate your account, please confirm your email address.
      </p>
      <p style="margin-bottom: 0; color: #9CA3AF; font-size: 13px;">
        This invitation is time-sensitive for security reasons.
      </p>
    `,
    ctaButton: {
      text: "Confirm email address",
      url: verifyUrl,
    },
    footerNote: `
      This invitation link may expire for security reasons.
      If you weren’t expecting this email, you can safely ignore it.
    `,
    appName,
  });

  return html;
}
