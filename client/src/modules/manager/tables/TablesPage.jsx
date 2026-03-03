import { useEffect, useMemo, useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiRefreshCcw,
  FiGrid,
  FiCheckCircle,
  FiClock,
  FiUsers,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [deleteTable, setDeleteTable] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState(SORT.TABLE_LOW_HIGH);

  const loadTables = async (silent = false) => {
    if (!restaurantId) return;
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);

      const res = await Axios(tableApi.list(restaurantId));
      setTables(res.data?.data || []);
    } catch {
      toast.error("Unable to load tables");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, [restaurantId]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-orange-700 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-1 mb-3">
              <FiGrid size={12} /> Restaurant Operations
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              Table Management
            </h1>
            <p className="text-sm text-gray-600 max-w-xl">
              Manage table inventory, QR access, and dine-in status in one
              place.
            </p>
          </div>

          <button
            onClick={() => setOpenCreate(true)}
            className="h-11 px-4 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 inline-flex items-center justify-center gap-2"
          >
            <FiPlus size={18} /> Add Table
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Total Tables
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {summary.total}
            </p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-200">
            <p className="text-xs text-green-700 uppercase tracking-wide inline-flex items-center gap-1.5">
              <FiCheckCircle size={12} /> Available
            </p>
            <p className="text-2xl font-bold text-green-700 mt-2">
              {summary.free}
            </p>
          </div>
          <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
            <p className="text-xs text-orange-700 uppercase tracking-wide inline-flex items-center gap-1.5">
              <FiUsers size={12} /> Occupied
            </p>
            <p className="text-2xl font-bold text-orange-700 mt-2">
              {summary.occupied}
            </p>
          </div>
          <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
            <p className="text-xs text-amber-700 uppercase tracking-wide inline-flex items-center gap-1.5">
              <FiClock size={12} /> Reserved
            </p>
            <p className="text-2xl font-bold text-amber-700 mt-2">
              {summary.reserved}
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-6 relative">
              <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search table number..."
                className="w-full h-11 pl-10 pr-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400"
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
            <button
              onClick={() => loadTables(true)}
              className="h-8 px-3 rounded-lg border border-orange-200 bg-orange-50 text-xs text-orange-700 font-semibold flex items-center gap-1 hover:bg-orange-100"
            >
              <FiRefreshCcw className={isRefreshing ? "animate-spin" : ""} />{" "}
              Refresh
            </button>
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
