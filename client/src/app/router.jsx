// src/router/index.jsx
import { createBrowserRouter } from "react-router-dom";
import App from "../App";

/* ================= AUTH ================= */
import Login from "../modules/auth/Login";
import Register from "../modules/auth/Register";
import VerifyEmail from "../modules/auth/VerifyEmail";
import ForgotPassword from "../modules/auth/ForgotPassword";
import VerifyOtp from "../modules/auth/VerifyOtp";
import ResetPassword from "../modules/auth/ResetPassword";
import Redirect from "../modules/auth/Redirect";

/* ================= LANDING ================= */
import LandingHome from "../modules/landing/LandingHome";

/* ================= STAFF AUTH ================= */
import StaffPinLogin from "../modules/staff/login/StaffPinLogin";

/* ================= INVITE ================= */
import AcceptInvite from "../modules/auth/invite/AcceptInvite";
import SetPassword from "../modules/auth/invite/SetPassword";

/* ================= ONBOARDING ================= */
import CreateBrand from "../modules/onboarding/CreateBrand";
import BrandSuccess from "../modules/onboarding/BrandSuccess";

/* ================= ADMIN ================= */
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../modules/admin/AdminDashboard";
import RestaurantsPage from "../modules/admin/restaurants/RestaurantsPage";
import ManagersPage from "../modules/admin/managers/ManagersPage";
import MasterMenuPage from "../modules/admin/master-menu/MasterMenuPage";
import AdminReports from "../modules/admin/AdminReports";
import AdminSettings from "../modules/admin/AdminSettings";
import AdminStaffStatus from "../modules/admin/AdminStaffStatus";
import AdminAnalytics from "../modules/admin/AdminAnalytics";

/* ================= MANAGER ================= */
import ManagerLayout from "../layouts/ManagerLayout";
import ManagerDashboard from "../modules/manager/ManagerDashboard";
import BranchMenuPage from "../modules/manager/branch-menu/pages/BranchMenuPage";
import KitchenStationsPage from "../modules/manager/kitchen-stations/KitchenStationsPage";
import TablesPage from "../modules/manager/tables/TablesPage";
import StaffPage from "../modules/manager/staff/StaffPage";
import ShiftQrPanel from "../modules/manager/staff/ShiftQrPanel";
import ManagerReports from "../modules/manager/ManagerReports";
import ManagerSettings from "../modules/manager/ManagerSettings";

/* ================= STAFF ================= */
import StaffLayout from "../layouts/StaffLayout";

/* ---- Chef ---- */
import ChefDashboard from "../modules/staff/chef/pages/ChefDashboard";
import ChefQueue from "../modules/staff/chef/pages/ChefQueue";
import ChefHistory from "../modules/staff/chef/pages/ChefHistory";

/* ---- Waiter ---- */
import WaiterDashboard from "../modules/staff/waiter/WaiterDashboard";
import WaiterOrders from "../modules/staff/waiter/WaiterOrders";
import WaiterBills from "../modules/staff/waiter/WaiterBills";
import WaiterAlerts from "../modules/staff/waiter/WaiterAlerts";

/* ---- Cashier ---- */
import CashierDashboard from "../modules/staff/cashier/CashierDashboard";
import CashierInvoices from "../modules/staff/cashier/CashierInvoices";
import CashierPayments from "../modules/staff/cashier/CashierPayments";
import CashierSummary from "../modules/staff/cashier/CashierSummary";

/* ================= CUSTOMER ================= */
import CustomerLayout from "../layouts/CustomerLayout";
import CustomerJoin from "../modules/customer/pages/CustomerJoin";
import CustomerMenu from "../modules/customer/pages/CustomerMenu";
import CustomerCart from "../modules/customer/pages/CustomerCart";
import CustomerOrders from "../modules/customer/pages/CustomerOrders";
import CustomerBill from "../modules/customer/pages/CustomerBill";
import CustomerItem from "../modules/customer/pages/CustomerItem";

