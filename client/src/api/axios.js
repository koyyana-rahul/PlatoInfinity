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
   NOTE: Interceptors are added in axios.interceptor.js
   via initAxiosInterceptors() function
===================================================== */

export default Axios;
