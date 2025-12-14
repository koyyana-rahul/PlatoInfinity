// src/services/order.service.js
import mongoose from "mongoose";
import OrderModel from "../models/order.model.js";
import BranchMenuItemModel from "../models/branchMenuItem.model.js";
import StockModel from "../models/stock.model.js";
import SessionModel from "../models/session.model.js";
import StationQueueEventModel from "../models/stationQueueEvent.model.js";
import KitchenStationModel from "../models/kitchenStation.model.js";
import IdempotencyKeyModel from "../models/idempotencyKey.model.js";
import SuspiciousOrderModel from "../models/suspiciousOrder.model.js";
import AuditLog from "../models/auditLog.model.js";
// order.service.js (or wherever placeOrder lives)
import StationQueueEventModel from "../models/stationQueueEvent.model.js";
import { emitToStationWrapper } from "../socket/emitter.js";

const DEFAULT_SUSPICIOUS_QTY_THRESHOLD = 10;
const DEFAULT_SUSPICIOUS_AMOUNT_THRESHOLD = 25000; // ₹25k — adjust per brand

/**
 * Evaluate suspiciousness for an order payload.
 * Returns { suspicious: boolean, reason: string }
 */
function evaluateSuspicious({ items, totalAmount }) {
  // qty threshold per item
  for (const it of items) {
    if ((it.quantity || 0) > DEFAULT_SUSPICIOUS_QTY_THRESHOLD) {
      return {
        suspicious: true,
        reason: `High quantity for item ${it.name} (${it.quantity})`,
      };
    }
  }
  if ((totalAmount || 0) > DEFAULT_SUSPICIOUS_AMOUNT_THRESHOLD) {
    return { suspicious: true, reason: `High total amount ${totalAmount}` };
  }
  return { suspicious: false, reason: null };
}

/**
 * placeOrder:
 * - payload: { sessionId, sessionToken, items: [{ branchMenuItemId, quantity, selectedModifiers }], actor (optional waiter user), clientRequestId (optional) }
 *
 * Returns { order, pending: boolean, suspiciousId? }
 * Throws an Error with .isClient = true for client-readable errors (useful in controllers).
 */
