// src/controllers/menu.controller.js
import MasterMenuItemModel from "../models/masterMenuItem.model.js";
import BranchMenuItemModel from "../models/branchMenuItem.model.js";
import StockModel from "../models/stock.model.js";
import AuditLog from "../models/auditLog.model.js"; // optional
import mongoose from "mongoose";
import MenuCategory from "../models/menuCategory.model.js";
import MenuSubcategory from "../models/menuSubcategory.model.js";
import MasterMenuItem from "../models/masterMenuItem.model.js";
/**
 * importMasterMenuController
 * POST /manager/branch-menu/:restaurantId/import
 * Body: { importAll?: boolean, masterItemIds?: [] }
 *
 * - Copies master items into BranchMenuItem if not already present.
 * - Does not overwrite manager overrides (unless you choose to).
 */
export async function importMasterMenuController(req, res) {
  try {
    const manager = req.user;
    const { restaurantId } = req.params;
    if (String(manager.restaurantId) !== String(restaurantId))
      return res
        .status(403)
        .json({ message: "Forbidden", error: true, success: false });

    console.log("req.body", req.body);
    const { importAll = false, masterItemIds = [] } = req.body;

    let masters;
    if (importAll) {
      masters = await MasterMenuItemModel.find({
        brandId: manager.brandId,
        isArchived: false,
      }).lean();
    } else {
      if (!Array.isArray(masterItemIds) || masterItemIds.length === 0)
        return res.status(400).json({
          message: "masterItemIds or importAll required",
          error: true,
          success: false,
        });
      masters = await MasterMenuItemModel.find({
        _id: { $in: masterItemIds },
        brandId: manager.brandId,
      }).lean();
    }

    const created = [];
    const skipped = [];
    for (const m of masters) {
      const exists = await BranchMenuItemModel.findOne({
        restaurantId,
        masterItemId: m._id,
      }).lean();
      if (exists) {
        skipped.push(m._id);
        continue;
      }

      const doc = {
        restaurantId,
        masterItemId: m._id,
        name: m.name,
        description: m.description || "",
        price: m.basePrice || 0,
        station: m.defaultStation || null,
        taxPercent: m.taxPercent || 0,
        status: "ON", // default to ON when imported
        trackStock: true,
        autoHideWhenZero: true,
        lastMasterVersion: m.version || 1,
        masterSnapshot: {
          name: m.name,
          description: m.description || "",
          basePrice: m.basePrice || 0,
          defaultStation: m.defaultStation || null,
        },
      };
      const b = await BranchMenuItemModel.create(doc);
      created.push(b._id);
    }

    try {
      await AuditLog.create({
        actorType: "USER",
        actorId: String(manager._id),
        action: "IMPORT_MASTER_MENU",
        entityType: "Restaurant",
        entityId: restaurantId,
        meta: { createdCount: created.length, skippedCount: skipped.length },
      });
    } catch (e) {}

    return res.json({
      message: "import complete",
      error: false,
      success: true,
      data: {
        createdCount: created.length,
        skippedCount: skipped.length,
        created,
        skipped,
      },
    });
  } catch (err) {
    console.error("importMasterMenuController err:", err);
    return res
      .status(500)
      .json({ message: "server error", error: true, success: false });
  }
}

/**
 * upsertBranchMenuItemController
 * POST /manager/branch-menu/:restaurantId
 * Body: { masterItemId, name?, price?, station?, status?, trackStock?, autoHideWhenZero? }
 *
 * If branch record exists, updates fields; otherwise creates a new branch override.
 */
