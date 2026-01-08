import axios from "axios";

const AuthAxios = axios.create({
  baseURL: "https://api.platoinfinity.xyz",
  withCredentials: true, // refresh token uses cookie
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export default AuthAxios;
