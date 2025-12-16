import mongoose from "mongoose";
import BranchMenuItem from "../models/branchMenuItem.model.js";
import MasterMenuItem from "../models/masterMenuItem.model.js";
import AuditLog from "../models/auditLog.model.js";

/**
 * ---------------------------------------------------
 * 1️⃣ IMPORT MASTER MENU → BRANCH
 * ---------------------------------------------------
 * POST /manager/branch-menu/:restaurantId/import
 * Body:
 *  {
 *    importAll?: boolean,
 *    masterItemIds?: []
 *  }
 */
export async function importMasterMenu(req, res) {
  try {
    const manager = req.user;
    const { restaurantId } = req.params;
    const { importAll = false, masterItemIds = [] } = req.body;

    if (String(manager.restaurantId) !== String(restaurantId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    let masterItems = [];

    if (importAll) {
      masterItems = await MasterMenuItem.find({
        brandId: manager.brandId,
        isArchived: false,
      }).lean();
    } else {
      if (!Array.isArray(masterItemIds) || masterItemIds.length === 0) {
        return res.status(400).json({
          message: "importAll or masterItemIds required",
        });
      }

      masterItems = await MasterMenuItem.find({
        _id: { $in: masterItemIds },
        brandId: manager.brandId,
        isArchived: false,
      }).lean();
    }

    const bulkOps = masterItems.map((m) => ({
      updateOne: {
        filter: { restaurantId, masterItemId: m._id },
        update: {
          $setOnInsert: {
            restaurantId,
            masterItemId: m._id,
            name: m.name,
            description: m.description || "",
            price: m.basePrice,
            station: m.defaultStation || null,
            taxPercent: m.taxPercent || 0,
            status: "ON",
            trackStock: true,
            autoHideWhenZero: true,
            lastMasterVersion: m.version || 1,
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

    if (bulkOps.length > 0) {
      await BranchMenuItem.bulkWrite(bulkOps);
    }

    return res.json({
      success: true,
      importedCount: bulkOps.length,
    });
  } catch (err) {
    console.error("importMasterMenu:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * ---------------------------------------------------
 * 2️⃣ LIST BRANCH MENU (FLAT – MANAGER PANEL)
 * ---------------------------------------------------
 * GET /manager/branch-menu/:restaurantId
 */
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
      .populate("masterItemId", "isVeg image categoryId subcategoryId")
      .sort({ name: 1 })
      .lean();

    return res.json({
      success: true,
      data: items,
    });
  } catch (err) {
    console.error("listBranchMenu:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * ---------------------------------------------------
 * 3️⃣ LIST BRANCH MENU GROUPED (CATEGORY → SUBCATEGORY)
 * ---------------------------------------------------
 * GET /manager/branch-menu/:restaurantId/grouped
 * Query: ?isVeg=true|false
 */
export async function listBranchMenuGrouped(req, res) {
  try {
    const { restaurantId } = req.params;
    const { isVeg } = req.query;

    const filter = {
      restaurantId,
      isArchived: false,
    };

    const items = await BranchMenuItem.find(filter)
      .populate("masterItemId", "categoryId subcategoryId isVeg image")
      .lean();

    const grouped = {};

    for (const item of items) {
      const master = item.masterItemId;
      if (!master) continue;

      if (isVeg !== undefined && master.isVeg !== (isVeg === "true")) {
        continue;
      }

      const categoryId = master.categoryId?.toString();
      const subcategoryId = master.subcategoryId?.toString() || "uncategorized";

      if (!grouped[categoryId]) grouped[categoryId] = {};
      if (!grouped[categoryId][subcategoryId])
        grouped[categoryId][subcategoryId] = [];

      grouped[categoryId][subcategoryId].push(item);
    }

    res.json({
      success: true,
      data: grouped,
    });
  } catch (err) {
    console.error("listBranchMenuGrouped:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * ---------------------------------------------------
 * 4️⃣ UPDATE SINGLE BRANCH MENU ITEM
 * ---------------------------------------------------
 * PATCH /manager/branch-menu/:restaurantId/item/:itemId
 */
export async function updateBranchMenuItem(req, res) {
  try {
    const { restaurantId, itemId } = req.params;
    const updates = req.body;

    const allowedFields = [
      "name",
      "description",
      "price",
      "station",
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
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (err) {
    console.error("updateBranchMenuItem:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * ---------------------------------------------------
 * 5️⃣ BULK TOGGLE (ON / OFF)
 * ---------------------------------------------------
 * POST /manager/branch-menu/:restaurantId/bulk-toggle
 * Body: { itemIds: [], action: "ON" | "OFF" }
 */
export async function bulkToggleBranchMenu(req, res) {
  try {
    const { restaurantId } = req.params;
    const { itemIds = [], action } = req.body;

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ message: "itemIds required" });
    }

    if (!["ON", "OFF"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    await BranchMenuItem.updateMany(
      { restaurantId, _id: { $in: itemIds } },
      { $set: { status: action } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("bulkToggleBranchMenu:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * ---------------------------------------------------
 * 6️⃣ UPDATE STOCK (IMPORTANT)
 * ---------------------------------------------------
 * PATCH /manager/branch-menu/:restaurantId/item/:itemId/stock
 * Body: { stock: number }
 */
export async function updateBranchStock(req, res) {
  try {
    const { restaurantId, itemId } = req.params;
    const { stock } = req.body;

    if (stock < 0) {
      return res.status(400).json({ message: "Invalid stock" });
    }

    const item = await BranchMenuItem.findOneAndUpdate(
      { _id: itemId, restaurantId },
      { stock },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (err) {
    console.error("updateBranchStock:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * ---------------------------------------------------
 * 7️⃣ SYNC WITH MASTER MENU
 * ---------------------------------------------------
 * POST /manager/branch-menu/:restaurantId/sync-with-master
 * Body: { overwrite?: boolean }
 */
export async function syncBranchWithMaster(req, res) {
  try {
    const { restaurantId } = req.params;
    const { overwrite = false } = req.body;

    const branchItems = await BranchMenuItem.find({ restaurantId });

    let updatedCount = 0;

    for (const item of branchItems) {
      const master = await MasterMenuItem.findById(item.masterItemId);
      if (!master) continue;

      if (overwrite || item.lastMasterVersion < master.version) {
        item.masterSnapshot = {
          name: master.name,
          basePrice: master.basePrice,
          defaultStation: master.defaultStation,
        };
        item.lastMasterVersion = master.version;

        if (overwrite) {
          item.name = master.name;
          item.price = master.basePrice;
          item.station = master.defaultStation;
        }

        await item.save();
        updatedCount++;
      }
    }

    res.json({
      success: true,
      updatedCount,
    });
  } catch (err) {
    console.error("syncBranchWithMaster:", err);
    res.status(500).json({ message: "Server error" });
  }
}
