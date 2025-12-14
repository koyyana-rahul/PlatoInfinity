// src/services/placeOrder.service.js
import mongoose from "mongoose";
import crypto from "crypto";

import SessionModel from "../models/session.model.js";
import BranchMenuItemModel from "../models/branchMenuItem.model.js";
import StockModel from "../models/stock.model.js";
import OrderModel from "../models/order.model.js";
import StationQueueEventModel from "../models/stationQueueEvent.model.js";
import KitchenStationModel from "../models/kitchenStation.model.js";
import IdempotencyKeyModel from "../models/idempotencyKey.model.js";
import SuspiciousOrderModel from "../models/suspiciousOrder.model.js";
import { emitToStationWrapper } from "../socket/emitter.js";
import AuditLog from "../models/auditLog.model.js"; // optional

// configurable thresholds
const DEFAULT_SUSPICIOUS_QTY_THRESHOLD = 10;
const DEFAULT_SUSPICIOUS_AMOUNT_THRESHOLD = 25000; // ₹25k

function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function evaluateSuspicious({ items, totalAmount }) {
  for (const it of items) {
    if ((it.quantity || 0) > DEFAULT_SUSPICIOUS_QTY_THRESHOLD) {
      return {
        suspicious: true,
        reason: `High qty for ${it.name} (${it.quantity})`,
      };
    }
  }
  if ((totalAmount || 0) > DEFAULT_SUSPICIOUS_AMOUNT_THRESHOLD) {
    return { suspicious: true, reason: `High total amount ${totalAmount}` };
  }
  return { suspicious: false, reason: null };
}

/**
 * placeOrderService(payload)
 * payload:
 *  - sessionId
 *  - sessionToken (raw)
 *  - items: [{ branchMenuItemId, quantity, selectedModifiers }]
 *  - actor: optional user object (who placed: waiterId or null)
 *  - clientRequestId: optional idempotency key
 *  - source: optional string
 */
