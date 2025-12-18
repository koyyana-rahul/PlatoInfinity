import MenuCategory from "../models/menuCategory.model.js";
import MasterMenuItem from "../models/masterMenuItem.model.js";
import MenuSubcategory from "../models/menuSubCategory.model.js";
import uploadImageClodinary from "../utils/uploadImageClodinary.js";
import menuCategoryModel from "../models/menuCategory.model.js";
import masterMenuItemModel from "../models/masterMenuItem.model.js";
import menuSubcategoryModel from "../models/menuSubCategory.model.js";

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

export async function createMasterItem(req, res) {
  try {
    let data = req.body;

    // If content-type is form-data, req.body might contain stringified JSON
    // in a field, or individual fields. Multer will populate req.file for the image.
    if (req.is("multipart/form-data")) {
      // If there's a specific field containing JSON data, parse it.
      // Assuming a field named 'data' might contain the JSON payload.
      if (req.body.data) {
        try {
          data = JSON.parse(req.body.data);
        } catch (e) {
          return res
            .status(400)
            .json({ message: "Invalid JSON data in 'data' field" });
        }
      }
    }

    const {
      categoryId,
      subcategoryId,
      name,
      description,
      isVeg,
      basePrice,
      defaultStation,
      image, // can be a URL for JSON input
    } = data;

    const brandId = req.user.brandId;

    if (
      !categoryId ||
      !name ||
      basePrice === undefined ||
      isVeg === undefined
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let imageUrl = image; // Use image URL from JSON body by default
    if (req.file) {
      // If a file is uploaded, it takes precedence
      const buffer = Buffer.from(req.file.buffer);
      const result = await uploadImageClodinary(buffer);
      imageUrl = result.secure_url;
    }

    const itemPayload = {
      brandId,
      categoryId,
      subcategoryId,
      name,
      description,
      isVeg: String(isVeg) === "true",
      basePrice: parseFloat(basePrice),
      defaultStation,
      image: imageUrl,
    };

    const item = await MasterMenuItem.findOneAndUpdate(
      { brandId, name },
      { $setOnInsert: itemPayload },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    console.error("createMasterItem error:", error);
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

export async function updateMasterItem(req, res) {
  try {
    const { itemId } = req.params;
    const { name, description, isVeg, basePrice, defaultStation } = req.body;

    let update = {
      ...(name && { name }),
      ...(description && { description }),
      ...(isVeg !== undefined && { isVeg }),
      ...(basePrice !== undefined && { basePrice }),
      ...(defaultStation && { defaultStation }),
    };

    if (req.file) {
      const uploadRes = await uploadImageClodinary(req.file, "master-menu");
      update.image = uploadRes.secure_url;
    }

    update.version = Date.now(); // used for branch sync

    const item = await MasterMenuItem.findByIdAndUpdate(itemId, update, {
      new: true,
    });

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
        error: true,
        success: false,
      });
    }

    return res.json({
      success: true,
      error: false,
      data: item,
    });
  } catch (err) {
    console.error("updateMasterItem:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
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
