import BranchMenuItem from "../models/branchMenuItem.model.js";
import MasterMenuItem from "../models/masterMenuItem.model.js";
import MenuCategory from "../models/menuCategory.model.js";
import MenuSubcategory from "../models/menuSubcategory.model.js";
import Table from "../models/table.model.js";

/* ======================================================
   INTERNAL: BUILD CUSTOMER MENU BY RESTAURANT
====================================================== */
export async function getCustomerMenuController(req, res) {
  try {
    const { restaurantId } = req.params;
    const { veg } = req.query;

    /* ================= 1. BRANCH ITEMS ================= */
    const branchItems = await BranchMenuItem.find({
      restaurantId,
      status: "ON",
      isArchived: false,
    }).lean();

    if (!branchItems.length) {
      return res.json({ success: true, data: [] });
    }

    /* ================= 2. MASTER ITEMS ================= */
    const masterItemIds = branchItems.map((b) => b.masterItemId);

    const masterFilter = {
      _id: { $in: masterItemIds },
      isArchived: false,
    };

    if (veg !== undefined) {
      masterFilter.isVeg = veg === "true";
    }

    const masterItems = await MasterMenuItem.find(masterFilter).lean();

    const masterMap = {};
    masterItems.forEach((m) => {
      masterMap[String(m._id)] = m;
    });

    /* ================= 3. CATEGORIES ================= */
    const categories = await MenuCategory.find({ isArchived: false })
      .sort({ order: 1 })
      .lean();

    const subcategories = await MenuSubcategory.find({
      isArchived: false,
    }).lean();

    const categoryMap = {};
    const subcategoryMap = {};

    categories.forEach((c) => {
      categoryMap[String(c._id)] = {
        id: c._id,
        name: c.name,
        items: [],
        subcategories: [],
      };
    });

    subcategories.forEach((s) => {
      subcategoryMap[String(s._id)] = {
        id: s._id,
        name: s.name,
        categoryId: String(s.categoryId),
        items: [],
      };
    });

    /* ================= 4. ATTACH ITEMS ================= */
    for (const branch of branchItems) {
      const master = masterMap[String(branch.masterItemId)];
      if (!master) continue;

      const item = {
        id: branch._id,
        name: branch.name,
        description: branch.description,
        price: branch.price,
        image: master.image || "",
        isVeg: master.isVeg,
        available: !branch.trackStock || (branch.stock ?? 1) > 0,
      };

      const categoryId = String(master.categoryId);
      const subcategoryId = master.subcategoryId
        ? String(master.subcategoryId)
        : null;

      // ✅ Attach to category
      if (categoryMap[categoryId]) {
        categoryMap[categoryId].items.push(item);
      }

      // ✅ Attach to subcategory
      if (subcategoryId && subcategoryMap[subcategoryId]) {
        subcategoryMap[subcategoryId].items.push(item);
      }
    }

    /* ================= 5. NEST SUBCATEGORIES ================= */
    Object.values(subcategoryMap).forEach((sub) => {
      if (categoryMap[sub.categoryId] && sub.items.length) {
        categoryMap[sub.categoryId].subcategories.push(sub);
      }
    });

    /* ================= 6. CLEAN RESPONSE ================= */
    const finalMenu = Object.values(categoryMap).filter(
      (c) => c.items.length || c.subcategories.length,
    );

    return res.json({ success: true, data: finalMenu });
  } catch (err) {
    console.error("getCustomerMenuController:", err);
    res.status(500).json({ success: false });
  }
}

/* ======================================================
   PUBLIC: MENU BY TABLE (QR FLOW)
====================================================== */
export async function getCustomerMenuByTableController(req, res) {
  try {
    const table = await Table.findById(req.params.tableId)
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
    res.status(500).json({ success: false });
  }
}
