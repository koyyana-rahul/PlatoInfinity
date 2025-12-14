// src/controllers/suspicious.controller.js
import mongoose from "mongoose";
import SuspiciousOrderModel from "../models/suspiciousOrder.model.js";
import OrderModel from "../models/order.model.js";
import StockModel from "../models/stock.model.js";
import BranchMenuItemModel from "../models/branchMenuItem.model.js";
import StationQueueEventModel from "../models/stationQueueEvent.model.js";
import KitchenStationModel from "../models/kitchenStation.model.js";
import IdempotencyKeyModel from "../models/idempotencyKey.model.js";
import AuditLog from "../models/auditLog.model.js";

/**
 * NOTE: For kitchen notifications we call notifyKitchenAfterApprove() after transaction commits.
 * Replace notifyKitchenAfterApprove with your Socket.IO / job-queue emitter.
 */
async function notifyKitchenAfterApprove(order) {
  // Placeholder: emit socket events or push to job queue here.
  // Example: io.to(`restaurant:${order.restaurantId}:station:${stationId}`).emit("new_order", {...});
  // For now we just log and return.
  try {
    const stationEvents = await StationQueueEventModel.find({
      orderId: order._id,
    }).lean();
    console.log(
      "notifyKitchenAfterApprove: created events",
      stationEvents.length
    );
  } catch (e) {
    console.error("notifyKitchenAfterApprove error", e);
  }
}

/**
 * GET /manager/suspicious-orders
 * Query: ?status=PENDING_APPROVAL&limit=20&page=1
 * Manager-only (requireRole('MANAGER'))
 */
export async function listSuspiciousOrdersController(req, res) {
  try {
    const manager = req.user;
    const { status = "PENDING_APPROVAL", limit = 20, page = 1 } = req.query;
    // Only list suspicious orders for the manager's restaurant
    const filter = {
      restaurantId: mongoose.Types.ObjectId(manager.restaurantId),
    };
    if (status) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);

    const total = await SuspiciousOrderModel.countDocuments(filter);
    const items = await SuspiciousOrderModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();
    return res.json({
      message: "suspicious orders",
      error: false,
      success: true,
      data: { total, page: Number(page), limit: Number(limit), items },
    });
  } catch (err) {
    console.error("listSuspiciousOrdersController error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: true, success: false });
  }
}

/**
 * GET /manager/suspicious-orders/:id
 * Manager-only
 */
