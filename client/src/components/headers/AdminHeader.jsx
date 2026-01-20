import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaChevronDown, FaSignOutAlt, FaBars } from "react-icons/fa";
import toast from "react-hot-toast";

import Axios from "../../api/axios";
import SummaryApi from "../../api/summaryApi";
import { logout } from "../../store/auth/userSlice";

export default function AdminHeader({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const user = useSelector((s) => s.user);
  const brand = useSelector((s) => s.brand);

  const [open, setOpen] = useState(false);

  /* ---------- LOGOUT ---------- */
  const handleLogout = async () => {
    try {
      await Axios(SummaryApi.logout);
    } catch (_) {
    } finally {
      dispatch(logout());
      localStorage.clear();
      toast.success("Logged out");
      navigate("/login", { replace: true });
    }
  };

  /* ---------- CLICK OUTSIDE ---------- */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------- SKELETON ---------- */
  if (!user?._id || !brand?.name) {
    return (
      <header className="h-16 bg-white border-b flex items-center px-4 animate-pulse">
        <div className="h-9 w-44 bg-gray-200 rounded-full" />
      </header>
    );
  }

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-3 sm:px-4">
      {/* ================= LEFT ================= */}
      <div className="flex items-center gap-3 min-w-0">
        {/* HAMBURGER (MOBILE) */}
        <button
          onClick={onMenuClick}
          className="sm:hidden p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200"
          aria-label="Open menu"
        >
          <FaBars />
        </button>

        {/* BRAND */}
        <div className="flex items-center gap-2 min-w-0">
          {/* LOGO */}
          {brand.logoUrl ? (
            <div className="h-10 w-10 rounded-full ring-1 ring-gray-200 bg-white overflow-hidden flex-shrink-0">
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-[#FC8019] text-white flex items-center justify-center font-extrabold text-sm shadow-sm flex-shrink-0">
              {brand.name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* BRAND NAME — ALWAYS VISIBLE */}
          <div className="flex flex-col min-w-0 leading-tight">
            <span
              className="
                text-sm sm:text-base
                font-extrabold
                text-[#1A1C1E]
                tracking-tight
                truncate
                max-w-[140px] sm:max-w-none
              "
            >
              {brand.name}
            </span>

            <span className="text-[10px] text-gray-400 uppercase tracking-widest">
              {user.role} Panel
            </span>
          </div>
        </div>
      </div>

      {/* ================= RIGHT ================= */}
      <div className="relative flex-shrink-0" ref={dropdownRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="
            flex items-center gap-2
            px-2 sm:px-3 py-2
            rounded-xl
            hover:bg-gray-100 active:bg-gray-200
            transition
          "
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {/* USER AVATAR */}
          <div className="h-9 w-9 rounded-full bg-[#00684A] text-white flex items-center justify-center font-bold text-sm">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          {/* NAME (DESKTOP) */}
          <span className="hidden sm:block text-sm font-medium text-gray-700">
            {user.name}
          </span>

          <FaChevronDown className="text-xs text-gray-400" />
        </button>

        {/* DROPDOWN */}
        {open && (
          <div
            className="
              absolute right-0 mt-2
              w-64
              bg-white border
              rounded-2xl shadow-xl
              z-50
              overflow-hidden
            "
          >
            <div className="px-4 py-3 border-b">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                {user.role} Account
              </p>
              <p className="font-semibold text-sm text-gray-800 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>

            <button
              onClick={handleLogout}
              className="
                w-full
                px-4 py-3
                text-sm font-medium
                text-red-600
                hover:bg-red-50
                flex items-center gap-3
                active:bg-red-100
              "
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