/* ================= FALLBACK ================= */
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center text-gray-500">
    Page not found
  </div>
);

const router = createBrowserRouter([
  /* ================= ROOT ================= */
  { path: "/", element: <LandingHome /> },
  { path: "/home", element: <LandingHome /> },
  { path: "/landing", element: <LandingHome /> },

  /* ================= PUBLIC AUTH ================= */
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/verify-email", element: <VerifyEmail /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/verify-otp", element: <VerifyOtp /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/redirect", element: <Redirect /> },

  /* ================= CUSTOMER (QR FLOW) ================= */
  {
    path: "/:brandSlug/:restaurantSlug/table/:tableId",
    element: <CustomerLayout />,
    children: [
      { index: true, element: <CustomerJoin /> },
      { path: "menu", element: <CustomerMenu /> },
      { path: "cart", element: <CustomerCart /> },
      { path: "orders", element: <CustomerOrders /> },
      { path: "bill", element: <CustomerBill /> },
      { path: "item/:itemId", element: <CustomerItem /> },
    ],
  },

  /* ================= STAFF LOGIN ================= */
  { path: "/staff/login", element: <StaffPinLogin /> },

  /* ================= INVITE ================= */
  { path: "/accept-invite", element: <AcceptInvite /> },
  { path: "/set-password", element: <SetPassword /> },

  /* ================= ONBOARDING ================= */
  { path: "/onboarding/create-brand", element: <CreateBrand /> },
  { path: "/onboarding/brand-success", element: <BrandSuccess /> },

  /* ================= ADMIN ================= */
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
      { path: "master-menu", element: <MasterMenuPage /> },
      { path: "reports", element: <AdminReports /> },
      { path: "settings", element: <AdminSettings /> },
      { path: "staff-status", element: <AdminStaffStatus /> },
      { path: "analytics", element: <AdminAnalytics /> },
    ],
  },

  /* ================= MANAGER ================= */
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
        path: "restaurants/:restaurantId/staff-qr",
        element: <ShiftQrPanel />,
      },
      {
        path: "restaurants/:restaurantId/kitchen-stations",
        element: <KitchenStationsPage />,
      },
      {
        path: "restaurants/:restaurantId/tables",
        element: <TablesPage />,
      },
      {
        path: "restaurants/:restaurantId/reports",
        element: <ManagerReports />,
      },
      {
        path: "restaurants/:restaurantId/settings",
        element: <ManagerSettings />,
      },
    ],
  },

  /* ================= STAFF ================= */
  {
    path: "/:brandSlug/staff",
    element: <StaffLayout />,
    children: [
      /* ---------- CHEF ---------- */
      {
        path: "chef/restaurants/:restaurantId",
        element: <ChefDashboard />, // Live Orders
      },
      {
        path: "chef/restaurants/:restaurantId/queue",
        element: <ChefQueue />,
      },
      {
        path: "chef/restaurants/:restaurantId/history",
        element: <ChefHistory />,
      },

      /* ---------- WAITER ---------- */
      {
        path: "waiter/restaurants/:restaurantId",
        element: <WaiterDashboard />,
      },
      {
        path: "waiter/restaurants/:restaurantId/orders",
        element: <WaiterOrders />,
      },
      {
        path: "waiter/restaurants/:restaurantId/bills",
        element: <WaiterBills />,
      },
      {
        path: "waiter/restaurants/:restaurantId/alerts",
        element: <WaiterAlerts />,
      },

      /* ---------- CASHIER ---------- */
      {
        path: "cashier/restaurants/:restaurantId",
        element: <CashierDashboard />,
      },
      {
        path: "cashier/restaurants/:restaurantId/invoices",
        element: <CashierInvoices />,
      },
      {
        path: "cashier/restaurants/:restaurantId/payments",
        element: <CashierPayments />,
      },
      {
        path: "cashier/restaurants/:restaurantId/summary",
        element: <CashierSummary />,
      },
    ],
  },

  /* ================= FALLBACK ================= */
  { path: "*", element: <NotFound /> },
]);

export default router;
