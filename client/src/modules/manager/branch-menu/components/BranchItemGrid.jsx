import BranchItemCard from "./BranchItemCard";
import { PackageOpen, Sparkles } from "lucide-react";

export default function BranchItemGrid({
  items = [],
  loading,
  refresh,
  isAllSection,
}) {
  /* ---------------- PREMIUM SKELETON LOADING ---------------- */
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-square bg-slate-100 rounded-[28px] relative overflow-hidden">
              {/* Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shimmer_1.5s_infinite]" />
            </div>
            <div className="space-y-2 px-2">
              <div className="h-4 w-2/3 bg-slate-100 rounded-lg" />
              <div className="h-3 w-1/2 bg-slate-50 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ---------------- PREMIUM EMPTY STATE ---------------- */
  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white border border-dashed border-slate-200 rounded-[40px] animate-in fade-in zoom-in-95 duration-700">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full" />
          <div className="relative w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center shadow-sm">
            <PackageOpen size={40} strokeWidth={1.5} />
          </div>
          <div className="absolute -top-2 -right-2 bg-white p-1.5 rounded-full shadow-md text-emerald-500">
            <Sparkles size={16} />
          </div>
        </div>

        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          No items found
        </h3>
        <p className="mt-2 text-sm font-medium text-slate-400 max-w-[280px] mx-auto leading-relaxed">
          It looks like this section is empty. Sync or import items from your{" "}
          <span className="text-emerald-600 font-bold">Master Menu</span> to
          begin.
        </p>

        <button
          onClick={refresh}
          className="mt-8 px-8 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
        >
          Check for Items
        </button>
      </div>
    );
  }

  /* ---------------- REFINED GRID LAYOUT ---------------- */
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 sm:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {items.map((item) => (
        <BranchItemCard key={item._id} item={item} refresh={refresh} />
      ))}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `,
        }}
      />
    </div>
  );
}
