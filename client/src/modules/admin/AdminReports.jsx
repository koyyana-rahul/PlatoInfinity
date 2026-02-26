import React, { useState, useEffect } from "react";
import {
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiDownload,
  FiCalendar,
} from "react-icons/fi";
import AuthAxios from "../../api/authAxios";
import reportsApi from "../../api/reports.api";
import toast from "react-hot-toast";

export default function AdminReports() {
  const [reports, setReports] = useState({
    sales: [],
    itemSales: [],
    hourly: [],
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
      const config = reportsApi.getAdminReports(dateRange.from, dateRange.to);
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

  const exportReport = async (type) => {
    try {
      const config = reportsApi.exportAdminReport(
        type,
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
      a.download = `${type}-report-${new Date().getTime()}.csv`;
      a.click();
      toast.success("Report downloaded");
    } catch (error) {
      console.error("❌ Export error:", error.message);
      toast.error("Failed to export report");
    }
  };

  const ReportCard = ({ icon: Icon, title, data }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Icon className="text-indigo-600" size={20} />
        </div>
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-2">
        {data && data.length > 0 ? (
          data.slice(0, 5).map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.name || item.label}</span>
              <span className="font-semibold text-gray-900">
                {item.value || item.count}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No data available</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* ============================================
          HEADER SECTION
          ============================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            📈 Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Comprehensive business intelligence and data insights
          </p>
        </div>

        <button
          onClick={() => exportReport(reportType)}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-bold text-sm sm:text-base"
        >
          <FiDownload size={20} />
          <span className="hidden sm:inline">Export Report</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>

      {/* ============================================
          DATE RANGE SELECTOR
          ============================================ */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 sm:p-6">
        <label className="block text-sm font-bold text-gray-900 mb-4">
          📅 Select Date Range
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <FiCalendar className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange({ ...dateRange, from: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition text-sm"
            />
          </div>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange({ ...dateRange, to: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition text-sm"
            />
          </div>
        </div>
      </div>

      {/* ============================================
          REPORT TYPE TABS
          ============================================ */}
      <div className="flex gap-2 border-b border-gray-200 bg-white rounded-t-xl p-4">
        {["sales", "items", "hourly"].map((type) => (
          <button
            key={type}
            onClick={() => setReportType(type)}
            className={`px-4 sm:px-6 py-3 font-bold text-sm sm:text-base transition whitespace-nowrap ${
              reportType === type
                ? "border-b-4 border-indigo-600 text-indigo-600"
                : "text-gray-600 hover:text-gray-900 border-b-4 border-transparent"
            }`}
          >
            {type === "sales" && "📊 Sales"}
            {type === "items" && "🍕 Items"}
            {type === "hourly" && "⏰ Hourly"}
          </button>
        ))}
      </div>

      {/* ============================================
          REPORTS GRID
          ============================================ */}
      {!loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reportType === "sales" && (
            <>
              <ReportCard
                icon={FiBarChart2}
                title="📊 Daily Sales"
                data={reports.sales}
              />
              <ReportCard
                icon={FiTrendingUp}
                title="⭐ Top Selling Items"
                data={reports.itemSales}
              />
            </>
          )}
          {reportType === "items" && (
            <>
              <ReportCard
                icon={FiPieChart}
                title="🥧 Item Distribution"
                data={reports.itemSales}
              />
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 text-lg">
                  🏆 Category Performance
                </h3>
                <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-semibold">
                  📈 Chart visualization
                </div>
              </div>
            </>
          )}
          {reportType === "hourly" && (
            <>
              <ReportCard
                icon={FiBarChart2}
                title="⏱️ Hourly Sales"
                data={reports.hourly}
              />
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 text-lg">
                  🎯 Peak Hours Analysis
                </h3>
                <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-semibold">
                  📊 Time series chart
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-80 bg-white rounded-xl border border-slate-200 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* ============================================
          SUMMARY STATISTICS
          ============================================ */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 rounded-xl p-6 sm:p-8 text-white shadow-xl">
        <h3 className="font-black text-xl sm:text-2xl mb-6">
          📊 Summary Statistics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-white/80 text-xs sm:text-sm font-bold uppercase tracking-wide mb-2">
              Total Orders
            </p>
            <p className="text-2xl sm:text-3xl font-black">0</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-white/80 text-xs sm:text-sm font-bold uppercase tracking-wide mb-2">
              Total Revenue
            </p>
            <p className="text-2xl sm:text-3xl font-black">₹0</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-white/80 text-xs sm:text-sm font-bold uppercase tracking-wide mb-2">
              Avg Order Value
            </p>
            <p className="text-2xl sm:text-3xl font-black">₹0</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-white/80 text-xs sm:text-sm font-bold uppercase tracking-wide mb-2">
              Transactions
            </p>
            <p className="text-2xl sm:text-3xl font-black">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
