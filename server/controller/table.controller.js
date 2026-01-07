import Table from "../models/table.model.js";
import QRCode from "qrcode";
import { uploadQrToCloudinary } from "../utils/uploadQrToCloudinary.js";

/**
 * CREATE TABLE
 */
export async function createTableController(req, res) {
  try {
    const restaurant = req.user.restaurant;
    const restaurantId = req.user.restaurantId;
    const { tableNumber, seatingCapacity = 4 } = req.body;

    if (!restaurantId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized restaurant",
      });
    }

    if (!tableNumber || !tableNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: "Table number is required",
      });
    }

    // 1️⃣ Create table
    const table = await Table.create({
      restaurantId,
      tableNumber: tableNumber.trim(),
      seatingCapacity,
      status: "FREE",
      isActive: true,
      isArchived: false,
    });

    // 2️⃣ QR target URL (CUSTOMER SCAN ENTRY)
    const qrUrl = `${process.env.FRONTEND_URL}/scan?rid=${restaurantId}&tid=${table._id}`;

    // 3️⃣ Generate QR image
    const qrBase64 = await QRCode.toDataURL(qrUrl);

    // 4️⃣ Upload QR to Cloudinary
    const upload = await uploadQrToCloudinary(qrBase64, `table-${table._id}`);

    // 5️⃣ Save QR info
    table.qrUrl = qrUrl;
    table.qrImageUrl = upload.secure_url;
    await table.save();

    return res.status(201).json({
      success: true,
      data: table,
    });
  } catch (err) {
    console.error("createTableController:", err);

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Table number already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

/**
 * LIST TABLES
 */
export async function listTablesController(req, res) {
  try {
    const restaurantId = req.user?.restaurantId || req.params.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const tables = await Table.find({
      restaurantId,
      isActive: true,
      isArchived: false,
    })
      .select("_id tableNumber seatingCapacity status qrUrl qrImageUrl") // ✅ ENSURE FIELDS
      .sort({ tableNumber: 1 })
      .lean(); // ✅ IMPORTANT

    return res.json({
      success: true,
      data: tables,
    });
  } catch (err) {
    console.error("listTablesController:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}
