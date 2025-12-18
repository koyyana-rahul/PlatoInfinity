import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Auth/Home";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import OtpVerification from "../pages/Auth/OtpVerification";
import VerifyEmail from "../pages/Auth/VerifyEmail";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
      {
        path: "OtpVerification",
        element: <OtpVerification />,
      },
      {
        path: "verify-email",
        element: <VerifyEmail />,
      },
    ],
  },
]);

export default router;
