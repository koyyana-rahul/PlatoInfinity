/**
 * Manager/Staff Invite Email Template
 * Sent to new managers or staff when invited to join a restaurant
 */
import createEmailWrapper from "./emailWrapper.js";

export default function getManagerInviteTemplate({
  name,
  restaurantName,
  inviteUrl,
  appName = "Plato",
  isResend = false,
}) {
  const content = isResend
    ? `
      <p style="margin-bottom: 16px;">
        Hi ${name || "there"},
      </p>
      <p style="margin-bottom: 24px;">
        Your invitation to join <strong>${restaurantName}</strong> as a Manager has been resent.
      </p>
      <p style="margin-bottom: 16px;">
        Click the button below to accept the invitation and set up your account.
      </p>
    `
    : `
      <p style="margin-bottom: 16px;">
        Hi ${name || "there"},
      </p>
      <p style="margin-bottom: 24px;">
        You have been invited to join <strong>${restaurantName}</strong> as a Manager on ${appName}.
      </p>
      <p style="margin-bottom: 16px;">
        Click the button below to accept the invitation and set up your account.
        This will give you access to the restaurant dashboard.
      </p>
    `;

  const html = createEmailWrapper({
    title: isResend
      ? "Manager Invitation (Resent)"
      : `You're invited to ${restaurantName}`,
    heading: isResend
      ? `Invite Resent: ${restaurantName}`
      : `Join ${restaurantName}`,
    content,
    ctaButton: {
      text: "Accept Invitation",
      url: inviteUrl,
    },
    footerNote: `
      This invitation link will expire in <strong>24 hours</strong>. 
      If you cannot access the link, contact the restaurant administrator who invited you.
    `,
    appName,
  });

  return html;
}
