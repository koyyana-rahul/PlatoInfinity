import Table from "../models/table.model.js";
import QRCode from "qrcode";
import { uploadQrToCloudinary } from "../utils/uploadQrToCloudinary.js";
import brandModel from "../models/brand.model.js";
import restaurantModel from "../models/restaurant.model.js";
import { generateTableQR } from "../utils/generateTableQR.js";

/**
 * CREATE TABLE
 */

// export async function createTableController(req, res) {
//   try {
//     const restaurantId = req.user.restaurantId;
//     const { tableNumber, seatingCapacity = 4 } = req.body;

//     if (!restaurantId) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized restaurant",
//       });
//     }

//     if (!tableNumber?.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Table number is required",
//       });
//     }

//     /* ================= FETCH RESTAURANT SAFELY ================= */
//     const restaurant = await restaurantModel
//       .findById(restaurantId)
//       .select("name slug brandId")
//       .lean();

//     if (!restaurant) {
//       return res.status(404).json({
//         success: false,
//         message: "Restaurant not found",
//       });
//     }

//     /* ================= FETCH BRAND SAFELY ================= */
//     let brandSlug = "brand";
//     if (restaurant.brandId) {
//       const brand = await brandModel
//         .findById(restaurant.brandId)
//         .select("slug")
//         .lean();
//       if (brand?.slug) brandSlug = brand.slug;
//     }

//     const restaurantSlug = restaurant.name || "restaurant";

//     /* ================= CREATE TABLE ================= */
//     const table = await Table.create({
//       restaurantId,
//       tableNumber: tableNumber.trim(),
//       seatingCapacity,
//       status: "FREE",
//       isActive: true,
//       isArchived: false,
//     });

//     /* ================= CUSTOMER FRIENDLY QR URL ================= */
//     const qrUrl = `${process.env.FRONTEND_URL}/${brandSlug}/${restaurantSlug}/table/${table._id}`;

//     /* ================= GENERATE QR ================= */
//     const qrBase64 = await QRCode.toDataURL(qrUrl);

//     const upload = await uploadQrToCloudinary(qrBase64, `table-${table._id}`);

//     table.qrUrl = qrUrl;
//     table.qrImageUrl = upload.secure_url;
//     await table.save();

//     return res.status(201).json({
//       success: true,
//       data: table,
//     });
//   } catch (err) {
//     console.error("createTableController:", err);

//     if (err.code === 11000) {
//       return res.status(409).json({
//         success: false,
//         message: "Table number already exists",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// }

export async function createTableController(req, res) {
  try {
    const restaurantId = req.user.restaurantId;
    const { tableNumber, seatingCapacity = 4 } = req.body;

    if (!restaurantId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!tableNumber?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Table number is required",
      });
    }

    /* ================= RESTAURANT ================= */
    const restaurant = await restaurantModel
      .findById(restaurantId)
      .select("name slug brandId")
      .lean();

    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    /* ================= BRAND ================= */
    let brandSlug = "brand";
    let brandName = "PLATO";
    let brandLogoUrl = null;

    if (restaurant.brandId) {
      const brand = await brandModel
        .findById(restaurant.brandId)
        .select("slug name logoUrl")
        .lean();

      if (brand?.slug) brandSlug = brand.slug;
      // if (brand?.name) brandName = brand.name;
      if (brand?.logoUrl) brandLogoUrl = brand.logoUrl;
    }

    {
      console.log(brandLogoUrl);
    }

    const restaurantSlug =
      restaurant.slug || restaurant.name.toLowerCase().replace(/\s+/g, "-");

    /* ================= CREATE TABLE ================= */
    const table = await Table.create({
      restaurantId,
      tableNumber: tableNumber.trim(),
      seatingCapacity,
      status: "FREE",
      isActive: true,
      isArchived: false,
    });

    /* ================= CUSTOMER QR URL ================= */
    const qrUrl = `${process.env.FRONTEND_URL}/${brandSlug}/${restaurantSlug}/table/${table._id}`;

    /* ================= GENERATE PROFESSIONAL QR ================= */
    const qrBase64 = await generateTableQR({
      url: qrUrl,
      tableNumber: table.tableNumber,
      // brandName,
      brandLogoUrl,
    });

    const upload = await uploadQrToCloudinary(qrBase64, `table-${table._id}`);

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

// src/controllers/table.controller.js

export async function getPublicTableController(req, res) {
  try {
    const { tableId } = req.params;

    const table = await Table.findById(tableId)
      .populate({
        path: "restaurantId",
        select: "_id name brandId",
        populate: {
          path: "brandId",
          select: "_id name slug logoUrl",
        },
      })
      .lean();

    if (!table || table.isArchived || !table.isActive) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    return res.json({
      success: true,
      data: {
        _id: table._id,
        tableNumber: table.tableNumber,
        seatingCapacity: table.seatingCapacity,
        restaurantId: table.restaurantId?._id || null,

        // 🔥 THIS IS REQUIRED FOR CUSTOMER HEADER
        brand: table.restaurantId?.brandId || null,
      },
    });
  } catch (err) {
    console.error("getPublicTableController:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

// export async function getPublicTableController(req, res) {
//   try {
//     const { tableId } = req.params;

//     const table = await Table.findById(tableId)
//       .select("_id restaurantId tableNumber name seatingCapacity status isActive isArchived")
//       .lean();

//     if (!table || table.isArchived || !table.isActive) {
//       return res.status(404).json({
//         success: false,
//         message: "Table not found",
//       });
//     }

//     return res.json({
//       success: true,
//       data: table,
//     });
//   } catch (err) {
//     console.error("getPublicTableController:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// }
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

/**
 * DELETE TABLE (Soft Delete)
 * Manager only
 */
export async function deleteTableController(req, res) {
  try {
    const restaurantId = req.user?.restaurantId;
    const { tableId } = req.params;

    if (!restaurantId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized restaurant",
      });
    }

    if (!tableId) {
      return res.status(400).json({
        success: false,
        message: "Table ID is required",
      });
    }

    // ✅ Ensure table belongs to this restaurant
    const table = await Table.findOne({
      _id: tableId,
      restaurantId,
      isArchived: false,
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    // ✅ Soft delete
    table.isArchived = true;
    table.isActive = false;
    await table.save();

    return res.json({
      success: true,
      message: "Table deleted successfully",
      data: {
        tableId: table._id,
      },
    });
  } catch (err) {
    console.error("deleteTableController:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}
