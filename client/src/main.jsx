import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Providers from "./app/providers.jsx";
import "./index.css";
import { initAxiosInterceptors } from "./api/axios.interceptor.js";
// import "./api/axios.interceptor";

initAxiosInterceptors();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Providers />
  </React.StrictMode>
);
