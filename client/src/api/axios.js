import axios from "axios";

const Axios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // ✅ cookie auth
  timeout: 15000,
});

// ✅ REQUEST INTERCEPTOR (IMPORTANT)
Axios.interceptors.request.use(
  (config) => {
    // ❌ DO NOT set Content-Type manually
    // Browser will auto-set for FormData

    return config;
  },
  (error) => Promise.reject(error)
);

export default Axios;
