// src/components/headers/AdminHeader.jsx
import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiChevronDown,
  FiLogOut,
  FiActivity,
} from "react-icons/fi"; // Unified Fi icons
import { notify } from "../../utils/notify";
import clsx from "clsx";

import Axios from "../../api/axios";
import SummaryApi from "../../api/summaryApi";
import { logout } from "../../store/auth/userSlice";

export default function AdminHeader({ onMenuClick, isSidebarOpen }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const user = useSelector((s) => s.user);
  const brand = useSelector((s) => s.brand);
  const [open, setOpen] = useState(false);

  /* ---------- LOGOUT LOGIC ---------- */
  const handleLogout = async () => {
    try {
      await Axios(SummaryApi.logout);
    } catch (_) {
    } finally {
      dispatch(logout());
      localStorage.clear();
      notify.success("Signed out successfully");
      navigate("/login", { replace: true });
    }
  };

  /* ---------- CLICK OUTSIDE DROPDOWN ---------- */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user?._id || !brand?.name)
    return <div className="h-14 sm:h-16 animate-pulse bg-white shadow-sm" />;

  return (
    <header className="h-14 sm:h-16 bg-white sticky top-0 z-[130] shadow-[0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-md">
      <div className="h-full w-full px-3 sm:px-4 md:px-6 lg:px-8 flex items-center justify-between">
        {/* ================= LEFT: BRANDING & TOGGLE ================= */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* THE TOGGLE BUTTON */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMenuClick();
            }}
            className={clsx(
              "lg:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-colors duration-200 flex-shrink-0",
              isSidebarOpen
                ? "bg-orange-50 text-[#FC8019]"
                : "text-gray-600 hover:bg-gray-50 active:bg-gray-100",
            )}
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          >
            {isSidebarOpen ? (
              <FiX size={20} strokeWidth={2.5} />
            ) : (
              <FiMenu size={20} strokeWidth={2.5} />
            )}
          </button>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {brand.logoUrl ? (
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-gray-100 shadow-sm">
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="h-full w-full object-contain p-0.5"
                />
              </div>
            ) : (
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-[#FC8019] to-[#FF6B35] text-white flex items-center justify-center font-semibold text-xs sm:text-sm flex-shrink-0 shadow-md">
                {brand.name.charAt(0)}
              </div>
            )}

            <div className="flex flex-col min-w-0">
              <h1 className="text-sm sm:text-base font-semibold text-gray-900 truncate leading-tight">
                {brand.name}
              </h1>
              <span className="text-[10px] sm:text-xs text-gray-500 font-normal capitalize hidden xs:block">
                {user.role} Portal
              </span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT: USER PROFILE ================= */}
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className={clsx(
              "flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200",
              open
                ? "bg-gray-50 shadow-sm"
                : "hover:bg-gray-50 active:bg-gray-100",
            )}
          >
            <div className="hidden lg:flex flex-col items-end text-right min-w-0">
              <span className="text-sm font-medium text-gray-900 leading-tight truncate max-w-[120px]">
                {user.name}
              </span>
              <span className="text-xs text-gray-500 capitalize truncate">
                {user.role}
              </span>
            </div>

            <div className="relative flex-shrink-0">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-[#FC8019] to-[#FF6B35] flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-md ring-2 ring-white">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full" />
            </div>

            <FiChevronDown
              className={clsx(
                "text-gray-400 transition-transform duration-200 hidden lg:block flex-shrink-0",
                open && "rotate-180",
              )}
              size={16}
            />
          </button>

          {/* DROPDOWN MENU */}
          {open && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 z-[150] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* User Info Section */}
              <div className="px-4 sm:px-5 py-3 sm:py-4 bg-gradient-to-br from-orange-50 via-white to-white border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br from-[#FC8019] to-[#FF6B35] flex items-center justify-center text-white font-semibold text-base sm:text-lg shadow-md flex-shrink-0 ring-2 ring-orange-100">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      {user.name}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="px-4 sm:px-5 py-3 sm:py-4 space-y-2.5 sm:space-y-3 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600 font-medium">
                    Account Type
                  </span>
                  <span className="text-xs sm:text-sm font-semibold capitalize px-2 sm:px-2.5 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-md shadow-sm">
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600 font-medium">
                    Status
                  </span>
                  <span className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-green-600">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse" />
                    Online
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <div className="p-3 sm:p-4 bg-white border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 active:bg-red-100 flex items-center justify-center gap-2 transition-all duration-200 border border-red-200 hover:border-red-300 hover:shadow-sm"
                >
                  <FiLogOut size={16} className="sm:w-5 sm:h-5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
