import React, { useState, useEffect } from "react";
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Download,
  Calendar,
  Loader2,
} from "lucide-react";
import clsx from "clsx";
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
  const [exporting, setExporting] = useState(false);

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
      setExporting(true);
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
    } finally {
      setExporting(false);
    }
  };

  const ReportCard = ({ icon: Icon, title, data }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-50 rounded-lg">
          <Icon className="text-[#FC8019]" size={20} />
        </div>
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      </div>
      <div className="space-y-2.5">
        {data && data.length > 0 ? (
          data.slice(0, 5).map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center text-sm"
            >
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#FC8019] to-[#FF6B35] rounded-lg">
                <BarChart3 className="text-white" size={24} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            </div>
            <p className="text-gray-600 text-sm">
              Comprehensive business intelligence and data insights
            </p>
          </div>

          <button
            onClick={() => exportReport(reportType)}
            disabled={exporting || loading}
            className={clsx(
              "flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all active:scale-[0.98]",
              exporting || loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white hover:shadow-md",
            )}
          >
            {exporting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Download size={16} />
            )}
            <span className="hidden sm:inline">
              {exporting ? "Exporting..." : "Export"}
            </span>
          </button>
        </div>

        {/* DATE RANGE SELECTOR */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
            <Calendar size={16} className="text-[#FC8019]" />
            Select Date Range
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange({ ...dateRange, from: e.target.value })
              }
              className="h-11 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FC8019]/40 focus:border-[#FC8019] outline-none transition"
            />
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange({ ...dateRange, to: e.target.value })
              }
              className="h-11 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FC8019]/40 focus:border-[#FC8019] outline-none transition"
            />
          </div>
        </div>

        {/* REPORT TYPE TABS */}
        <div className="flex gap-2 border-b border-gray-200">
          {["sales", "items", "hourly"].map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={clsx(
                "px-4 py-3 text-sm font-semibold border-b-2 transition-all",
                reportType === type
                  ? "text-[#FC8019] border-[#FC8019]"
                  : "text-gray-600 border-transparent hover:text-gray-900",
              )}
            >
              {type === "sales" && "Sales"}
              {type === "items" && "Items"}
              {type === "hourly" && "Hourly"}
            </button>
          ))}
        </div>

        {/* REPORTS GRID */}
        {!loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reportType === "sales" && (
              <>
                <ReportCard
                  icon={BarChart3}
                  title="Daily Sales"
                  data={reports.sales}
                />
                <ReportCard
                  icon={TrendingUp}
                  title="Top Selling Items"
                  data={reports.itemSales}
                />
              </>
            )}
            {reportType === "items" && (
              <>
                <ReportCard
                  icon={PieChartIcon}
                  title="Item Distribution"
                  data={reports.itemSales}
                />
                <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center justify-center min-h-[200px]">
                  <p className="text-gray-500 text-sm font-medium">
                    Chart visualization
                  </p>
                </div>
              </>
            )}
            {reportType === "hourly" && (
              <>
                <ReportCard
                  icon={BarChart3}
                  title="Hourly Sales"
                  data={reports.hourly}
                />
                <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center justify-center min-h-[200px]">
                  <p className="text-gray-500 text-sm font-medium">
                    Time series chart
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-64 bg-white rounded-lg border border-gray-200 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* SUMMARY STATISTICS */}
        <div className="bg-gradient-to-r from-[#FC8019] to-[#FF6B35] rounded-lg p-6 text-white">
          <h3 className="font-semibold text-lg mb-5">Summary Statistics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-white/80 text-xs font-semibold uppercase mb-2">
                Total Orders
              </p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-white/80 text-xs font-semibold uppercase mb-2">
                Total Revenue
              </p>
              <p className="text-2xl font-bold">₹0</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-white/80 text-xs font-semibold uppercase mb-2">
                Avg Order
              </p>
              <p className="text-2xl font-bold">₹0</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-white/80 text-xs font-semibold uppercase mb-2">
                Transactions
              </p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
