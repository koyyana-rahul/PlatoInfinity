/**
 * formatters.js
 * Production-ready formatting utilities for display
 */

/**
 * Format currency (Indian Rupee)
 * @param {number} amount
 * @returns {string} formatted amount like ₹1,234.56
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "₹0.00";
  return `₹${parseFloat(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format number with commas
 * @param {number} num
 * @returns {string} formatted number like 1,234
 */
export const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return parseFloat(num).toLocaleString("en-IN");
};

/**
 * Format percentage
 * @param {number} value
 * @param {number} decimals
 * @returns {string} formatted percentage like 45.67%
 */
export const formatPercentage = (value, decimals = 2) => {
  if (!value && value !== 0) return "0%";
  return `${parseFloat(value).toFixed(decimals)}%`;
};

/**
 * Format date to readable format
 * @param {string|Date} date
 * @returns {string} formatted date like "24 Jan, 2026"
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Format time to readable format
 * @param {string|Date} date
 * @returns {string} formatted time like "02:30 PM"
 */
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Format date and time together
 * @param {string|Date} date
 * @returns {string} formatted datetime like "24 Jan, 2026 02:30 PM"
 */
export const formatDateTime = (date) => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date
 * @returns {string} relative time
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const time = new Date(date);
  const diffMs = now - time;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return formatDate(date);
};

/**
 * Format phone number
 * @param {string} phone
 * @returns {string} formatted phone like "+91 98765 43210"
 */
export const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

/**
 * Format order status to readable text
 * @param {string} status
 * @returns {string} readable status
 */
export const formatOrderStatus = (status) => {
  const statusMap = {
    PLACED: "Order Placed",
    CONFIRMED: "Confirmed",
    PREPARING: "Preparing",
    READY: "Ready to Serve",
    SERVED: "Served",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    FAILED: "Failed",
  };
  return statusMap[status] || status;
};

/**
 * Format payment method
 * @param {string} method
 * @returns {string} readable payment method
 */
export const formatPaymentMethod = (method) => {
  const methodMap = {
    CASH: "Cash",
    CARD: "Card",
    UPI: "UPI",
    WALLET: "Wallet",
    ONLINE: "Online Payment",
    PREPAID: "Prepaid",
  };
  return methodMap[method] || method;
};

/**
 * Truncate text
 * @param {string} text
 * @param {number} length
 * @returns {string} truncated text with ellipsis
 */
export const truncateText = (text, length = 50) => {
  if (!text) return "";
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

/**
 * Format file size
 * @param {number} bytes
 * @returns {string} formatted size like "2.5 MB"
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
