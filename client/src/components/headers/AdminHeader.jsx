import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaChevronDown, FaSignOutAlt, FaBars } from "react-icons/fa";
import toast from "react-hot-toast";
import clsx from "clsx";

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
      toast.success("Safe travels! Logged out.");
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
      <header className="h-20 bg-white border-b border-slate-100 flex items-center px-8 animate-pulse">
        <div className="h-10 w-40 bg-slate-100 rounded-2xl" />
      </header>
    );
  }

  return (
    <header className="h-20 bg-white border-b border-slate-100 sticky top-0 z-[130] flex items-center justify-between px-4 sm:px-8">
      {/* ================= LEFT: BRANDING ================= */}
      <div className="flex items-center gap-4 min-w-0">
        {/* HAMBURGER: Large 48px hit-area for mobile accessibility */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMenuClick();
          }}
          className="lg:hidden w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-600 active:scale-90 active:bg-emerald-50 active:text-emerald-600 transition-all cursor-pointer"
          aria-label="Open Sidebar"
        >
          <FaBars size={18} />
        </button>

        <div className="flex items-center gap-3 min-w-0 group cursor-default">
          {brand.logoUrl ? (
            <div className="h-12 w-12 rounded-2xl ring-4 ring-slate-50 bg-white overflow-hidden flex-shrink-0 transition-transform duration-500 group-hover:scale-105 shadow-sm">
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-[0_8px_16px_-4px_rgba(16,185,129,0.4)] flex-shrink-0">
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
              ? "bg-slate-900 text-white shadow-2xl shadow-slate-300"
              : "bg-white border border-slate-100 shadow-sm hover:border-emerald-200",
          )}
        >
          <div className="relative">
            <div
              className={clsx(
                "h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm transition-colors duration-300",
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

          <FaChevronDown
            className={clsx(
              "text-[10px] transition-transform duration-500",
              open ? "rotate-180 text-emerald-400" : "text-slate-300",
            )}
          />
        </button>

        {/* DROPDOWN MENU - Apple-style Slide & Fade */}
        {open && (
          <div className="absolute right-0 mt-4 w-72 bg-white border border-slate-100 rounded-[32px] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.18)] z-[150] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 origin-top-right">
            <div className="px-7 py-6 bg-slate-50/50 border-b border-slate-100">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.25em] mb-2">
                Manager Session
              </p>
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
                  <FaSignOutAlt size={14} />
                </div>
                Log Out Account
              </button>
            </div>
          </div>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* Smooth Entrance Animations */
        .animate-in {
          animation-fill-mode: forwards;
        }
      `,
        }}
      />
    </header>
  );
}
