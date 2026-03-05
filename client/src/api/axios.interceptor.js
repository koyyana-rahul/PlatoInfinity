import Axios from "./axios";
import AuthAxios from "./authAxios";

let initialized = false;

export function initAxiosInterceptors() {
  if (initialized) return;
  initialized = true;

  const getCustomerSessionToken = (url = "", config = {}) => {
    const directToken =
      sessionStorage.getItem("plato:token") ||
      localStorage.getItem("plato:token");

    if (directToken) return directToken;

    const headerTableId =
      config?.headers?.["x-table-id"] || config?.headers?.["X-Table-Id"];
    const routeTableIdMatch = String(url).match(
      /^\/api\/order\/table\/([^/?#]+)/i,
    );
    const tableId =
      headerTableId ||
      routeTableIdMatch?.[1] ||
      localStorage.getItem("plato:lastTableId");

    if (!tableId) return null;

    const tableSessionRaw = localStorage.getItem(
      `plato:customerSession:${tableId}`,
    );
    if (!tableSessionRaw) return null;

    // Some flows store plain session id, some store JSON payload
    try {
      const parsed = JSON.parse(tableSessionRaw);
      return parsed?.sessionToken || parsed?.token || null;
    } catch {
      return null;
    }
  };

  /* =====================================================
     REQUEST INTERCEPTOR
     Attach JWT tokens for admin + customer session tokens
  ===================================================== */
  Axios.interceptors.request.use(
    (config) => {
      const url = config.url || "";

      // ❌ NEVER attach session to public or auth routes
      if (url.startsWith("/api/public") || url.startsWith("/api/auth")) {
        return config;
      }

      // ✅ ADMIN/MANAGER PROTECTED ROUTES
      // Attach JWT token for dashboard, restaurants, reports, etc.
      if (
        url.startsWith("/api/dashboard") ||
        url.startsWith("/api/restaurants") ||
        url.startsWith("/api/staff") ||
        url.startsWith("/api/manager") ||
        url.startsWith("/api/report") ||
        url.startsWith("/api/kitchen")
      ) {
        const jwtToken =
          localStorage.getItem("authToken") ||
          localStorage.getItem("token") ||
          sessionStorage.getItem("authToken");

        if (jwtToken) {
          config.headers["Authorization"] = `Bearer ${jwtToken}`;
          console.log(
            "✅ Attached JWT token to admin route:",
            url,
            "| Token:",
            jwtToken.substring(0, 10) + "...",
          );
        } else {
          console.warn(
            "⚠️ No JWT token found in localStorage/sessionStorage for admin route:",
            url,
          );
        }
      }

      // ✅ CUSTOMER PROTECTED ROUTES
      // Attach customer session token for cart, orders, etc.
      if (
        url.startsWith("/api/cart") ||
        url.startsWith("/api/order") ||
        url.startsWith("/api/customer")
      ) {
        // Optional session token (for hybrid flows)
        const sessionToken = getCustomerSessionToken(url, config);

        if (sessionToken) {
          config.headers["x-customer-session"] = sessionToken;
          console.log(
            "✅ Attached session token to",
            url,
            "| Token:",
            sessionToken.substring(0, 10) + "...",
          );
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
