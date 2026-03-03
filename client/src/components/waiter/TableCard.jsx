export default function TableCard({ table, activeSession, onOpen, onViewPin }) {
  const isFree = table.status === "FREE" && !activeSession;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-base font-bold text-gray-900">
            {table.tableNumber}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Seats {table.seatingCapacity}
          </p>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${
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
            className="w-full h-10 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            View Customer PIN
          </button>
        ) : (
          <button
            onClick={onOpen}
            disabled={!isFree}
            className="w-full h-10 rounded-xl text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
          >
            Open Session
          </button>
        )}
      </div>
    </div>
  );
}
