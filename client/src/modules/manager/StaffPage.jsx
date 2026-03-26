/**
 * Staff Management Page - 2026 Savory Modern
 * Manage team members, roles, and shift assignments
 */
import React, { useState } from "react";
import { Plus, Search, Users } from "lucide-react";

const StaffPage = () => {
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  if (loading && staff.length === 0) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <p className="text-text-secondary">Loading Staff...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="max-w-7xl mx-auto px-2.5 md:px-6 py-3 md:py-8 space-y-3 md:space-y-6 transition-all">
        {/* Header */}
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-4">
          <div className="flex items-center gap-2 xs:gap-3">
            <Users className="text-brand-cta" size={22} />
            <div>
              <h1 className="text-lg xs:text-2xl md:text-4xl font-bold text-text-primary leading-tight">
                Staff Management
              </h1>
              <p className="text-xs xs:text-sm text-text-secondary">
                Manage your team members and their roles
              </p>
            </div>
          </div>
          <button className="btn-primary px-3 md:px-6 py-2 xs:py-2.5 md:py-3 rounded-lg flex items-center gap-1.5 font-semibold text-xs xs:text-sm md:text-base transition-all">
            <Plus size={16} />
            <span className="hidden xs:inline">Add Staff</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search
            className="absolute left-3 top-2.5 text-text-secondary"
            size={16}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by name, role..."
            className="input-field w-full pl-10 py-2 xs:py-2.5 text-xs xs:text-sm md:text-base"
          />
        </div>

        {/* Staff List */}
        <div className="card p-3 xs:p-4 md:p-8 transition-all">
          <div className="text-center py-8 xs:py-10 md:py-12">
            <Users
              className="mx-auto text-text-secondary mb-3 xs:mb-4"
              size={28}
            />
            <p className="text-base xs:text-lg text-text-secondary">
              No staff members yet
            </p>
            <p className="text-xs xs:text-sm text-text-light mt-1 xs:mt-2">
              Click "Add Staff" to invite your first team member
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPage;
