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

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Brand name is required",
        error: true,
        success: false,
      });
    }

    // Generate slug
    const slug = slugify(name, {
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
      const uploadRes = await uploadImageClodinary(
        req.file.buffer,
        "brand-logos"
      );
      logoUrl = uploadRes.secure_url;
    }

    const brand = await BrandModel.create({
      name: name.trim(),
      slug,
      logoUrl,
      ownerId: admin._id,
    });

    // Default categories
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
        { upsert: true }
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
      "name slug logoUrl"
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