export async function getSuspiciousOrderController(req, res) {
  try {
    const manager = req.user;
    const { id } = req.params;
    const doc = await SuspiciousOrderModel.findById(id).lean();
    if (!doc)
      return res
        .status(404)
        .json({ message: "Not found", error: true, success: false });
    if (String(doc.restaurantId) !== String(manager.restaurantId))
      return res
        .status(403)
        .json({ message: "Forbidden", error: true, success: false });
    return res.json({
      message: "suspicious order",
      error: false,
      success: true,
      data: doc,
    });
  } catch (err) {
    console.error("getSuspiciousOrderController error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: true, success: false });
  }
}

/**
 * POST /manager/suspicious-orders/:id/approve
 * Body: { approveByUserNote? }
 * Manager-only
 *
 * Approve flow:
 * - In a transaction: re-check stock, decrement stock, create actual Order, create StationQueueEvent rows, mark suspicious order APPROVED.
 * - After commit: notify kitchen / emit events.
 */
export async function approveSuspiciousOrderController(req, res) {
  const manager = req.user;
  const { id } = req.params;
  const { approveByUserNote = "" } = req.body;

  const mongooseSession = await mongoose.startSession();
  try {
    // Load suspicious order
    const suspect = await SuspiciousOrderModel.findById(id);
    if (!suspect)
      return res
        .status(404)
        .json({ message: "Not found", error: true, success: false });
    if (String(suspect.restaurantId) !== String(manager.restaurantId))
      return res
        .status(403)
        .json({ message: "Forbidden", error: true, success: false });
    if (suspect.status !== "PENDING_APPROVAL")
      return res
        .status(400)
        .json({ message: "Order is not pending", error: true, success: false });

    // Start transaction
    let createdOrder = null;
    await mongooseSession.withTransaction(async () => {
      // Re-check and decrement stock for tracked items
      for (const it of suspect.items) {
        if (it.trackStock) {
          const stockDoc = await StockModel.findOne({
            restaurantId: suspect.restaurantId,
            branchMenuItemId: it.branchMenuItemId,
          }).session(mongooseSession);
          if (!stockDoc) {
            const e = new Error(`Stock not configured for ${it.name}`);
            e.isClient = true;
            throw e;
          }
          if (
            stockDoc.stockQty === null ||
            typeof stockDoc.stockQty === "undefined"
          ) {
            // unlimited - nothing to do
          } else if (stockDoc.stockQty < it.quantity) {
            const e = new Error(`Insufficient stock for ${it.name}`);
            e.isClient = true;
            throw e;
          } else {
            stockDoc.stockQty = stockDoc.stockQty - it.quantity;
            stockDoc.lastAdjustedAt = new Date();
            await stockDoc.save({ session: mongooseSession });
            if (stockDoc.stockQty === 0 && stockDoc.autoHideWhenZero) {
              await BranchMenuItemModel.findByIdAndUpdate(it.branchMenuItemId, {
                status: "OFF",
              }).session(mongooseSession);
            }
          }
        }
      }

      // Create order document
      const orderPayload = {
        restaurantId: suspect.restaurantId,
        tableId: suspect.sessionId ? suspect.sessionId : null, // session->table relation exists elsewhere
        tableName: suspect.tableName || "",
        items: suspect.items.map((i) => ({
          branchMenuItemId: i.branchMenuItemId,
          name: i.name,
          price: i.price || 0,
          quantity: i.quantity,
          selectedModifiers: i.selectedModifiers || [],
          itemStatus: "PENDING",
        })),
        orderStatus: "OPEN",
        totalAmount: suspect.totalAmount || 0,
        paymentMethod: null,
        createdBy: manager._id,
        sessionId: suspect.sessionId || null,
        source: "MANAGER_APPROVAL",
      };

      const [orderDoc] = await OrderModel.create([orderPayload], {
        session: mongooseSession,
      });

      // Create StationQueueEvent rows
      const itemsByStation = {};
      for (const it of suspect.items) {
        const station = it.station || "UNKNOWN";
        itemsByStation[station] = itemsByStation[station] || [];
        itemsByStation[station].push({
          orderId: orderDoc._id,
          branchMenuItemId: it.branchMenuItemId,
          name: it.name,
          quantity: it.quantity,
        });
      }

      for (const [stationName, stationItems] of Object.entries(
        itemsByStation
      )) {
        const stationDoc = await KitchenStationModel.findOne({
          restaurantId: suspect.restaurantId,
          name: stationName,
        }).session(mongooseSession);
        const stationId = stationDoc ? stationDoc._id : null;
        await StationQueueEventModel.create(
          stationItems.map((si) => ({
            restaurantId: suspect.restaurantId,
            stationId,
            stationName,
            orderId: si.orderId,
            branchMenuItemId: si.branchMenuItemId,
            name: si.name,
            quantity: si.quantity,
            status: "NEW",
            createdAt: new Date(),
          })),
          { session: mongooseSession }
        );
      }

      // Mark suspicious order approved, record approver and note
      suspect.status = "APPROVED";
      suspect.approvedBy = manager._id;
      suspect.approvedAt = new Date();
      suspect.approveByUserNote = approveByUserNote || "";
      await suspect.save({ session: mongooseSession });

      // Optional: map idempotency key (if pending key existed)
      await IdempotencyKeyModel.updateMany(
        { suspiciousId: suspect._id },
        { orderId: orderDoc._id, pending: false }
      )
        .session(mongooseSession)
        .catch(() => {});

      createdOrder = orderDoc;
    }); // transaction end

    // After successful commit: notify kitchen
    try {
      await notifyKitchenAfterApprove(createdOrder);
    } catch (e) {
      console.error("notifyKitchenAfterApprove failed", e);
    }

    // Audit
    try {
      await AuditLog.create({
        actorType: "USER",
        actorId: String(manager._id),
        action: "APPROVE_SUSPICIOUS_ORDER",
        entityType: "SuspiciousOrder",
        entityId: String(suspect._id),
        meta: { orderId: String(createdOrder._id) },
      });
    } catch (e) {}

    return res.json({
      message: "Suspicious order approved and sent to kitchen",
      error: false,
      success: true,
      data: { orderId: createdOrder._id },
    });
  } catch (err) {
    if (err.isClient)
      return res
        .status(400)
        .json({ message: err.message, error: true, success: false });
    console.error("approveSuspiciousOrderController error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: true, success: false });
  } finally {
    mongooseSession.endSession();
  }
}

/**
 * POST /manager/suspicious-orders/:id/reject
 * Body: { rejectReason? }
 * Manager-only: mark the suspicious order REJECTED and notify session/waiter/customer as needed.
 */
export async function rejectSuspiciousOrderController(req, res) {
  try {
    const manager = req.user;
    const { id } = req.params;
    const { rejectReason = "" } = req.body;

    const suspect = await SuspiciousOrderModel.findById(id);
    if (!suspect)
      return res
        .status(404)
        .json({ message: "Not found", error: true, success: false });
    if (String(suspect.restaurantId) !== String(manager.restaurantId))
      return res
        .status(403)
        .json({ message: "Forbidden", error: true, success: false });
    if (suspect.status !== "PENDING_APPROVAL")
      return res
        .status(400)
        .json({ message: "Order not pending", error: true, success: false });

    suspect.status = "REJECTED";
    suspect.rejectedBy = manager._id;
    suspect.rejectedAt = new Date();
    suspect.rejectReason = rejectReason || "";
    await suspect.save();

    // Optional: mark idempotency keys as rejected
    await IdempotencyKeyModel.updateMany(
      { suspiciousId: suspect._id },
      { pending: false }
    ).catch(() => {});

    try {
      await AuditLog.create({
        actorType: "USER",
        actorId: String(manager._id),
        action: "REJECT_SUSPICIOUS_ORDER",
        entityType: "SuspiciousOrder",
        entityId: String(suspect._id),
        meta: { rejectReason },
      });
    } catch (e) {}

    return res.json({
      message: "Suspicious order rejected",
      error: false,
      success: true,
    });
  } catch (err) {
    console.error("rejectSuspiciousOrderController error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: true, success: false });
  }
}
