// src/controllers/brand.controller.js
import BrandModel from "../models/brand.model.js";
import UserModel from "../models/user.model.js";
import MenuCategory from "../models/menuCategory.model.js";
import uploadImageClodinary from "../utils/uploadImageClodinary.js";
import slugify from "slugify";

export async function createBrandController(req, res) {
  try {
    const admin = req.user;
    const { name } = req.body;

    // Validation
    if (!name?.trim()) {
      return res.status(400).json({
        message: "Brand name is required",
        error: true,
        success: false,
      });
    }

    const trimmedName = name.trim();

    // Validate name length
    if (trimmedName.length < 2) {
      return res.status(400).json({
        message: "Brand name must be at least 2 characters",
        error: true,
        success: false,
      });
    }

    if (trimmedName.length > 50) {
      return res.status(400).json({
        message: "Brand name cannot exceed 50 characters",
        error: true,
        success: false,
      });
    }

    // Generate slug
    const slug = slugify(trimmedName, {
      lower: true,
      strict: true,
      trim: true,
    });

    // Prevent duplicate slug
    const existingSlug = await BrandModel.findOne({ slug });
    if (existingSlug) {
      return res.status(409).json({
        message: "Brand name already exists",
        error: true,
        success: false,
      });
    }

    // Upload logo if exists
    let logoUrl = "";
    if (req.file) {
      try {
        const uploadRes = await uploadImageClodinary(
          req.file.buffer,
          "brand-logos",
        );
        logoUrl = uploadRes.secure_url;
      } catch (uploadErr) {
        console.error("Image upload error:", uploadErr);
        return res.status(400).json({
          message: "Failed to upload logo. Please try again.",
          error: true,
          success: false,
        });
      }
    }

    const brand = await BrandModel.create({
      name: trimmedName,
      slug,
      logoUrl,
      ownerId: admin._id,
    });

    // Default categories - empty array for now
    const defaultCategories = [];

    for (let i = 0; i < defaultCategories.length; i++) {
      await MenuCategory.findOneAndUpdate(
        { name: defaultCategories[i], brandId: brand._id },
        {
          $setOnInsert: {
            name: defaultCategories[i],
            brandId: brand._id,
            sortOrder: i + 1,
          },
        },
        { upsert: true },
      );
    }

    // Attach brandId to admin
    if (!admin.brandId) {
      await UserModel.findByIdAndUpdate(admin._id, {
        brandId: brand._id,
      });
    }

    return res.status(201).json({
      message: "Brand created successfully",
      error: false,
      success: true,
      data: brand, // includes slug
    });
  } catch (err) {
    console.error("createBrandController:", err);
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

    const brands = await BrandModel.find({ ownerId: admin._id }).select(
      "name slug logoUrl",
    );

    return res.json({
      success: true,
      error: false,
      data: brands,
    });
  } catch (err) {
    console.error("listBrandsController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

export async function updateBrandSettingsController(req, res) {
  try {
    const user = req.user;
    const {
      storeName,
      address,
      phone,
      email,
      description,
      gst,
      fssai,
      serviceCharge,
      taxRate,
      deliveryFee,
    } = req.body;

    // Find brand by user's brandId
    const brand = await BrandModel.findOne({
      _id: user.brandId,
      ownerId: user._id,
    });

    if (!brand) {
      return res.status(404).json({
        message: "Brand not found",
        error: true,
        success: false,
      });
    }

    // Validation
    const updateData = {};

    if (storeName !== undefined) {
      if (!storeName?.trim()) {
        return res.status(400).json({
          message: "Store name is required",
          error: true,
          success: false,
        });
      }
      updateData.storeName = storeName.trim();
    }

    if (address !== undefined) {
      if (!address?.trim()) {
        return res.status(400).json({
          message: "Address is required",
          error: true,
          success: false,
        });
      }
      updateData.address = address.trim();
    }

    if (phone !== undefined) {
      if (!phone?.trim()) {
        return res.status(400).json({
          message: "Phone is required",
          error: true,
          success: false,
        });
      }
      updateData.phone = phone.trim();
    }

    if (email !== undefined) {
      if (!email?.trim()) {
        return res.status(400).json({
          message: "Email is required",
          error: true,
          success: false,
        });
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
          message: "Invalid email format",
          error: true,
          success: false,
        });
      }
      updateData.email = email.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || "";
    }

    if (gst !== undefined) {
      updateData.gst = gst?.trim() || "";
    }

    if (fssai !== undefined) {
      updateData.fssai = fssai?.trim() || "";
    }

    if (serviceCharge !== undefined) {
      const sc = parseFloat(serviceCharge) || 0;
      if (sc < 0 || sc > 100) {
        return res.status(400).json({
          message: "Service charge must be between 0 and 100",
          error: true,
          success: false,
        });
      }
      updateData.serviceCharge = sc;
    }

    if (taxRate !== undefined) {
      const tr = parseFloat(taxRate) || 0;
      if (tr < 0 || tr > 100) {
        return res.status(400).json({
          message: "Tax rate must be between 0 and 100",
          error: true,
          success: false,
        });
      }
      updateData.taxRate = tr;
    }

    if (deliveryFee !== undefined) {
      const df = parseFloat(deliveryFee) || 0;
      if (df < 0) {
        return res.status(400).json({
          message: "Delivery fee cannot be negative",
          error: true,
          success: false,
        });
      }
      updateData.deliveryFee = df;
    }

    const updatedBrand = await BrandModel.findByIdAndUpdate(
      brand._id,
      updateData,
      { new: true },
    );

    return res.json({
      message: "Brand settings updated successfully",
      error: false,
      success: true,
      data: updatedBrand,
    });
  } catch (err) {
    console.error("updateBrandSettingsController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}
