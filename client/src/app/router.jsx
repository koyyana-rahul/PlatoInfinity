// src/routes/index.jsx
import { createBrowserRouter } from "react-router-dom";

import App from "../App";

/* -------- AUTH -------- */
import Login from "../modules/auth/Login";
import Register from "../modules/auth/Register";
import VerifyEmail from "../modules/auth/VerifyEmail";
import ForgotPassword from "../modules/auth/ForgotPassword";
import VerifyOtp from "../modules/auth/VerifyOtp";
import ResetPassword from "../modules/auth/ResetPassword";
import Redirect from "../modules/auth/Redirect";

/* -------- INVITE -------- */
import AcceptInvite from "../modules/auth/invite/AcceptInvite";
import SetPassword from "../modules/auth/invite/SetPassword";

/* -------- ONBOARDING -------- */
import CreateBrand from "../modules/onboarding/CreateBrand";
import BrandSuccess from "../modules/onboarding/BrandSuccess";

/* -------- ADMIN -------- */
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../modules/admin/AdminDashboard";
import RestaurantsPage from "../modules/admin/restaurants/RestaurantsPage";
import ManagersPage from "../modules/admin/managers/ManagersPage";
import MasterMenuPage from "../modules/admin/master-menu/MasterMenuPage";
import ManagerLayout from "../layouts/ManagerLayout";
import ManagerDashboard from "../modules/manager/ManagerDashboard";
import StaffPage from "../modules/manager/staff/staffPage";
import KitchenStationsPage from "../modules/manager/kitchen-stations/KitchenStationsPage";
import TablesPage from "../modules/manager/tables/TablesPage";
import BranchMenuPage from "../modules/manager/branch-menu/pages/BranchMenuPage";

/* -------- FALLBACK -------- */
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center text-gray-500">
    Page not found
  </div>
);

const router = createBrowserRouter([
  /* ================= ROOT LAYOUT ================= */
  {
    path: "/",
    element: <App />, // layout wrapper (providers, outlet)
  },

  /* ================= AUTH ================= */
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/verify-email", element: <VerifyEmail /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/verify-otp", element: <VerifyOtp /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/redirect", element: <Redirect /> },

  /* ================= INVITE FLOW ================= */
  { path: "/accept-invite", element: <AcceptInvite /> },
  { path: "/set-password", element: <SetPassword /> },

  /* ================= ONBOARDING ================= */
  { path: "/onboarding/create-brand", element: <CreateBrand /> },
  { path: "/onboarding/brand-success", element: <BrandSuccess /> },

  /* ================= ADMIN (BRAND SCOPED) ================= */
  {
    path: "/:brandSlug/admin",
    element: <AdminLayout />,
    children: [
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "restaurants", element: <RestaurantsPage /> },
      {
        path: "restaurants/:restaurantId/managers",
        element: <ManagersPage />,
      },
      {
        path: "master-menu",
        element: <MasterMenuPage />,
      },
    ],
  },

  {
    path: "/:brandSlug/manager",
    element: <ManagerLayout />,
    children: [
      {
        path: "restaurants/:restaurantId/dashboard",
        element: <ManagerDashboard />,
      },
      {
        path: "restaurants/:restaurantId/menu",
        element: <BranchMenuPage />,
      },
      {
        path: "restaurants/:restaurantId/staff",
        element: <StaffPage />,
      },
      {
        path: "restaurants/:restaurantId/kitchen-stations",
        element: <KitchenStationsPage />,
      },
      {
        path: "restaurants/:restaurantId/tables",
        element: <TablesPage />,
      },
    ],
  },
  {
    // path: "/:brandSlug/staff",
    // element: < />
  },

  /* ================= FALLBACK ================= */
  { path: "*", element: <NotFound /> },
]);

export default router;
