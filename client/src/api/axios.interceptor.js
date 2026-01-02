import Axios from "./axios";
import AuthAxios from "./authAxios";

let initialized = false;

export function initAxiosInterceptors() {
  if (initialized) return;
  initialized = true;

  const PUBLIC_ROUTES = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/verify-email",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/auth/refresh-token",
  ];

  Axios.interceptors.response.use(
    (res) => res,
    async (err) => {
      const original = err.config;

      if (err.response?.status !== 401) {
        return Promise.reject(err);
      }

      if (original._retry) {
        return Promise.reject(err);
      }

      if (PUBLIC_ROUTES.some((r) => original.url?.includes(r))) {
        return Promise.reject(err);
      }

      original._retry = true;

      try {
        // ✅ refresh using cookie
        await AuthAxios.post("/api/auth/refresh-token");

        // retry original request
        return Axios(original);
      } catch {
        window.location.replace("/login");
        return Promise.reject(err);
      }
    }
  );
}
