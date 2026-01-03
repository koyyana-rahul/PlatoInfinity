import Axios from "./axios";
import AuthAxios from "./authAxios";

let initialized = false;

export function initAxiosInterceptors() {
  if (initialized) return;
  initialized = true;

  Axios.interceptors.response.use(
    (res) => res,
    async (err) => {
      const original = err.config;

      // If not 401 → just throw
      if (err.response?.status !== 401) {
        return Promise.reject(err);
      }

      // Prevent infinite loop
      if (original._retry) {
        return Promise.reject(err);
      }

      // ❗ NEVER refresh on auth routes
      if (original.url?.includes("/api/auth")) {
        return Promise.reject(err);
      }

      original._retry = true;

      try {
        // Try refresh token
        await AuthAxios.post("/api/auth/refresh-token");
        return Axios(original); // retry original request
      } catch (refreshError) {
        // ✅ DO NOTHING HERE (no redirect)
        return Promise.reject(refreshError);
      }
    }
  );
}
