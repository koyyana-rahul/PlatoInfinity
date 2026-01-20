// src/components/headers/CustomerHeader.jsx
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

export default function CustomerHeader() {
  const { tableId } = useParams();
  const brand = useSelector((s) => s.brand);

  /* ---------- SKELETON ---------- */
  if (!brand._id) {
    return (
      <header className="h-16 bg-white border-b flex items-center px-4 animate-pulse">
        <div className="h-9 w-44 bg-gray-200 rounded-full" />
      </header>
    );
  }

  return (
    <header className="h-16 bg-white border-b flex items-center gap-3 px-4">
      {/* LOGO */}
      {brand.logoUrl ? (
        <div className="h-10 w-10 rounded-full ring-1 ring-gray-200 bg-white overflow-hidden flex-shrink-0">
          <img
            src={brand.logoUrl}
            alt={brand.name}
            className="h-full w-full object-contain"
          />
        </div>
      ) : (
        <div className="h-10 w-10 rounded-full bg-[#FC8019] text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
          {brand.name.charAt(0).toUpperCase()}
        </div>
      )}

      {/* NAME + TABLE */}
      <div className="flex flex-col min-w-0 leading-tight">
        <span className="text-sm sm:text-base font-extrabold text-[#1A1C1E] truncate">
          {brand.name}
        </span>

        {/* <span className="text-[10px] text-gray-400 uppercase tracking-widest">
          Table {tableId?.slice(-4)}
        </span> */}
      </div>
    </header>
  );
}
