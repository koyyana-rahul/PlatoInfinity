import axios from "axios";

const API_BASE_URL = (() => {
  if (import.meta.env.VITE_API_BASE_URL)
    return import.meta.env.VITE_API_BASE_URL;

  if (typeof window === "undefined") return "http://localhost:8080";

  const { protocol, hostname, origin } = window.location;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  if (isLocal) return "";

  if (
    hostname === "platoinfinity.xyz" ||
    hostname === "www.platoinfinity.xyz"
  ) {
    return `${protocol}//api.platoinfinity.xyz`;
  }

  return origin;
})();

const AuthAxios = axios.create({
  // baseURL: "https://api.platoinfinity.xyz",
  baseURL: API_BASE_URL,
  withCredentials: true, // refresh token uses cookie
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ✅ REQUEST INTERCEPTOR - Attach JWT token for authenticated routes
AuthAxios.interceptors.request.use(
  (config) => {
    // ✅ Token is sent via HTTP-only cookies (with withCredentials: true)
    // No need to manually attach since cookies are auto-sent by browser
    console.log(
      "✅ AuthAxios: Request to",
      config.url,
      "(token via httpOnly cookie)",
    );
    return config;
  },
  (error) => Promise.reject(error),
);

// ✅ RESPONSE INTERCEPTOR - Handle 401 errors and refresh token
AuthAxios.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // Don't retry if already retried
    if (original._retry) {
      return Promise.reject(err);
    }

    // Only retry on 401 (Unauthorized)
    if (err.response?.status !== 401) {
      return Promise.reject(err);
    }

    original._retry = true;

    try {
      // Attempt to refresh token
      // Since withCredentials: true, cookies are auto-sent
      const refreshRes = await axios.post(
        `${API_BASE_URL}/api/auth/refresh-token`,
        {},
        { withCredentials: true },
      );

      if (refreshRes.data?.success) {
        // New token is set in cookie by server
        // Just retry the original request
        return AuthAxios(original);
      }
    } catch (refreshErr) {
      console.error("❌ Token refresh failed:", refreshErr.message);
      // Redirect to login if refresh fails
      window.location.href = "/login";
      return Promise.reject(refreshErr);
    }

    return Promise.reject(err);
  },
);

export default AuthAxios;
