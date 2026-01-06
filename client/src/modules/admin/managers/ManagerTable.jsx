import {
  FiMail,
  FiTrash2,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import { formatRelative, formatAbsolute } from "../../../utils/dateFormatter";

export default function ManagerTable({
  managers = [],
  onResend,
  onRemove,
  timezone = "Asia/Kolkata",
}) {
  if (!managers.length) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border shadow-sm">
        <div className="text-5xl mb-4">👤</div>
        <h3 className="text-lg font-semibold text-gray-900">
          No managers added yet
        </h3>
        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
          Managers help you run daily operations like orders and staff. Invite
          one to get started.
        </p>
      </div>
    );
  }

  const active = managers.filter((m) => m.isActive);
  const invited = managers.filter((m) => !m.isActive);

  return (
    <div className="space-y-12">
      {active.length > 0 && (
        <Section
          title="Active Managers"
          subtitle="Currently managing this restaurant"
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
          title="Pending Invitations"
          subtitle="Invited but not yet joined"
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

/* ================= SECTION ================= */

function Section({ title, subtitle, children }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-0.5">
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

/* ================= CARD ================= */

function ManagerCard({ manager, onResend, onRemove, timezone }) {
  const isActive = manager.isActive;

  return (
    <div className="relative rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition">
      {/* STATUS STRIPE */}
      <span
        className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${
          isActive ? "bg-emerald-500" : "bg-orange-400"
        }`}
      />

      <div className="flex flex-col gap-4 pl-2">
        {/* HEADER */}
        <div className="flex items-start gap-3">
          <Avatar name={manager.name} />

          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 truncate">{manager.name}</p>

            {/* EMAIL — RESPONSIVE + FULLY VISIBLE */}
            <p
              className="
                text-sm text-gray-500 flex items-start gap-1
                break-all sm:break-normal
                sm:line-clamp-2 lg:line-clamp-1
              "
              title={manager.email}
            >
              <FiMail size={13} className="mt-0.5 shrink-0" />
              <span>{manager.email}</span>
            </p>
          </div>
        </div>

        {/* META */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <Meta
            icon={isActive ? FiCheckCircle : FiClock}
            label={
              isActive
                ? `Joined ${formatRelative(manager.createdAt)}`
                : `Invited ${formatRelative(manager.createdAt)}`
            }
            title={formatAbsolute(manager.createdAt, timezone)}
          />

          <StatusBadge active={isActive} />
        </div>

        {/* ACTIONS */}
        <div className="flex gap-4 pt-1 text-xs font-medium">
          {!isActive && (
            <ActionBlue
              icon={FiRefreshCw}
              onClick={() => onResend?.(manager._id)}
            >
              Resend Invite
            </ActionBlue>
          )}

          <ActionRed icon={FiTrash2} onClick={() => onRemove?.(manager)}>
            Remove
          </ActionRed>
        </div>
      </div>
    </div>
  );
}

/* ================= SMALL UI PARTS ================= */

function Avatar({ name }) {
  return (
    <div className="h-11 w-11 rounded-full bg-emerald-100 flex items-center justify-center font-semibold text-emerald-700 shrink-0">
      {name?.charAt(0)?.toUpperCase() || "M"}
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        active ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
      }`}
    >
      {active ? "Active" : "Invited"}
    </span>
  );
}

function Meta({ icon: Icon, label, title }) {
  return (
    <span
      title={title}
      className="flex items-center gap-1 text-gray-500 cursor-help"
    >
      <Icon size={13} />
      {label}
    </span>
  );
}

/* ================= ACTIONS ================= */

function ActionBlue({ icon: Icon, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-blue-600 hover:underline"
    >
      <Icon size={13} />
      {children}
    </button>
  );
}

function ActionRed({ icon: Icon, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-red-600 hover:underline"
    >
      <Icon size={13} />
      {children}
    </button>
  );
}