export async function placeOrderService(payload) {
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

  // Idempotency: if clientRequestId provided and exists -> return stored order/pending state
  if (clientRequestId) {
    const existing = await IdempotencyKeyModel.findOne({
      key: clientRequestId,
    }).lean();
    if (existing) {
      if (existing.orderId) {
        const existingOrder = await OrderModel.findById(
          existing.orderId
        ).lean();
        return {
          order: existingOrder,
          pending: existing.pending || false,
          fromCache: true,
        };
      }
      // if pending is true -> inform client
      if (existing.pending) {
        const e = new Error("Request is being processed");
        e.isClient = true;
        throw e;
      }
    }
  }

  // Validate session token and session
  const tokenHash = hashToken(sessionToken);
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

  // Load branch menu docs for requested items
  const branchMenuIds = requestedItems.map((i) =>
    mongoose.Types.ObjectId(i.branchMenuItemId)
  );
  const branchMenuDocs = await BranchMenuItemModel.find({
    _id: { $in: branchMenuIds },
  }).lean();
  const branchMenuMap = {};
  for (const b of branchMenuDocs) branchMenuMap[String(b._id)] = b;

  // Validate each requested item w.r.t branch menu
  for (const it of requestedItems) {
    const b = branchMenuMap[String(it.branchMenuItemId)];
    if (!b) {
      const e = new Error(`Menu item ${it.branchMenuItemId} not found`);
      e.isClient = true;
      throw e;
    }
    if (b.status !== "ON") {
      const e = new Error(`Item ${b.name} is not available`);
      e.isClient = true;
      throw e;
    }
    if (!Number.isInteger(it.quantity) || it.quantity <= 0) {
      const e = new Error(`Invalid quantity for ${b.name}`);
      e.isClient = true;
      throw e;
    }
    if (b.maxPerOrder && it.quantity > b.maxPerOrder) {
      const e = new Error(`Max quantity for ${b.name} is ${b.maxPerOrder}`);
      e.isClient = true;
      throw e;
    }
  }

  // Compute totals and build order items
  let computedTotal = 0;
  const orderItems = [];
  for (const it of requestedItems) {
    const b = branchMenuMap[String(it.branchMenuItemId)];
    const unitPrice = typeof b.price === "number" ? b.price : 0;
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

  // Suspicious evaluation
  const suspiciousEval = evaluateSuspicious({
    items: requestedItems.map((i, idx) => ({
      ...i,
      name: orderItems[idx].name,
    })),
    totalAmount: computedTotal,
  });
  if (suspiciousEval.suspicious) {
    // create suspicious order record
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

    // optionally audit log
    try {
      await AuditLog.create({
        actorType: actor ? "USER" : "ANON",
        actorId: actor ? String(actor._id) : null,
        action: "CREATE_SUSPICIOUS_ORDER",
        entityType: "SuspiciousOrder",
        entityId: String(suspiciousDoc._id),
      });
    } catch (e) {}

    return {
      pending: true,
      suspiciousId: suspiciousDoc._id,
      reason: suspiciousEval.reason,
    };
  }

  // Not suspicious => proceed with transaction
  const mongoSession = await mongoose.startSession();
  let createdOrderDoc = null;
  try {
    await mongoSession.withTransaction(async () => {
      // Re-check and decrement stocks
      for (const it of orderItems) {
        if (it.trackStock) {
          const stockDoc = await StockModel.findOne({
            restaurantId: sessionDoc.restaurantId,
            branchMenuItemId: it.branchMenuItemId,
          }).session(mongoSession);
          if (!stockDoc) {
            const e = new Error(`Stock not configured for ${it.name}`);
            e.isClient = true;
            throw e;
          }
          if (
            stockDoc.stockQty !== null &&
            typeof stockDoc.stockQty !== "undefined"
          ) {
            if (stockDoc.stockQty < it.quantity) {
              const e = new Error(`Insufficient stock for ${it.name}`);
              e.isClient = true;
              throw e;
            }
            stockDoc.stockQty = stockDoc.stockQty - it.quantity;
            stockDoc.lastAdjustedAt = new Date();
            await stockDoc.save({ session: mongoSession });
            if (stockDoc.stockQty === 0 && stockDoc.autoHideWhenZero) {
              await BranchMenuItemModel.findByIdAndUpdate(it.branchMenuItemId, {
                status: "OFF",
              }).session(mongoSession);
            }
          }
        }
      }

      // Create Order doc
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

      const created = await OrderModel.create([orderPayload], {
        session: mongoSession,
      });
      createdOrderDoc = created[0];

      // create StationQueueEvent rows
      // group items by station
      const itemsByStation = {};
      orderItems.forEach((it) => {
        const station = it.station || "UNKNOWN";
        itemsByStation[station] = itemsByStation[station] || [];
        itemsByStation[station].push(it);
      });

      // persist station events (flat list)
      const eventsToCreate = [];
      for (const [stationName, stationItems] of Object.entries(
        itemsByStation
      )) {
        // try to find stationId by name
        const stationDoc = await KitchenStationModel.findOne({
          restaurantId: sessionDoc.restaurantId,
          name: stationName,
        }).session(mongoSession);
        const stationId = stationDoc ? stationDoc._id : null;
        for (const it of stationItems) {
          eventsToCreate.push({
            restaurantId: sessionDoc.restaurantId,
            stationId,
            stationName,
            orderId: createdOrderDoc._id,
            branchMenuItemId: it.branchMenuItemId,
            name: it.name,
            quantity: it.quantity,
            status: "NEW",
            createdAt: new Date(),
          });
        }
      }

      if (eventsToCreate.length > 0) {
        await StationQueueEventModel.insertMany(eventsToCreate, {
          session: mongoSession,
        });
      }

      // save idempotency mapping if provided
      if (clientRequestId) {
        await IdempotencyKeyModel.create(
          [
            {
              key: clientRequestId,
              orderId: createdOrderDoc._id,
              pending: false,
              createdAt: new Date(),
            },
          ],
          { session: mongoSession }
        );
      }
    }); // end transaction
  } catch (err) {
    // surface client-friendly errors
    if (err.isClient) throw err;
    throw err;
  } finally {
    await mongoSession.endSession();
  }

  // After commit, emit station events to kitchen (best-effort)
  try {
    const stationEvents = await StationQueueEventModel.find({
      orderId: createdOrderDoc._id,
    }).lean();
    for (const ev of stationEvents) {
      const payload = {
        eventId: String(ev._id),
        orderId: String(ev.orderId),
        branchMenuItemId: String(ev.branchMenuItemId),
        name: ev.name,
        quantity: ev.quantity,
        status: ev.status,
        stationId: ev.stationId ? String(ev.stationId) : null,
        stationName: ev.stationName || null,
        createdAt: ev.createdAt || new Date(),
      };

      try {
        await emitToStationWrapper({
          restaurantId: String(ev.restaurantId),
          stationId: ev.stationId ? String(ev.stationId) : null,
          stationName: ev.stationName || null,
          eventPayload: payload,
        });
        console.log(
          `Emitted station event ${payload.eventId} -> station ${
            payload.stationName || payload.stationId
          }`
        );
      } catch (emitErr) {
        console.error(
          "emitToStation failed for event",
          payload.eventId,
          emitErr
        );
        // optional: push to retry queue here
      }
    }
  } catch (err) {
    console.error(
      "Failed to load/emit station events for order",
      createdOrderDoc._id,
      err
    );
  }

  // audit
  try {
    await AuditLog.create({
      actorType: actor ? "USER" : "ANON",
      actorId: actor ? String(actor._id) : null,
      action: "PLACE_ORDER",
      entityType: "Order",
      entityId: String(createdOrderDoc._id),
    });
  } catch (e) {}

  return { order: createdOrderDoc, pending: false };
}
