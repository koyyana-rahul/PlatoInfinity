import Table from "../models/table.model.js";
import QRCode from "qrcode";
import { uploadQrToCloudinary } from "../utils/uploadQrToCloudinary.js";
export async function createTableController(req, res) {
  try {
    const { restaurantId } = req.params;
    const { tableNumber, seatingCapacity } = req.body;

    if (!tableNumber) {
      return res.status(400).json({
        message: "tableNumber required",
        error: true,
        success: false,
      });
    }

    // 1️⃣ Create table first
    const table = await Table.create({
      restaurantId,
      tableNumber,
      seatingCapacity,
      status: "FREE",
      isActive: true,
    });

    // 2️⃣ QR TARGET URL (THIS IS VERY IMPORTANT)
    const qrUrl = `${process.env.FRONTEND_URL}/menu?rid=${restaurantId}&tid=${table._id}`;

    // 3️⃣ Generate QR image (base64)
    const qrBase64 = await QRCode.toDataURL(qrUrl);

    // 4️⃣ Upload QR image to cloudinary
    const uploadRes = await uploadQrToCloudinary(
      qrBase64,
      `table-${table._id}`
    );

    // 5️⃣ Save BOTH url + image
    table.qrUrl = qrUrl;
    table.qrImageUrl = uploadRes.secure_url;
    await table.save();

    return res.status(201).json({
      success: true,
      error: false,
      data: table,
    });
  } catch (err) {
    console.error("createTableController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}
export async function listTablesController(req, res) {
  try {
    const { restaurantId } = req.params;

    const tables = await Table.find({
      restaurantId,
      isActive: true,
    }).sort({ tableNumber: 1 });

    return res.json({
      success: true,
      error: false,
      data: tables,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}
