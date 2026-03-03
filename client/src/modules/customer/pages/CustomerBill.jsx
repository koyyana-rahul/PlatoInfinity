import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ReceiptText, Clock3 } from "lucide-react";

export default function CustomerBill() {
  const navigate = useNavigate();
  const { brandSlug, restaurantSlug, tableId } = useParams();
  const base = `/${brandSlug}/${restaurantSlug}/table/${tableId}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white pb-20">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center"
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">
              Bill Summary
            </h1>
            <p className="text-xs text-slate-500">
              View your running table total
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-3xl ring-1 ring-slate-100 shadow-[0_20px_45px_-35px_rgba(2,6,23,0.5)] p-6 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#F35C2B] mx-auto flex items-center justify-center mb-5">
            <ReceiptText size={30} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Detailed bill is preparing
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            We are fetching your latest paid and running amounts. Meanwhile, you
            can continue ordering.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Current status
              </p>
              <p className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-2">
                <Clock3 size={14} className="text-slate-500" />
                Syncing with cashier counters
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-[10px] uppercase tracking-wider text-emerald-500 font-bold">
                Tip
              </p>
              <p className="text-sm font-bold text-emerald-900 mt-1">
                Visit Orders to check live item delivery status.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`${base}/orders`)}
            className="mt-7 h-12 px-6 rounded-2xl bg-slate-900 text-white text-xs uppercase tracking-widest font-black"
          >
            Go to Orders
          </button>
        </div>
      </main>
    </div>
  );
}
