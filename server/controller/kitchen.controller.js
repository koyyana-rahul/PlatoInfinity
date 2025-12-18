import Order from "../models/order.model.js";

export async function listKitchenOrders(req, res) {
  try {
    const { station } = req.query;
    const restaurantId = req.user.restaurantId;

    if (!station) {
      return res.status(400).json({
        success: false,
        message: "station required",
      });
    }

    const orders = await Order.aggregate([
      {
        $match: {
          restaurantId,
          orderStatus: "OPEN",
        },
      },
      {
        $project: {
          tableId: 1,
          tableName: 1,
          createdAt: 1,
          items: {
            $filter: {
              input: "$items",
              as: "item",
              cond: {
                $and: [
                  { $eq: ["$$item.station", station] },
                  { $ne: ["$$item.itemStatus", "SERVED"] },
                ],
              },
            },
          },
        },
      },
      { $match: { "items.0": { $exists: true } } },
      { $sort: { createdAt: 1 } },
    ]);

    res.json({ success: true, data: orders });
  } catch (err) {
    console.error("listKitchenOrders:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function updateKitchenItemStatus(req, res) {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    if (!["PREPARING", "READY", "SERVED"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    const update = {
      "items.$.itemStatus": status,
      "items.$.chefId": req.user._id,
      "items.$.updatedAt": new Date(),
    };

    if (status === "PREPARING") update["items.$.preparedAt"] = new Date();
    if (status === "READY") update["items.$.readyAt"] = new Date();
    if (status === "SERVED") update["items.$.servedAt"] = new Date();

    const order = await Order.findOneAndUpdate(
      { _id: orderId, "items._id": itemId },
      { $set: update },
      { new: true }
    );

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });

    const item = order.items.find((i) => i._id.toString() === itemId);

    // 🔥 SOCKET EVENTS
    emitKitchenEvent(
      req.app.get("io"),
      order.restaurantId,
      item.station,
      `order:${status.toLowerCase()}`,
      {
        orderId,
        itemId,
        tableId: order.tableId,
      }
    );

    // ✅ AUTO CLOSE ORDER
    const remaining = order.items.some((i) => i.itemStatus !== "SERVED");
    if (!remaining) {
      order.orderStatus = "COMPLETED";
      await order.save();
    }

    res.json({ success: true, data: item });
  } catch (err) {
    console.error("updateKitchenItemStatus:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
