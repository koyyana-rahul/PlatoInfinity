// src/controllers/order.controller.js
import { placeOrderService } from "../services/placeOrder.service.js";

/**
 * POST /api/order
 * Expect session authenticated by requireSessionAuth middleware which sets:
 *   req.sessionDoc  -> session document
 *   req.sessionRawToken -> raw token string
 *
 * Body: {
 *   items: [{ branchMenuItemId, quantity, selectedModifiers }],
 *   clientRequestId?: string,
 *   source?: string
 * }
 */
export async function placeOrderController(req, res) {
  try {
    const actor = req.user || null;

    // sessionDoc & raw token come from requireSessionAuth middleware
    const sessionDoc = req.sessionDoc;
    const sessionRawToken = req.sessionRawToken;

    if (!sessionDoc || !sessionRawToken) {
      return res.status(401).json({
        message: "Session authentication required",
        error: true,
        success: false,
      });
    }

    const { items, clientRequestId, source } = req.body;

    try {
      const result = await placeOrderService({
        sessionId: sessionDoc._id,
        sessionToken: sessionRawToken,
        items,
        actor,
        clientRequestId,
        source,
      });

      if (result.pending) {
        return res.status(202).json({
          message: "Order pending approval (suspicious). Manager will review.",
          error: false,
          success: true,
          data: { suspiciousId: result.suspiciousId, reason: result.reason },
        });
      }

      return res.status(201).json({
        message: "Order placed",
        error: false,
        success: true,
        data: result.order,
      });
    } catch (err) {
      if (err.isClient) {
        return res
          .status(400)
          .json({ message: err.message, error: true, success: false });
      }
      console.error("placeOrderController error:", err);
      return res
        .status(500)
        .json({ message: "Server error", error: true, success: false });
    }
  } catch (err) {
    console.error("placeOrderController unexpected:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: true, success: false });
  }
}
