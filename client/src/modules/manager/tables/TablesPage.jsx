import { useEffect, useMemo, useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiLayers,
  FiCheckCircle,
  FiActivity,
  FiRefreshCcw,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import clsx from "clsx";

import Axios from "../../../api/axios";
import tableApi from "../../../api/table.api";

import CreateTableModal from "./CreateTableModal";
import DeleteTableModal from "./DeleteTableModal";
import TableCard from "./TableCard";
import Dropdown from "../../../components/ui/DropDown";

/* ================= SORT KEYS ================= */
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

  /* ================= FILTER STATE ================= */
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
      toast.error("Network Latency: Cloud sync interrupted");
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

    // 1. Search Logic
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((t) => t.tableNumber.toLowerCase().includes(q));
    }

    // 2. Status Logic
    if (status !== "ALL") {
      data = data.filter((t) => t.status === status);
    }

    // 3. Sorting Logic (Human-friendly numeric sort)
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
    }),
    [tables],
  );

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-20">
      <div className="space-y-6 sm:space-y-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                <FiLayers size={12} /> Seating Map
              </div>
              {isRefreshing && (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                  <FiRefreshCcw className="animate-spin" /> Syncing
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Floor Assets
            </h1>
            <p className="hidden sm:block text-sm font-medium text-slate-500 max-w-md leading-relaxed">
              Global overview of restaurant seating units and secure access
              tokens.
            </p>
          </div>

          <button
            onClick={() => setOpenCreate(true)}
            className="flex items-center justify-center gap-2.5 bg-slate-900 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-[20px] text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-emerald-600 active:scale-95 transition-all duration-300"
          >
            <FiPlus size={16} strokeWidth={3} /> Add Table
          </button>
        </div>

        {/* ================= SUMMARY STATS ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
          <Stat
            icon={FiLayers}
            label="Inventory"
            value={summary.total}
            color="slate"
          />
          <Stat
            icon={FiCheckCircle}
            label="Available"
            value={summary.free}
            color="emerald"
          />
          <Stat
            icon={FiActivity}
            label="In Use"
            value={summary.occupied}
            color="red"
            className="col-span-2 sm:col-span-1"
          />
        </div>

        {/* ================= FILTER COMMAND BAR ================= */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3 bg-white p-2 sm:p-3 rounded-[24px] border border-slate-100 shadow-sm">
            <div className="lg:col-span-6 relative group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search identifier (e.g. VIP-1, Table 4)..."
                className="w-full h-11 sm:h-12 pl-12 pr-4 bg-slate-50/50 border border-transparent rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all"
              />
            </div>

            <div className="lg:col-span-3">
              <Dropdown
                value={status}
                onChange={setStatus}
                options={[
                  { value: "ALL", label: "Filter: All Status" },
                  { value: "FREE", label: "Status: Available" },
                  { value: "OCCUPIED", label: "Status: Occupied" },
                  { value: "RESERVED", label: "Status: Reserved" },
                ]}
              />
            </div>

            <div className="lg:col-span-3">
              <Dropdown
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: SORT.TABLE_LOW_HIGH, label: "Sort: Low to High" },
                  { value: SORT.TABLE_HIGH_LOW, label: "Sort: High to Low" },
                  { value: SORT.SEATS, label: "Sort: Max Capacity" },
                  { value: SORT.STATUS, label: "Sort: Availability" },
                ]}
              />
            </div>
          </div>

          <div className="flex justify-between items-center px-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
              Viewing {visibleTables.length} results
            </p>
            <button
              onClick={() => loadTables(true)}
              className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline flex items-center gap-1.5"
            >
              <FiRefreshCcw className={clsx(isRefreshing && "animate-spin")} />{" "}
              Sync Inventory
            </button>
          </div>
        </div>

        {/* ================= CONTENT GRID ================= */}
        {loading ? (
          <Skeleton />
        ) : visibleTables.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {visibleTables.map((t) => (
              <TableCard
                key={t._id}
                table={t}
                onDeleted={(id) =>
                  setTables((p) => p.filter((x) => x._id !== id))
                }
                onDeleteRequest={(table) => {
                  if (table.status === "OCCUPIED") {
                    toast.error(
                      "Operation Denied: Table session is currently active",
                    );
                    return;
                  }
                  setDeleteTable(table);
                }}
              />
            ))}
          </div>
        )}

        {/* ================= MODALS ================= */}
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

/* ================= UI COMPONENTS ================= */

function Stat({ label, value, color, icon: Icon, className }) {
  const colors = {
    slate: "bg-slate-50 text-slate-600 border-slate-100",
    emerald:
      "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-500/[0.03]",
    red: "bg-red-50 text-red-600 border-red-100 shadow-red-500/[0.03]",
  };

  return (
    <div
      className={clsx(
        "flex items-center justify-between p-4 sm:p-6 bg-white border border-slate-100 rounded-2xl sm:rounded-[28px] transition-all hover:shadow-lg group",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">
          {label}
        </p>
        <p
          className={clsx(
            "text-2xl sm:text-3xl font-black tracking-tight tabular-nums",
            colors[color].split(" ")[1],
          )}
        >
          {value}
        </p>
      </div>
      <div
        className={clsx(
          "p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all group-hover:scale-110 shrink-0",
          colors[color],
        )}
      >
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border border-slate-100 rounded-[32px] sm:rounded-[40px] p-12 sm:p-20 text-center shadow-sm">
      <div className="w-20 h-20 sm:w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner animate-bounce">
        🪑
      </div>
      <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
        No Seating Units Found
      </h3>
      <p className="text-xs sm:text-sm font-medium text-slate-400 mt-3 max-w-xs mx-auto leading-relaxed">
        We couldn't find any tables matching your search parameters. Try
        clearing your filters or adding a new unit.
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-64 sm:h-80 bg-white border border-slate-50 rounded-[28px] sm:rounded-[32px] animate-pulse"
        />
      ))}
    </div>
  );
}
