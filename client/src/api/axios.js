import axios from "axios";

const Axios = axios.create({
  baseURL: "https://api.platoinfinity.xyz",
  withCredentials: true, // ✅ cookie auth
  headers: {
    "Content-Type": "application/json",
  },
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
