/**
 * Tables Management Page - 2026 Savory Modern
 * Manage restaurant seating, QR codes, and table configurations
 */
import React, { useState } from "react";
import { Plus, Search, Grid3x3 } from "lucide-react";

const TablesPage = () => {
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  if (loading && tables.length === 0) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <p className="text-text-secondary">Loading Tables...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Grid3x3 className="text-brand-cta" size={32} />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
                Table Management
              </h1>
              <p className="text-text-secondary">
                Manage your restaurant seating
              </p>
            </div>
          </div>
          <button className="btn-primary px-4 md:px-6 py-3 rounded-lg flex items-center gap-2 font-semibold">
            <Plus size={20} />
            <span className="hidden md:inline">Add Table</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search
            className="absolute left-4 top-3 text-text-secondary"
            size={20}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tables..."
            className="input-field w-full pl-12 py-3 text-base"
          />
        </div>

        {/* Tables Grid */}
        <div className="card p-6 md:p-8">
          <div className="text-center py-12">
            <Grid3x3 className="mx-auto text-text-secondary mb-4" size={40} />
            <p className="text-lg text-text-secondary">
              No tables configured yet
            </p>
            <p className="text-sm text-text-light mt-2">
              Click "Add Table" to set up your seating arrangement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablesPage;
