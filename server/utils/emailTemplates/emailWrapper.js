/**
 * Email Template Wrapper - Core responsive HTML email structure
 * Follows responsive design patterns for major email clients (Outlook, Gmail, Apple Mail, Mobile)
 * Uses Plato brand colors: #FC8019 (primary orange), #FF6B35 (secondary)
 */

export default function createEmailWrapper({
  title,
  heading,
  content, // HTML content to insert in the body
  ctaButton, // { text, url } - optional
  footerNote, // Optional footer text
  logoUrl, // Optional absolute logo URL
  appName = "Plato",
}) {
  const PRIMARY = "#FC8019"; // Plato main orange
  const SECONDARY = "#FF6B35"; // Gradient orange
  const DARK = "#1F2937"; // Dark gray
  const MUTED = "#6B7280"; // Muted gray
  const LIGHT_BG = "#F9FAFB"; // Light background
  const WHITE = "#FFFFFF";
  const baseUrl = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.replace(/\/$/, "")
    : "";
  const resolvedLogoUrl = logoUrl || (baseUrl ? `${baseUrl}/plato.png` : "");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title || "Plato Notification"}</title>
  <style type="text/css">
    * {
      margin: 0;
      padding: 0;
    }
    body, table, td, div, p, a {
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: 100%;
      -moz-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      border: 0;
      outline: 0;
      text-decoration: none;
      -ms-interpolation-mode: nearest-neighbor;
    }
    .mso-container {
      mso-padding-alt: 0;
    }
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .card {
        width: 100% !important;
        padding: 24px 16px !important;
      }
      .btn {
        width: 100% !important;
        display: block !important;
      }
    }
  </style>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: ${LIGHT_BG};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: ${DARK};
">

  <!-- WRAPPER -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${LIGHT_BG}; padding: 40px 16px;">
    <tr>
      <td align="center">

        <!-- MAIN CARD -->
        <table class="container" width="100%" cellpadding="0" cellspacing="0" style="
          max-width: 600px;
          background-color: ${WHITE};
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        ">

          <!-- HEADER WITH GRADIENT BACKGROUND -->
          <tr>
            <td style="
              background: linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%);
              padding: 32px 24px;
              text-align: center;
            ">
              ${
                resolvedLogoUrl
                  ? `
              <div style="margin-bottom: 12px;">
                <img src="${resolvedLogoUrl}" alt="${appName} logo" width="64" height="64" style="
                  width: 64px;
                  height: 64px;
                  border-radius: 16px;
                  display: inline-block;
                " />
              </div>
              `
                  : ""
              }
              <div style="
                font-size: 28px;
                font-weight: 900;
                letter-spacing: -0.5px;
                color: ${WHITE};
                margin-bottom: 8px;
              ">
                ${appName}
              </div>
              <div style="
                font-size: 13px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.9);
                letter-spacing: 0.5px;
              ">
                RESTAURANT MANAGEMENT PLATFORM
              </div>
            </td>
          </tr>

          <!-- CONTENT BODY -->
          <tr>
            <td style="padding: 36px 28px;">

              <!-- HEADING -->
              <h1 style="
                font-size: 24px;
                font-weight: 800;
                margin: 0 0 12px 0;
                color: ${DARK};
                line-height: 1.2;
              ">
                ${heading}
              </h1>

              <!-- CONTENT -->
              <div style="
                font-size: 15px;
                line-height: 1.7;
                color: ${MUTED};
                margin-bottom: 24px;
              ">
                ${content}
              </div>

              <!-- CTA BUTTON -->
              ${
                ctaButton
                  ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${ctaButton.url}" target="_blank" class="btn" style="
                      display: inline-block;
                      background: linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%);
                      color: ${WHITE};
                      text-decoration: none;
                      padding: 14px 32px;
                      border-radius: 8px;
                      font-weight: 700;
                      font-size: 15px;
                      letter-spacing: 0.3px;
                      transition: all 0.2s ease;
                      border: none;
                      cursor: pointer;
                    ">
                      ${ctaButton.text}
                    </a>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }

              <!-- FALLBACK LINK (if button provided) -->
              ${
                ctaButton
                  ? `
              <div style="
                font-size: 12px;
                color: #9CA3AF;
                line-height: 1.6;
                margin-bottom: 24px;
                padding: 12px;
                background-color: #F3F4F6;
                border-radius: 6px;
              ">
                If the button doesn't work, copy and paste this link:
                <br />
                <a href="${ctaButton.url}" style="
                  color: ${PRIMARY};
                  word-break: break-all;
                  text-decoration: none;
                ">
                  ${ctaButton.url}
                </a>
              </div>
              `
                  : ""
              }

            </td>
          </tr>

          <!-- FOOTER NOTE (if provided) -->
          ${
            footerNote
              ? `
          <tr>
            <td style="
              background-color: #F9FAFB;
              border-top: 1px solid #E5E7EB;
              padding: 20px 28px;
              font-size: 11px;
              color: #9CA3AF;
              line-height: 1.6;
            ">
              ${footerNote}
            </td>
          </tr>
          `
              : ""
          }

          <!-- FOOTER BRANDING -->
          <tr>
            <td style="
              background-color: ${LIGHT_BG};
              padding: 20px 28px;
              font-size: 11px;
              color: #9CA3AF;
              text-align: center;
              border-top: 1px solid #E5E7EB;
            ">
              <p style="margin: 0 0 8px 0;">
                © ${new Date().getFullYear()} ${appName}. All rights reserved.
              </p>
              <p style="margin: 0;">
                <a href="https://platoinfinity.xyz" style="color: ${MUTED}; text-decoration: none;">
                  Visit our website
                </a>
                 · 
                <a href="mailto:support@platoinfinity.xyz" style="color: ${MUTED}; text-decoration: none;">
                  Support
                </a>
              </p>
            </td>
          </tr>

        </table>
        <!-- END MAIN CARD -->

      </td>
    </tr>
  </table>
  <!-- END WRAPPER -->

</body>
</html>
  `.trim();
}
