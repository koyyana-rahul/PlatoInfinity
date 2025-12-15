import QRCode from "qrcode";

/**
 * payload example:
 * plato://menu?restaurantId=xxx&tableId=yyy
 */
export async function generateTableQR(payload) {
  const qrDataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "H",
    width: 500,
  });

  return qrDataUrl; // base64 image
}
