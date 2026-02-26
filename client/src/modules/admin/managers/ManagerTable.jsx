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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 sm:p-12 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center mx-auto mb-4 sm:mb-6 border-2 border-gray-200">
          <FiShield size={32} />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
          No Personnel Assigned
        </h3>
        <p className="text-sm text-gray-600 mt-2 sm:mt-3 max-w-sm mx-auto">
          Invite your first manager to begin building your administrative team
        </p>
      </div>
    );
  }

  const active = managers.filter((m) => m.isActive);
  const invited = managers.filter((m) => !m.isActive);

  return (
    <div className="space-y-6">
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
      ? "bg-green-50 border-green-200"
      : "bg-orange-50 border-orange-200";
  const iconColor = type === "active" ? "text-green-600" : "text-[#FC8019]";

  return (
    <section className="space-y-4">
      <div className="bg-white rounded-xl px-4 sm:px-5 py-3 sm:py-4 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-2 rounded-lg border ${bgColor}`}>
                {type === "active" ? (
                  <FiActivity size={14} className={iconColor} />
                ) : (
                  <FiAlertCircle size={14} className={iconColor} />
                )}
              </div>
              <h4 className="text-sm sm:text-base font-semibold text-gray-900">
                {title}
              </h4>
              <span
                className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                  type === "active"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-orange-50 text-[#FC8019] border-orange-200"
                }`}
              >
                {count}
              </span>
            </div>
            <p className="text-xs text-gray-600 ml-9 sm:ml-10 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
        "group relative bg-white rounded-xl border transition-all duration-200 overflow-hidden hover:shadow-md active:scale-[0.99]",
        isActive
          ? "border-gray-200 shadow-sm hover:border-green-300"
          : "border-orange-200 shadow-sm hover:border-orange-300",
      )}
    >
      {/* HEADER SECTION */}
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={clsx(
                "p-2.5 rounded-xl flex items-center justify-center shrink-0",
                isActive
                  ? "bg-green-100 text-green-600"
                  : "bg-orange-100 text-[#FC8019]",
              )}
            >
              <FiUser size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-sm sm:text-base font-semibold text-gray-900 break-words line-clamp-1">
                {manager.name}
              </h5>
              <p className="text-xs text-gray-600 break-all line-clamp-1 mt-0.5">
                {manager.email}
              </p>
            </div>
          </div>
          <div
            className={clsx(
              "px-2 py-1 rounded-md text-xs font-medium border shrink-0",
              isActive
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-orange-50 text-[#FC8019] border-orange-200",
            )}
          >
            {isActive ? "Active" : "Pending"}
          </div>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="px-4 sm:px-5 py-3 sm:py-4 space-y-3">
        {/* ROLE & STATUS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-600">Role</p>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
              <FiShield
                size={14}
                className={isActive ? "text-green-500" : "text-[#FC8019]"}
              />
              Manager
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-600">Status</p>
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              {isActive ? (
                <>
                  <FiCheckCircle size={14} className="text-green-500" />
                  <span className="text-green-600">Live</span>
                </>
              ) : (
                <>
                  <FiClock size={14} className="text-[#FC8019]" />
                  <span className="text-[#FC8019]">Pending</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* DATE INFO */}
        <div className="space-y-1 pt-2 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-600">
            {isActive ? "Verified" : "Invited"}
          </p>
          <p
            title={formatAbsolute(manager.createdAt, timezone)}
            className="text-xs text-gray-700"
          >
            {formatRelative(manager.createdAt)}
          </p>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="px-4 sm:px-5 py-3 bg-gray-50 border-t border-gray-100">
        <div
          className={clsx(
            "flex items-center gap-2",
            !isActive && "grid grid-cols-2",
          )}
        >
          {!isActive && (
            <button
              onClick={() => onResend?.(manager._id)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-orange-200 text-[#FC8019] text-xs font-semibold hover:bg-orange-50 hover:border-orange-300 transition-all active:scale-[0.98]"
              title="Resend Invitation"
            >
              <FiRefreshCw size={14} />
              <span>Resend</span>
            </button>
          )}
          <button
            onClick={() => onRemove?.(manager)}
            className={clsx(
              "flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 hover:border-red-300 transition-all active:scale-[0.98]",
              isActive && "w-full",
            )}
            title="Revoke Access"
          >
            <FiTrash2 size={14} />
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
}
