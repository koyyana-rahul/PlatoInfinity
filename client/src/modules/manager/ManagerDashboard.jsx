import { useEffect, useState } from "react";
import Axios from "../../api/axios";
import dashboardApi from "../../api/dashboard.api";

function StatCard({ label, value, hint }) {
  return (
    <div className="bg-white border rounded-2xl p-4 sm:p-5 shadow-sm">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
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
      setError(e?.response?.data?.message || "Failed to load dashboard");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border rounded-2xl p-6">
        <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <button
          onClick={load}
          className="mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const today = data?.today;
  const tables = data?.tables;
  const sessions = data?.sessions;
  const kitchen = data?.kitchen;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Today’s snapshot</p>
        </div>
        <button
          onClick={load}
          className="px-4 py-2 rounded-lg text-sm font-medium border bg-white hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today Sales"
          value={`₹${Math.round(today?.totalSales || 0)}`}
          hint={`Bills: ${today?.totalBills || 0} · Avg: ₹${today?.avgBillValue || 0}`}
        />
        <StatCard label="Orders Today" value={today?.totalOrders || 0} />
        <StatCard
          label="Active Sessions"
          value={sessions?.activeSessions || 0}
          hint="Open tables currently dining"
        />
        <StatCard
          label="Kitchen Pending"
          value={kitchen?.pendingItems || 0}
          hint="Items not served yet"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-900">Tables</h2>
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <Row label="Total" value={tables?.total || 0} />
            <Row label="Occupied" value={tables?.occupied || 0} />
            <Row label="Free" value={tables?.free || 0} />
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900">Quick actions</h2>
          <p className="text-xs text-gray-500 mt-1">
            Use the sidebar to manage menu, staff, QR, stations and tables.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ActionHint title="Menu" text="Import/sync and control availability" />
            <ActionHint title="Staff" text="Create staff and manage PINs" />
            <ActionHint title="Staff Login QR" text="Open shift and rotate QR" />
            <ActionHint title="Tables" text="Create tables and print QR" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function ActionHint({ title, text }) {
  return (
    <div className="border rounded-xl p-4 bg-gray-50">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="text-xs text-gray-600 mt-1">{text}</p>
    </div>
  );
}
