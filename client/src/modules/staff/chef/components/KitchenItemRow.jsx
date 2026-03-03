// src/modules/staff/chef/components/KitchenItemRow.jsx
import clsx from "clsx";
import { useState } from "react";
import Axios from "../../../../api/axios";
import chefApi from "../../../../api/chef.api";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const statusLabelMap = {
  NEW: "New",
  IN_PROGRESS: "In progress",
  READY: "Ready",
  SERVED: "Served",
};

export default function KitchenItemRow({
  item,
  orderId,
  onUpdated,
  onStatusUpdate,
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = async (status) => {
    try {
      setIsUpdating(true);
      await Axios({
        ...chefApi.updateItemStatus(orderId, item._id),
        data: { status },
      });
      toast.success(`Marked ${status}`);
      if (onStatusUpdate) {
        onStatusUpdate(orderId, item._id, status);
      }
      if (onUpdated) {
        onUpdated();
      }
    } catch {
      toast.error("Failed to update item");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white gap-3">
      <div>
        <p className="font-semibold text-gray-900">{item.name}</p>
        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
        <p className="text-[11px] text-gray-400 mt-1">
          Status: {statusLabelMap[item.itemStatus] || item.itemStatus}
        </p>
      </div>

      <div className="flex gap-2">
        {item.itemStatus === "NEW" && (
          <button
            onClick={() => updateStatus("IN_PROGRESS")}
            disabled={isUpdating}
            className="px-4 h-9 text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-lg font-semibold disabled:opacity-60 hover:shadow-sm transition inline-flex items-center gap-1.5"
          >
            {isUpdating && <Loader2 size={14} className="animate-spin" />}
            Start Cooking
          </button>
        )}

        {item.itemStatus === "IN_PROGRESS" && (
          <button
            onClick={() => updateStatus("READY")}
            disabled={isUpdating}
            className="px-4 h-9 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg font-semibold disabled:opacity-60 hover:shadow-sm transition inline-flex items-center gap-1.5"
          >
            {isUpdating && <Loader2 size={14} className="animate-spin" />}
            Mark Ready
          </button>
        )}

        {item.itemStatus === "READY" && (
          <button
            onClick={() => updateStatus("SERVED")}
            disabled={isUpdating}
            className="px-4 h-9 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-semibold disabled:opacity-60 hover:shadow-sm transition inline-flex items-center gap-1.5"
          >
            {isUpdating && <Loader2 size={14} className="animate-spin" />}
            Item Served
          </button>
        )}
      </div>
    </div>
  );
}
