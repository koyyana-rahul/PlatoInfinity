import {
  FiMail,
  FiTrash2,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiUser,
  FiShield,
  FiZap,
  FiActivity,
  FiAlertCircle,
} from "react-icons/fi";
import { formatRelative, formatAbsolute } from "../../../utils/dateFormatter";
import clsx from "clsx";

export default function ManagerTable({
  managers = [],
  onResend,
  onRemove,
  timezone = "Asia/Kolkata",
}) {
  if (!managers.length) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-3xl sm:rounded-4xl p-8 sm:p-12 md:p-16 text-center border border-slate-200 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.03)] animate-in fade-in zoom-in-95 duration-700">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg border border-slate-100">
          <FiShield size={40} strokeWidth={1.2} />
        </div>
        <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight">
          No Personnel Assigned
        </h3>
        <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-2 sm:mt-3 max-w-sm mx-auto leading-relaxed">
          Invite your first manager to begin building your administrative team
        </p>
      </div>
    );
  }

  const active = managers.filter((m) => m.isActive);
  const invited = managers.filter((m) => !m.isActive);

  return (
    <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-1000">
      {active.length > 0 && (
        <Section
          title="Active Personnel"
          subtitle="Verified administrative clearance"
          count={active.length}
          type="active"
        >
          {active.map((m) => (
            <ManagerCard
              key={m._id}
              manager={m}
              timezone={timezone}
              onRemove={onRemove}
              isActive={true}
            />
          ))}
        </Section>
      )}

      {invited.length > 0 && (
        <Section
          title="Pending Verification"
          subtitle="Awaiting manager acceptance"
          count={invited.length}
          type="pending"
        >
          {invited.map((m) => (
            <ManagerCard
              key={m._id}
              manager={m}
              timezone={timezone}
              onResend={onResend}
              onRemove={onRemove}
              isActive={false}
            />
          ))}
        </Section>
      )}
    </div>
  );
}

/* ================= SECTION COMPONENT ================= */

function Section({ title, subtitle, count, type = "active", children }) {
  const bgColor =
    type === "active"
      ? "bg-emerald-50/50 border-emerald-200/50"
      : "bg-amber-50/50 border-amber-200/50";
  const iconColor = type === "active" ? "text-emerald-600" : "text-amber-600";

  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-2xl sm:rounded-3xl px-4 sm:px-6 md:px-8 py-4 sm:py-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 mb-1">
              <div className={`p-2 rounded-lg ${bgColor}`}>
                {type === "active" ? (
                  <FiActivity size={16} className={iconColor} />
                ) : (
                  <FiAlertCircle size={16} className={iconColor} />
                )}
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {title}
              </h4>
              <span
                className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap ${
                  type === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {count}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 ml-10">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {children}
      </div>
    </section>
  );
}

/* ================= MANAGER CARD COMPONENT ================= */

function ManagerCard({ manager, onResend, onRemove, timezone, isActive }) {
  return (
    <div
      className={clsx(
        "group relative animate-in fade-in zoom-in-95 duration-500",
        "bg-white rounded-2xl sm:rounded-3xl border transition-all duration-300",
        isActive
          ? "border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-lg hover:shadow-emerald-500/10"
          : "border-amber-200 hover:border-amber-300 shadow-sm hover:shadow-md hover:shadow-amber-500/10",
      )}
    >
      {/* HEADER SECTION */}
      <div
        className={`px-4 sm:px-6 py-4 sm:py-5 border-b transition-colors ${
          isActive
            ? "border-slate-100 bg-emerald-50/30"
            : "border-amber-100 bg-amber-50/30"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={clsx(
                "p-2.5 sm:p-3 rounded-xl flex items-center justify-center shrink-0 transition-all",
                isActive
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-amber-100 text-amber-600",
              )}
            >
              <FiUser size={18} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {manager.name}
              </h5>
              <p className="text-xs sm:text-sm text-slate-600 truncate mt-0.5">
                {manager.email}
              </p>
            </div>
          </div>
          <div
            className={clsx(
              "px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors",
              isActive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700",
            )}
          >
            {isActive ? "Active" : "Pending"}
          </div>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">
        {/* ROLE & STATUS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">
              Role
            </p>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
              <FiShield
                size={14}
                className={isActive ? "text-emerald-500" : "text-amber-500"}
              />
              Manager
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">
              Status
            </p>
            <div className="flex items-center gap-1.5 text-sm font-bold">
              {isActive ? (
                <>
                  <FiCheckCircle
                    size={14}
                    className="text-emerald-500 animate-pulse"
                  />
                  <span className="text-emerald-600">Live</span>
                </>
              ) : (
                <>
                  <FiClock size={14} className="text-amber-500 animate-pulse" />
                  <span className="text-amber-600">Pending</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* DATE INFO */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">
            {isActive ? "Verified" : "Invited"}
          </p>
          <p
            title={formatAbsolute(manager.createdAt, timezone)}
            className="text-xs sm:text-sm font-semibold text-slate-700"
          >
            {formatRelative(manager.createdAt)}
          </p>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div
        className={`px-4 sm:px-6 py-3 sm:py-4 border-t transition-colors ${
          isActive ? "border-slate-100" : "border-amber-100"
        } flex items-center gap-2 sm:gap-3 bg-slate-50/50`}
      >
        {!isActive && (
          <button
            onClick={() => onResend?.(manager._id)}
            className="flex-1 px-3 sm:px-4 py-2 rounded-lg bg-white border border-amber-200 text-amber-700 text-xs sm:text-sm font-bold hover:bg-amber-50 hover:border-amber-300 transition-all active:scale-95 duration-200"
            title="Resend Invitation"
          >
            <div className="flex items-center justify-center gap-1.5">
              <FiRefreshCw size={14} strokeWidth={2.5} />
              <span className="hidden sm:inline">Resend</span>
            </div>
          </button>
        )}
        <button
          onClick={() => onRemove?.(manager)}
          className="flex-1 px-3 sm:px-4 py-2 rounded-lg bg-white border border-red-200 text-red-600 text-xs sm:text-sm font-bold hover:bg-red-50 hover:border-red-300 transition-all active:scale-95 duration-200"
          title="Revoke Access"
        >
          <div className="flex items-center justify-center gap-1.5">
            <FiTrash2 size={14} strokeWidth={2.5} />
            <span className="hidden sm:inline">Remove</span>
          </div>
        </button>
      </div>
    </div>
  );
}
