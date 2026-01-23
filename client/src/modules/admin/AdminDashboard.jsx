import {
  FiDollarSign,
  FiShoppingBag,
  FiLayers,
  FiUsers,
  FiActivity,
} from "react-icons/fi";
import clsx from "clsx";

export default function AdminDashboard() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER: With Live Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Dashboard
          </h2>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Operational Metrics Overview
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100/50 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
            Live Terminal
          </span>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales"
          value="₹0"
          icon={FiDollarSign}
          color="emerald"
        />
        <StatCard
          title="Orders Today"
          value="0"
          icon={FiShoppingBag}
          color="blue"
        />
        <StatCard
          title="Active Tables"
          value="0"
          icon={FiLayers}
          color="orange"
        />
        <StatCard title="Staff Online" value="0" icon={FiUsers} color="slate" />
      </div>

      {/* ANALYTICS PLACEHOLDER */}
      <div className="w-full h-64 rounded-[40px] bg-slate-50/30 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-3 group hover:border-emerald-200 transition-colors">
        <div className="p-4 bg-white rounded-2xl shadow-sm text-slate-300 group-hover:text-emerald-500 transition-colors">
          <FiActivity size={24} />
        </div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
          Awaiting Analytic Data Stream
        </p>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const themes = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100/50",
    blue: "text-blue-600 bg-blue-50 border-blue-100/50",
    orange: "text-orange-600 bg-orange-50 border-orange-100/50",
    slate: "text-slate-600 bg-slate-50 border-slate-100/50",
  };

  const displayValue = value ?? "---";

  return (
    <div className="group relative bg-white rounded-[32px] p-6 border border-slate-50 shadow-[0_20px_50px_rgba(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.04)] hover:-translate-y-1">
      <div className="flex justify-between items-start mb-6">
        {/* THE ICON CONTAINER: Inner shadow for "Stamped" look */}
        <div
          className={clsx(
            "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner transition-transform group-hover:rotate-6",
            themes[color] || themes.slate,
          )}
        >
          {Icon && <Icon size={20} strokeWidth={2.5} />}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-0.5">
          {title || "Metric"}
        </p>
        <p className="text-3xl font-black text-slate-900 tracking-tight tabular-nums truncate">
          {displayValue}
        </p>
      </div>
    </div>
  );
}
