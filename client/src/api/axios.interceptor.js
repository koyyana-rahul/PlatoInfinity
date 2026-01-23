import Axios from "./axios";
import AuthAxios from "./authAxios";

let initialized = false;

export function initAxiosInterceptors() {
  if (initialized) return;
  initialized = true;

  /* =====================================================
     REQUEST INTERCEPTOR
     Attach RAW customer session token
  ===================================================== */
  Axios.interceptors.request.use(
    (config) => {
      const url = config.url || "";

      // ❌ NEVER attach session to public or auth routes
      if (url.startsWith("/api/public") || url.startsWith("/api/auth")) {
        return config;
      }

      // ✅ CUSTOMER PROTECTED ROUTES
      if (
        url.startsWith("/api/cart") ||
        url.startsWith("/api/order") ||
        url.startsWith("/api/customer")
      ) {
        let sessionToken = null;
        let sessionKey = null;

        // NEW: Try to get tableId from URL for accuracy
        const match = window.location.pathname.match(/table\/([^/]+)/);
        if (match) {
          const tableId = match[1];
          sessionKey = `plato:customerSession:${tableId}`;
          sessionToken = localStorage.getItem(sessionKey);
          console.log(
            `🎯 Found tableId '${tableId}' in URL, using session key: ${sessionKey}`,
          );
        }

        // FALLBACK: If no tableId in URL, use the old (less reliable) method
        if (!sessionToken) {
          console.log(
            "⚠️ Could not find session token using tableId from URL, trying fallback.",
          );
          sessionKey = Object.keys(localStorage).find((k) =>
            k.startsWith("plato:customerSession:"),
          );
          if (sessionKey) {
            sessionToken = localStorage.getItem(sessionKey);
          }
        }

        if (sessionToken) {
          config.headers["x-customer-session"] = sessionToken;
          console.log(
            "✅ Attached session token to",
            url,
            "| Token:",
            sessionToken.substring(0, 10) + "...",
          );
        } else {
          console.warn("⚠️ No session token found in localStorage for", url);
        }
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  /* =====================================================
     RESPONSE INTERCEPTOR
     ❌ NO RETRY FOR CUSTOMER FLOWS
  ===================================================== */
  Axios.interceptors.response.use(
    (res) => {
      // Log join response for debugging
      if (res.config.url?.includes("/sessions/join")) {
        console.log("📥 Join response received");
        console.log("📥 Response data:", res.data);
        console.log("📥 sessionToken:", res.data?.data?.sessionToken);
      }
      return res;
    },
    async (err) => {
      const original = err.config;

      if (!err.response || err.response.status !== 401) {
        return Promise.reject(err);
      }

      // ❌ NEVER retry customer APIs
      if (
        original.url?.startsWith("/api/cart") ||
        original.url?.startsWith("/api/order") ||
        original.url?.startsWith("/api/public")
      ) {
        return Promise.reject(err);
      }

      // ❌ NEVER refresh auth routes
      if (original.url?.startsWith("/api/auth")) {
        return Promise.reject(err);
      }

      if (original._retry) {
        return Promise.reject(err);
      }

      original._retry = true;

      try {
        await AuthAxios.post("/api/auth/refresh-token");
        return Axios(original);
      } catch {
        return Promise.reject(err);
      }
    },
  );
}
