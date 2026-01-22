import { useEffect, useState } from "react";
import Axios from "../../api/axios";
import dashboardApi from "../../api/dashboard.api";
import { FaArrowRight, FaSyncAlt, FaChartLine, FaUtensils, FaUsers, FaQrcode, FaChair } from "react-icons/fa";

/* ---------------- PREMIUM LIGHT STAT CARD ---------------- */
function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="group relative bg-white border border-slate-200/60 rounded-[24px] p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
          <Icon size={20} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
          Live
        </span>
      </div>
      
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <h3 className="mt-1 text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </h3>
        {hint && <p className="mt-2 text-xs font-medium text-slate-500 italic opacity-80">{hint}</p>}
      </div>
      
      {/* Soft Glow Background */}
      <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    </div>
  );
}

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await Axios(dashboardApi.summary);
      setData(res.data?.data || null);
    } catch (e) {
      setError(e?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setTimeout(() => setLoading(false), 500); 
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse p-2">
        <div className="h-10 w-64 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-slate-50 border border-slate-100 rounded-[28px]" />
          ))}
        </div>
      </div>
    );
  }

  const { today, tables, sessions, kitchen } = data || {};

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* HEADER: Minimalist & Clean */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 font-medium">
            Overview for <span className="text-emerald-600 font-bold">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          </p>
        </div>
        <button
          onClick={load}
          className="group flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-600 transition-all active:scale-95 shadow-sm"
        >
          <FaSyncAlt className={`transition-transform duration-700 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
          Sync Data
        </button>
      </div>

      {/* PRIMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Today's Revenue"
          icon={FaChartLine}
          value={`₹${Math.round(today?.totalSales || 0).toLocaleString()}`}
          hint={`${today?.totalBills || 0} Bills Generated`}
        />
        <StatCard 
          label="Active Orders" 
          icon={FaUtensils}
          value={today?.totalOrders || 0} 
          hint="Across kitchen stations"
        />
        <StatCard
          label="Dining Now"
          icon={FaUsers}
          value={sessions?.activeSessions || 0}
          hint="Active table sessions"
        />
        <StatCard
          label="Kitchen Queue"
          icon={FaSyncAlt}
          value={kitchen?.pendingItems || 0}
          hint="Items awaiting service"
        />
      </div>

      {/* ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* TABLE OCCUPANCY: Floating Card Style */}
        <div className="bg-white border border-slate-200/70 rounded-[32px] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Table Status</h2>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
              <FaChair size={18} />
            </div>
          </div>
          
          <div className="space-y-6">
             <OccupancyRow label="Total Capacity" value={tables?.total} color="bg-slate-200" />
             <OccupancyRow label="Currently Busy" value={tables?.occupied} color="bg-emerald-500" />
             <OccupancyRow label="Ready to Seat" value={tables?.free} color="bg-blue-400" />
          </div>

          <div className="mt-10 p-6 rounded-[24px] bg-slate-50 border border-slate-100 flex flex-col items-center">
             <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Efficiency Score</p>
             <p className="text-4xl font-black text-slate-900 mt-2">
               {tables?.total ? Math.round((tables?.occupied / tables?.total) * 100) : 0}<span className="text-emerald-500 text-xl">%</span>
             </p>
          </div>
        </div>

        {/* QUICK ACTIONS: Modern Icon Grid */}
        <div className="lg:col-span-2 bg-white border border-slate-200/70 rounded-[32px] p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Management Shortcuts</h2>
            <p className="text-sm text-slate-500 font-medium">One-tap access to core functions</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ActionHint icon={FaUtensils} title="Menu Manager" text="Availability & Pricing" />
            <ActionHint icon={FaUsers} title="Staff Center" text="Permissions & PINs" />
            <ActionHint icon={FaQrcode} title="QR Terminal" text="Rotate Login Codes" />
            <ActionHint icon={FaChair} title="Floor Plan" text="Zone Configuration" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- SUB-COMPONENTS ---------------- */

function OccupancyRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${color} ring-4 ring-white shadow-sm`} />
        <span className="text-sm font-bold text-slate-600">{label}</span>
      </div>
      <span className="text-base font-black text-slate-900">{value || 0}</span>
    </div>
  );
}

function ActionHint({ title, text, icon: Icon }) {
  return (
    <div className="group flex items-center gap-5 p-5 rounded-[24px] border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.08)] hover:border-emerald-200 transition-all duration-300 cursor-pointer active:scale-[0.97]">
      <div className="p-4 rounded-2xl bg-white text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 shadow-sm border border-slate-100 transition-all duration-300">
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-black text-slate-800 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{title}</p>
        <p className="text-[11px] text-slate-500 font-medium mt-0.5">{text}</p>
      </div>
      <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
        <FaArrowRight size={12} className="text-emerald-500" />
      </div>
    </div>
  );
}