import {
  FiMail,
  FiTrash2,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiUser,
  FiShield,
  FiZap,
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
      <div className="bg-white rounded-[40px] p-12 sm:p-20 text-center border border-slate-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.03)] animate-in fade-in zoom-in-95 duration-700">
        <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
          <FiShield size={48} strokeWidth={1.5} />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter uppercase italic">
          No Personnel Assigned
        </h3>
        <p className="text-sm font-bold text-slate-400 mt-3 max-w-sm mx-auto leading-relaxed">
          Operational efficiency relies on distributed authority. Invite your
          first administrative node to begin oversight.
        </p>
      </div>
    );
  }

  const active = managers.filter((m) => m.isActive);
  const invited = managers.filter((m) => !m.isActive);

  return (
    <div className="space-y-12 sm:space-y-20 animate-in fade-in duration-1000">
      {active.length > 0 && (
        <Section
          title="Active Personnel"
          subtitle="Nodes with verified administrative clearance"
          count={active.length}
        >
          {active.map((m) => (
            <ManagerCard
              key={m._id}
              manager={m}
              timezone={timezone}
              onRemove={onRemove}
            />
          ))}
        </Section>
      )}

      {invited.length > 0 && (
        <Section
          title="Pending Authorization"
          subtitle="Invitations awaiting secure handshake"
          count={invited.length}
        >
          {invited.map((m) => (
            <ManagerCard
              key={m._id}
              manager={m}
              timezone={timezone}
              onResend={onResend}
              onRemove={onRemove}
            />
          ))}
        </Section>
      )}
    </div>
  );
}

/* ================= SECTION COMPONENT ================= */

function Section({ title, subtitle, count, children }) {
  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-widest uppercase italic">
              {title}
            </h4>
            <span className="px-2 py-0.5 bg-slate-900 text-white rounded-md text-[10px] font-black italic">
              {count}
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

/* ================= MANAGER CARD COMPONENT ================= */

function ManagerCard({ manager, onResend, onRemove, timezone }) {
  const isActive = manager.isActive;

  return (
    <div className="group relative rounded-[32px] border border-slate-100 bg-white p-5 sm:p-6 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(15,23,42,0.1)] hover:-translate-y-1 overflow-hidden">
      {/* Interactive Background Flair */}
      <div className="absolute -right-6 -bottom-6 opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-110 transition-all duration-700 pointer-events-none">
        <FiShield size={140} />
      </div>

      <div className="flex flex-col gap-6 relative z-10">
        {/* HEADER SECTION */}
        <div className="flex items-start gap-4">
          <div
            className={clsx(
              "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-inner transition-all duration-500 group-hover:bg-slate-900 group-hover:text-white",
              isActive
                ? "bg-emerald-50 text-emerald-600"
                : "bg-orange-50 text-orange-600",
            )}
          >
            {manager.name?.charAt(0)?.toUpperCase() || "M"}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-black text-slate-900 tracking-tight truncate pr-2 uppercase text-sm italic">
                {manager.name}
              </p>
              <div
                className={clsx(
                  "w-1.5 h-1.5 rounded-full",
                  isActive ? "bg-emerald-500 animate-pulse" : "bg-orange-400",
                )}
              />
            </div>
            <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 truncate">
              <FiMail size={12} className="shrink-0" />
              <span className="truncate">{manager.email}</span>
            </p>
          </div>
        </div>

        {/* METADATA BAR */}
        <div className="pt-5 border-t border-slate-50 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
              {" "}
              Clearance Issued{" "}
            </p>
            <span
              title={formatAbsolute(manager.createdAt, timezone)}
              className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 tabular-nums uppercase"
            >
              {isActive ? (
                <FiCheckCircle size={12} className="text-emerald-400" />
              ) : (
                <FiClock size={12} className="text-orange-300" />
              )}
              {formatRelative(manager.createdAt)}
            </span>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2">
            {!isActive && (
              <button
                onClick={() => onResend?.(manager._id)}
                className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-90"
                title="Resend Invitation"
              >
                <FiRefreshCw size={14} strokeWidth={2.5} />
              </button>
            )}
            <button
              onClick={() => onRemove?.(manager)}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white transition-all active:scale-90"
              title="Revoke Access"
            >
              <FiTrash2 size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
