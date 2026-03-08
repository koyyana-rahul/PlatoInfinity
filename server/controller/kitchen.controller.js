import Order from "../models/order.model.js";
import {
  emitKitchenEvent,
  emitOrderItemStatusUpdate,
} from "../socket/emitter.js";

export async function listKitchenOrders(req, res) {
  try {
    const { restaurantId } = req.params;
    const { stationFilter, stationId } = req.query;
    const chefStation = req.user?.station; // Chef's assigned station from JWT
    const chefStationId = req.user?.kitchenStationId; // Chef's assigned station ID from JWT

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "restaurantId required",
      });
    }

    // Use chef's assigned station ID, or query param if provided
    const filterStationId = stationId || chefStationId;
    const filterStation = stationFilter || chefStation;

    if (!filterStationId && !filterStation) {
      return res.status(400).json({
        success: false,
        message:
          "No station assigned. Contact manager to assign a kitchen station.",
      });
    }

    // Build match criteria for orders
    const matchCriteria = {
      restaurantId,
      orderStatus: { $ne: "SERVED" },
    };

    // Build filter condition based on what's available
    let itemFilterCond;
    if (filterStationId) {
      // Filter by kitchenStationId (ObjectId)
      itemFilterCond = {
        $and: [
          {
            $eq: ["$$item.kitchenStationId", { $toObjectId: filterStationId }],
          },
          { $ne: ["$$item.itemStatus", "SERVED"] },
        ],
      };
    } else if (filterStation) {
      // Fallback: filter by station name (string)
      itemFilterCond = {
        $and: [
          { $eq: ["$$item.station", filterStation] },
          { $ne: ["$$item.itemStatus", "SERVED"] },
        ],
      };
    }

    const orders = await Order.aggregate([
      {
        $match: matchCriteria,
      },
      {
        $project: {
          _id: 1,
          orderId: "$_id",
          tableId: 1,
          tableName: 1,
          orderNumber: 1,
          createdAt: 1,
          sessionId: 1,
          // Only include items for this chef's station
          items: {
            $filter: {
              input: "$items",
              as: "item",
              cond: itemFilterCond,
            },
          },
        },
      },
      { $match: { "items.0": { $exists: true } } }, // Only orders with matching items
      { $sort: { createdAt: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        orders: orders,
        station: filterStation,
        stationId: filterStationId,
      },
    });
  } catch (err) {
    console.error("listKitchenOrders:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function updateKitchenItemStatus(req, res) {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;
    const chefId = req.user._id;

    const normalizedStatus = status === "PREPARING" ? "IN_PROGRESS" : status;

    if (!["IN_PROGRESS", "READY", "SERVED"].includes(normalizedStatus)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const update = {
      "items.$.itemStatus": normalizedStatus,
      "items.$.chefId": req.user._id,
      "items.$.updatedAt": new Date(),
    };

    if (normalizedStatus === "IN_PROGRESS")
      update["items.$.claimedAt"] = new Date();
    if (normalizedStatus === "READY") update["items.$.readyAt"] = new Date();
    if (normalizedStatus === "SERVED") update["items.$.servedAt"] = new Date();

    const order = await Order.findOneAndUpdate(
      { _id: orderId, "items._id": itemId },
      { $set: update },
      { new: true },
    );

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });

    const item = order.items.find((i) => i._id.toString() === itemId);
    const itemIndex = order.items.findIndex((i) => i._id.toString() === itemId);

    const totalItems = order.items.length;
    const readyCount = order.items.filter(
      (i) => i.itemStatus === "READY",
    ).length;
    const servedCount = order.items.filter(
      (i) => i.itemStatus === "SERVED",
    ).length;
    const inProgressCount = order.items.filter(
      (i) => i.itemStatus === "IN_PROGRESS",
    ).length;
    const newCount = order.items.filter((i) => i.itemStatus === "NEW").length;

    let orderStatus = "NEW";
    if (servedCount === totalItems && totalItems > 0) orderStatus = "SERVED";
    else if (inProgressCount > 0) orderStatus = "IN_PROGRESS";
    else if (readyCount > 0) orderStatus = "READY";

    // 🔥 REAL-TIME SOCKET EVENTS TO ALL ROLES
    await emitOrderItemStatusUpdate({
      orderId: String(order._id),
      restaurantId: String(order.restaurantId),
      sessionId: String(order.sessionId),
      tableId: String(order.tableId),
      tableName: order.tableName || "Unknown",
      itemId: String(itemId),
      itemIndex,
      itemName: item.name,
      itemStatus: normalizedStatus,
      chefId: String(req.user._id),
      chefName: req.user.name || "Chef",
      orderStatus,
      totalItems,
      readyCount,
      servedCount,
      inProgressCount,
      newCount,
      updatedAt: new Date(),
    });

    // ✅ AUTO CLOSE ORDER
    const remaining = order.items.some((i) => i.itemStatus !== "SERVED");
    if (!remaining) {
      order.meta = {
        ...(order.meta || {}),
        allItemsServedAt: new Date(),
      };
      await order.save();
    }

    res.json({ success: true, data: item });
  } catch (err) {
    console.error("updateKitchenItemStatus:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
