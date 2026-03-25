export default function TableCard({ table, activeSession, onOpen, onViewPin }) {
  const isFree = table.status === "FREE" && !activeSession;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between gap-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-base font-bold text-slate-900">
            {table.tableNumber}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Seats {table.seatingCapacity}
          </p>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest border ${
            activeSession
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          {activeSession ? "OCCUPIED" : "FREE"}
        </span>
      </div>

      <div>
        {activeSession ? (
          <button
            onClick={() => onViewPin?.(activeSession)}
            className="w-full h-11 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            View Customer PIN
          </button>
        ) : (
          <button
            onClick={onOpen}
            disabled={!isFree}
            className="w-full h-11 rounded-2xl text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.99] transition-transform disabled:opacity-50"
          >
            Open Session
          </button>
        )}
      </div>
    </div>
  );
}
