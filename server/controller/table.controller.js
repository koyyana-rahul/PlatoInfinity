import Table from "../models/table.model.js";
import brandModel from "../models/brand.model.js";
import restaurantModel from "../models/restaurant.model.js";
import { generateTableQR } from "../utils/generateTableQR.js";
import { uploadQrToCloudinary } from "../utils/uploadQrToCloudinary.js";
import generateFrontendUrl from "../utils/generateFrontendUrl.js";

/* ======================================================
   CREATE TABLE (MANAGER)
====================================================== */
export async function createTableController(req, res) {
  try {
    const { restaurantId } = req.params;
    const { tableNumber, seatingCapacity = 4 } = req.body;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID is required",
      });
    }

    if (!tableNumber?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Table number is required" });
    }

    /* ================= RESTAURANT ================= */
    const restaurant = await restaurantModel
      .findById(restaurantId)
      .select("_id name slug brandId")
      .lean();

    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    /* ================= BRAND ================= */
    let brandSlug = "brand";
    let brandLogoUrl = null;

    if (restaurant.brandId) {
      const brand = await brandModel
        .findById(restaurant.brandId)
        .select("slug logoUrl")
        .lean();

      if (brand?.slug) brandSlug = brand.slug;
      if (brand?.logoUrl) brandLogoUrl = brand.logoUrl;
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

    const qrUrl = generateFrontendUrl(
      `/${brandSlug}/${restaurantSlug}/table/${table._id}`,
    );

    const qrBase64 = await generateTableQR({
      url: qrUrl,
      tableNumber: table.tableNumber,
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

/* ======================================================
   PUBLIC: GET TABLE (QR FLOW) ✅ NO AUTH
====================================================== */
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

        // ✅ REQUIRED BY CUSTOMER HEADER
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

/* ======================================================
   LIST TABLES (MANAGER)
====================================================== */
export async function listTablesController(req, res) {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res
        .status(400)
        .json({ success: false, message: "Restaurant ID is required" });
    }

    const restaurant = await restaurantModel
      .findById(restaurantId)
      .select("_id name slug brandId")
      .lean();

    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    let brandSlug = "brand";
    let brandLogoUrl = null;

    if (restaurant.brandId) {
      const brand = await brandModel
        .findById(restaurant.brandId)
        .select("slug logoUrl")
        .lean();

      if (brand?.slug) brandSlug = brand.slug;
      if (brand?.logoUrl) brandLogoUrl = brand.logoUrl;
    }

    const restaurantSlug =
      restaurant.slug || restaurant.name.toLowerCase().replace(/\s+/g, "-");

    const tables = await Table.find({
      restaurantId,
      isActive: true,
      isArchived: false,
    })
      .select("_id tableNumber seatingCapacity status qrUrl qrImageUrl")
      .sort({ tableNumber: 1 })
      .lean();

    const updatedTables = await Promise.all(
      tables.map(async (table) => {
        const expectedQrUrl = generateFrontendUrl(
          `/${brandSlug}/${restaurantSlug}/table/${table._id}`,
        );

        const currentQrUrl = String(table.qrUrl || "").trim();
        const needsQrUpdate =
          !currentQrUrl ||
          currentQrUrl !== expectedQrUrl ||
          currentQrUrl.includes("localhost") ||
          currentQrUrl.includes("127.0.0.1");

        if (!needsQrUpdate) {
          return { ...table, qrUrl: expectedQrUrl };
        }

        let qrImageUrl = table.qrImageUrl;

        try {
          const qrBase64 = await generateTableQR({
            url: expectedQrUrl,
            tableNumber: table.tableNumber,
            brandLogoUrl,
          });

          const upload = await uploadQrToCloudinary(
            qrBase64,
            `table-${table._id}`,
          );

          qrImageUrl = upload.secure_url;

          await Table.findByIdAndUpdate(table._id, {
            qrUrl: expectedQrUrl,
            qrImageUrl,
          });
        } catch (qrErr) {
          console.error(
            `Failed to refresh QR for table ${table._id}:`,
            qrErr?.message || qrErr,
          );
        }

        return {
          ...table,
          qrUrl: expectedQrUrl,
          qrImageUrl,
        };
      }),
    );

    return res.json({
      success: true,
      data: updatedTables,
    });
  } catch (err) {
    console.error("listTablesController:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

/* ======================================================
   DELETE TABLE (SOFT)
====================================================== */
export async function deleteTableController(req, res) {
  try {
    const { restaurantId, tableId } = req.params;

    if (!restaurantId || !tableId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID and Table ID are required",
      });
    }

    const table = await Table.findOneAndDelete({
      _id: tableId,
      restaurantId,
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    return res.json({
      success: true,
      message: "Table deleted successfully",
    });
  } catch (err) {
    console.error("deleteTableController:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}
