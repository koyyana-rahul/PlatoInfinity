import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/public/Home";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import OtpVerification from "../pages/Auth/OtpVerification";
import VerifyEmail from "../pages/Auth/VerifyEmail";
// New imports for multi-tenant architecture
import CreateBrand from "../pages/Onboarding/CreateBrand";
import BrandShell from "../layouts/BrandShell";
// New imports for role-specific dashboards
import AdminDashboard from "../pages/Admin/AdminDashboard";
import ManagerDashboard from "../pages/Manager/ManagerDashboard";
import ChefKitchen from "../pages/Chef/ChefKitchen";
import WaiterFloor from "../pages/Waiter/WaiterFloor";
import CustomerMenu from "../pages/Customer/CustomerMenu";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // App remains the root for common UI and initial landing
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
        path: "verification-otp",
        element: <OtpVerification />,
      },
      {
        path: "verify-email",
        element: <VerifyEmail />,
      },
      // New onboarding route
      {
        path: "onboarding/create-brand",
        element: <CreateBrand />,
      },
    ],
  },
  // New dynamic brand-slug route
  {
    path: "/:brandSlug",
    element: <BrandShell />,
    children: [
      {
        path: "admin/*", // Admin/Owner
        element: <AdminDashboard />,
      },
      {
        path: ":branchId/manager", // Manager
        element: <ManagerDashboard />,
      },
      {
        path: ":branchId/kitchen", // Chef
        element: <ChefKitchen />,
      },
      {
        path: ":branchId/floor", // Waiter
        element: <WaiterFloor />,
      },
      {
        path: ":tableId", // Customer (note: this might conflict if /:branchId is used before)
        element: <CustomerMenu />,
      },
      {
        path: "", // Default for /:brandSlug - might be a landing page or redirect to appropriate role-dashboard
        element: <div>Welcome to Brand Home</div>,
      },
      // Future: Add a redirect for /:brandSlug/dashboard to the appropriate role-based dashboard
    ],
  },
]);

export default router;
