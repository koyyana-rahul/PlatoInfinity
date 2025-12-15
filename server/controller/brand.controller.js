// src/controllers/brand.controller.js
import BrandModel from "../models/brand.model.js";
import UserModel from "../models/user.model.js";
import AuditLog from "../models/auditLog.model.js"; // optional - remove if you don't have
import uploadImageClodinary from "../utils/uploadImageClodinary.js";
import MenuCategory from "../models/menuCategory.model.js";

export async function createBrandController(req, res) {
  try {
    const admin = req.user; // requireAuth + requireRole('BRAND_ADMIN')

    // req.body works for BOTH json and form-data
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Brand name is required",
        error: true,
        success: false,
      });
    }

    // Prevent duplicate brand names (case-insensitive recommended)
    const existing = await BrandModel.findOne({
      name: new RegExp(`^${name}$`, "i"),
    }).lean();

    if (existing) {
      return res.status(409).json({
        message: "Brand name already exists",
        error: true,
        success: false,
      });
    }

    // Handle optional logo upload
    let logoUrl = "";

    if (req.file) {
      const uploadRes = await uploadImageClodinary(
        req.file.buffer,
        "brand-logos"
      );
      logoUrl = uploadRes.secure_url;
    }

    const brand = await BrandModel.create({
      name,
      logoUrl,
      ownerId: admin._id,
    });

    // Create default categories for the new brand
    const defaultCategories = [
      { name: "Starters", brandId: brand._id, sortOrder: 1 },
      { name: "chicken Starters", brandId: brand._id, sortOrder: 2 },
      { name: "Main Course", brandId: brand._id, sortOrder: 3 },
      { name: "Desserts", brandId: brand._id, sortOrder: 4 },
      { name: "Beverages", brandId: brand._id, sortOrder: 5 },
    ];

    for (const category of defaultCategories) {
      await MenuCategory.findOneAndUpdate(
        { name: category.name, brandId: category.brandId },
        { $setOnInsert: category },
        { upsert: true, new: true }
      );
    }

    // Attach brandId to admin if not already attached
    if (!admin.brandId) {
      await UserModel.findByIdAndUpdate(admin._id, {
        brandId: brand._id,
      });
    }

    // Optional audit log (non-blocking)
    try {
      await AuditLog.create({
        actorType: "USER",
        actorId: String(admin._id),
        action: "CREATE_BRAND",
        entityType: "Brand",
        entityId: String(brand._id),
      });
    } catch (e) {
      console.warn("Audit log failed:", e.message);
    }

    return res.status(201).json({
      message: "Brand created successfully",
      error: false,
      success: true,
      data: brand,
    });
  } catch (err) {
    console.error("createBrandController error:", err);

    if (err.code === 11000) {
      return res.status(409).json({
        message: "Brand already exists",
        error: true,
        success: false,
      });
    }

    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

export async function listBrandsController(req, res) {
  try {
    const admin = req.user;
    // If admin should only see their brands:
    const brands = await BrandModel.find({ ownerId: admin._id }).lean();
    return res.json({
      message: "brands",
      error: false,
      success: true,
      data: brands,
    });
  } catch (err) {
    console.error("listBrandsController error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: true, success: false });
  }
}
