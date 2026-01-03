export default function getInviteEmailTemplate({ name, verifyUrl, appName }) {
  const PRIMARY = "#E11D48";
  const DARK = "#0F172A";
  const BG = "#F8FAFC";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your email</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:${BG};
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px;">
    <tr>
      <td align="center">

        <!-- CARD -->
        <table width="100%" cellpadding="0" cellspacing="0" style="
          max-width:540px;
          background:#ffffff;
          border-radius:20px;
          padding:36px 28px;
          box-shadow:0 15px 40px rgba(15,23,42,0.12);
        ">

          <!-- BRAND -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <div style="
                font-size:26px;
                font-weight:900;
                letter-spacing:0.5px;
                color:${DARK};
              ">
                ${appName}
              </div>
            </td>
          </tr>

          <!-- TITLE -->
          <tr>
            <td style="padding-bottom:12px;">
              <h1 style="
                font-size:24px;
                font-weight:800;
                margin:0;
                color:${DARK};
              ">
                Verify your email
              </h1>
            </td>
          </tr>

          <!-- MESSAGE -->
          <tr>
            <td style="padding-bottom:28px;">
              <p style="
                font-size:15px;
                line-height:1.7;
                color:#475569;
                margin:0;
              ">
                ${name ? `Hi <strong>${name}</strong>,` : "Hi,"}
                <br /><br />
                You’ve been invited to join <strong>${appName}</strong> — a modern platform
                designed to simplify restaurant operations and management.
                <br /><br />
                Please confirm your email address to activate your account.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <a href="${verifyUrl}" target="_blank" style="
                display:inline-block;
                background:${PRIMARY};
                color:#ffffff;
                text-decoration:none;
                padding:16px 34px;
                border-radius:14px;
                font-weight:800;
                font-size:15px;
                letter-spacing:0.3px;
              ">
                Verify Email →
              </a>
            </td>
          </tr>

          <!-- FALLBACK -->
          <tr>
            <td style="padding-bottom:24px;">
              <p style="
                font-size:12px;
                color:#64748b;
                line-height:1.6;
                margin:0;
              ">
                If the button doesn’t work, copy and paste this link into your browser:
                <br />
                <a href="${verifyUrl}" style="
                  color:${PRIMARY};
                  word-break:break-all;
                  text-decoration:none;
                ">
                  ${verifyUrl}
                </a>
              </p>
            </td>
          </tr>

          <!-- FOOTER NOTE -->
          <tr>
            <td style="
              border-top:1px solid #e5e7eb;
              padding-top:18px;
            ">
              <p style="
                font-size:11px;
                color:#94a3b8;
                margin:0;
              ">
                This link will expire for security reasons.
                If you did not request this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>

        <!-- COPYRIGHT -->
        <div style="
          margin-top:18px;
          font-size:11px;
          color:#94a3b8;
        ">
          © ${new Date().getFullYear()} ${appName}. All rights reserved.
        </div>

      </td>
    </tr>
  </table>

</body>
</html>
`;
}
