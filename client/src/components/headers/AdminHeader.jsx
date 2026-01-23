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
import toast from "react-hot-toast";
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
      toast.success("Safe travels! Logged out.");
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
    return <div className="h-20 animate-pulse bg-white border-b" />;

  return (
    <header className="h-20 bg-white border-b border-slate-100 sticky top-0 z-[130] flex items-center justify-between px-4 sm:px-8">
      {/* ================= LEFT: BRANDING & TOGGLE ================= */}
      <div className="flex items-center gap-4 min-w-0">
        {/* THE TOGGLE BUTTON */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMenuClick(); // Triggers toggle in parent
          }}
          className={clsx(
            "lg:hidden w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 active:scale-90",
            isSidebarOpen
              ? "bg-slate-900 text-white shadow-lg"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100",
          )}
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isSidebarOpen ? (
            <FiX
              size={20}
              strokeWidth={2.5}
              className="animate-in fade-in zoom-in duration-300"
            />
          ) : (
            <FiMenu
              size={20}
              strokeWidth={2}
              className="animate-in fade-in zoom-in duration-300"
            />
          )}
        </button>

        <div className="flex items-center gap-3 min-w-0 group">
          {brand.logoUrl ? (
            <div className="h-12 w-12 rounded-2xl ring-4 ring-slate-50 bg-white overflow-hidden flex-shrink-0 transition-transform duration-500 group-hover:scale-105 border border-slate-100 shadow-sm">
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-lg flex-shrink-0">
              {brand.name.charAt(0)}
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate leading-none">
              {brand.name}
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.25em]">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT: USER PROFILE ================= */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className={clsx(
            "flex items-center gap-3 p-1.5 sm:pl-2 sm:pr-4 py-1.5 rounded-[22px] transition-all duration-500 active:scale-95",
            open
              ? "bg-slate-900 text-white shadow-2xl"
              : "bg-white border border-slate-100 shadow-sm hover:border-emerald-200",
          )}
        >
          <div className="relative">
            <div
              className={clsx(
                "h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner transition-colors",
                open
                  ? "bg-white/10 text-white"
                  : "bg-emerald-50 text-emerald-600",
              )}
            >
              {user.name?.charAt(0).toUpperCase()}
            </div>
            {!open && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            )}
          </div>

          <div className="hidden sm:flex flex-col items-start text-left leading-tight">
            <span className="text-xs font-black tracking-tight leading-none mb-0.5">
              {user.name}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Online
            </span>
          </div>

          <FiChevronDown
            className={clsx(
              "text-[12px] transition-transform duration-500",
              open ? "rotate-180 text-emerald-400" : "text-slate-300",
            )}
          />
        </button>

        {/* DROPDOWN MENU */}
        {open && (
          <div className="absolute right-0 mt-4 w-72 bg-white border border-slate-100 rounded-[32px] shadow-2xl z-[150] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 origin-top-right">
            <div className="px-7 py-6 bg-slate-50/50 border-b">
              <div className="flex items-center gap-2 mb-2">
                <FiActivity size={10} className="text-emerald-500" />
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.25em]">
                  Active Session
                </p>
              </div>
              <p className="font-black text-slate-900 text-base truncate tracking-tight">
                {user.name}
              </p>
              <p className="text-xs font-medium text-slate-500 truncate mt-0.5 opacity-80">
                {user.email}
              </p>
            </div>

            <div className="p-3">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-4 rounded-[22px] text-sm font-black text-red-500 hover:bg-red-50 flex items-center gap-4 transition-all active:scale-[0.98]"
              >
                <div className="p-2.5 rounded-xl bg-red-100/50">
                  <FiLogOut size={14} strokeWidth={3} />
                </div>
                Log Out Account
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
