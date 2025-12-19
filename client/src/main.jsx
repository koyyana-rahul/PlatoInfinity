import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Toaster } from "react-hot-toast";

import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { store } from "./store/store";
import router from "./route/index";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <Provider store={store}>
    <Toaster position="top-right" reverseOrder={false} />
    <RouterProvider router={router} />
  </Provider>
  // {/* </StrictMode> */}
);
