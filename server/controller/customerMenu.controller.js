// import mongoose from "mongoose";
// import BranchMenuItem from "../models/branchMenuItem.model.js";
// import MasterMenuItem from "../models/masterMenuItem.model.js";
// import Table from "../models/table.model.js";

// /* ======================================================
//    CUSTOMER MENU – FINAL PRODUCTION VERSION
// ====================================================== */
// export async function getCustomerMenuController(req, res) {
//   try {
//     const { restaurantId } = req.params;
//     const { veg } = req.query;

//     if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid restaurant",
//       });
//     }

//     /* ======================================================
//        1️⃣ LOAD BRANCH MENU (ONLY SOURCE OF TRUTH)
//     ====================================================== */
//     const branchItems = await BranchMenuItem.find({
//       restaurantId,
//       status: "ON",
//       isArchived: false,
//     }).lean();

//     if (!branchItems.length) {
//       return res.json({ success: true, data: [] });
//     }

//     /* ======================================================
//        2️⃣ LOAD MASTER ITEMS (ONLY FOR IMAGE / VEG)
//     ====================================================== */
//     const masterItems = await MasterMenuItem.find({
//       _id: { $in: branchItems.map((b) => b.masterItemId) },
//       isArchived: false,
//       ...(veg !== undefined ? { isVeg: veg === "true" } : {}),
//     }).lean();

//     const masterMap = {};
//     masterItems.forEach((m) => {
//       masterMap[String(m._id)] = m;
//     });

//     /* ======================================================
//        3️⃣ BUILD MENU TREE DYNAMICALLY (NO CATEGORY DROP)
//     ====================================================== */
//     const categoryMap = {};

//     for (const branch of branchItems) {
//       const master = masterMap[String(branch.masterItemId)];
//       if (!master) continue;

//       const categoryId = master.categoryId
//         ? String(master.categoryId)
//         : "uncategorized";

//       const subcategoryId = master.subcategoryId
//         ? String(master.subcategoryId)
//         : "default";

//       /* CATEGORY */
//       if (!categoryMap[categoryId]) {
//         categoryMap[categoryId] = {
//           id: categoryId,
//           name: master.categoryId ? "Category" : "Menu",
//           subcategories: {},
//         };
//       }

//       /* SUBCATEGORY */
//       if (!categoryMap[categoryId].subcategories[subcategoryId]) {
//         categoryMap[categoryId].subcategories[subcategoryId] = {
//           id: subcategoryId,
//           name: master.subcategoryId ? "Items" : "Items",
//           items: [],
//         };
//       }

//       /* ITEM */
//       categoryMap[categoryId].subcategories[subcategoryId].items.push({
//         id: branch._id, // branchMenuItemId
//         name: branch.name,
//         description: branch.description,
//         price: branch.price,
//         image: master.image || "",
//         isVeg: master.isVeg,
//         available: !branch.trackStock || (branch.stock ?? 1) > 0,
//       });
//     }

//     /* ======================================================
//        4️⃣ FINAL NORMALIZED RESPONSE
//     ====================================================== */
//     const finalMenu = Object.values(categoryMap).map((cat) => ({
//       id: cat.id,
//       name: cat.name,
//       subcategories: Object.values(cat.subcategories),
//     }));

//     return res.json({
//       success: true,
//       data: finalMenu,
//     });
//   } catch (err) {
//     console.error("getCustomerMenuController:", err);
//     return res.status(500).json({ success: false });
//   }
// }

// /* ======================================================
//    PUBLIC: MENU BY TABLE (QR FLOW)
// ====================================================== */
// export async function getCustomerMenuByTableController(req, res) {
//   try {
//     const { tableId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(tableId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid table",
//       });
//     }

//     const table = await Table.findById(tableId)
//       .select("restaurantId isActive isArchived")
//       .lean();

//     if (!table || table.isArchived || !table.isActive) {
//       return res.status(404).json({
//         success: false,
//         message: "Table not found",
//       });
//     }

//     req.params.restaurantId = String(table.restaurantId);
//     return getCustomerMenuController(req, res);
//   } catch (err) {
//     console.error("getCustomerMenuByTableController:", err);
//     return res.status(500).json({ success: false });
//   }
// }

import mongoose from "mongoose";
import BranchMenuItem from "../models/branchMenuItem.model.js";
import MasterMenuItem from "../models/masterMenuItem.model.js";
import MenuCategory from "../models/menuCategory.model.js";
import MenuSubcategory from "../models/menuSubcategory.model.js";
import Table from "../models/table.model.js";




