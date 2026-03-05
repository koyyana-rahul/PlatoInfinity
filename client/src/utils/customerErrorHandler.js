/**
 * CUSTOMER ERROR HANDLER
 * Converts technical errors into user-friendly messages and actions
 */

/**
 * Error categories for handling
 */
export const ERROR_CATEGORIES = {
  SESSION: "SESSION",
  VALIDATION: "VALIDATION",
  NETWORK: "NETWORK",
  AUTH: "AUTH",
  SERVER: "SERVER",
  BUSINESS: "BUSINESS",
  UNKNOWN: "UNKNOWN",
};

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES = {
  // Session Errors
  SESSION_EXPIRED:
    "Your session has expired. Please scan the QR code again to rejoin.",
  SESSION_INVALID: "This session is no longer valid. Please start fresh.",
  SESSION_CLOSED: "This table's session has been closed.",

  // PIN Errors
  PIN_INCORRECT: "Incorrect PIN. Please try again.",
  PIN_LOCKED: "Too many incorrect attempts. Account locked for 30 minutes.",
  PIN_REQUIRED: "PIN is required to place an order.",
  PIN_INVALID_FORMAT: "PIN must be 4 digits.",

  // Cart Errors
  CART_EMPTY: "Your cart is empty. Add items before checking out.",
  CART_ITEM_UNAVAILABLE:
    "One or more items in your cart are no longer available.",
  CART_ITEM_OUT_OF_STOCK: "This item is out of stock. Please remove from cart.",

  // Order Errors
  ORDER_ALREADY_EXISTS: "You have already placed an order. Wait for it.",
  ORDER_CANNOT_PLACE:
    "Unable to place order. Try again or contact your server.",
  ORDER_DUPLICATE:
    "This order appears to have been placed already. Check your order history.",
  ORDER_SESSION_MISMATCH: "Order session doesn't match. Please try again.",

  // Restaurant Errors
  RESTAURANT_CLOSED: "Restaurant is closed. Orders cannot be placed.",
  KITCHEN_CLOSED: "Kitchen is closed. Try again later.",
  TABLE_INACTIVE: "This table is no longer active.",
  TABLE_NOT_FOUND: "Table not found. Please scan the QR code again.",

  // Network Errors
  NETWORK_TIMEOUT: "Connection timeout. Check your internet and try again.",
  NETWORK_OFFLINE: "You're offline. Connect to internet to place orders.",
  NETWORK_SLOW: "Slow connection detected. Retrying... (Attempt 2/3)",

  // Validation Errors
  INVALID_QUANTITY: "Quantity must be between 1 and 100.",
  INVALID_AMOUNT: "Invalid amount. Please check and try again.",
  INVALID_INPUT: "Some fields have errors. Please check and try again.",
  ITEMS_INVALID: "One or more items invalid. Please refresh menu.",

  // Payment Errors
  PAYMENT_METHOD_FAILED: "Payment method not available. Try another method.",
  PAYMENT_PROCESSING: "Payment is being processed. Please wait...",

  // Server Errors
  SERVER_ERROR: "Server error. Our team has been notified. Please try again.",
  SERVICE_UNAVAILABLE: "Service temporarily unavailable. Try again in moment.",
  DATABASE_ERROR:
    "Database error. Your order might not be saved. Contact support.",

  // Generic Errors
  TRY_AGAIN: "Something went wrong. Please try again.",
  CONTACT_SUPPORT: "Please contact support if this persists.",
};

/**
 * Error categorizer - maps error details to user-friendly messages
 */
