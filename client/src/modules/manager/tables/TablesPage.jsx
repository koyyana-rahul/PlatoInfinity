import { useEffect, useMemo, useState, useCallback } from "react";
import {
  FiPlus,
  FiSearch,
  FiGrid,
  FiCheckCircle,
  FiClock,
  FiUsers,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

import { useSocket } from "../../../socket/SocketProvider";

import Axios from "../../../api/axios";
import tableApi from "../../../api/table.api";

import CreateTableModal from "./CreateTableModal";
import DeleteTableModal from "./DeleteTableModal";
import TableCard from "./TableCard";
import Dropdown from "../../../components/ui/DropDown";

const SORT = {
  TABLE_LOW_HIGH: "TABLE_LOW_HIGH",
  TABLE_HIGH_LOW: "TABLE_HIGH_LOW",
  SEATS: "SEATS",
  STATUS: "STATUS",
};

export default function TablesPage() {
  const restaurantId = useSelector((s) => s.user.restaurantId);

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [deleteTable, setDeleteTable] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState(SORT.TABLE_LOW_HIGH);

  const loadTables = useCallback(
    async (silent = false) => {
      if (!restaurantId) return;
      try {
        if (!silent) setLoading(true);

        const res = await Axios(tableApi.list(restaurantId));
        setTables(res.data?.data || []);
      } catch {
        toast.error("Unable to load tables");
      } finally {
        setLoading(false);
      }
    },
    [restaurantId],
  );

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleLiveUpdate = () => loadTables(true);

    const events = [
      "table:status-changed",
      "table:status-updated",
      "table:status_changed",
      "table:update",
      "table:availability",
      "session:update",
      "session:opened",
      "session:closed",
      "order:placed",
      "order:status-changed",
      "order:served",
      "order:cancelled",
    ];

    events.forEach((eventName) => socket.on(eventName, handleLiveUpdate));
    socket.on("connect", handleLiveUpdate);

    return () => {
      events.forEach((eventName) => socket.off(eventName, handleLiveUpdate));
      socket.off("connect", handleLiveUpdate);
    };
  }, [socket, loadTables]);

  const visibleTables = useMemo(() => {
    let data = [...tables];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((t) =>
        (t.tableNumber || "").toLowerCase().includes(q),
      );
    }

    if (status !== "ALL") {
      data = data.filter((t) => t.status === status);
    }

    switch (sortBy) {
      case SORT.TABLE_HIGH_LOW:
        data.sort((a, b) =>
          b.tableNumber.localeCompare(a.tableNumber, undefined, {
            numeric: true,
          }),
        );
        break;
      case SORT.SEATS:
        data.sort((a, b) => b.seatingCapacity - a.seatingCapacity);
        break;
      case SORT.STATUS:
        data.sort((a, b) => a.status.localeCompare(b.status));
        break;
      default:
        data.sort((a, b) =>
          a.tableNumber.localeCompare(b.tableNumber, undefined, {
            numeric: true,
          }),
        );
    }

    return data;
  }, [tables, search, status, sortBy]);

  const summary = useMemo(
    () => ({
      total: tables.length,
      free: tables.filter((t) => t.status === "FREE").length,
      occupied: tables.filter((t) => t.status === "OCCUPIED").length,
      reserved: tables.filter((t) => t.status === "RESERVED").length,
    }),
    [tables],
  );

  return (
    <div className="min-h-screen bg-gray-50/70">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-3 sm:py-6 space-y-3 sm:space-y-5 transition-all">
        <div className="bg-white border border-gray-200 rounded-2xl p-2.5 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-orange-700 bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5 mb-1.5">
              <FiGrid size={10} /> Restaurant Operations
            </div>
            <h1 className="text-base sm:text-xl font-bold text-gray-900 mb-0.5 sm:mb-1">
              Table Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-xl">
              Manage table inventory, QR access, and dine-in status in one
              place.
            </p>
          </div>

          <button
            onClick={() => setOpenCreate(true)}
            className="h-8 sm:h-10 px-2.5 sm:px-4 rounded-xl bg-orange-500 text-white text-xs sm:text-sm font-semibold hover:bg-orange-600 inline-flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 hover:-translate-y-0.5"
          >
            <FiPlus size={14} />{" "}
            <span className="hidden xs:inline">Add Table</span>
          </button>
        </div>

        {/* Stats grid: 4 cols on mobile, tighter spacing */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-4">
          <div className="bg-white rounded-xl p-2.5 sm:p-5 border border-gray-200 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">
              Total Tables
            </p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">
              {summary.total}
            </p>
          </div>
          <div className="bg-green-50 rounded-xl p-2.5 sm:p-5 border border-green-200 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-[10px] sm:text-xs text-green-700 uppercase tracking-wide inline-flex items-center gap-1 xs:gap-1.5">
              <FiCheckCircle size={10} /> Available
            </p>
            <p className="text-lg sm:text-2xl font-bold text-green-700 mt-1 sm:mt-2">
              {summary.free}
            </p>
          </div>
          <div className="bg-orange-50 rounded-xl p-2.5 sm:p-5 border border-orange-200 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-[10px] sm:text-xs text-orange-700 uppercase tracking-wide inline-flex items-center gap-1 xs:gap-1.5">
              <FiUsers size={10} /> Occupied
            </p>
            <p className="text-lg sm:text-2xl font-bold text-orange-700 mt-1 sm:mt-2">
              {summary.occupied}
            </p>
          </div>
          <div className="bg-amber-50 rounded-xl p-2.5 sm:p-5 border border-amber-200 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-[10px] sm:text-xs text-amber-700 uppercase tracking-wide inline-flex items-center gap-1 xs:gap-1.5">
              <FiClock size={10} /> Reserved
            </p>
            <p className="text-lg sm:text-2xl font-bold text-amber-700 mt-1 sm:mt-2">
              {summary.reserved}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-6 relative">
              <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search table number..."
                className="w-full h-11 pl-10 pr-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 shadow-sm"
              />
            </div>

            <div className="lg:col-span-3">
              <Dropdown
                value={status}
                onChange={setStatus}
                options={[
                  { value: "ALL", label: "All Status" },
                  { value: "FREE", label: "Available" },
                  { value: "OCCUPIED", label: "Occupied" },
                  { value: "RESERVED", label: "Reserved" },
                ]}
              />
            </div>

            <div className="lg:col-span-3">
              <Dropdown
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: SORT.TABLE_LOW_HIGH, label: "Table: Low to High" },
                  { value: SORT.TABLE_HIGH_LOW, label: "Table: High to Low" },
                  { value: SORT.SEATS, label: "Capacity" },
                  { value: SORT.STATUS, label: "Status" },
                ]}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-gray-500">
              Showing {visibleTables.length} tables
            </p>
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live updates
            </span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-72 bg-white border border-gray-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : visibleTables.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-700 font-semibold">No tables found</p>
            <p className="text-sm text-gray-500 mt-1">
              Try changing filters or add a new table.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleTables.map((t) => (
              <TableCard
                key={t._id}
                table={t}
                onDelete={(table) => {
                  if (table.status === "OCCUPIED") {
                    toast.error("Cannot delete an occupied table");
                    return;
                  }
                  setDeleteTable(table);
                }}
              />
            ))}
          </div>
        )}

        {openCreate && (
          <CreateTableModal
            restaurantId={restaurantId}
            onClose={() => setOpenCreate(false)}
            onSuccess={(newTable) => {
              setTables((prev) => [newTable, ...prev]);
              setOpenCreate(false);
            }}
          />
        )}

        {deleteTable && (
          <DeleteTableModal
            restaurantId={restaurantId}
            table={deleteTable}
            onClose={() => setDeleteTable(null)}
            onDeleted={(id) => {
              setTables((prev) => prev.filter((t) => t._id !== id));
              setDeleteTable(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
