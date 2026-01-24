/**
 * useCustomerSession.js
 *
 * Custom React hook for managing customer session:
 * - PIN entry and verification
 * - Session token storage and recovery
 * - Token expiry handling
 * - Real-time cart synchronization
 * - Order status tracking
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Axios from "../api/axios";
import sessionApi from "../api/session.api";
import customerApi from "../api/customer.api";
import toast from "react-hot-toast";
import { socketService } from "../api/socket.service";

const SESSION_STORAGE_KEY = "plato:session";
const TOKEN_STORAGE_KEY = "plato:token";
const DEVICE_ID_KEY = "plato:deviceId";

export function useCustomerSession(tableId, restaurantId) {
  // Session state
  const [session, setSession] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Failure recovery state
  const [tokenExpired, setTokenExpired] = useState(false);
  const [sessionResumeAttempt, setSessionResumeAttempt] = useState(false);

  // Refs
  const sessionCheckInterval = useRef(null);
  const socketInitialized = useRef(false);

  /* ========== GET OR CREATE DEVICE ID ========== */
  const getDeviceId = useCallback(() => {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }, []);

  /* ========== LOAD SESSION FROM STORAGE ========== */
  const loadSessionFromStorage = useCallback(async () => {
    try {
      const storedSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (storedSession && storedToken) {
        const sessionData = JSON.parse(storedSession);
        console.log("✅ Session loaded from storage");
        setSession(sessionData);
        setSessionToken(storedToken);
        setIsAuthenticated(true);

        // Check if token is still valid
        const expiry = await checkTokenValidity(storedToken, sessionData._id);
        if (expiry.expired) {
          setTokenExpired(true);
          return false;
        }

        return true;
      }
    } catch (err) {
      console.error("❌ Failed to load session:", err);
    }
    return false;
  }, []);

  /* ========== VERIFY PIN & JOIN SESSION ========== */
  const verifyPin = useCallback(
    async (pin) => {
      try {
        setLoading(true);
        setPinError("");

        const res = await Axios({
          ...sessionApi.joinWithPin,
          data: {
            tableId,
            tablePin: pin,
          },
        });

        const { sessionId, sessionToken: rawToken, mode } = res.data?.data;

        if (!sessionId || !rawToken) {
          throw new Error("Invalid server response");
        }

        // Store session and token
        sessionStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({
            _id: sessionId,
            tableId,
            restaurantId,
            mode,
          }),
        );
        localStorage.setItem(TOKEN_STORAGE_KEY, rawToken);

        console.log("✅ PIN verified, session started");
        console.log("🔑 Token length:", rawToken.length);

        setSession({
          _id: sessionId,
          tableId,
          restaurantId,
          mode,
        });
        setSessionToken(rawToken);
        setIsAuthenticated(true);

        toast.success("Welcome! Session started.");
        return true;
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err.message ||
          "PIN verification failed";

        console.error("❌ PIN error:", message);
        setPinError(message);
        toast.error(message);

        // Show attempts remaining if available
        if (err?.response?.data?.attemptsLeft !== undefined) {
          const left = err.response.data.attemptsLeft;
          toast.error(`${left} attempts remaining`);
        }

        return false;
      } finally {
        setLoading(false);
      }
    },
    [tableId, restaurantId],
  );

  /* ========== RESUME SESSION AFTER COOKIE LOSS ========== */
  const resumeSession = useCallback(
    async (pin) => {
      try {
        setLoading(true);
        setSessionResumeAttempt(true);

        const res = await Axios({
          ...sessionApi.resumeSession,
          data: {
            tableId,
            tablePin: pin,
            restaurantId,
          },
        });

        const { sessionId, sessionToken: rawToken } = res.data?.data;

        // Restore session
        sessionStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({
            _id: sessionId,
            tableId,
            restaurantId,
          }),
        );
        localStorage.setItem(TOKEN_STORAGE_KEY, rawToken);

        setSession({ _id: sessionId, tableId, restaurantId });
        setSessionToken(rawToken);
        setIsAuthenticated(true);
        setTokenExpired(false);

        toast.success("Session resumed. Your cart is safe.");
        return true;
      } catch (err) {
        toast.error(
          err?.response?.data?.message ||
            "Failed to resume session. Please try again.",
        );
        return false;
      } finally {
        setLoading(false);
        setSessionResumeAttempt(false);
      }
    },
    [tableId, restaurantId],
  );

  /* ========== CHECK TOKEN VALIDITY ========== */
  const checkTokenValidity = useCallback(async (token, sessionId) => {
    try {
      const res = await Axios({
        ...sessionApi.checkTokenExpiry,
        data: { sessionId },
      });

      if (res.data?.expired) {
        setTokenExpired(true);
        return { expired: true };
      }

      return { expired: false };
    } catch (err) {
      console.error("Token validity check failed:", err);
      return { expired: true };
    }
  }, []);

  /* ========== CONNECT TO SOCKET.IO ========== */
  const connectSocket = useCallback(async () => {
    if (socketInitialized.current || !sessionToken) {
      return;
    }

    try {
      socketInitialized.current = true;
      await socketService.connect(sessionToken);

      if (session) {
        socketService.joinSessionRoom(session._id, session.restaurantId);
      }

      setSocketConnected(true);

      /* ========== LISTEN FOR CART UPDATES (FAMILY MODE) ========== */
      if (session?.mode === "FAMILY") {
        socketService.onCartUpdated((cartData) => {
          console.log("📦 Cart updated:", cartData);
          // Cart will be re-fetched on next query
        });
      }

      /* ========== LISTEN FOR ORDER UPDATES ========== */
      socketService.onOrderStatusChanged((orderData) => {
        console.log("📋 Order updated:", orderData);
      });

      /* ========== LISTEN FOR PAYMENT NOTIFICATIONS ========== */
      socketService.onPaymentCompleted((paymentData) => {
        console.log("💳 Payment completed:", paymentData);
      });

      /* ========== LISTEN FOR SESSION CLOSE ========== */
      socketService.onSessionClosed(() => {
        console.log("🔒 Session closed by staff");
        logoutSession();
        toast.info("Your session has been closed. Thank you!");
      });

      console.log("✅ Socket connected and listeners attached");
    } catch (err) {
      console.error("❌ Socket connection failed:", err);
      socketInitialized.current = false;
      // Non-blocking failure - app still works without real-time updates
    }
  }, [sessionToken, session]);

  /* ========== PERIODIC TOKEN VALIDITY CHECK ========== */
  useEffect(() => {
    if (!isAuthenticated || !session) {
      return;
    }

    // Check token every 2 minutes
    sessionCheckInterval.current = setInterval(
      async () => {
        const validity = await checkTokenValidity(sessionToken, session._id);
        if (validity.expired) {
          console.warn("⏰ Token expired");
          setTokenExpired(true);
          socketService.disconnect();
          socketInitialized.current = false;
        }
      },
      2 * 60 * 1000,
    );

    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
    };
  }, [isAuthenticated, session, sessionToken, checkTokenValidity]);

  /* ========== CONNECT SOCKET ON AUTHENTICATION ========== */
  useEffect(() => {
    if (isAuthenticated && sessionToken && !socketConnected) {
      connectSocket();
    }

    return () => {
      // Cleanup on unmount
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
    };
  }, [isAuthenticated, sessionToken, socketConnected, connectSocket]);

  /* ========== CLEANUP ON UNMOUNT ========== */
  useEffect(() => {
    return () => {
      socketService.disconnect();
    };
  }, []);

  /* ========== LOGOUT/CLEAR SESSION ========== */
  const logoutSession = useCallback(() => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setSession(null);
    setSessionToken(null);
    setIsAuthenticated(false);
    socketService.disconnect();
    socketInitialized.current = false;
    console.log("✅ Session cleared");
  }, []);

  /* ========== BROADCAST CART UPDATE (FAMILY MODE) ========== */
  const broadcastCart = useCallback(
    (cartData) => {
      if (session?.mode === "FAMILY" && socketConnected) {
        socketService.broadcastCartUpdate(cartData);
      }
    },
    [session?.mode, socketConnected],
  );

  return {
    // Session state
    session,
    sessionToken,
    isAuthenticated,
    loading,
    socketConnected,

    // Failure recovery
    tokenExpired,
    sessionResumeAttempt,
    pinError,

    // Methods
    verifyPin,
    resumeSession,
    logoutSession,
    broadcastCart,
    getDeviceId,

    // Utilities
    loadSessionFromStorage,
  };
}

export default useCustomerSession;
