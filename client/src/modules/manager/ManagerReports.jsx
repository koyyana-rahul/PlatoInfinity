import React, { useState, useEffect } from "react";
import {
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiDownload,
  FiUsers,
} from "react-icons/fi";
import AuthAxios from "../../api/authAxios";
import reportsApi from "../../api/reports.api";
import toast from "react-hot-toast";

export default function ManagerReports() {
  const [reports, setReports] = useState({
    sales: [],
    staff: [],
    items: [],
  });

  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("sales");

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const config = reportsApi.getManagerReports(dateRange.from, dateRange.to);
      const res = await AuthAxios.get(config.url, { params: config.params });

      if (res.data?.success) {
        setReports(res.data.data);
      }
    } catch (error) {
      console.error("❌ Error fetching reports:", error.message);
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const config = reportsApi.exportManagerReport(
        reportType,
        dateRange.from,
        dateRange.to,
      );
      const res = await AuthAxios.get(config.url, {
        params: config.params,
        responseType: config.responseType,
      });

      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `manager-report-${new Date().getTime()}.csv`;
      a.click();
      toast.success("Report downloaded");
    } catch (error) {
      console.error("❌ Export error:", error.message);
      toast.error("Failed to export report");
    }
  };

  const ReportCard = ({ icon: Icon, title, data, color }) => (
    <div className="bg-white border border-slate-100 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 bg-${color}-50 rounded-lg`}>
          <Icon className={`text-${color}-600`} size={20} />
        </div>
        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>
      <div className="space-y-3">
        {data && data.length > 0 ? (
          data.slice(0, 5).map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center pb-2 border-b border-slate-100 last:border-0"
            >
              <div>
                <p className="text-sm text-slate-600">
                  {item.name || item.label}
                </p>
                <p className="text-xs text-slate-400">{item.detail}</p>
              </div>
              <p className="font-semibold text-slate-900">{item.value}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">No data available</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Manager Reports</h2>
          <p className="text-xs font-semibold text-slate-400 uppercase mt-1">
            Performance and operations metrics
          </p>
        </div>

        <button
          onClick={exportReport}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition text-sm font-semibold"
        >
          <FiDownload size={16} />
          Export Report
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white border border-slate-100 rounded-lg p-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">
            From Date
          </label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) =>
              setDateRange({ ...dateRange, from: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">
            To Date
          </label>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {["sales", "staff", "items"].map((type) => (
          <button
            key={type}
            onClick={() => setReportType(type)}
            className={`px-4 py-3 font-semibold text-sm transition border-b-2 capitalize ${
              reportType === type
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {type} Report
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      {!loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reportType === "sales" && (
            <>
              <ReportCard
                icon={FiBarChart2}
                title="Daily Sales"
                data={reports.sales}
                color="emerald"
              />
              <ReportCard
                icon={FiTrendingUp}
                title="Peak Hours"
                data={reports.sales}
                color="blue"
              />
            </>
          )}
          {reportType === "staff" && (
            <>
              <ReportCard
                icon={FiUsers}
                title="Staff Performance"
                data={reports.staff}
                color="purple"
              />
              <ReportCard
                icon={FiBarChart2}
                title="Shift Summary"
                data={reports.staff}
                color="orange"
              />
            </>
          )}
          {reportType === "items" && (
            <>
              <ReportCard
                icon={FiPieChart}
                title="Best Sellers"
                data={reports.items}
                color="pink"
              />
              <ReportCard
                icon={FiTrendingUp}
                title="Inventory Status"
                data={reports.items}
                color="indigo"
              />
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-64 bg-slate-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      )}
    </div>
  );
}
