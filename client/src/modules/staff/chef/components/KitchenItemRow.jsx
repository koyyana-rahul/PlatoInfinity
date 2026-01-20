// src/modules/staff/chef/components/KitchenItemRow.jsx
import clsx from "clsx";
import Axios from "../../../../api/axios";
import chefApi from "../../../../api/chef.api";
import toast from "react-hot-toast";

export default function KitchenItemRow({ item, orderId, onUpdated }) {
  const updateStatus = async (status) => {
    try {
      await Axios({
        ...chefApi.updateItemStatus(orderId, item._id),
        data: { status },
      });
      toast.success(`Marked ${status}`);
      onUpdated();
    } catch {
      toast.error("Failed to update item");
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
      <div>
        <p className="font-medium">{item.name}</p>
        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
      </div>

      <div className="flex gap-2">
        {item.itemStatus === "NEW" && (
          <button
            onClick={() => updateStatus("IN_PROGRESS")}
            className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded"
          >
            Start
          </button>
        )}

        {item.itemStatus === "IN_PROGRESS" && (
          <button
            onClick={() => updateStatus("READY")}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded"
          >
            Ready
          </button>
        )}

        {item.itemStatus === "READY" && (
          <button
            onClick={() => updateStatus("SERVED")}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded"
          >
            Served
          </button>
        )}
      </div>
    </div>
  );
}
