/**
 * orderConstants.js
 * Constants for order states, statuses, and transitions
 */

export const ORDER_STATUS = {
  NEW: "NEW",
  IN_PROGRESS: "IN_PROGRESS",
  READY: "READY",
  SERVED: "SERVED",
  CANCELLED: "CANCELLED",
  REJECTED: "REJECTED",
};

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
};

export const PAYMENT_METHOD = {
  CASH: "CASH",
  CARD: "CARD",
  UPI: "UPI",
  WALLET: "WALLET",
  ONLINE: "ONLINE",
};

export const ORDER_FLOW = {
  MENU: "menu",
  CART: "cart",
  CHECKOUT: "checkout",
  PAYMENT: "payment",
  ORDERS: "orders",
  TRACKING: "tracking",
  BILL: "bill",
};

export const getOrderStatusColor = (status) => {
  const colors = {
    [ORDER_STATUS.NEW]: "bg-yellow-100 text-yellow-800",
    [ORDER_STATUS.IN_PROGRESS]: "bg-blue-100 text-blue-800",
    [ORDER_STATUS.READY]: "bg-green-100 text-green-800",
    [ORDER_STATUS.SERVED]: "bg-emerald-100 text-emerald-800",
    [ORDER_STATUS.CANCELLED]: "bg-red-100 text-red-800",
    [ORDER_STATUS.REJECTED]: "bg-red-200 text-red-900",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

export const getOrderStatusLabel = (status) => {
  const labels = {
    [ORDER_STATUS.NEW]: "New order",
    [ORDER_STATUS.IN_PROGRESS]: "Preparing",
    [ORDER_STATUS.READY]: "Ready",
    [ORDER_STATUS.SERVED]: "Served",
    [ORDER_STATUS.CANCELLED]: "Cancelled",
    [ORDER_STATUS.REJECTED]: "Rejected",
  };
  return labels[status] || status;
};

export default {
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  ORDER_FLOW,
  getOrderStatusColor,
  getOrderStatusLabel,
};
