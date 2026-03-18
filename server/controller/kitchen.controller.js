import Order from "../models/order.model.js";
import {
  emitKitchenEvent,
  emitOrderItemStatusUpdate,
  emitOrderReady,
} from "../socket/emitter.js";

function deriveLiveOrderStatusFromItems(items = []) {
  const safeItems = Array.isArray(items) ? items : [];
  const totalItems = safeItems.length;

  const newCount = safeItems.filter((i) => i.itemStatus === "NEW").length;
  const inProgressCount = safeItems.filter(
    (i) => i.itemStatus === "IN_PROGRESS",
  ).length;
  const readyCount = safeItems.filter((i) => i.itemStatus === "READY").length;
  const servingCount = safeItems.filter(
    (i) => i.itemStatus === "SERVING",
  ).length;
  const servedCount = safeItems.filter((i) => i.itemStatus === "SERVED").length;

  let orderStatus = "NEW";
  if (totalItems > 0 && servedCount === totalItems) orderStatus = "SERVED";
  else if (servingCount > 0 || servedCount > 0) orderStatus = "SERVING";
  else if (readyCount > 0) orderStatus = "READY";
  else if (inProgressCount > 0) orderStatus = "IN_PROGRESS";

  return {
    orderStatus,
    totalItems,
    newCount,
    inProgressCount,
    readyCount,
    servingCount,
    servedCount,
  };
}

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

    const {
      orderStatus,
      totalItems,
      readyCount,
      servedCount,
      servingCount,
      inProgressCount,
      newCount,
    } = deriveLiveOrderStatusFromItems(order.items);

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
      servingCount,
      inProgressCount,
      newCount,
      updatedAt: new Date(),
    });

    // Emit explicit order-ready lifecycle event when all non-served items
    // have reached READY state.
    const allReadyForServing =
      totalItems > 0 &&
      order.items.every((i) => ["READY", "SERVED"].includes(i.itemStatus));

    if (allReadyForServing) {
      await emitOrderReady({
        orderId: String(order._id),
        restaurantId: String(order.restaurantId),
        sessionId: String(order.sessionId),
        tableId: String(order.tableId),
        tableName: order.tableName || "Unknown",
        orderNumber: order.orderNumber,
        readyAt: new Date(),
      });
    }

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
