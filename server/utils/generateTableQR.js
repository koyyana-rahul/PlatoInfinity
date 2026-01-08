// import QRCode from "qrcode";
// import { createCanvas, loadImage } from "canvas";
// import { PLATO_QR_COLOR } from "../config/platoBrand.js";

// /**
//  * generateTableQR (PLATO – LOGO CENTERED)
//  * --------------------------------------------------
//  * ✔ Big QR (print-ready)
//  * ✔ Plato brand color
//  * ✔ Brand logo perfectly centered
//  * ✔ No brand name text
//  * ✔ Table number on top
//  * ✔ High scan success
//  * ✔ Returns base64 PNG (qrDataUrl)
//  */
// export async function generateTableQR({ url, tableNumber, brandLogoUrl = "" }) {
//   /* ================= CONFIG ================= */
//   const SIZE = 600; // canvas width
//   const TOP_SPACE = 80; // table number area
//   const QR_SIZE = 460; // QR size (large)
//   const CENTER_BOX = 110; // white patch size
//   const LOGO_SIZE = 70; // logo max size

//   /* ================= CANVAS ================= */
//   const canvas = createCanvas(SIZE, SIZE + TOP_SPACE);
//   const ctx = canvas.getContext("2d");

//   /* ================= BACKGROUND ================= */
//   ctx.fillStyle = "#ffffff";
//   ctx.fillRect(0, 0, canvas.width, canvas.height);

//   /* ================= TABLE NUMBER ================= */
//   ctx.fillStyle = PLATO_QR_COLOR;
//   ctx.font = "700 30px Arial";
//   ctx.textAlign = "center";
//   ctx.textBaseline = "middle";
//   ctx.fillText(`TABLE ${tableNumber}`, SIZE / 2, 40);

//   /* ================= QR GENERATION ================= */
//   const qrDataUrl = await QRCode.toDataURL(url, {
//     errorCorrectionLevel: "H",
//     margin: 1,
//     width: QR_SIZE,
//     color: {
//       dark: PLATO_QR_COLOR,
//       light: "#ffffff",
//     },
//   });

//   const qrImage = await loadImage(qrDataUrl);

//   const qrX = (SIZE - QR_SIZE) / 2;
//   const qrY = TOP_SPACE;

//   ctx.drawImage(qrImage, qrX, qrY, QR_SIZE, QR_SIZE);

//   /* ================= CENTER WHITE PATCH ================= */
//   const centerX = SIZE / 2;
//   const centerY = TOP_SPACE + QR_SIZE / 2;

//   ctx.fillStyle = "#ffffff";
//   ctx.beginPath();
//   ctx.roundRect(
//     centerX - CENTER_BOX / 2,
//     centerY - CENTER_BOX / 2,
//     CENTER_BOX,
//     CENTER_BOX,
//     16
//   );
//   ctx.fill();

//   /* ================= BRAND LOGO (CENTERED & SAFE) ================= */
//   if (brandLogoUrl) {
//     try {
//       const logo = await loadImage(brandLogoUrl);

//       ctx.drawImage(
//         logo,
//         centerX - LOGO_SIZE / 2,
//         centerY - LOGO_SIZE / 2,
//         LOGO_SIZE,
//         LOGO_SIZE
//       );
//     } catch (err) {
//       console.warn("QR logo load failed:", err.message);
//     }
//   }

//   /* ================= RETURN BASE64 PNG ================= */
//   return canvas.toDataURL("image/png");
// }

import QRCode from "qrcode";
import { createCanvas, loadImage } from "canvas";
import { PLATO_QR_COLOR } from "../config/platoBrand.js";

/**
 * generateTableQR – PLATO PROFESSIONAL
 * --------------------------------------------------
 * ✔ Startup-grade QR
 * ✔ Emerald Plato color
 * ✔ Circular logo with white ring
 * ✔ Soft shadow (premium look)
 * ✔ Table number on top
 * ✔ High scan reliability
 * ✔ Returns base64 PNG
 */
export async function generateTableQR({ url, tableNumber, brandLogoUrl = "" }) {
  /* ================= CONFIG ================= */
  const SIZE = 600;
  const TOP_SPACE = 80;
  const QR_SIZE = 460;

  const LOGO_OUTER = 120; // white ring
  const LOGO_INNER = 72; // actual logo

  /* ================= CANVAS ================= */
  const canvas = createCanvas(SIZE, SIZE + TOP_SPACE);
  const ctx = canvas.getContext("2d");

  /* ================= BACKGROUND ================= */
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  /* ================= TABLE NUMBER ================= */
  ctx.fillStyle = PLATO_QR_COLOR;
  ctx.font = "700 30px Inter, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${tableNumber}`, SIZE / 2, 40);

  /* ================= QR ================= */
  const qrDataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: QR_SIZE,
    color: {
      dark: PLATO_QR_COLOR,
      light: "#ffffff",
    },
  });

  const qrImg = await loadImage(qrDataUrl);
  ctx.drawImage(qrImg, (SIZE - QR_SIZE) / 2, TOP_SPACE, QR_SIZE, QR_SIZE);

  /* ================= CENTER POSITION ================= */
  const cx = SIZE / 2;
  const cy = TOP_SPACE + QR_SIZE / 2;

  /* ================= SOFT SHADOW ================= */
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.15)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;

  /* ================= WHITE CIRCLE ================= */
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx, cy, LOGO_OUTER / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  /* ================= LOGO ================= */
  if (brandLogoUrl) {
    try {
      const logo = await loadImage(brandLogoUrl);

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, LOGO_INNER / 2, 0, Math.PI * 2);
      ctx.clip();

      ctx.drawImage(
        logo,
        cx - LOGO_INNER / 2,
        cy - LOGO_INNER / 2,
        LOGO_INNER,
        LOGO_INNER
      );

      ctx.restore();
    } catch (err) {
      console.warn("QR logo load failed:", err.message);
    }
  }

  /* ================= RETURN ================= */
  return canvas.toDataURL("image/png");
}
