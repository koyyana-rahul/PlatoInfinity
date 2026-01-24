import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Delivery Orders API
 * Real-world integration with Swiggy, Zomato, and custom online delivery
 */

/**
 * Create new delivery order
 * Used for: Creating orders from online platforms
 * @param {string} restaurantId - Restaurant ID
 * @param {object} orderData - Order details
 * @returns {Promise} Delivery order created
 */
export const createDeliveryOrder = (restaurantId, orderData) => {
  return axios.post(
    `${API_BASE}/restaurants/${restaurantId}/delivery/orders`,
    orderData,
  );
};

/**
 * Get all delivery orders with filters
 * Used for: Listing all delivery orders
 * @param {string} restaurantId - Restaurant ID
 * @param {object} filters - Query filters
 * @returns {Promise} Array of delivery orders
 */
export const listDeliveryOrders = (restaurantId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.platform) params.append("platform", filters.platform);
  if (filters.paymentStatus)
    params.append("paymentStatus", filters.paymentStatus);
  if (filters.page) params.append("page", filters.page);
  if (filters.limit) params.append("limit", filters.limit);

  return axios.get(
    `${API_BASE}/restaurants/${restaurantId}/delivery/orders?${params.toString()}`,
  );
};

/**
 * Get specific delivery order details
 * Used for: Viewing order details, tracking
 * @param {string} restaurantId - Restaurant ID
 * @param {string} orderId - Order ID
 * @returns {Promise} Delivery order details
 */
export const getDeliveryOrderDetail = (restaurantId, orderId) => {
  return axios.get(
    `${API_BASE}/restaurants/${restaurantId}/delivery/orders/${orderId}`,
  );
};

/**
 * Update delivery order status
 * Used for: Updating order status (CONFIRMED, PREPARING, READY_FOR_PICKUP, etc.)
 * @param {string} restaurantId - Restaurant ID
 * @param {string} orderId - Order ID
 * @param {object} statusData - Status update data
 * @returns {Promise} Updated delivery order
 */
export const updateDeliveryOrderStatus = (
  restaurantId,
  orderId,
  statusData,
) => {
  return axios.patch(
    `${API_BASE}/restaurants/${restaurantId}/delivery/orders/${orderId}/status`,
    statusData,
  );
};

/**
 * Assign delivery partner to order
 * Used for: Assigning partner for delivery
 * @param {string} restaurantId - Restaurant ID
 * @param {string} orderId - Order ID
 * @param {object} partnerData - Partner assignment data
 * @returns {Promise} Updated delivery order with partner assigned
 */
export const assignDeliveryPartner = (restaurantId, orderId, partnerData) => {
  return axios.post(
    `${API_BASE}/restaurants/${restaurantId}/delivery/orders/${orderId}/assign-partner`,
    partnerData,
  );
};

/**
 * Update delivery partner location
 * Used for: Real-time GPS tracking
 * @param {string} restaurantId - Restaurant ID
 * @param {string} orderId - Order ID
 * @param {object} location - Location data (latitude, longitude)
 * @returns {Promise} Location updated
 */
export const updateDeliveryPartnerLocation = (
  restaurantId,
  orderId,
  location,
) => {
  return axios.patch(
    `${API_BASE}/restaurants/${restaurantId}/delivery/orders/${orderId}/location`,
    location,
  );
};

/**
 * Get orders assigned to delivery partner
 * Used for: Delivery partner app to view assigned orders
 * @param {string} restaurantId - Restaurant ID
 * @param {object} filters - Query filters
 * @returns {Promise} Array of assigned delivery orders
 */
export const getDeliveryPartnerOrders = (restaurantId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.page) params.append("page", filters.page);
  if (filters.limit) params.append("limit", filters.limit);

  return axios.get(
    `${API_BASE}/restaurants/${restaurantId}/delivery/partner/orders?${params.toString()}`,
  );
};

/**
 * Mark delivery as completed
 * Used for: Delivery partner to complete delivery
 * @param {string} restaurantId - Restaurant ID
 * @param {string} orderId - Order ID
 * @param {object} feedbackData - Delivery feedback
 * @returns {Promise} Delivery marked as complete
 */
export const completeDelivery = (restaurantId, orderId, feedbackData = {}) => {
  return axios.post(
    `${API_BASE}/restaurants/${restaurantId}/delivery/orders/${orderId}/complete`,
    feedbackData,
  );
};

/**
 * Cancel delivery order
 * Used for: Cancelling orders
 * @param {string} restaurantId - Restaurant ID
 * @param {string} orderId - Order ID
 * @param {object} cancelData - Cancellation details
 * @returns {Promise} Order cancelled
 */
export const cancelDeliveryOrder = (restaurantId, orderId, cancelData) => {
  return axios.post(
    `${API_BASE}/restaurants/${restaurantId}/delivery/orders/${orderId}/cancel`,
    cancelData,
  );
};

/**
 * Get delivery orders summary and analytics
 * Used for: Dashboard, reports, analytics
 * @param {string} restaurantId - Restaurant ID
 * @param {object} filters - Date range filters
 * @returns {Promise} Summary and analytics data
 */
export const getDeliveryOrdersSummary = (restaurantId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);

  return axios.get(
    `${API_BASE}/restaurants/${restaurantId}/delivery/summary?${params.toString()}`,
  );
};

export default {
  createDeliveryOrder,
  listDeliveryOrders,
  getDeliveryOrderDetail,
  updateDeliveryOrderStatus,
  assignDeliveryPartner,
  updateDeliveryPartnerLocation,
  getDeliveryPartnerOrders,
  completeDelivery,
  cancelDeliveryOrder,
  getDeliveryOrdersSummary,
};