export const categorizeError = (error) => {
  const response = error.response?.data;

  // Session-related errors
  if (
    error.isSessionExpired ||
    error.response?.status === 401 ||
    response?.message?.includes("session")
  ) {
    return {
      category: ERROR_CATEGORIES.SESSION,
      message: ERROR_MESSAGES.SESSION_EXPIRED,
      action: "REDIRECT_TO_JOIN",
      severity: "HIGH",
    };
  }

  // PIN errors
  if (response?.message?.includes("PIN")) {
    if (response?.message?.includes("locked")) {
      return {
        category: ERROR_CATEGORIES.AUTH,
        message: ERROR_MESSAGES.PIN_LOCKED,
        action: "WAIT_30_MINUTES",
        severity: "HIGH",
      };
    }
    if (response?.message?.includes("Incorrect")) {
      return {
        category: ERROR_CATEGORIES.AUTH,
        message: `${ERROR_MESSAGES.PIN_INCORRECT} ${
          response?.attemptsLeft
            ? `(${response.attemptsLeft} attempts left)`
            : ""
        }`,
        action: "RETRY_PIN",
        severity: "MEDIUM",
      };
    }
    return {
      category: ERROR_CATEGORIES.AUTH,
      message: ERROR_MESSAGES.PIN_REQUIRED,
      action: "SHOW_PIN_FORM",
      severity: "MEDIUM",
    };
  }

  // Cart errors
  if (response?.message?.includes("cart")) {
    if (response?.message?.includes("empty")) {
      return {
        category: ERROR_CATEGORIES.VALIDATION,
        message: ERROR_MESSAGES.CART_EMPTY,
        action: "BROWSE_MENU",
        severity: "LOW",
      };
    }
    if (response?.message?.includes("unavailable")) {
      return {
        category: ERROR_CATEGORIES.BUSINESS,
        message: ERROR_MESSAGES.CART_ITEM_UNAVAILABLE,
        action: "REMOVE_UNAVAILABLE",
        severity: "MEDIUM",
      };
    }
  }

  // Validation errors
  if (error.isValidationError || error.response?.status === 400) {
    const validationErrors = error.validationErrors || [];
    let message = ERROR_MESSAGES.INVALID_INPUT;

    if (validationErrors.length === 1) {
      const field = validationErrors[0].field;
      if (field?.includes("quantity")) {
        message = ERROR_MESSAGES.INVALID_QUANTITY;
      } else if (field?.includes("amount")) {
        message = ERROR_MESSAGES.INVALID_AMOUNT;
      }
    }

    return {
      category: ERROR_CATEGORIES.VALIDATION,
      message,
      action: "SHOW_VALIDATION_ERRORS",
      severity: "MEDIUM",
      validationErrors,
    };
  }

  // Network errors
  if (error.isNetworkError || error.isNetworkTimeout) {
    return {
      category: ERROR_CATEGORIES.NETWORK,
      message: ERROR_MESSAGES.NETWORK_TIMEOUT,
      action: "SHOW_RETRY_BUTTON",
      severity: "HIGH",
      shouldRetry: true,
    };
  }

  // Order-related errors
  if (response?.message?.includes("order")) {
    if (response?.message?.includes("already")) {
      return {
        category: ERROR_CATEGORIES.BUSINESS,
        message: ERROR_MESSAGES.ORDER_ALREADY_EXISTS,
        action: "SHOW_ORDER_HISTORY",
        severity: "MEDIUM",
      };
    }
    if (response?.message?.includes("duplicate")) {
      return {
        category: ERROR_CATEGORIES.BUSINESS,
        message: ERROR_MESSAGES.ORDER_DUPLICATE,
        action: "CHECK_ORDER_HISTORY",
        severity: "HIGH",
      };
    }
  }

  // Restaurant/Kitchen closed
  if (
    response?.message?.includes("closed") ||
    response?.message?.includes("Kitchen")
  ) {
    return {
      category: ERROR_CATEGORIES.BUSINESS,
      message: ERROR_MESSAGES.RESTAURANT_CLOSED,
      action: "NONE",
      severity: "MEDIUM",
    };
  }

  // Table not found
  if (response?.message?.includes("table")) {
    return {
      category: ERROR_CATEGORIES.BUSINESS,
      message: ERROR_MESSAGES.TABLE_NOT_FOUND,
      action: "SCAN_QR_AGAIN",
      severity: "HIGH",
    };
  }

  // Server errors
  if (error.response?.status >= 500) {
    return {
      category: ERROR_CATEGORIES.SERVER,
      message: ERROR_MESSAGES.SERVER_ERROR,
      action: "SHOW_RETRY_BUTTON",
      severity: "HIGH",
      shouldRetry: true,
    };
  }

  // Forbidden access
  if (error.response?.status === 403 || error.isForbidden) {
    return {
      category: ERROR_CATEGORIES.AUTH,
      message: "You don't have permission for this action.",
      action: "CONTACT_SUPPORT",
      severity: "MEDIUM",
    };
  }

  // Unknown error
  return {
    category: ERROR_CATEGORIES.UNKNOWN,
    message: ERROR_MESSAGES.TRY_AGAIN,
    action: "RETRY",
    severity: "MEDIUM",
  };
};

/**
 * Error toast messages
 */
export const getErrorToast = (error) => {
  const categorized = categorizeError(error);

  return {
    message: categorized.message,
    type: "error",
    duration: categorized.severity === "HIGH" ? 5000 : 3000,
    action: categorized.action,
  };
};

/**
 * Log error for monitoring
 */
export const logError = (error, context = {}) => {
  const categorized = categorizeError(error);

  // In production, send to error tracking service (Sentry, LogRocket, etc.)
  console.error("[Customer Error]", {
    category: categorized.category,
    message: categorized.message,
    severity: categorized.severity,
    originalError: error.message || error.toString(),
    status: error.response?.status,
    url: error.config?.url,
    method: error.config?.method,
    context,
    timestamp: new Date().toISOString(),
  });

  // Example: Send to Sentry
  // if (window.Sentry) {
  //   window.Sentry.captureException(error, {
  //     tags: { category: categorized.category, severity: categorized.severity },
  //     ...context
  //   });
  // }
};

/**
 * Check if error should trigger refresh
 */
export const shouldRefreshAfterError = (error) => {
  const categorized = categorizeError(error);
  return categorized.action === "REDIRECT_TO_JOIN";
};

/**
 * Build error display object for UI
 */
export const buildErrorDisplay = (error, additionalContext = {}) => {
  const categorized = categorizeError(error);

  return {
    category: categorized.category,
    message: categorized.message,
    action: categorized.action,
    severity: categorized.severity,
    shouldRetry: categorized.shouldRetry || false,
    validationErrors: categorized.validationErrors || [],
    timestamp: new Date().toISOString(),
    ...additionalContext,
  };
};

export default {
  categorizeError,
  getErrorToast,
  logError,
  shouldRefreshAfterError,
  buildErrorDisplay,
  ERROR_CATEGORIES,
  ERROR_MESSAGES,
};
