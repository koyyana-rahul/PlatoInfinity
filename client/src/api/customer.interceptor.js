/**
 * CUSTOMER API INTERCEPTOR
 * Handles session management, retries, and error recovery
 * for all customer-facing API calls
 */

import axios from "axios";
import store from "../store/store.js";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Create customer-specific axios instance
 */
const customerAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds for customer operations
  withCredentials: true,
});

/**
 * Request Interceptor
 * Adds session token to all customer API calls
 */
customerAxios.interceptors.request.use(
  (config) => {
    // Skip adding session token for public endpoints
    if (config.url?.includes("/public")) {
      return config;
    }

    // Get session token from sessionStorage (per-browser session)
    const sessionToken = sessionStorage.getItem("x-customer-session");
    if (sessionToken) {
      config.headers["x-customer-session"] = sessionToken;
    }

    // Get session ID for reference
    const sessionId = sessionStorage.getItem("sessionId");
    if (sessionId) {
      config.headers["x-session-id"] = sessionId;
    }

    // Add unique request ID for tracking
    config.headers["x-request-id"] =
      `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor
 * Handles errors, session expiry, and retries
 */
customerAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config;

    // Track retry attempts
    config.retryCount = config.retryCount || 0;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = Math.pow(2, config.retryCount) * 1000; // Exponential backoff

    // ═══════════════════════════════════════════════════════════════
    // SESSION EXPIRED (401 Unauthorized)
    // ═══════════════════════════════════════════════════════════════
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || "";

      // Session expired - don't retry, redirect to join
      if (
        errorMessage.includes("session") ||
        errorMessage.includes("expired")
      ) {
        // Clear session storage
        sessionStorage.removeItem("x-customer-session");
        sessionStorage.removeItem("sessionId");
        sessionStorage.removeItem("tableId");

        // Dispatch Redux action to reset customer state
        store.dispatch({ type: "CUSTOMER_SESSION_EXPIRED" });

        // Return error with action hint
        return Promise.reject({
          ...error,
          isSessionExpired: true,
          userMessage:
            "Your session has expired. Please scan the QR code again.",
          action: "REDIRECT_TO_JOIN",
        });
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // VALIDATION ERROR (400 Bad Request)
    // ═══════════════════════════════════════════════════════════════
    if (error.response?.status === 400) {
      const errors = error.response?.data?.errors || [];
      const message = error.response?.data?.message || "Invalid request";

      return Promise.reject({
        ...error,
        isValidationError: true,
        userMessage: message,
        validationErrors: errors,
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // FORBIDDEN (403 Access Denied)
    // ═══════════════════════════════════════════════════════════════
    if (error.response?.status === 403) {
      return Promise.reject({
        ...error,
        isForbidden: true,
        userMessage: "You don't have permission to perform this action.",
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // SERVER ERROR (5xx) - RETRY WITH BACKOFF
    // ═══════════════════════════════════════════════════════════════
    if (
      !error.response ||
      (error.response?.status >= 500 && error.response?.status < 600)
    ) {
      // Don't retry idempotent GET requests too aggressively
      const isIdempotent = ["GET", "HEAD"].includes(
        config.method?.toUpperCase(),
      );

      if (config.retryCount < MAX_RETRIES) {
        config.retryCount++;

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));

        console.warn(
          `[API Retry] Attempt ${config.retryCount}/${MAX_RETRIES} for ${config.method} ${config.url}`,
        );

        return customerAxios(config);
      }

      // Max retries exceeded
      return Promise.reject({
        ...error,
        isNetworkError: true,
        userMessage:
          "Unable to connect to the server. Please check your connection and try again.",
        action: "SHOW_RETRY_BUTTON",
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // NETWORK TIMEOUT - RETRY
    // ═══════════════════════════════════════════════════════════════
    if (error.code === "ECONNABORTED" || error.message === "Network Error") {
      if (config.retryCount < MAX_RETRIES) {
        config.retryCount++;

        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));

        console.warn(
          `[Network Retry] Attempt ${config.retryCount}/${MAX_RETRIES} for ${config.url}`,
        );

        return customerAxios(config);
      }

      return Promise.reject({
        ...error,
        isNetworkTimeout: true,
        userMessage: "Network connection lost. Please check your connection.",
        userAction: "CHECK_INTERNET",
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // UNKNOWN ERROR
    // ═══════════════════════════════════════════════════════════════
    return Promise.reject({
      ...error,
      isUnknownError: true,
      userMessage: "Something went wrong. Please try again.",
    });
  },
);

export default customerAxios;

/**
 * INTERCEPTOR BEHAVIOR SUMMARY
 * ════════════════════════════════════════════════════════════════
 *
 * REQUEST:
 * ────────
 * 1. Automatically includes x-customer-session header
 * 2. Includes session ID and unique request ID for tracking
 * 3. Timeout: 15 seconds (suitable for customer operations)
 *
 * RESPONSE SUCCESS:
 * ─────────────────
 * Returns response directly
 *
 * RESPONSE ERRORS:
 * ────────────────
 *
 * 401 (Session Expired):
 * - Clears session storage
 * - Dispatches Redux action
 * - Returns error with isSessionExpired flag
 * - UI should show "Session Expired" modal
 * - Offer: "Scan QR again" or "Resume Session"
 *
 * 400 (Validation Error):
 * - Returns with isValidationError flag
 * - Includes validation errors array
 * - UI should display field-specific errors
 *
 * 403 (Forbidden):
 * - Returns with isForbidden flag
 * - UI should show "Access Denied" message
 *
 * 5xx or Network Error:
 * - AUTOMATIC RETRY with exponential backoff
 * - Retry Count: Up to 3 attempts
 * - Backoff: 1s, 2s, 4s
 * - If all retries fail: Error with isNetworkError flag
 *
 * ECONNABORTED (Timeout):
 * - AUTOMATIC RETRY with exponential backoff
 * - Same logic as 5xx errors
 *
 * Network Error:
 * - AUTOMATIC RETRY with exponential backoff
 * - Returns with isNetworkTimeout flag if max retries exceeded
 *
 * USAGE IN COMPONENTS:
 * ──────────────────────
 *
 * try {
 *   const response = await customerAxios.post('/api/order/place', {
 *     sessionId,
 *     items,
 *     tablePin
 *   });
 *   // Success
 * } catch (error) {
 *   if (error.isSessionExpired) {
 *     // Show "Session Expired" modal, offer resume
 *   } else if (error.isValidationError) {
 *     // Show validation errors to user
 *   } else if (error.isNetworkError) {
 *     // Show "Network Error" with retry button
 *   } else {
 *     // Show generic error
 *   }
 * }
 *
 * ════════════════════════════════════════════════════════════════
 */
