import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Axios from "../../api/axios";
import toast from "react-hot-toast";
import { FiArrowLeft, FiRefreshCw, FiFilter } from "react-icons/fi";

/**
 * Admin Staff Status Page
 * Displays all staff members with their current status
 */
export default function AdminStaffStatus() {
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchStaffStatus();
  }, []);

  const fetchStaffStatus = async () => {
    try {
      setLoading(true);
      // Fetch staff data from dashboard performance metrics
      const response = await Axios.get("/api/dashboard/performance");

      if (response.data?.data) {
        setStaffList(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch staff status:", err);
      toast.error("Failed to load staff status");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isActive) => {
    return isActive
      ? "bg-green-100 text-green-700"
      : "bg-gray-100 text-gray-700";
  };

  const getStatusBadge = (role) => {
    const colors = {
      CHEF: "bg-blue-100 text-blue-700",
      WAITER: "bg-purple-100 text-purple-700",
      CASHIER: "bg-orange-100 text-orange-700",
      MANAGER: "bg-red-100 text-red-700",
    };
    return colors[role] || "bg-gray-100 text-gray-700";
  };

  const filteredStaff =
    filter === "all" ? staffList : staffList.filter((s) => s.role === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
              👥 Team Status
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Monitor all staff members and their performance metrics
            </p>
          </div>
          <button
            onClick={fetchStaffStatus}
            className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all font-semibold w-full sm:w-auto justify-center sm:justify-start"
          >
            <FiRefreshCw size={18} />
            Refresh Data
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3 bg-white rounded-lg p-4 sm:p-6 border border-slate-200 shadow-sm">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm transition-all ${
              filter === "all"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            🌐 All Staff
          </button>
          {["CHEF", "WAITER", "CASHIER"].map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm transition-all ${
                filter === role
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {role === "CHEF" && "👨‍🍳"}
              {role === "WAITER" && "🧑‍💼"}
              {role === "CASHIER" && "💳"}
              {role}
            </button>
          ))}
        </div>

        {/* Staff Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-500 mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">
                Loading staff data...
              </p>
            </div>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center shadow-sm">
            <p className="text-slate-500 text-lg">No staff members found</p>
            <p className="text-slate-400 text-sm mt-2">
              Try changing your filter or adding new staff members
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredStaff.map((staff) => (
              <div
                key={staff._id}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-300/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      {staff.name}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">{staff.email}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2 ${getStatusBadge(
                      staff.role,
                    )}`}
                  >
                    {staff.role === "CHEF" && "👨‍🍳"}
                    {staff.role === "WAITER" && "🧑‍💼"}
                    {staff.role === "CASHIER" && "💳"}
                    {staff.role}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                      staff.isActive,
                    )}`}
                  >
                    {staff.isActive ? "🟢 Active" : "🔴 Inactive"}
                  </span>
                </div>

                {/* Branch Info */}
                {staff.branch && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-600 font-semibold">
                      Branch
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      🏪 {staff.branch}
                    </p>
                  </div>
                )}

                {/* Performance Stats */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <p className="text-xs text-slate-600 font-semibold">
                      Orders
                    </p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {staff.performanceMetrics?.orderCount || 0}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4">
                    <p className="text-xs text-slate-600 font-semibold">
                      Completion
                    </p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                      {staff.performanceMetrics?.completionRate || 0}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
