import { v4 as uuidv4 } from "uuid";

const orderApi = {
  /* ========== CUSTOMER: PLACE ORDER ========== */
  place: {
    url: "/api/order/place",
    method: "POST",
    // body: {
    //   sessionId,
    //   restaurantId,
    //   tableId,
    //   paymentMethod: "CASH" | "CARD" | "UPI_IN_APP" | "SPLIT",
    //   idempotencyKey: generateIdempotencyKey()
    // }
  },

  /* ========== CUSTOMER: GET ORDERS ========== */
  listBySession: (sessionId) => ({
    url: `/api/order/session/${sessionId}`,
    method: "GET",
  }),

  getDetails: (orderId) => ({
    url: `/api/order/${orderId}`,
    method: "GET",
  }),

  /* ========== STAFF: ORDER MANAGEMENT ========== */
  listSessionOrdersStaff: (sessionId) => ({
    url: `/api/order/session/${sessionId}/staff`,
    method: "GET",
  }),

  listRestaurantOrders: (restaurantId, params = {}) => ({
    url: `/api/restaurants/${restaurantId}/orders`,
    method: "GET",
    params,
  }),

  updateItemStatus: (orderId, itemIndex) => ({
    url: `/api/order/${orderId}/item/${itemIndex}/status`,
    method: "PATCH",
    // body: { status: "IN_PROGRESS" | "READY" | "SERVED" | "CANCELLED" }
  }),

  /* ========== KITCHEN DISPLAY (NO PRICING) ========== */
  getKitchenOrders: (restaurantId, params = {}) => ({
    url: `/api/kitchen/${restaurantId}/orders`,
    method: "GET",
    params, // { stationFilter?: "grill" | "fryer" | etc }
  }),

  getKitchenOrderDetail: (orderId) => ({
    url: `/api/kitchen/order/${orderId}`,
    method: "GET",
  }),

  updateKitchenItemStatus: (orderId, itemIndex) => ({
    url: `/api/kitchen/order/${orderId}/item/${itemIndex}/status`,
    method: "PATCH",
    // body: { status: "IN_PROGRESS" | "READY" | "SERVED" | "CANCELLED" }
  }),

  /* ========== RETRY/RECOVERY ========== */
  retryPlacement: {
    url: "/api/order/retry",
    method: "POST",
    // body: { sessionId, restaurantId, idempotencyKey }
  },

  checkPlacementStatus: (idempotencyKey) => ({
    url: `/api/order/status/${idempotencyKey}`,
    method: "GET",
  }),
};

/**
 * Generate unique idempotency key for order placement
 * Prevents duplicate orders on network retry
 */
export function generateIdempotencyKey() {
  return uuidv4();
}

export default orderApi;
