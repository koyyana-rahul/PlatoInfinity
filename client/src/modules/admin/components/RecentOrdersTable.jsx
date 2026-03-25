import React, { useEffect, useMemo, useState } from "react";
import Dropdown from "../../../components/ui/DropDown";

const formatOrderDateTimeParts = (timestamp) => {
  if (!timestamp) return { date: "-", time: "-" };
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return { date: "-", time: "-" };

  return {
    date: date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
  };
};

/**
 * Recent Orders Table Component
 * Displays list of recent orders with status badges
 */
export const RecentOrdersTable = ({ orders, loading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [compactMode, setCompactMode] = useState(true);

  const getTotalQuantity = (items = []) =>
    (Array.isArray(items) ? items : []).reduce(
      (sum, item) => sum + Number(item?.quantity || 0),
      0,
    );

  const totalOrders = Array.isArray(orders) ? orders.length : 0;
  const totalPages = Math.max(1, Math.ceil(totalOrders / rowsPerPage));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedOrders = useMemo(() => {
    if (!Array.isArray(orders) || orders.length === 0) return [];
    const start = (currentPage - 1) * rowsPerPage;
    return orders.slice(start, start + rowsPerPage);
  }, [orders, currentPage, rowsPerPage]);

  const startIndex = totalOrders === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(currentPage * rowsPerPage, totalOrders);

  const compactClass = compactMode ? "py-2" : "py-3";
  const compactCellTextClass = compactMode ? "text-xs" : "text-sm";
  const rowsPerPageOptions = [
    { value: 10, label: "10 rows / page" },
    { value: 25, label: "25 rows / page" },
    { value: 50, label: "50 rows / page" },
  ];

  if (loading && (!orders || orders.length === 0)) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-slate-100 rounded animate-pulse w-32" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 bg-slate-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-500">No orders yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto">
          <div className="text-xs sm:text-sm text-slate-600 bg-slate-100 px-3 py-2 rounded-md text-center sm:text-left whitespace-nowrap">
            Showing {startIndex}-{endIndex} of {totalOrders}
          </div>

          <div className="w-full min-w-0">
            <Dropdown
              value={rowsPerPage}
              onChange={(value) => {
                setRowsPerPage(Number(value));
                setCurrentPage(1);
              }}
              placeholder="Rows per page"
              options={rowsPerPageOptions}
            />
          </div>

          <button
            type="button"
            onClick={() => setCompactMode((prev) => !prev)}
            className="w-full text-xs sm:text-sm border border-slate-200 rounded-md px-3 py-2 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-200"
          >
            {compactMode ? "Comfortable view" : "Compact view"}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-lg overflow-hidden">
        <div className="hidden xl:block">
          <table className="w-full table-fixed">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Order #
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Branch
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Table
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Items
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Qty
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Date & Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedOrders.map((order) => {
                const sourceTs = order.createdAt || order.updatedAt;
                const dateTime = formatOrderDateTimeParts(sourceTs);

                return (
                  <tr
                    key={order._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td
                      className={`px-4 ${compactClass} ${compactCellTextClass} font-bold text-slate-900 whitespace-nowrap`}
                    >
                      #{order.orderNumber}
                    </td>
                    <td className={`px-4 ${compactClass} ${compactCellTextClass} text-slate-600`}>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold truncate max-w-[160px]">
                        {order.restaurantId?.name || "Unknown"}
                      </span>
                    </td>
                    <td
                      className={`px-4 ${compactClass} ${compactCellTextClass} text-slate-600 whitespace-nowrap`}
                    >
                      {order.tableName || "Takeaway"}
                    </td>
                    <td
                      className={`px-4 ${compactClass} ${compactCellTextClass} text-slate-600 whitespace-nowrap`}
                    >
                      {order.items?.length || 0} items
                    </td>
                    <td
                      className={`px-4 ${compactClass} ${compactCellTextClass} text-slate-600 font-semibold whitespace-nowrap`}
                    >
                      {getTotalQuantity(order.items)}
                    </td>
                    <td
                      className={`px-4 ${compactClass} ${compactCellTextClass} font-semibold text-emerald-600 whitespace-nowrap`}
                    >
                      ₹{order.totalAmount?.toLocaleString("en-IN") || "0"}
                    </td>
                    <td
                      className={`px-4 ${compactClass} ${compactCellTextClass} whitespace-nowrap`}
                    >
                      <OrderStatusBadge status={order.orderStatus} />
                    </td>
                    <td className={`px-4 ${compactClass} text-xs text-slate-500`}>
                      <div className="leading-tight">
                        <p className="font-semibold text-slate-700">{dateTime.date}</p>
                        <p>{dateTime.time}</p>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="xl:hidden divide-y divide-slate-100">
          {paginatedOrders.map((order) => {
            const sourceTs = order.createdAt || order.updatedAt;
            const dateTime = formatOrderDateTimeParts(sourceTs);

            return (
              <div key={order._id} className={compactMode ? "p-3 space-y-2" : "p-4 space-y-3"}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      #{order.orderNumber}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {order.tableName || "Takeaway"}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.orderStatus} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 rounded p-2">
                    <p className="text-slate-500">Branch</p>
                    <p className="font-semibold text-slate-800 truncate">
                      {order.restaurantId?.name || "Unknown"}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded p-2">
                    <p className="text-slate-500">Amount</p>
                    <p className="font-semibold text-emerald-700">
                      ₹{order.totalAmount?.toLocaleString("en-IN") || "0"}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded p-2">
                    <p className="text-slate-500">Items / Qty</p>
                    <p className="font-semibold text-slate-800">
                      {order.items?.length || 0} / {getTotalQuantity(order.items)}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded p-2">
                    <p className="text-slate-500">Date & Time</p>
                    <p className="font-semibold text-slate-800">{dateTime.date}</p>
                    <p className="text-slate-600">{dateTime.time}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-100 px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-xs sm:text-sm rounded-md border border-slate-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="text-xs sm:text-sm font-semibold text-slate-600">
            Page {currentPage} of {totalPages}
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages}
            className="px-3 py-1.5 text-xs sm:text-sm rounded-md border border-slate-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Order Status Badge Component
 * Shows colored badge based on order status
 */
const OrderStatusBadge = ({ status }) => {
  const normalized = String(status || "NEW").toUpperCase();

  const statusConfig = {
    NEW: { bg: "bg-orange-100", text: "text-orange-700", label: "PLACED" },
    IN_PROGRESS: { bg: "bg-yellow-100", text: "text-yellow-700" },
    SERVING: { bg: "bg-blue-100", text: "text-blue-700" },
    READY: { bg: "bg-green-100", text: "text-green-700" },
    SERVED: { bg: "bg-emerald-100", text: "text-emerald-700" },
    DELIVERED: { bg: "bg-emerald-100", text: "text-emerald-700" },
    CANCELLED: { bg: "bg-slate-100", text: "text-slate-700" },
  };

  const config = statusConfig[normalized] || statusConfig.NEW;
  const label = config.label || normalized.replaceAll("_", " ");

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${config.bg} ${config.text}`}
    >
      {label}
    </span>
  );
};
