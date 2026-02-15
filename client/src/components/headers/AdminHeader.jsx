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
    return <div className="h-24 animate-pulse bg-[#FCFCFC]" />;

  return (
    <header className="h-24 bg-[#FCFCFC] sticky top-0 z-[130] flex items-center justify-between px-4 sm:px-8">
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
            "lg:hidden w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 active:scale-95",
            isSidebarOpen
              ? "bg-[#F35C2B] text-white shadow-[0_20px_25px_-5px_rgb(243_92_43_/_0.35)]"
              : "bg-white text-slate-600 shadow-[0_20px_25px_-5px_rgb(0_0_0_/_0.05)] hover:scale-[1.02]",
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

        <div className="flex items-center gap-3 min-w-0 group bg-white rounded-3xl px-3 py-2 shadow-[0_20px_25px_-5px_rgb(0_0_0_/_0.05)]">
          {brand.logoUrl ? (
            <div className="h-12 w-12 rounded-2xl bg-white overflow-hidden flex-shrink-0 transition-transform duration-500 group-hover:scale-105 shadow-[0_20px_25px_-5px_rgb(0_0_0_/_0.05)]">
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-2xl bg-[#F35C2B] text-white flex items-center justify-center font-black text-lg shadow-[0_20px_25px_-5px_rgb(243_92_43_/_0.35)] flex-shrink-0">
              {brand.name.charAt(0)}
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate leading-none">
              {brand.name}
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F35C2B] animate-pulse" />
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
            "flex items-center gap-3 p-1.5 sm:pl-2 sm:pr-4 py-1.5 rounded-3xl transition-all duration-500 active:scale-95",
            open
              ? "bg-[#F35C2B] text-white shadow-[0_20px_25px_-5px_rgb(243_92_43_/_0.35)]"
              : "bg-white shadow-[0_20px_25px_-5px_rgb(0_0_0_/_0.05)] hover:scale-[1.02]",
          )}
        >
          <div className="relative">
            <div
              className={clsx(
                "h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner transition-colors",
                open
                  ? "bg-white/10 text-white"
                  : "bg-[#F35C2B]/10 text-[#F35C2B]",
              )}
            >
              {user.name?.charAt(0).toUpperCase()}
            </div>
            {!open && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#F35C2B] border-2 border-white rounded-full" />
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
              open ? "rotate-180 text-white/80" : "text-slate-300",
            )}
          />
        </button>

        {/* DROPDOWN MENU */}
        {open && (
          <div className="absolute right-0 mt-4 w-72 bg-white rounded-[32px] shadow-[0_20px_25px_-5px_rgb(0_0_0_/_0.08)] z-[150] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 origin-top-right">
            <div className="px-7 py-6 bg-slate-50/60">
              <div className="flex items-center gap-2 mb-2">
                <FiActivity size={10} className="text-[#F35C2B]" />
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
                className="w-full px-4 py-4 rounded-3xl text-sm font-black text-white bg-[#F35C2B] hover:scale-[1.02] flex items-center gap-4 transition-all active:scale-[0.95]"
              >
                <div className="p-2.5 rounded-2xl bg-white/20">
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
