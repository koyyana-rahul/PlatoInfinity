import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

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

  const [openCreate, setOpenCreate] = useState(false);
  const [deleteTable, setDeleteTable] = useState(null);

  /* ================= FILTER STATE ================= */
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState(SORT.TABLE_LOW_HIGH);

  /* ================= LOAD TABLES ================= */
  const loadTables = async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const res = await Axios(tableApi.list(restaurantId));
      setTables(res.data?.data || []);
    } catch {
      toast.error("Unable to load tables");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, [restaurantId]);

  /* ================= FILTER + SORT ================= */
  const visibleTables = useMemo(() => {
    let data = [...tables];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((t) => t.tableNumber.toLowerCase().includes(q));
    }

    if (status !== "ALL") {
      data = data.filter((t) => t.status === status);
    }

    switch (sortBy) {
      case SORT.TABLE_HIGH_LOW:
        data.sort((a, b) => b.tableNumber.localeCompare(a.tableNumber));
        break;
      case SORT.SEATS:
        data.sort((a, b) => b.seatingCapacity - a.seatingCapacity);
        break;
      case SORT.STATUS:
        data.sort((a, b) => a.status.localeCompare(b.status));
        break;
      default:
        data.sort((a, b) => a.tableNumber.localeCompare(b.tableNumber));
    }

    return data;
  }, [tables, search, status, sortBy]);

  /* ================= SUMMARY ================= */
  const summary = useMemo(
    () => ({
      total: tables.length,
      free: tables.filter((t) => t.status === "FREE").length,
      occupied: tables.filter((t) => t.status === "OCCUPIED").length,
    }),
    [tables]
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Table Management
          </h1>
          <p className="text-sm text-gray-600">
            Manage seating, QR codes & availability
          </p>
        </div>

        <button
          onClick={() => setOpenCreate(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          <FiPlus /> Add Table
        </button>
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Total Tables" value={summary.total} color="gray" />
        <Stat label="Available" value={summary.free} color="green" />
        <Stat label="In Use" value={summary.occupied} color="red" />
      </div>

      {/* ================= CONTROLS (MOBILE SAFE) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* SEARCH */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          {/* <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search table (T1, VIP-2)"
            className="
              w-full h-11 pl-10 pr-3
              border rounded-lg text-sm
              focus:ring-2 focus:ring-emerald-500
            "
          /> */}

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search table (T1, VIP-2)"
            className="
    w-full h-11 pl-10 pr-3
    border border-gray-300 rounded-lg text-sm
    focus:outline-none
    focus:border-emerald-500
    focus:ring-1 focus:ring-emerald-500
    appearance-none
  "
          />
        </div>

        {/* STATUS */}
        <Dropdown
          value={status}
          onChange={setStatus}
          placeholder="Filter by status"
          options={[
            { value: "ALL", label: "All Tables" },
            { value: "FREE", label: "Available" },
            { value: "OCCUPIED", label: "In Use" },
            { value: "RESERVED", label: "Reserved" },
          ]}
        />

        {/* SORT */}
        <Dropdown
          value={sortBy}
          onChange={setSortBy}
          placeholder="Sort tables"
          options={[
            { value: SORT.TABLE_LOW_HIGH, label: "Table No (Low → High)" },
            { value: SORT.TABLE_HIGH_LOW, label: "Table No (High → Low)" },
            { value: SORT.SEATS, label: "Seating Capacity" },
            { value: SORT.STATUS, label: "Table Status" },
          ]}
        />
      </div>

      {/* ================= TABLES ================= */}
      {loading ? (
        <Skeleton />
      ) : visibleTables.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleTables.map((t) => (
            <TableCard
              key={t._id}
              table={t}
              onDelete={(table) => {
                if (table.status === "OCCUPIED") {
                  toast.error("Cannot delete table in use");
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
          onSuccess={(newTable) => setTables((prev) => [newTable, ...prev])}
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
  );
}

/* ================= SMALL UI ================= */

function Stat({ label, value, color }) {
  const map = {
    gray: "bg-gray-50 text-gray-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className={`rounded-lg p-4 text-center ${map[color]}`}>
      <p className="text-xs">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border rounded-xl p-12 text-center">
      <div className="text-5xl mb-3">🪑</div>
      <h3 className="font-semibold text-lg">No tables found</h3>
      <p className="text-sm text-gray-600 mt-1">
        Adjust filters or add a new table
      </p>
    </div>
  );
}