export async function upsertBranchMenuItemController(req, res) {
  try {
    const manager = req.user;
    const { restaurantId } = req.params;
    if (String(manager.restaurantId) !== String(restaurantId))
      return res
        .status(403)
        .json({ message: "Forbidden", error: true, success: false });

    const {
      masterItemId,
      name,
      price,
      station,
      status,
      trackStock,
      autoHideWhenZero,
      description,
    } = req.body;
    if (!masterItemId)
      return res.status(400).json({
        message: "masterItemId required",
        error: true,
        success: false,
      });

    const master = await MasterMenuItemModel.findById(masterItemId).lean();
    if (!master)
      return res.status(404).json({
        message: "Master item not found",
        error: true,
        success: false,
      });

    let branchItem = await BranchMenuItemModel.findOne({
      restaurantId,
      masterItemId,
    });
    if (!branchItem) {
      const createDoc = {
        restaurantId,
        masterItemId,
        name: name || master.name,
        description: description || master.description || "",
        price: typeof price === "number" ? price : master.basePrice || 0,
        station: station || master.defaultStation || null,
        taxPercent: master.taxPercent || 0,
        status: status || "ON",
        trackStock: typeof trackStock === "boolean" ? trackStock : true,
        autoHideWhenZero:
          typeof autoHideWhenZero === "boolean" ? autoHideWhenZero : true,
        lastMasterVersion: master.version || 1,
        masterSnapshot: {
          name: master.name,
          description: master.description || "",
          basePrice: master.basePrice || 0,
          defaultStation: master.defaultStation || null,
        },
      };
      branchItem = await BranchMenuItemModel.create(createDoc);
      try {
        await AuditLog.create({
          actorType: "USER",
          actorId: String(manager._id),
          action: "CREATE_BRANCH_MENU_ITEM",
          entityType: "BranchMenuItem",
          entityId: String(branchItem._id),
        });
      } catch (e) {}
      return res.status(201).json({
        message: "Branch menu item created",
        error: false,
        success: true,
        data: branchItem,
      });
    }

    // update allowed fields
    if (name) branchItem.name = name;
    if (description) branchItem.description = description;
    if (typeof price === "number") branchItem.price = price;
    if (station) branchItem.station = station;
    if (status) branchItem.status = status;
    if (typeof trackStock === "boolean") branchItem.trackStock = trackStock;
    if (typeof autoHideWhenZero === "boolean")
      branchItem.autoHideWhenZero = autoHideWhenZero;

    branchItem.meta = branchItem.meta || {};
    branchItem.meta.lastManagerEditedAt = new Date();
    await branchItem.save();

    try {
      await AuditLog.create({
        actorType: "USER",
        actorId: String(manager._id),
        action: "UPDATE_BRANCH_MENU_ITEM",
        entityType: "BranchMenuItem",
        entityId: String(branchItem._id),
      });
    } catch (e) {}

    return res.json({
      message: "Branch menu item updated",
      error: false,
      success: true,
      data: branchItem,
    });
  } catch (err) {
    console.error("upsertBranchMenuItemController err:", err);
    return res
      .status(500)
      .json({ message: "server error", error: true, success: false });
  }
}

/**
 * listBranchMenuController
 * GET /manager/branch-menu/:restaurantId
 * Query: ?search=&categoryId=&station=&status=&limit=&page=
 * Returns branch menu items joined with master snapshot
 */
export async function listBranchMenuController(req, res) {
  try {
    const manager = req.user;
    const { restaurantId } = req.params;
    if (String(manager.restaurantId) !== String(restaurantId))
      return res
        .status(403)
        .json({ message: "Forbidden", error: true, success: false });

    const { search, station, status, limit = 50, page = 1 } = req.query;
    const filter = { restaurantId: new mongoose.Types.ObjectId(restaurantId) };
    if (station) filter.station = station;
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await BranchMenuItemModel.countDocuments(filter);
    const items = await BranchMenuItemModel.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // enrich with current stock (if tracked)
    const branchMenuIds = items.map((i) => i._id);
    const stockDocs = await StockModel.find({
      restaurantId,
      branchMenuItemId: { $in: branchMenuIds },
    }).lean();
    const stockMap = stockDocs.reduce((acc, s) => {
      acc[String(s.branchMenuItemId)] = s;
      return acc;
    }, {});

    const result = items.map((i) => {
      const stock = stockMap[String(i._id)] || null;
      return { ...i, stock };
    });

    return res.json({
      message: "branch menu",
      error: false,
      success: true,
      data: { total, page: Number(page), limit: Number(limit), items: result },
    });
  } catch (err) {
    console.error("listBranchMenuController err:", err);
    return res
      .status(500)
      .json({ message: "server error", error: true, success: false });
  }
}

/**
 * toggleBranchMenuItemsController
 * POST /manager/branch-menu/:restaurantId/bulk-toggle
 * Body: { itemIds: [], action: 'ON'|'OFF' }
 * Useful to disable many items quickly.
 */
export async function toggleBranchMenuItemsController(req, res) {
  try {
    const manager = req.user;
    const { restaurantId } = req.params;
    const { itemIds = [], action } = req.body;
    if (!Array.isArray(itemIds) || itemIds.length === 0)
      return res
        .status(400)
        .json({ message: "itemIds required", error: true, success: false });
    if (!["ON", "OFF"].includes(action))
      return res.status(400).json({
        message: "action must be ON or OFF",
        error: true,
        success: false,
      });
    if (String(manager.restaurantId) !== String(restaurantId))
      return res
        .status(403)
        .json({ message: "Forbidden", error: true, success: false });

    const resUpdate = await BranchMenuItemModel.updateMany(
      { restaurantId, _id: { $in: itemIds } },
      { status: action }
    );
    try {
      await AuditLog.create({
        actorType: "USER",
        actorId: String(manager._id),
        action: "BULK_TOGGLE_BRANCH_MENU",
        entityType: "BranchMenuItem",
        entityId: restaurantId,
        meta: { itemCount: itemIds.length, action },
      });
    } catch (e) {}
    return res.json({
      message: "updated",
      error: false,
      success: true,
      data: resUpdate,
    });
  } catch (err) {
    console.error("toggleBranchMenuItemsController err:", err);
    return res
      .status(500)
      .json({ message: "server error", error: true, success: false });
  }
}

