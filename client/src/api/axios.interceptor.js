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
        // 🔥 SINGLE SOURCE OF TRUTH
        const sessionToken = localStorage.getItem(
          "plato:customerSession:token"
        );

        if (sessionToken) {
          // MUST match backend exactly
          config.headers["x-customer-session"] = sessionToken;
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  /* =====================================================
     RESPONSE INTERCEPTOR
     ❌ NO RETRY FOR CUSTOMER FLOWS
  ===================================================== */
  Axios.interceptors.response.use(
    (res) => res,
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
    }
  );
}