import BranchMenuItem from "../models/branchMenuItem.model.js";
import MasterMenuItem from "../models/masterMenuItem.model.js";
import MenuCategory from "../models/menuCategory.model.js";
import MenuSubcategory from "../models/menuSubCategory.model.js";

/**
 * PUBLIC CUSTOMER MENU
 * GET /api/customer/menu/:restaurantId?veg=true|false
 */
export async function getCustomerMenuController(req, res) {
  try {
    const { restaurantId } = req.params;
    const { veg } = req.query;

    /* ----------------------------------
       1️⃣ Load ACTIVE branch menu items
    ----------------------------------- */
    const branchItems = await BranchMenuItem.find({
      restaurantId,
      status: "ON",
      isArchived: false,
    }).lean();

    if (branchItems.length === 0) {
      return res.json({
        success: true,
        error: false,
        data: [],
      });
    }

    /* ----------------------------------
       2️⃣ Load master items (with veg filter)
    ----------------------------------- */
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

    /* ----------------------------------
       3️⃣ Load categories & subcategories
    ----------------------------------- */
    const categories = await MenuCategory.find({
      isArchived: false,
    }).sort({ order: 1 });

    const subcategories = await MenuSubcategory.find({
      isArchived: false,
    });

    const categoryMap = {};
    const subcategoryMap = {};

    categories.forEach((c) => {
      categoryMap[c._id] = {
        id: c._id,
        name: c.name,
        items: [],
        subcategories: [],
      };
    });

    subcategories.forEach((s) => {
      subcategoryMap[s._id] = {
        id: s._id,
        name: s.name,
        items: [],
        categoryId: s.categoryId,
      };
    });

    /* ----------------------------------
       4️⃣ Attach items correctly
       ✅ WITH subcategory
       ✅ WITHOUT subcategory
    ----------------------------------- */
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
        dietaryInfo: master.dietaryInfo || [],
        available: !branch.trackStock || (branch.stock ?? 1) > 0,
      };

      // 🟢 With subcategory
      if (master.subcategoryId && subcategoryMap[master.subcategoryId]) {
        subcategoryMap[master.subcategoryId].items.push(item);
      }
      // 🟢 Without subcategory → directly under category
      else if (categoryMap[master.categoryId]) {
        categoryMap[master.categoryId].items.push(item);
      }
    }

    /* ----------------------------------
       5️⃣ Attach subcategories to categories
    ----------------------------------- */
    Object.values(subcategoryMap).forEach((sub) => {
      if (categoryMap[sub.categoryId] && sub.items.length > 0) {
        categoryMap[sub.categoryId].subcategories.push(sub);
      }
    });

    /* ----------------------------------
       6️⃣ Final response (cleaned)
    ----------------------------------- */
    const finalMenu = Object.values(categoryMap).filter(
      (cat) => cat.items.length > 0 || cat.subcategories.length > 0
    );

    return res.json({
      success: true,
      error: false,
      data: finalMenu,
    });
  } catch (err) {
    console.error("getCustomerMenuController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}
