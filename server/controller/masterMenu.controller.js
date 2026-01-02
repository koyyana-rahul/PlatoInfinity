import MenuCategory from "../models/menuCategory.model.js";
import MasterMenuItem from "../models/masterMenuItem.model.js";
import MenuSubcategory from "../models/menuSubcategory.model.js";
import menuCategoryModel from "../models/menuCategory.model.js";
import masterMenuItemModel from "../models/masterMenuItem.model.js";
import menuSubcategoryModel from "../models/menuSubcategory.model.js";
import mongoose from "mongoose";

export async function createCategory(req, res) {
  const { name, order } = req.body;
  const brandId = req.user.brandId;

  if (!name) {
    return res.status(400).json({ message: "Category name required" });
  }

  const category = await MenuCategory.findOneAndUpdate(
    { name, brandId },
    { $setOnInsert: { name, brandId, order } },
    { upsert: true, new: true }
  );

  res.status(201).json({ success: true, data: category });
}

export async function createSubcategory(req, res) {
  const { categoryId, name, order } = req.body;
  const brandId = req.user.brandId;

  if (!categoryId || !name) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const subcategory = await MenuSubcategory.findOneAndUpdate(
    { categoryId, name, brandId },
    { $setOnInsert: { categoryId, name, brandId, order } },
    { upsert: true, new: true }
  );

  res.status(201).json({ success: true, data: subcategory });
}

import uploadImageClodinary from "../utils/uploadImageClodinary.js";

