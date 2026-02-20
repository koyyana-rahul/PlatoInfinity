import Order from "../models/order.model.js";
import { emitKitchenEvent } from "../socket/emitter.js";

export async function listKitchenOrders(req, res) {
  try {
    const { restaurantId } = req.params;
    const { stationFilter } = req.query;
    const chefStation = req.user?.station; // Chef's assigned station from JWT

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "restaurantId required",
      });
    }

    // Use chef's assigned station, or query param if provided
    const filterStation = stationFilter || chefStation;

    if (!filterStation) {
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
              cond: {
                $and: [
                  { $eq: ["$$item.station", filterStation] },
                  { $ne: ["$$item.itemStatus", "SERVED"] },
                ],
              },
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
    const { status, staffPin } = req.body;
    const chefId = req.user._id;
    const chefPin = req.user.staffPin; // Assuming this is set on user from login

    // 🔐 PIN VERIFICATION FOR MARKING READY
    if (status === "READY" || status === "ready") {
      if (!staffPin) {
        return res.status(400).json({
          success: false,
          message: "Staff PIN required to confirm ready items",
        });
      }

      // Simple PIN check (in production, use bcrypt comparison)
      // For now, assuming staffPin is validated during login
      // This is a basic check - enhance with bcrypt if needed
      if (String(staffPin) !== String(chefPin)) {
        return res.status(401).json({
          success: false,
          message: "Invalid Staff PIN",
          error: "INVALID_PIN",
        });
      }
    }

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

    // 🔥 SOCKET EVENTS
    const stationName = item.station || "MAIN";
    const payload = {
      orderId,
      itemId,
      status: normalizedStatus,
      tableId: order.tableId,
      tableName: order.tableName,
    };

    emitKitchenEvent(
      req.app.locals.io,
      order.restaurantId,
      stationName,
      "order:item-status-updated",
      payload,
    );
    emitKitchenEvent(
      req.app.locals.io,
      order.restaurantId,
      stationName,
      "order:itemStatus",
      payload,
    );

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