/**
 * syncWithMasterController
 * POST /manager/branch-menu/:restaurantId/sync-with-master
 * Body: { overwrite?: boolean } - if overwrite true, update branch items' name/price/station to match master
 */
export async function syncWithMasterController(req, res) {
  try {
    const manager = req.user;
    const { restaurantId } = req.params;
    const { overwrite = false } = req.body;
    if (String(manager.restaurantId) !== String(restaurantId))
      return res
        .status(403)
        .json({ message: "Forbidden", error: true, success: false });

    const branchItems = await BranchMenuItemModel.find({ restaurantId }).lean();
    let updatedCount = 0;
    for (const b of branchItems) {
      const master = await MasterMenuItemModel.findById(b.masterItemId).lean();
      if (!master) continue;
      // if overwrite or master version changed -> update snapshot/fields
      const masterVersion = master.version || 1;
      if (overwrite || (b.lastMasterVersion || 0) < masterVersion) {
        const update = {
          lastMasterVersion: masterVersion,
          masterSnapshot: {
            name: master.name,
            description: master.description || "",
            basePrice: master.basePrice || 0,
            defaultStation: master.defaultStation || null,
          },
        };
        if (overwrite) {
          update.name = master.name;
          update.price = master.basePrice || 0;
          update.station = master.defaultStation || null;
        }
        await BranchMenuItemModel.findByIdAndUpdate(b._id, update).catch(
          () => {}
        );
        updatedCount++;
      }
    }

    try {
      await AuditLog.create({
        actorType: "USER",
        actorId: String(manager._id),
        action: "SYNC_WITH_MASTER",
        entityType: "Restaurant",
        entityId: restaurantId,
        meta: { updatedCount },
      });
    } catch (e) {}

    return res.json({
      message: "sync complete",
      error: false,
      success: true,
      data: { updatedCount },
    });
  } catch (err) {
    console.error("syncWithMasterController err:", err);
    return res
      .status(500)
      .json({ message: "server error", error: true, success: false });
  }
}

// export async function createCategory(req, res) {
//   const { name, order } = req.body;
//   const brandId = req.user.brandId;

//   if (!name) {
//     return res.status(400).json({ message: "Category name required" });
//   }

//   const category = await MenuCategory.create({
//     brandId,
//     name,
//     order,
//   });

//   res.status(201).json({ success: true, data: category });
// }

// export async function createSubcategory(req, res) {
//   const { categoryId, name, order } = req.body;
//   const brandId = req.user.brandId;

//   if (!categoryId || !name) {
//     return res.status(400).json({ message: "Missing fields" });
//   }

//   const subcategory = await MenuSubcategory.create({
//     brandId,
//     categoryId,
//     name,
//     order,
//   });

//   res.status(201).json({ success: true, data: subcategory });
// }

// export async function createMasterItem(req, res) {
//   const {
//     categoryId,
//     subcategoryId,
//     name,
//     description,
//     isVeg,
//     basePrice,
//     defaultStation,
//     image,
//   } = req.body;

//   const brandId = req.user.brandId;

//   if (!categoryId || !name || basePrice === undefined || isVeg === undefined) {
//     return res.status(400).json({ message: "Missing required fields" });
//   }

//   const item = await MasterMenuItem.create({
//     brandId,
//     categoryId,
//     subcategoryId,
//     name,
//     description,
//     isVeg,
//     basePrice,
//     defaultStation,
//     image,
//   });

//   res.status(201).json({ success: true, data: item });
// }

// export async function getMasterMenu(req, res) {
//   const brandId = req.user.brandId;
//   const { isVeg } = req.query;

//   const filter = {
//     brandId,
//     isArchived: false,
//   };

//   if (isVeg !== undefined) {
//     filter.isVeg = isVeg === "true";
//   }

//   const items = await MasterMenuItem.find(filter)
//     .populate("categoryId", "name")
//     .populate("subcategoryId", "name")
//     .sort({ createdAt: 1 });

//   res.json({ success: true, data: items });
// }