export async function createMasterItem(req, res) {
  try {
    const data = req.body?.data ? JSON.parse(req.body.data) : req.body;

    const {
      categoryId,
      subcategoryId,
      name,
      description = "",
      isVeg,
      basePrice,
      defaultStation,
    } = data;

    if (
      !categoryId ||
      !name ||
      basePrice === undefined ||
      isVeg === undefined
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🔥 UPLOAD MULTIPLE IMAGES
    const imageUrls = [];

    if (req.files?.length) {
      for (const file of req.files) {
        const result = await uploadImageClodinary(file.buffer, "master-menu");
        imageUrls.push(result.secure_url);
      }
    }

    const item = await MasterMenuItem.create({
      brandId: req.user.brandId,
      categoryId,
      subcategoryId,
      name,
      description,
      isVeg: Boolean(isVeg),
      basePrice: Number(basePrice),
      defaultStation,

      // ✅ IMPORTANT
      image: imageUrls[0] || "",
      images: imageUrls,
    });

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (err) {
    console.error("createMasterItem:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export async function getMasterMenu(req, res) {
  try {
    const brandId = req.user.brandId;
    const { isVeg } = req.query;

    if (!brandId) {
      return res.status(400).json({
        message: "Brand not linked to user",
        error: true,
        success: false,
      });
    }

    /** 1️⃣ Load categories */
    const categories = await menuCategoryModel
      .find({
        brandId,
        isArchived: false,
      })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    /** 2️⃣ Load subcategories */
    const subcategories = await menuSubcategoryModel
      .find({
        brandId,
        isArchived: false,
      })
      .lean();

    /** 3️⃣ Load items */
    const itemFilter = {
      brandId,
      isArchived: false,
    };

    if (isVeg !== undefined) {
      itemFilter.isVeg = isVeg === "true";
    }

    const items = await masterMenuItemModel.find(itemFilter).lean();

    /** 4️⃣ Build maps */
    const categoryMap = {};
    const subcategoryMap = {};

    categories.forEach((cat) => {
      categoryMap[cat._id] = {
        id: cat._id,
        name: cat.name,
        subcategories: [],
        items: [],
      };
    });

    subcategories.forEach((sub) => {
      subcategoryMap[sub._id] = {
        id: sub._id,
        name: sub.name,
        items: [],
      };
    });

    /** 5️⃣ Attach items */
    for (const item of items) {
      if (!categoryMap[item.categoryId]) continue;

      const formattedItem = {
        id: item._id,
        name: item.name,
        description: item.description || "",
        price: item.basePrice,
        image: item.image || "",
        isVeg: item.isVeg,
        dietaryInfo: item.dietaryInfo || [],
        defaultStation: item.defaultStation || null,
      };

      if (item.subcategoryId && subcategoryMap[item.subcategoryId]) {
        subcategoryMap[item.subcategoryId].items.push(formattedItem);
      } else {
        categoryMap[item.categoryId].items.push(formattedItem);
      }
    }

    /** 6️⃣ Attach subcategories to categories */
    for (const sub of subcategories) {
      if (
        categoryMap[sub.categoryId] &&
        subcategoryMap[sub._id].items.length > 0
      ) {
        categoryMap[sub.categoryId].subcategories.push(subcategoryMap[sub._id]);
      }
    }

    /** 7️⃣ Clean empty categories */
    const result = Object.values(categoryMap).filter(
      (cat) => cat.items.length > 0 || cat.subcategories.length > 0
    );

    return res.json({
      success: true,
      error: false,
      data: result,
    });
  } catch (err) {
    console.error("getMasterMenu error:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

export async function updateCategory(req, res) {
  try {
    const { categoryId } = req.params;
    const { name, order } = req.body;

    if (!name && order === undefined) {
      return res.status(400).json({
        message: "Nothing to update",
        error: true,
        success: false,
      });
    }

    const updated = await menuCategoryModel.findByIdAndUpdate(
      categoryId,
      {
        ...(name && { name }),
        ...(order !== undefined && { order }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Category not found",
        error: true,
        success: false,
      });
    }

    return res.json({
      success: true,
      error: false,
      data: updated,
    });
  } catch (err) {
    console.error("updateCategory:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

export async function deleteCategory(req, res) {
  try {
    const { categoryId } = req.params;

    const category = await menuCategoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
        error: true,
        success: false,
      });
    }

    category.isArchived = true;
    await category.save();

    // Optional: archive all subcategories & items
    await menuSubcategoryModel.updateMany({ categoryId }, { isArchived: true });

    await masterMenuItemModel.updateMany({ categoryId }, { isArchived: true });

    return res.json({
      success: true,
      error: false,
      message: "Category archived",
    });
  } catch (err) {
    console.error("deleteCategory:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

export async function updateSubcategory(req, res) {
  try {
    const { subcategoryId } = req.params;
    const { name, order } = req.body;

    if (!name && order === undefined) {
      return res.status(400).json({
        message: "Nothing to update",
        error: true,
        success: false,
      });
    }

    const updated = await menuSubcategoryModel.findByIdAndUpdate(
      subcategoryId,
      {
        ...(name && { name }),
        ...(order !== undefined && { order }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Subcategory not found",
        error: true,
        success: false,
      });
    }

    return res.json({
      success: true,
      error: false,
      data: updated,
    });
  } catch (err) {
    console.error("updateSubcategory:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

export async function deleteSubcategory(req, res) {
  try {
    const { subcategoryId } = req.params;

    const sub = await menuSubcategoryModel.findById(subcategoryId);
    if (!sub) {
      return res.status(404).json({
        message: "Subcategory not found",
        error: true,
        success: false,
      });
    }

    sub.isArchived = true;
    await sub.save();

    // Archive items under subcategory
    await masterMenuItemModel.updateMany(
      { subcategoryId },
      { isArchived: true }
    );

    return res.json({
      success: true,
      error: false,
      message: "Subcategory archived",
    });
  } catch (err) {
    console.error("deleteSubcategory:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

// export async function updateMasterItem(req, res) {
//   try {
//     const { itemId } = req.params;
//     const { name, description, isVeg, basePrice, defaultStation } = req.body;

//     let update = {
//       ...(name && { name }),
//       ...(description && { description }),
//       ...(isVeg !== undefined && { isVeg }),
//       ...(basePrice !== undefined && { basePrice }),
//       ...(defaultStation && { defaultStation }),
//     };

//     if (req.file) {
//       const uploadRes = await uploadImageClodinary(req.file, "master-menu");
//       update.image = uploadRes.secure_url;
//     }

//     update.version = Date.now(); // used for branch sync

//     const item = await MasterMenuItem.findByIdAndUpdate(itemId, update, {
//       new: true,
//     });

//     if (!item) {
//       return res.status(404).json({
//         message: "Item not found",
//         error: true,
//         success: false,
//       });
//     }

//     return res.json({
//       success: true,
//       error: false,
//       data: item,
//     });
//   } catch (err) {
//     console.error("updateMasterItem:", err);
//     return res.status(500).json({
//       message: "Server error",
//       error: true,
//       success: false,
//     });
//   }
// }

// export async function updateMasterItem(req, res) {
//   try {
//     const { itemId } = req.params;

//     // ✅ REQUIRED for multipart/form-data
//     const payload =
//       typeof req.body.data === "string" ? JSON.parse(req.body.data) : req.body;

//     const { name, description, isVeg, basePrice, defaultStation } = payload;

//     const update = {
//       ...(name && { name }),
//       ...(description !== undefined && { description }),
//       ...(isVeg !== undefined && { isVeg }),
//       ...(basePrice !== undefined && { basePrice }),
//       ...(defaultStation && { defaultStation }),
//       version: Date.now(),
//     };

//     if (req.file) {
//       const uploadRes = await uploadImageClodinary(req.file, "master-menu");
//       update.image = uploadRes.secure_url;
//     }

//     const item = await MasterMenuItem.findByIdAndUpdate(itemId, update, {
//       new: true,
//     });

//     if (!item) {
//       return res.status(404).json({
//         success: false,
//         error: true,
//         message: "Item not found",
//       });
//     }

//     return res.json({
//       success: true,
//       error: false,
//       data: item,
//     });
//   } catch (err) {
//     console.error("updateMasterItem ERROR:", err);
//     return res.status(500).json({
//       success: false,
//       error: true,
//       message: "Server error",
//     });
//   }
// }

export async function updateMasterItem(req, res) {
  try {
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid itemId" });
    }

    const body = req.body?.data ? JSON.parse(req.body.data) : req.body;

    const {
      name,
      description,
      basePrice,
      isVeg,
      defaultStation,
      removedImages = [],
    } = body;

    const item = await MasterMenuItem.findById(itemId);
    if (!item || item.isArchived) {
      return res.status(404).json({ message: "Item not found" });
    }

    /* ---------- REMOVE IMAGES ---------- */
    if (removedImages.length) {
      item.images = item.images.filter((img) => !removedImages.includes(img));
    }

    /* ---------- ADD NEW IMAGES ---------- */
    if (req.files?.length) {
      for (const file of req.files) {
        const upload = await uploadImageClodinary(file.buffer, "master-menu");
        item.images.push(upload.secure_url);
      }
    }

    /* ---------- PRIMARY IMAGE ---------- */
    item.image = item.images[0] || "";

    /* ---------- UPDATE FIELDS ---------- */
    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (basePrice !== undefined) item.basePrice = Number(basePrice);
    if (isVeg !== undefined) item.isVeg = Boolean(isVeg);
    if (defaultStation !== undefined) item.defaultStation = defaultStation;

    item.version = Date.now();
    await item.save();

    return res.json({
      success: true,
      data: item,
    });
  } catch (err) {
    console.error("updateMasterItem error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
export async function deleteMasterItem(req, res) {
  try {
    const { itemId } = req.params;

    const item = await masterMenuItemModel.findById(itemId);
    if (!item) {
      return res.status(404).json({
        message: "Item not found",
        error: true,
        success: false,
      });
    }

    item.isArchived = true;
    await item.save();

    return res.json({
      success: true,
      error: false,
      message: "Item archived",
    });
  } catch (err) {
    console.error("deleteMasterItem:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

// src/controller/masterMenu.controller.js

/**
 * GET /api/master-menu/categories
 * Brand admin only
 */
export async function getCategories(req, res) {
  try {
    const brandId = req.user.brandId;

    const categories = await menuCategoryModel
      .find({
        brandId,
        isArchived: false,
      })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return res.json({
      success: true,
      error: false,
      data: categories,
    });
  } catch (err) {
    console.error("getCategories error:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

/**
 * GET /api/master-menu/categories/:categoryId/subcategories
 */
export async function getSubcategories(req, res) {
  try {
    const brandId = req.user.brandId;
    const { categoryId } = req.params;

    const subcategories = await menuSubcategoryModel
      .find({
        brandId,
        categoryId,
        isArchived: false,
      })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return res.json({
      success: true,
      error: false,
      data: subcategories,
    });
  } catch (err) {
    console.error("getSubcategories error:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

/**
 * GET /api/master-menu/tree
 */
export async function getMasterMenuTree(req, res) {
  try {
    const brandId = req.user.brandId;

    const [categories, subcategories, items] = await Promise.all([
      menuCategoryModel
        .find({ brandId, isArchived: false })
        .sort({ order: 1 })
        .lean(),
      menuSubcategoryModel
        .find({ brandId, isArchived: false })
        .sort({ order: 1 })
        .lean(),
      masterMenuItemModel.find({ brandId, isArchived: false }).lean(),
    ]);

    const categoryMap = {};

    categories.forEach((cat) => {
      categoryMap[cat._id] = {
        id: cat._id,
        name: cat.name,
        subcategories: [],
        items: [],
      };
    });

    const subcategoryMap = {};

    subcategories.forEach((sub) => {
      const node = {
        id: sub._id,
        name: sub.name,
        items: [],
      };
      subcategoryMap[sub._id] = node;

      if (categoryMap[sub.categoryId]) {
        categoryMap[sub.categoryId].subcategories.push(node);
      }
    });

    items.forEach((item) => {
      if (item.subcategoryId && subcategoryMap[item.subcategoryId]) {
        subcategoryMap[item.subcategoryId].items.push(item);
      } else if (categoryMap[item.categoryId]) {
        categoryMap[item.categoryId].items.push(item);
      }
    });

    return res.json({
      success: true,
      error: false,
      data: Object.values(categoryMap),
    });
  } catch (err) {
    console.error("getMasterMenuTree error:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}
