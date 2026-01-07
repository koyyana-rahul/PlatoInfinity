import toast from "react-hot-toast";
import { FiPower } from "react-icons/fi";
import Axios from "../../../api/axios";
import kitchenStationApi from "../../../api/kitchenStation.api";

export default function KitchenStationList({ stations, onUpdate }) {
  if (!stations.length) {
    return (
      <div className="bg-white border rounded-xl p-10 text-center text-gray-600">
        No kitchen stations created yet
      </div>
    );
  }

  const toggleStation = async (station) => {
    try {
      if (station.isArchived) {
        await Axios(kitchenStationApi.enable(station._id));
        toast.success("Station enabled");
        onUpdate(station._id, { isArchived: false });
      } else {
        await Axios(kitchenStationApi.disable(station._id));
        toast.success("Station disabled");
        onUpdate(station._id, { isArchived: true });
      }
    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <div className="bg-white border rounded-xl divide-y">
      {stations.map((s) => (
        <div
          key={s._id}
          className={`p-4 flex justify-between items-center ${
            s.isArchived && "bg-gray-50 opacity-70"
          }`}
        >
          <div>
            <p className="font-semibold text-gray-900">{s.name}</p>
            <p className="text-xs text-gray-600">
              {s.isArchived ? "Disabled" : "Active"}
            </p>
          </div>

          <button
            onClick={() => toggleStation(s)}
            className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border ${
              s.isArchived
                ? "border-emerald-300 text-emerald-700"
                : "border-red-300 text-red-700"
            }`}
          >
            <FiPower />
            {s.isArchived ? "Enable" : "Disable"}
          </button>
        </div>
      ))}
    </div>
  );
}
