import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Axios from "../../api/axios";
import toast from "react-hot-toast";
import { Users, RefreshCw, Loader2 } from "lucide-react";
import clsx from "clsx";

export default function AdminStaffStatus() {
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchStaffStatus();
  }, []);

  const fetchStaffStatus = async () => {
    try {
      setRefreshing(true);
      const response = await Axios.get("/api/dashboard/performance");

      if (response.data?.data) {
        setStaffList(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch staff status:", err);
      toast.error("Failed to load staff status");
    } finally {
      setRefreshing(false);
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
      CASHIER: "bg-orange-100 text-[#FC8019]",
      MANAGER: "bg-red-100 text-red-700",
    };
    return colors[role] || "bg-gray-100 text-gray-700";
  };

  const filteredStaff =
    filter === "all" ? staffList : staffList.filter((s) => s.role === filter);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#FC8019] to-[#FF6B35] rounded-lg">
                <Users className="text-white" size={24} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Team Status</h1>
            </div>
            <p className="text-gray-600 text-sm">
              Monitor all staff members and their performance
            </p>
          </div>
          <button
            onClick={fetchStaffStatus}
            disabled={refreshing}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all active:scale-[0.98]",
              refreshing
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white hover:shadow-md",
            )}
          >
            {refreshing ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <RefreshCw size={16} />
            )}
            Refresh
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 bg-white rounded-lg p-4 border border-gray-200">
          <button
            onClick={() => setFilter("all")}
            className={clsx(
              "px-4 py-2 rounded-lg font-semibold text-sm transition-all",
              filter === "all"
                ? "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200",
            )}
          >
            All Staff
          </button>
          {["CHEF", "WAITER", "CASHIER"].map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={clsx(
                "px-4 py-2 rounded-lg font-semibold text-sm transition-all",
                filter === role
                  ? "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200",
              )}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Staff Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <Loader2 className="animate-spin h-12 w-12 text-[#FC8019] mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Loading staff data...</p>
            </div>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">No staff members found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((staff) => (
              <div
                key={staff._id}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {staff.name}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">{staff.email}</p>
                  </div>
                  <span
                    className={clsx(
                      "px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2",
                      getStatusBadge(staff.role),
                    )}
                  >
                    {staff.role}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
                      getStatusColor(staff.isActive),
                    )}
                  >
                    <span
                      className={clsx(
                        "w-2 h-2 rounded-full",
                        staff.isActive ? "bg-green-700" : "bg-gray-500",
                      )}
                    ></span>
                    {staff.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Branch Info */}
                {staff.branch && (
                  <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-xs text-gray-600 font-medium">Branch</p>
                    <p className="text-sm font-semibold text-[#FC8019] mt-1">
                      {staff.branch}
                    </p>
                  </div>
                )}

                {/* Performance Stats */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-gray-600 font-medium">Orders</p>
                    <p className="text-lg font-bold text-blue-600 mt-1">
                      {staff.performanceMetrics?.orderCount || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-gray-600 font-medium">Rate</p>
                    <p className="text-lg font-bold text-green-600 mt-1">
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
