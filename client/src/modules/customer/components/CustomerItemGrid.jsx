export default function CustomerItemGrid({ title, items, onAdd }) {
  if (!items.length) {
    return (
      <div className="bg-white border rounded-xl p-6 text-gray-500">
        No items available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-700">{title}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) => (
          <div key={it.id} className="bg-white border rounded-xl p-4">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-semibold text-sm">{it.name}</p>
                {it.description && (
                  <p className="text-xs text-gray-500 mt-1">{it.description}</p>
                )}
              </div>

              <span
                className={`text-[10px] px-2 py-1 rounded-full ${
                  it.isVeg
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {it.isVeg ? "VEG" : "NON-VEG"}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="font-semibold text-sm">₹{it.price}</span>
              <button
                onClick={() => onAdd(it.id)}
                disabled={!it.available}
                className="px-3 py-1.5 text-xs bg-black text-white rounded-lg disabled:opacity-50"
              >
                {it.available ? "Add" : "Unavailable"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
