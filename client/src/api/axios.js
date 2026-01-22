import axios from "axios";

/* =====================================================
   API BASE URL
===================================================== */
const API_BASE_URL = (() => {
  // 1️⃣ Explicit env override (recommended)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 2️⃣ SSR safety
  if (typeof window === "undefined") {
    return "http://localhost:8080";
  }

  const { protocol, hostname } = window.location;

  // 3️⃣ Local development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:8080";
  }

  // 4️⃣ Plato Infinity production
  if (
    hostname === "platoinfinity.xyz" ||
    hostname === "www.platoinfinity.xyz"
  ) {
    return `${protocol}//api.platoinfinity.xyz`;
  }

  // 5️⃣ Fallback (rare)
  return `${protocol}//${hostname}`;
})();

/* =====================================================
   AXIOS INSTANCE
===================================================== */
const Axios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ✅ cookies (admin / auth)
  timeout: 15000,
});

/* =====================================================
   REQUEST INTERCEPTOR (PLATO FINAL)
===================================================== */
Axios.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    // ❌ NEVER attach session to public APIs (CORS SAFE)
    if (url.startsWith("/api/public")) {
      return config;
    }

    // ❌ NEVER attach session to auth APIs
    if (url.startsWith("/api/auth")) {
      return config;
    }

    // ✅ ONLY customer-protected routes need session
    if (
      url.startsWith("/api/cart") ||
      url.startsWith("/api/order") ||
      url.startsWith("/api/customer")
    ) {
      // Find customer session
      const sessionKey = Object.keys(localStorage).find((k) =>
        k.startsWith("plato:customerSession:"),
      );

      if (sessionKey) {
        const sessionId = localStorage.getItem(sessionKey);

        if (sessionId) {
          // 🔥 IMPORTANT: Header name MUST match backend exactly
          config.headers["x-customer-session"] = sessionId;
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default Axios;