export async function placeOrder(payload) {
  const {
    sessionId,
    sessionToken,
    items: requestedItems = [],
    actor = null,
    clientRequestId = null,
    source = "CUSTOMER_WEB",
  } = payload;

  if (!sessionId || !sessionToken) {
    const e = new Error("sessionId and sessionToken required");
    e.isClient = true;
    throw e;
  }
  if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
    const e = new Error("items required");
    e.isClient = true;
    throw e;
  }

  const mongooseSession = await mongoose.startSession();
  try {
    // 0) Idempotency: if clientRequestId provided, try to return previous result
    if (clientRequestId) {
      const existingKey = await IdempotencyKeyModel.findOne({
        key: clientRequestId,
      }).lean();
      if (existingKey) {
        // return existing order reference if stored
        if (existingKey.orderId) {
          const existingOrder = await OrderModel.findById(
            existingKey.orderId
          ).lean();
          return {
            order: existingOrder,
            pending: existingKey.pending || false,
            fromCache: true,
          };
        } else {
          // in-progress case: avoid duplicate processing
          const e = new Error("Request is being processed");
          e.isClient = true;
          throw e;
        }
      }
    }

    // 1) Validate session token and session state
    const tokenHash = require("crypto")
      .createHash("sha256")
      .update(sessionToken)
      .digest("hex");
    const sessionDoc = await SessionModel.findOne({
      _id: sessionId,
      sessionTokenHash: tokenHash,
      status: "OPEN",
    }).lean();
    if (!sessionDoc) {
      const e = new Error("Invalid or expired session token");
      e.isClient = true;
      throw e;
    }

    // Map to fetch branchMenu items and validate availability
    const branchMenuIds = requestedItems.map((i) =>
      mongoose.Types.ObjectId(i.branchMenuItemId)
    );
    const branchMenuDocs = await BranchMenuItemModel.find({
      _id: { $in: branchMenuIds },
    }).lean();

    // Basic validation
    const branchMenuMap = {};
    for (const b of branchMenuDocs) branchMenuMap[String(b._id)] = b;
    for (const it of requestedItems) {
      if (!branchMenuMap[String(it.branchMenuItemId)]) {
        const e = new Error(`Menu item ${it.branchMenuItemId} not found`);
        e.isClient = true;
        throw e;
      }
      const bm = branchMenuMap[String(it.branchMenuItemId)];
      if (bm.status !== "ON") {
        const e = new Error(`Item ${bm.name} is not available`);
        e.isClient = true;
        throw e;
      }
      if (it.quantity <= 0) {
        const e = new Error(`Invalid quantity for ${bm.name}`);
        e.isClient = true;
        throw e;
      }
      // Optional: check per-item max quantity config
      if (bm.maxPerOrder && it.quantity > bm.maxPerOrder) {
        const e = new Error(`Max quantity for ${bm.name} is ${bm.maxPerOrder}`);
        e.isClient = true;
        throw e;
      }
    }

    // 2) Compute totals and check stock (but don't commit yet)
    let computedTotal = 0;
    const orderItems = []; // will contain order item payloads
    for (const it of requestedItems) {
      const b = branchMenuMap[String(it.branchMenuItemId)];
      const unitPrice = typeof b.price === "number" ? b.price : 0;
      // compute modifiers total if any
      const mods = Array.isArray(it.selectedModifiers)
        ? it.selectedModifiers
        : [];
      const modsTotal = mods.reduce((a, m) => a + (m.price || 0), 0);
      const lineTotal = (unitPrice + modsTotal) * it.quantity;
      computedTotal += lineTotal;

      orderItems.push({
        branchMenuItemId: b._id,
        name: b.name,
        price: unitPrice,
        quantity: it.quantity,
        selectedModifiers: mods,
        station: b.station || null,
        trackStock: !!b.trackStock,
      });
    }

    // 3) Evaluate suspicious
    const suspiciousEval = evaluateSuspicious({
      items: requestedItems.map((i, idx) => ({
        ...i,
        name: orderItems[idx].name,
      })),
      totalAmount: computedTotal,
    });
    if (suspiciousEval.suspicious) {
      // Create SuspiciousOrder record and an IdempotencyKey mapping to pending state
      const suspiciousDoc = await SuspiciousOrderModel.create({
        restaurantId: sessionDoc.restaurantId,
        sessionId: sessionDoc._id,
        items: orderItems,
        totalAmount: computedTotal,
        reason: suspiciousEval.reason,
        createdBy: actor ? actor._id : null,
        status: "PENDING_APPROVAL",
        createdAt: new Date(),
      });

      if (clientRequestId) {
        await IdempotencyKeyModel.create({
          key: clientRequestId,
          pending: true,
          suspiciousId: suspiciousDoc._id,
          createdAt: new Date(),
        });
      }

      // notify manager (left to your notification flow) and return pending
      return { pending: true, suspiciousId: suspiciousDoc._id };
    }

    // 4) Not suspicious - do transactional order + stock decrement + station queue events
    let createdOrder = null;
    await mongooseSession.withTransaction(async () => {
      // Re-check stock and decrement atomically
      for (const it of orderItems) {
        if (it.trackStock) {
          const stockDoc = await StockModel.findOne({
            restaurantId: sessionDoc.restaurantId,
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
            // unlimited
          } else if (stockDoc.stockQty < it.quantity) {
            const e = new Error(`Insufficient stock for ${it.name}`);
            e.isClient = true;
            throw e;
          } else {
            // decrement
            stockDoc.stockQty = stockDoc.stockQty - it.quantity;
            stockDoc.lastAdjustedAt = new Date();
            await stockDoc.save({ session: mongooseSession });
            // If becomes zero and autoHideWhenZero true -> set branch menu OFF
            if (stockDoc.stockQty === 0 && stockDoc.autoHideWhenZero) {
              await BranchMenuItemModel.findByIdAndUpdate(it.branchMenuItemId, {
                status: "OFF",
              }).session(mongooseSession);
            }
          }
        }
      }

      // Build order doc
      const orderPayload = {
        restaurantId: sessionDoc.restaurantId,
        tableId: sessionDoc.tableId,
        tableName: sessionDoc.tableNumber || String(sessionDoc.tableId),
        items: orderItems.map((i) => ({
          branchMenuItemId: i.branchMenuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          selectedModifiers: i.selectedModifiers,
          itemStatus: "PENDING",
        })),
        orderStatus: "OPEN",
        totalAmount: computedTotal,
        paymentMethod: null,
        createdBy: actor ? actor._id : null,
        sessionId: sessionDoc._id,
        source,
      };

      createdOrder = await OrderModel.create([orderPayload], {
        session: mongooseSession,
      });
      // create StationQueueEvents for each distinct station
      const itemsByStation = {};
      orderItems.forEach((it, idx) => {
        const station = it.station || "UNKNOWN";
        itemsByStation[station] = itemsByStation[station] || [];
        itemsByStation[station].push({
          orderId: createdOrder[0]._id,
          branchMenuItemId: it.branchMenuItemId,
          name: it.name,
          quantity: it.quantity,
        });
      });

      for (const [stationName, stationItems] of Object.entries(
        itemsByStation
      )) {
        // find station id if exists
        const stationDoc = await KitchenStationModel.findOne({
          restaurantId: sessionDoc.restaurantId,
          name: stationName,
        }).session(mongooseSession);
        const stationId = stationDoc ? stationDoc._id : null;
        await StationQueueEventModel.create(
          stationItems.map((si) => ({
            restaurantId: sessionDoc.restaurantId,
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

      // Persist idempotency mapping
      if (clientRequestId) {
        await IdempotencyKeyModel.create(
          [
            {
              key: clientRequestId,
              orderId: createdOrder[0]._id,
              pending: false,
              createdAt: new Date(),
            },
          ],
          { session: mongooseSession }
        );
      }
    }); // transaction end

    // After commit, you can emit socket events for kitchen (outside transaction)
    try {
      await AuditLog.create({
        actorType: actor ? "USER" : "ANONYMOUS",
        actorId: actor ? String(actor._id) : null,
        action: "PLACE_ORDER",
        entityType: "Order",
        entityId: String(createdOrder[0]._id),
      });
    } catch (e) {}

    return { order: createdOrder[0], pending: false };
  } catch (err) {
    // if err.isClient => rethrow to controller
    throw err;
  } finally {
    mongooseSession.endSession();
  }
}
