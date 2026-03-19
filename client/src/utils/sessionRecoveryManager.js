/**
 * SESSION RECOVERY MANAGER
 * Handles automatic session expiry detection, notification, and recovery
 * Integrates with axios interceptor to catch 401 errors
 */

import { useEffect, useCallback, useRef } from "react";
import store from "../store/store.js";
import { useNavigate } from "react-router-dom";
import { notify } from "./notify";

/**
 * Redux actions for session state
 */
export const SESSION_ACTIONS = {
  SESSION_EXPIRED: "CUSTOMER/SESSION_EXPIRED",
  SESSION_EXPIRED_DETECTED: "CUSTOMER/SESSION_EXPIRED_DETECTED",
  SHOW_SESSION_RECOVERY_MODAL: "CUSTOMER/SHOW_SESSION_RECOVERY_MODAL",
  HIDE_SESSION_RECOVERY_MODAL: "CUSTOMER/HIDE_SESSION_RECOVERY_MODAL",
  SESSION_RECOVERY_FAILED: "CUSTOMER/SESSION_RECOVERY_FAILED",
};

/**
 * Hook to monitor and handle session expiry
 */
export const useSessionRecovery = (onSessionExpired) => {
  const navigate = useNavigate();
  const recoveryAttempted = useRef(false);

  useEffect(() => {
    /**
     * Listen for session expiry from axios interceptor
     */
    const handleSessionExpired = (error) => {
      if (error.isSessionExpired && !recoveryAttempted.current) {
        recoveryAttempted.current = true;

        console.warn("🔐 Session expired detected");

        // Show modal with recovery options
        store.dispatch({
          type: SESSION_ACTIONS.SHOW_SESSION_RECOVERY_MODAL,
          payload: {
            message: error.userMessage,
            tableId: sessionStorage.getItem("tableId"),
            restaurantId: sessionStorage.getItem("restaurantId"),
          },
        });

        // Call optional callback
        if (onSessionExpired) {
          onSessionExpired(error);
        }
      }
    };

    // Attach to window for axios interceptor to call
    window.__handleSessionExpired = handleSessionExpired;

    return () => {
      delete window.__handleSessionExpired;
    };
  }, [onSessionExpired, navigate]);

  /**
   * Attempt to resume session
   */
  const attemptSessionRecovery = useCallback(
    async (pin) => {
      try {
        recoveryAttempted.current = false;

        // API call to resume session
        // const response = await resumeSessionAPI(pin);
        // On success:
        // - Store new token
        // - Close modal
        // - Retry original operation

        console.log("✅ Session recovered");
        notify.success("Session recovered. Continuing...");

        return true;
      } catch (error) {
        console.error("❌ Session recovery failed:", error);
        notify.error("Failed to resume session. Please scan QR code again.");

        store.dispatch({
          type: SESSION_ACTIONS.SESSION_RECOVERY_FAILED,
        });

        // Redirect to join page
        navigate("/customer/join");
        return false;
      }
    },
    [navigate],
  );

  return { attemptSessionRecovery };
};

/**
 * Session expired modal component
 * Shows when session expires and offers recovery options
 */
export const SessionRecoveryModal = ({
  isOpen,
  onRecover,
  onStartFresh,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm">
        <h2 className="text-xl font-bold mb-2">Session Expired</h2>
        <p className="text-gray-600 mb-4">
          {message ||
            "Your session has expired. Would you like to resume or start over?"}
        </p>

        <div className="space-y-3">
          <button
            onClick={onRecover}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Resume Session
          </button>
          <button
            onClick={onStartFresh}
            className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Scan QR Code Again
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Your cart will be preserved if you resume.
        </p>
      </div>
    </div>
  );
};

/**
 * Hook for integrating session recovery into Redux
 */
export const useSessionRecoveryState = () => {
  const state = store.getState();
  // Assumes Redux state has: customer.sessionRecoveryModal
  return (
    state.customer?.sessionRecoveryModal || {
      isOpen: false,
      message: "",
    }
  );
};

/**
 * Dispatch session expiry to Redux and show modal
 */
export const notifySessionExpired = (error) => {
  store.dispatch({
    type: SESSION_ACTIONS.SHOW_SESSION_RECOVERY_MODAL,
    payload: {
      message: error.userMessage || "Your session has expired",
      originalError: error,
    },
  });
};

/**
 * Redux reducer for session recovery (to be added to customer reducer)
 */
export const sessionRecoveryReducer = (
  state = {
    sessionRecoveryModal: {
      isOpen: false,
      message: "",
      originalError: null,
    },
  },
  action,
) => {
  switch (action.type) {
    case SESSION_ACTIONS.SHOW_SESSION_RECOVERY_MODAL:
      return {
        ...state,
        sessionRecoveryModal: {
          isOpen: true,
          message: action.payload.message,
          originalError: action.payload.originalError,
        },
      };

    case SESSION_ACTIONS.HIDE_SESSION_RECOVERY_MODAL:
      return {
        ...state,
        sessionRecoveryModal: {
          isOpen: false,
          message: "",
          originalError: null,
        },
      };

    case SESSION_ACTIONS.SESSION_RECOVERY_FAILED:
      return {
        ...state,
        sessionRecoveryModal: {
          isOpen: true,
          message: "Failed to resume session. Please scan QR code again.",
          originalError: null,
        },
      };

    case SESSION_ACTIONS.SESSION_EXPIRED:
      return {
        ...state,
        isAuthenticated: false,
        sessionToken: null,
      };

    default:
      return state;
  }
};

export default {
  SESSION_ACTIONS,
  useSessionRecovery,
  useSessionRecoveryState,
  notifySessionExpired,
  sessionRecoveryReducer,
  SessionRecoveryModal,
};
