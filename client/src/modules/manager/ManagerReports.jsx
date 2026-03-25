import React, { useState, useEffect } from "react";
import { FiBarChart2, FiDownload, FiUsers, FiPackage } from "react-icons/fi";
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

      // Fetch multiple reports in parallel
      const [salesRes, itemsRes, waitersRes] = await Promise.all([
        AuthAxios.get("/api/reports/daily-sales", {
          params: { from: dateRange.from, to: dateRange.to },
        }),
        AuthAxios.get("/api/reports/top-items", {
          params: { from: dateRange.from, to: dateRange.to, limit: 10 },
        }),
        AuthAxios.get("/api/reports/waiters", {
          params: { from: dateRange.from, to: dateRange.to },
        }),
      ]);

      // Transform the data to match component expectations
      const transformedData = {
        sales:
          salesRes.data?.data?.dailySales?.map((item) => ({
            name: item.date || item.day,
            detail: `${item.orderCount || 0} orders`,
            value: `₹${item.revenue?.toFixed(0) || 0}`,
          })) || [],
        items:
          itemsRes.data?.data?.topItems?.map((item) => ({
            name: item.itemName || item.name,
            detail: `Sold ${item.quantitySold || 0} times`,
            value: `₹${item.revenue?.toFixed(0) || 0}`,
          })) || [],
        staff:
          waitersRes.data?.data?.waiters?.map((waiter) => ({
            name: waiter.name,
            detail: `${waiter.ordersServed || 0} orders`,
            value: `₹${waiter.totalSales?.toFixed(0) || 0}`,
          })) || [],
      };

      setReports(transformedData);
    } catch (error) {
      console.error("Failed to fetch reports:", error.message);
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      // Simple CSV export from current data
      const dataToExport = reports[reportType] || [];

      if (dataToExport.length === 0) {
        toast.error("No data to export");
        return;
      }

      // Create CSV content
      const headers = ["Name", "Details", "Value"];
      const rows = dataToExport.map((item) => [
        item.name || "",
        item.detail || "",
        item.value || "",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}-report-${new Date().getTime()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded");
    } catch (error) {
      console.error("Export error:", error.message);
      toast.error("Failed to export report");
    }
  };

  const ReportCard = ({ icon: Icon, title, data }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-50 rounded-lg">
          <Icon className="text-orange-600" size={20} />
        </div>
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-3">
        {data && data.length > 0 ? (
          data.slice(0, 5).map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center pb-2 border-b border-gray-100 last:border-0"
            >
              <div>
                <p className="text-sm text-gray-700">
                  {item.name || item.label}
                </p>
                <p className="text-xs text-gray-500">{item.detail}</p>
              </div>
              <p className="font-semibold text-gray-900">{item.value}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No data available</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Business Analytics
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Track sales, staff, and item performance
            </p>
          </div>

          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200 text-sm font-semibold hover:-translate-y-0.5"
          >
            <FiDownload size={16} />
            Export Report
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row gap-4 transition-all duration-300 hover:shadow-md">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
              From Date
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange({ ...dateRange, from: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">
              To Date
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange({ ...dateRange, to: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
          {["sales", "staff", "items"].map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-4 py-3 font-semibold text-sm transition border-b-2 capitalize ${
                reportType === type
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {type} Report
            </button>
          ))}
        </div>

        {!loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reportType === "sales" && (
              <>
                <ReportCard
                  icon={FiBarChart2}
                  title="Daily Sales"
                  data={reports.sales}
                />
                <ReportCard
                  icon={FiBarChart2}
                  title="Peak Hours"
                  data={reports.sales}
                />
              </>
            )}
            {reportType === "staff" && (
              <>
                <ReportCard
                  icon={FiUsers}
                  title="Staff Performance"
                  data={reports.staff}
                />
                <ReportCard
                  icon={FiBarChart2}
                  title="Shift Summary"
                  data={reports.staff}
                />
              </>
            )}
            {reportType === "items" && (
              <>
                <ReportCard
                  icon={FiPackage}
                  title="Best Sellers"
                  data={reports.items}
                />
                <ReportCard
                  icon={FiPackage}
                  title="Inventory Status"
                  data={reports.items}
                />
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-64 bg-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
