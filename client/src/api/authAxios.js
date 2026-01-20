import axios from "axios";

const API_BASE_URL = (() => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;

  if (typeof window === "undefined") return "http://localhost:8080";

  const { protocol, hostname, origin } = window.location;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  if (isLocal) return "";

  if (hostname === "platoinfinity.xyz" || hostname === "www.platoinfinity.xyz") {
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

export default AuthAxios;
