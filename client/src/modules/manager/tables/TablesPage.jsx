import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";

import Axios from "../../../api/axios";
import tableApi from "../../../api/table.api";

import CreateTableModal from "./CreateTableModal";
import TableCard from "./TableCard";

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);

  /* ================= LOAD TABLES ================= */
  const loadTables = async () => {
    try {
      setLoading(true);
      const res = await Axios(tableApi.list());
      setTables(res.data?.data || []);
    } catch {
      toast.error("Unable to load tables");
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOAD ON EVERY PAGE REFRESH
  useEffect(() => {
    loadTables();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Restaurant Tables
          </h1>
          <p className="text-sm text-gray-700 mt-1">
            Manage table QR codes & seating
          </p>
        </div>

        <button
          onClick={() => setOpenCreate(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm shadow-sm"
        >
          <FiPlus /> Add Table
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <Skeleton />
      ) : tables.length === 0 ? (
        <EmptyState onAdd={() => setOpenCreate(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((t) => (
            <TableCard key={t._id} table={t} />
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {openCreate && (
        <CreateTableModal
          onClose={() => setOpenCreate(false)}
          onSuccess={(newTable) => {
            // ⚡ INSTANT UPDATE (NO RELOAD)
            setTables((prev) => [newTable, ...prev]);
          }}
        />
      )}
    </div>
  );
}

/* ================= UI HELPERS ================= */

function Skeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="bg-white border rounded-xl p-12 text-center">
      <div className="text-5xl mb-3">🪑</div>
      <h3 className="font-semibold text-lg text-gray-900">No tables added</h3>
      <p className="text-sm text-gray-700 mt-2">
        Create tables to generate QR codes
      </p>
      <button
        onClick={onAdd}
        className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm"
      >
        Add Table
      </button>
    </div>
  );
}
