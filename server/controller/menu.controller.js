import mongoose from "mongoose";
import BranchMenuItem from "../models/branchMenuItem.model.js";
import MasterMenuItem from "../models/masterMenuItem.model.js";
import AuditLog from "../models/auditLog.model.js";
import Stock from "../models/stock.model.js";
import { emitMenuUpdate } from "../socket/emitter.js";

/* =========================================================
   1️⃣ IMPORT MASTER MENU → BRANCH
   ========================================================= */
export async function importMasterMenu(req, res) {
  try {
    const manager = req.user;
    const { restaurantId } = req.params;
    const { importAll = false, masterItemIds = [] } = req.body || {};

    if (String(manager.restaurantId) !== String(restaurantId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    let masterItems = [];

    if (importAll) {
      masterItems = await MasterMenuItem.find({
        brandId: manager.brandId,
        isArchived: false,
      })
        .select(
          "_id name description basePrice defaultStation taxPercent version categoryId subcategoryId isVeg image",
        )
        .lean();
    } else {
      if (!Array.isArray(masterItemIds) || !masterItemIds.length) {
        return res.status(400).json({ message: "masterItemIds required" });
      }

      masterItems = await MasterMenuItem.find({
        _id: { $in: masterItemIds },
        brandId: manager.brandId,
        isArchived: false,
      }).lean();
    }

    if (!masterItems.length) {
      return res.json({ success: true, importedCount: 0 });
    }

    const ops = masterItems.map((m) => ({
      updateOne: {
        filter: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          masterItemId: new mongoose.Types.ObjectId(m._id),
        },
        update: {
          $setOnInsert: {
            restaurantId: new mongoose.Types.ObjectId(restaurantId),
            masterItemId: new mongoose.Types.ObjectId(m._id),

            categoryId: m.categoryId,
            subcategoryId: m.subcategoryId,

            name: m.name,
            description: m.description || "",
            price: m.basePrice,
            station: m.defaultStation || null,
            taxPercent: m.taxPercent || 0,
            status: "ON",

            trackStock: true,
            autoHideWhenZero: true,
            stock: null,

            lastMasterVersion: m.version ?? 1,
            masterSnapshot: {
              name: m.name,
              basePrice: m.basePrice,
              defaultStation: m.defaultStation,
            },
          },
        },
        upsert: true,
      },
    }));
    await BranchMenuItem.bulkWrite(ops, { ordered: false });

    res.json({
      success: true,
      importedCount: ops.length,
    });
  } catch (err) {
    console.error("importMasterMenu:", err);
    res.status(500).json({ message: "Import failed" });
  }
}
/* =========================================================
   2️⃣ LIST BRANCH MENU (FLAT)
   ========================================================= */
export async function listBranchMenu(req, res) {
  try {
    const manager = req.user;
    const { restaurantId } = req.params;

    if (String(manager.restaurantId) !== String(restaurantId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const items = await BranchMenuItem.find({
      restaurantId,
      isArchived: false,
    })
      .populate("masterItemId", "isVeg image images categoryId subcategoryId")
      .populate("kitchenStationId", "name displayName badge")
      .sort({ name: 1 })
      .lean();

    // Fetch stock data for all items
    const stocks = await Stock.find({
      restaurantId,
      branchMenuItemId: { $in: items.map((i) => i._id) },
    }).lean();

    // Create a map of itemId -> stockQty
    const stockMap = new Map();
    stocks.forEach((s) => {
      stockMap.set(s.branchMenuItemId.toString(), s.stockQty);
    });

    // Attach stockQty to each item
    const itemsWithStock = items.map((item) => ({
      ...item,
      stockQty: stockMap.get(item._id.toString()) ?? null,
    }));

    res.json({ success: true, data: itemsWithStock });
  } catch (err) {
    console.error("listBranchMenu:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* =========================================================
   3️⃣ LIST BRANCH MENU GROUPED (CATEGORY → SUBCATEGORY)
   ========================================================= */
export async function listBranchMenuGrouped(req, res) {
  try {
    const manager = req.user;
    const { restaurantId } = req.params;

    if (String(manager.restaurantId) !== String(restaurantId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const items = await BranchMenuItem.find({
      restaurantId,
      isArchived: false,
    })
      .populate({
        path: "masterItemId",
        select: "categoryId subcategoryId isVeg image images",
      })
      .populate("kitchenStationId", "name displayName badge")
      .lean();

    // Fetch stock data for all items
    const stocks = await Stock.find({
      restaurantId,
      branchMenuItemId: { $in: items.map((i) => i._id) },
    }).lean();

    // Create a map of itemId -> stockQty
    const stockMap = new Map();
    stocks.forEach((s) => {
      stockMap.set(s.branchMenuItemId.toString(), s.stockQty);
    });

    const tree = {};

    for (const item of items) {
      const master = item.masterItemId;
      if (!master?.categoryId) continue;

      const catId = master.categoryId.toString();
      const subId = master.subcategoryId?.toString() || "all";

      if (!tree[catId]) {
        tree[catId] = {
          categoryId: catId,
          subcategories: {},
        };
      }

      if (!tree[catId].subcategories[subId]) {
        tree[catId].subcategories[subId] = {
          subcategoryId: subId,
          items: [],
        };
      }

      tree[catId].subcategories[subId].items.push({
        ...item,
        isVeg: master.isVeg,
        image: master.image,
        images: master.images,
        stockQty: stockMap.get(item._id.toString()) ?? null,
      });
    }

    res.json({
      success: true,
      data: tree,
    });
  } catch (err) {
    console.error("listBranchMenuGrouped:", err);
    res.status(500).json({ message: "Server error" });
  }
}
/* =========================================================
   4️⃣ UPDATE SINGLE BRANCH ITEM
   ========================================================= */
export async function updateBranchMenuItem(req, res) {
  try {
    const { restaurantId, itemId } = req.params;
    const updates = req.body || {};

    const allowedFields = [
      "name",
      "description",
      "price",
      "station",
      "kitchenStationId",
      "status",
      "trackStock",
      "autoHideWhenZero",
    ];

    const safeUpdate = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) safeUpdate[key] = updates[key];
    }

    const item = await BranchMenuItem.findOneAndUpdate(
      { _id: itemId, restaurantId },
      { $set: safeUpdate },
      { new: true },
    ).populate("kitchenStationId", "name displayName badge");

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // 📢 Emit menu update to customers viewing this restaurant's menu
    emitMenuUpdate(restaurantId, {
      type: "item_updated",
      itemId: item._id,
      name: item.name,
    });

    res.json({ success: true, data: item });
  } catch (err) {
    console.error("updateBranchMenuItem:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* =========================================================
   5️⃣ BULK TOGGLE ON / OFF
   ========================================================= */
export async function bulkToggleBranchMenu(req, res) {
  try {
    const { restaurantId } = req.params;
    const { itemIds = [], action } = req.body || {};

    if (!Array.isArray(itemIds) || !itemIds.length) {
      return res.status(400).json({ message: "itemIds required" });
    }

    if (!["ON", "OFF"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    await BranchMenuItem.updateMany(
      { restaurantId, _id: { $in: itemIds } },
      { $set: { status: action } },
    );

    // 📢 Emit menu update to customers
    emitMenuUpdate(restaurantId, {
      type: "items_toggled",
      action: action,
      itemCount: itemIds.length,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("bulkToggleBranchMenu:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* =========================================================
   6️⃣ UPDATE STOCK (REAL WORLD SAFE)
   ========================================================= */

export async function updateBranchStock(req, res) {
  try {
    const { restaurantId, itemId } = req.params;
    const { stockQty } = req.body;

    // ✅ allow null (unlimited)
    if (stockQty !== null && (typeof stockQty !== "number" || stockQty < 0)) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a number ≥ 0 or null",
      });
    }

    const item = await BranchMenuItem.findOne({
      _id: itemId,
      restaurantId,
      isArchived: false,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    // ✅ upsert stock
    const stock = await Stock.findOneAndUpdate(
      { restaurantId, branchMenuItemId: itemId },
      {
        $set: {
          stockQty,
          lastAdjustedAt: new Date(),
          lastAdjustedBy: req.user._id,
        },
      },
      { upsert: true, new: true },
    );

    // ✅ sync menu behavior
    item.trackStock = stockQty !== null;
    await item.save();

    res.json({
      success: true,
      data: stock,
    });
  } catch (err) {
    console.error("updateBranchStock:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

/* =========================================================
   7️⃣ SYNC WITH MASTER MENU (FIXED)
   ========================================================= */

/**
 * ---------------------------------------------------
 * SYNC BRANCH MENU WITH MASTER MENU (SAFE)
 * ---------------------------------------------------
 * POST /api/branch-menu/:restaurantId/sync-with-master
 * Body: { overwrite?: boolean }
 */
export async function syncBranchWithMaster(req, res) {
  try {
    const manager = req.user;
    const { restaurantId } = req.params;
    const { overwrite = false } = req.body;

    // 🔐 SECURITY CHECK
    if (String(manager.restaurantId) !== String(restaurantId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // 1️⃣ Load all branch items
    const branchItems = await BranchMenuItem.find({
      restaurantId,
      isArchived: false,
    });

    if (!branchItems.length) {
      return res.json({ success: true, updatedCount: 0 });
    }

    // 2️⃣ Load all related master items in ONE query
    const masterIds = branchItems.map((i) => i.masterItemId);
    const masters = await MasterMenuItem.find({
      _id: { $in: masterIds },
      isArchived: false,
    }).lean();

    const masterMap = new Map(masters.map((m) => [String(m._id), m]));

    let updatedCount = 0;

    // 3️⃣ Sync safely
    for (const item of branchItems) {
      const master = masterMap.get(String(item.masterItemId));
      if (!master) continue;

      const lastVersion = item.lastMasterVersion ?? 0;
      const masterVersion = master.version ?? 1;

      if (overwrite || lastVersion < masterVersion) {
        // snapshot (ALWAYS update snapshot)
        item.masterSnapshot = {
          name: master.name,
          basePrice: master.basePrice,
          defaultStation: master.defaultStation,
        };

        item.lastMasterVersion = masterVersion;

        // overwrite only if requested
        if (overwrite) {
          item.name = master.name;
          item.price = master.basePrice;
          item.station = master.defaultStation;
        }

        await item.save();
        updatedCount++;
      }
    }

    return res.json({
      success: true,
      updatedCount,
    });
  } catch (err) {
    console.error("syncBranchWithMaster ERROR:", err);
    res.status(500).json({
      message: "Failed to sync with master menu",
    });
  }
}
