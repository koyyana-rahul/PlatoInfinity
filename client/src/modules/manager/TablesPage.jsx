/**
 * Tables Management Page - Swiggy/Zomato Style
 */
import React, { useState, useEffect } from "react";
import { Plus, Search, Grid3x3, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Axios from "../../api/axios";

const TablesPage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTable, setNewTable] = useState({ name: "", capacity: 2 });

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      // Mock data for demo
      setTables([
        { _id: "1", name: "Table 1", capacity: 2, status: "available" },
        { _id: "2", name: "Table 2", capacity: 4, status: "occupied" },
        { _id: "3", name: "Table 3", capacity: 6, status: "available" },
        { _id: "4", name: "Table 4", capacity: 2, status: "available" },
      ]);
    } catch (error) {
      toast.error("Failed to load tables");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTable = async () => {
    if (!newTable.name.trim()) {
      toast.error("Table name is required");
      return;
    }
    if (newTable.capacity < 1) {
      toast.error("Capacity must be at least 1");
      return;
    }

    try {
      setTables([
        ...tables,
        {
          _id: Date.now().toString(),
          ...newTable,
          status: "available",
        },
      ]);
      setNewTable({ name: "", capacity: 2 });
      setShowCreateModal(false);
      toast.success("Table created successfully");
    } catch (error) {
      toast.error("Failed to create table");
    }
  };

  const deleteTable = (id) => {
    setTables(tables.filter((t) => t._id !== id));
    toast.success("Table deleted");
  };

  const filteredTables = tables.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusColor = (status) => {
    return status === "available"
      ? "bg-green-50 border-green-200"
      : "bg-orange-50 border-orange-200";
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Table Management
            </h1>
            <p className="text-gray-600 text-sm">
              Manage your restaurant seating
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
          >
            <Plus size={18} />
            Add Table
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search tables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* Tables Grid */}
        {!loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTables.length > 0 ? (
              filteredTables.map((table) => (
                <div
                  key={table._id}
                  className={`p-6 rounded-lg border ${getStatusColor(table.status)}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {table.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Capacity: {table.capacity}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        table.status === "available"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {table.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-900 rounded text-sm font-medium hover:bg-gray-200">
                      <Edit size={14} className="inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTable(table._id)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded text-sm font-medium hover:bg-red-200"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Grid3x3 className="mx-auto text-gray-400 mb-4" size={40} />
                <p className="text-gray-600">No tables found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-40 bg-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-sm w-full p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Table</h2>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Table Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Table 1"
                  value={newTable.name}
                  onChange={(e) =>
                    setNewTable({ ...newTable, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newTable.capacity}
                  onChange={(e) =>
                    setNewTable({
                      ...newTable,
                      capacity: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTable}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TablesPage;
