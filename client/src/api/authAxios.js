import axios from "axios";

const AuthAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // refresh token uses cookie
  timeout: 15000,
});

export default AuthAxios;