export async function getPublicMenuItemController(req, res) {
  try {
    const { branchMenuItemId } = req.params;

    if (!branchMenuItemId) {
      return res.status(400).json({ success: false });
    }

    const branch = await BranchMenuItem.findById(branchMenuItemId)
      .select("name description price masterItemId trackStock stock")
      .lean();

    if (!branch) {
      return res.status(404).json({ success: false });
    }

    const master = await MasterMenuItem.findById(branch.masterItemId)
      .select("image images isVeg dietaryTags")
      .lean();

    return res.json({
      success: true,
      data: {
        id: branch._id,
        name: branch.name,
        description: branch.description,
        price: branch.price,
        image: master?.image || "",
        images: master?.images || [],
        isVeg: master?.isVeg ?? true,
        dietaryTags: master?.dietaryTags || [],
        available: !branch.trackStock || (branch.stock ?? 1) > 0,
      },
    });
  } catch (err) {
    console.error("getPublicMenuItemController:", err);
    res.status(500).json({ success: false });
  }
}

/* ======================================================
   CUSTOMER MENU – FINAL PRODUCTION VERSION (WITH NAMES)
====================================================== */
export async function getCustomerMenuController(req, res) {
  try {
    const { restaurantId } = req.params;
    const { veg } = req.query;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant",
      });
    }

    /* ======================================================
       1️⃣ LOAD BRANCH MENU (SOURCE OF TRUTH)
    ====================================================== */
    const branchItems = await BranchMenuItem.find({
      restaurantId,
      status: "ON",
      isArchived: false,
    }).lean();

    if (!branchItems.length) {
      return res.json({ success: true, data: [] });
    }

    /* ======================================================
       2️⃣ LOAD MASTER ITEMS (META ONLY)
    ====================================================== */
    const masterItems = await MasterMenuItem.find({
      _id: { $in: branchItems.map((b) => b.masterItemId) },
      isArchived: false,
      ...(veg !== undefined ? { isVeg: veg === "true" } : {}),
    }).lean();

    const masterMap = {};
    const categoryIds = new Set();
    const subcategoryIds = new Set();

    masterItems.forEach((m) => {
      masterMap[String(m._id)] = m;
      if (m.categoryId) categoryIds.add(String(m.categoryId));
      if (m.subcategoryId) subcategoryIds.add(String(m.subcategoryId));
    });

    /* ======================================================
       3️⃣ LOAD CATEGORY & SUBCATEGORY NAMES (SAFE)
    ====================================================== */
    const categories = await MenuCategory.find({
      _id: { $in: [...categoryIds] },
      isArchived: false,
    }).lean();

    const subcategories = await MenuSubcategory.find({
      _id: { $in: [...subcategoryIds] },
      isArchived: false,
    }).lean();

    const categoryNameMap = {};
    const subcategoryNameMap = {};

    categories.forEach((c) => {
      categoryNameMap[String(c._id)] = c.name;
    });

    subcategories.forEach((s) => {
      subcategoryNameMap[String(s._id)] = s.name;
    });

    /* ======================================================
       4️⃣ BUILD MENU TREE (NO DROPS)
    ====================================================== */
    const categoryMap = {};

    for (const branch of branchItems) {
      const master = masterMap[String(branch.masterItemId)];
      if (!master) continue;

      const categoryId = master.categoryId
        ? String(master.categoryId)
        : "uncategorized";

      const subcategoryId = master.subcategoryId
        ? String(master.subcategoryId)
        : "default";

      /* CATEGORY */
      if (!categoryMap[categoryId]) {
        categoryMap[categoryId] = {
          id: categoryId,
          name:
            categoryNameMap[categoryId] ||
            (categoryId === "uncategorized" ? "Menu" : "Category"),
          subcategories: {},
        };
      }

      /* SUBCATEGORY */
      if (!categoryMap[categoryId].subcategories[subcategoryId]) {
        categoryMap[categoryId].subcategories[subcategoryId] = {
          id: subcategoryId,
          name:
            subcategoryNameMap[subcategoryId] ||
            (subcategoryId === "default" ? "Items" : "Items"),
          items: [],
        };
      }

      /* ITEM */
      categoryMap[categoryId].subcategories[subcategoryId].items.push({
        id: branch._id,
        name: branch.name,
        description: branch.description,
        price: branch.price,
        image: master.image || "",
        isVeg: master.isVeg,
        available: !branch.trackStock || (branch.stock ?? 1) > 0,
      });
    }

    /* ======================================================
       5️⃣ FINAL RESPONSE
    ====================================================== */
    const finalMenu = Object.values(categoryMap).map((cat) => ({
      id: cat.id,
      name: cat.name,
      subcategories: Object.values(cat.subcategories),
    }));

    return res.json({
      success: true,
      data: finalMenu,
    });
  } catch (err) {
    console.error("getCustomerMenuController:", err);
    return res.status(500).json({ success: false });
  }
}

/* ======================================================
   PUBLIC: MENU BY TABLE (QR FLOW)
====================================================== */
export async function getCustomerMenuByTableController(req, res) {
  try {
    const { tableId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tableId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid table",
      });
    }

    const table = await Table.findById(tableId)
      .select("restaurantId isActive isArchived")
      .lean();

    if (!table || table.isArchived || !table.isActive) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    req.params.restaurantId = String(table.restaurantId);
    return getCustomerMenuController(req, res);
  } catch (err) {
    console.error("getCustomerMenuByTableController:", err);
    return res.status(500).json({ success: false });
  }
}
