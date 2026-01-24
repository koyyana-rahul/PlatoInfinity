/**
 * ResponsiveTable.jsx
 * Responsive table component that works on all screen sizes
 * Shows data as cards on mobile, table on desktop
 */

import clsx from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function ResponsiveTable({
  columns = [],
  data = [],
  onRowClick = null,
  loading = false,
}) {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No data available</div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, idx) => (
              <tr
                key={row.id || idx}
                onClick={() => onRowClick?.(row)}
                className={clsx(
                  "hover:bg-gray-50 transition-colors",
                  onRowClick && "cursor-pointer",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700"
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {data.map((row, idx) => (
          <div
            key={row.id || idx}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <div
              onClick={() => toggleRow(row.id || idx)}
              className={clsx(
                "p-3 sm:p-4 bg-gray-50 cursor-pointer flex items-center justify-between",
                onRowClick && "hover:bg-gray-100",
              )}
            >
              <div className="font-semibold text-sm sm:text-base text-gray-900">
                {columns[0]?.render
                  ? columns[0].render(row[columns[0].key], row)
                  : row[columns[0]?.key]}
              </div>
              {expandedRows.has(row.id || idx) ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </div>

            {expandedRows.has(row.id || idx) && (
              <div
                onClick={() => onRowClick?.(row)}
                className={clsx(
                  "p-3 sm:p-4 space-y-2",
                  onRowClick && "cursor-pointer hover:bg-gray-50",
                )}
              >
                {columns.slice(1).map((col) => (
                  <div
                    key={col.key}
                    className="flex justify-between text-xs sm:text-sm"
                  >
                    <span className="font-medium text-gray-600">
                      {col.label}
                    </span>
                    <span className="text-gray-900 font-semibold">
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
