import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { X, ChevronDown, Search, Check } from "lucide-react";

import Axios from "../../../../api/axios";
import branchMenuApi from "../../../../api/branchMenu.api";
import kitchenStationApi from "../../../../api/kitchenStation.api";

export default function EditBranchItemModal({ item, onClose, onSuccess }) {
  const restaurantId = useSelector((s) => s.user.restaurantId);

  // Extract station ID from the item
  const initialStationId =
    typeof item?.kitchenStationId === "string"
      ? item.kitchenStationId
      : item?.kitchenStationId?._id || "";

  const [form, setForm] = useState({
    name: item?.name || "",
    price: item?.price ?? 0,
    kitchenStationId: initialStationId,
    status: item?.status || "ON",
  });
  const [stations, setStations] = useState([]);
  const [stationLoading, setStationLoading] = useState(true);
  const [stationOpen, setStationOpen] = useState(false);
  const [stationQuery, setStationQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredStations = stations.filter((s) =>
    String(s?.displayName || s?.name || "")
      .toLowerCase()
      .includes(stationQuery.toLowerCase()),
  );

  useEffect(() => {
    const loadStations = async () => {
      if (!restaurantId) return;
      try {
        setStationLoading(true);
        const res = await Axios(kitchenStationApi.list(restaurantId));
        setStations(res.data?.data || []);
      } catch {
        toast.error("Failed to load kitchen stations");
      } finally {
        setStationLoading(false);
      }
    };
    loadStations();
  }, [restaurantId]);

  const submit = async () => {
    if (!form.name.trim()) return toast.error("Item name is required");
    if (Number(form.price) < 0) return toast.error("Price cannot be negative");

    try {
      setLoading(true);
      await Axios({
        ...branchMenuApi.updateItem(restaurantId, item._id),
        data: {
          name: form.name.trim(),
          price: Number(form.price),
          kitchenStationId: form.kitchenStationId || null,
          status: form.status,
        },
      });
      toast.success("Item updated successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-2 rounded-md text-gray-500 hover:bg-gray-100"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-7 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Edit Menu Item</h3>
            <p className="text-sm text-gray-600 mt-1">
              Update name, price, kitchen station assignment and status.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Item Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Price
            </label>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) =>
                setForm((p) => ({ ...p, price: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Kitchen Station
            </label>
            <div className="relative">
              <button
                type="button"
                disabled={stationLoading}
                onClick={() => setStationOpen((prev) => !prev)}
                className="w-full h-11 px-3 rounded-xl border border-gray-300 bg-white text-sm text-left flex items-center justify-between hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:opacity-60"
              >
                <span className="truncate text-gray-800">
                  {stationLoading
                    ? "Loading stations..."
                    : form.kitchenStationId
                      ? stations.find((s) => s._id === form.kitchenStationId)
                          ?.displayName ||
                        stations.find((s) => s._id === form.kitchenStationId)
                          ?.name ||
                        "Select Station"
                      : "No Station Assigned"}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gray-500 transition-transform ${stationOpen ? "rotate-180" : ""}`}
                />
              </button>

              {stationOpen && !stationLoading && (
                <div className="absolute z-40 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
                  <div className="p-2 border-b border-gray-100">
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-2.5 h-9">
                      <Search size={14} className="text-gray-400" />
                      <input
                        value={stationQuery}
                        onChange={(e) => setStationQuery(e.target.value)}
                        placeholder="Search station"
                        className="w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="max-h-52 overflow-y-auto py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setForm((p) => ({ ...p, kitchenStationId: "" }));
                        setStationOpen(false);
                      }}
                      className="w-full px-3 py-2.5 text-left text-sm hover:bg-orange-50 flex items-center justify-between"
                    >
                      <span className="truncate text-gray-700">No Station</span>
                      {!form.kitchenStationId && (
                        <Check size={14} className="text-orange-500" />
                      )}
                    </button>

                    {filteredStations.length ? (
                      filteredStations.map((s) => {
                        const selected = form.kitchenStationId === s._id;
                        const stationLabel = s.displayName || s.name;
                        return (
                          <button
                            key={s._id}
                            type="button"
                            onClick={() => {
                              setForm((p) => ({
                                ...p,
                                kitchenStationId: s._id,
                              }));
                              setStationOpen(false);
                            }}
                            className="w-full px-3 py-2.5 text-left text-sm hover:bg-orange-50 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2 truncate">
                              {s.badge && <span>{s.badge}</span>}
                              <span className="truncate text-gray-800">
                                {stationLabel}
                              </span>
                            </div>
                            {selected && (
                              <Check size={14} className="text-orange-500" />
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-3 py-3 text-sm text-gray-500">
                        No stations found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({ ...p, status: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="ON">ON</option>
              <option value="OFF">OFF</option>
            </select>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-10 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={loading}
              className="flex-1 h-10 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
