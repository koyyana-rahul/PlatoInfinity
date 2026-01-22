export default function TableCard({ table, activeSession, onOpen, onViewPin }) {
  const isFree = table.status === "FREE" && !activeSession;

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-4 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-bold text-gray-900">
            Table {table.tableNumber}
          </p>
          <p className="text-xs text-gray-500">Seats {table.seatingCapacity}</p>
        </div>

        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            activeSession
              ? "bg-amber-100 text-amber-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {activeSession ? "OCCUPIED" : "FREE"}
        </span>
      </div>

      <div className="mt-4">
        {activeSession ? (
          <button
            onClick={onViewPin}
            className="w-full py-2 rounded-xl border text-xs font-semibold hover:bg-gray-50"
          >
            View Customer PIN
          </button>
        ) : (
          <button
            onClick={onOpen}
            disabled={!isFree}
            className="w-full py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            Open Session
          </button>
        )}
      </div>
    </div>
  );
}
