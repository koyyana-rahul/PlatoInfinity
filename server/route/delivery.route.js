import express from "express";
import {
  createDeliveryOrderController,
  listDeliveryOrdersController,
  getDeliveryOrderDetailController,
  updateDeliveryOrderStatusController,
  assignDeliveryPartnerController,
  updateDeliveryPartnerLocationController,
  getDeliveryPartnerOrdersController,
  completeDeliveryController,
  cancelDeliveryOrderController,
  getDeliveryOrdersSummaryController,
  platformWebhookController,
} from "../controller/delivery.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

/**
 * Create Delivery Order
 * POST /api/restaurants/:restaurantId/delivery/orders
 * Roles: MANAGER, BRAND_ADMIN, SYSTEM
 * Used for: Creating orders from online platforms
 */
router.post(
  "/:restaurantId/delivery/orders",
  requireAuth,
  requireRole("MANAGER", "BRAND_ADMIN", "SYSTEM"),
  createDeliveryOrderController,
);

/**
 * List Delivery Orders
 * GET /api/restaurants/:restaurantId/delivery/orders
 * Roles: MANAGER, CHEF, WAITER, CASHIER, BRAND_ADMIN
 * Query params: status, platform, paymentStatus, page, limit
 * Used for: Getting all delivery orders with filters
 */
router.get(
  "/:restaurantId/delivery/orders",
  requireAuth,
  requireRole("MANAGER", "CHEF", "WAITER", "CASHIER", "BRAND_ADMIN"),
  listDeliveryOrdersController,
);

/**
 * Get Delivery Order Details
 * GET /api/restaurants/:restaurantId/delivery/orders/:orderId
 * Roles: MANAGER, CHEF, WAITER, CASHIER, DELIVERY_PARTNER, BRAND_ADMIN
 * Used for: Getting specific order details
 */
router.get(
  "/:restaurantId/delivery/orders/:orderId",
  requireAuth,
  requireRole(
    "MANAGER",
    "CHEF",
    "WAITER",
    "CASHIER",
    "DELIVERY_PARTNER",
    "BRAND_ADMIN",
  ),
  getDeliveryOrderDetailController,
);

/**
 * Update Delivery Order Status
 * PATCH /api/restaurants/:restaurantId/delivery/orders/:orderId/status
 * Roles: MANAGER, CHEF, WAITER, DELIVERY_PARTNER, BRAND_ADMIN
 * Body: { status, note }
 * Status options: CONFIRMED, PREPARING, READY_FOR_PICKUP, PICKED_UP, OUT_FOR_DELIVERY, NEARBY, DELIVERED, CANCELLED, FAILED
 * Used for: Updating order status through the system
 */
router.patch(
  "/:restaurantId/delivery/orders/:orderId/status",
  requireAuth,
  requireRole("MANAGER", "CHEF", "WAITER", "DELIVERY_PARTNER", "BRAND_ADMIN"),
  updateDeliveryOrderStatusController,
);

/**
 * Assign Delivery Partner
 * POST /api/restaurants/:restaurantId/delivery/orders/:orderId/assign-partner
 * Roles: MANAGER, BRAND_ADMIN
 * Body: { deliveryPartnerId, estimatedDeliveryTime }
 * Used for: Assigning delivery partner to order
 */
router.post(
  "/:restaurantId/delivery/orders/:orderId/assign-partner",
  requireAuth,
  requireRole("MANAGER", "BRAND_ADMIN"),
  assignDeliveryPartnerController,
);

/**
 * Update Delivery Partner Location
 * PATCH /api/restaurants/:restaurantId/delivery/orders/:orderId/location
 * Roles: DELIVERY_PARTNER
 * Body: { latitude, longitude }
 * Used for: Real-time location tracking
 */
router.patch(
  "/:restaurantId/delivery/orders/:orderId/location",
  requireAuth,
  requireRole("DELIVERY_PARTNER"),
  updateDeliveryPartnerLocationController,
);

/**
 * Get Delivery Partner Orders
 * GET /api/restaurants/:restaurantId/delivery/partner/orders
 * Roles: DELIVERY_PARTNER
 * Query params: status, page, limit
 * Used for: Getting orders assigned to delivery partner
 */
router.get(
  "/:restaurantId/delivery/partner/orders",
  requireAuth,
  requireRole("DELIVERY_PARTNER"),
  getDeliveryPartnerOrdersController,
);

/**
 * Complete Delivery
 * POST /api/restaurants/:restaurantId/delivery/orders/:orderId/complete
 * Roles: DELIVERY_PARTNER, MANAGER, BRAND_ADMIN
 * Body: { deliveryPartnerRating, deliveryPartnerReview }
 * Used for: Marking order as delivered
 */
router.post(
  "/:restaurantId/delivery/orders/:orderId/complete",
  requireAuth,
  requireRole("DELIVERY_PARTNER", "MANAGER", "BRAND_ADMIN"),
  completeDeliveryController,
);

/**
 * Cancel Delivery Order
 * POST /api/restaurants/:restaurantId/delivery/orders/:orderId/cancel
 * Roles: MANAGER, CUSTOMER, DELIVERY_PARTNER, BRAND_ADMIN
 * Body: { cancelledBy, cancelReason, refundAmount }
 * Used for: Cancelling delivery orders
 */
router.post(
  "/:restaurantId/delivery/orders/:orderId/cancel",
  requireAuth,
  requireRole("MANAGER", "CUSTOMER", "DELIVERY_PARTNER", "BRAND_ADMIN"),
  cancelDeliveryOrderController,
);

/**
 * Get Delivery Orders Summary/Analytics
 * GET /api/restaurants/:restaurantId/delivery/summary
 * Roles: MANAGER, BRAND_ADMIN
 * Query params: startDate, endDate
 * Used for: Getting analytics and statistics
 */
router.get(
  "/:restaurantId/delivery/summary",
  requireAuth,
  requireRole("MANAGER", "BRAND_ADMIN"),
  getDeliveryOrdersSummaryController,
);

/**
 * Platform Webhook
 * POST /api/delivery/webhook
 * No authentication (but should verify signature)
 * Body: { platform, event, data }
 * Platforms: SWIGGY, ZOMATO, etc.
 * Used for: Receiving updates from platforms
 */
router.post("/delivery/webhook", platformWebhookController);

export default router;
