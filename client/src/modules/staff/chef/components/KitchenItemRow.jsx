// src/modules/staff/chef/components/KitchenItemRow.jsx
import clsx from "clsx";
import { useState } from "react";
import Axios from "../../../../api/axios";
import chefApi from "../../../../api/chef.api";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import ChefStatusConfirmationModal from "./ChefStatusConfirmationModal";

const statusLabelMap = {
  NEW: "New",
  IN_PROGRESS: "Preparing",
  READY: "Ready",
  SERVED: "Served",
};

export default function KitchenItemRow({
  item,
  orderId,
  onUpdated,
  onStatusUpdate,
  tableName = "Unknown",
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  const openConfirmation = (status) => {
    setPendingStatus(status);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setPendingStatus(null);
  };

  const updateStatus = async (nextStatus) => {
    const statusToSend = nextStatus || pendingStatus;
    if (!statusToSend) {
      toast.error("Unable to update: invalid item status");
      return;
    }

    try {
      setIsUpdating(true);
      await Axios({
        ...chefApi.updateItemStatus(orderId, item._id),
        data: { status: statusToSend },
      });

      const statusMessages = {
        IN_PROGRESS: "🍳 Started cooking!",
        READY: "✅ Marked as Ready! Waiter notified.",
        SERVED: "🍽️ Marked as Served!",
      };

      toast.success(
        statusMessages[statusToSend] || `Updated to ${statusToSend}`,
      );

      if (onStatusUpdate) {
        onStatusUpdate(orderId, item._id, statusToSend);
      }
      if (onUpdated) {
        onUpdated();
      }

      closeModal();
    } catch (err) {
      console.error("Status update error:", err);
      toast.error(err.response?.data?.message || "Failed to update item");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border border-gray-200 rounded-xl bg-white gap-3">
        <div>
          <p className="font-semibold text-gray-900">{item.name}</p>
          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
          <p className="text-[11px] text-gray-400 mt-1">
            Status:{" "}
            <span
              className={clsx("font-medium", {
                "text-yellow-600": item.itemStatus === "NEW",
                "text-orange-600": item.itemStatus === "IN_PROGRESS",
                "text-green-600": item.itemStatus === "READY",
                "text-blue-600": item.itemStatus === "SERVED",
              })}
            >
              {statusLabelMap[item.itemStatus] || item.itemStatus}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
          {item.itemStatus === "NEW" && (
            <button
              onClick={() => openConfirmation("IN_PROGRESS")}
              disabled={isUpdating}
              className="w-full sm:w-auto px-4 h-9 text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-lg font-semibold disabled:opacity-60 hover:shadow-sm transition inline-flex items-center justify-center gap-1.5"
            >
              {isUpdating && <Loader2 size={14} className="animate-spin" />}
              Start Cooking
            </button>
          )}

          {item.itemStatus === "IN_PROGRESS" && (
            <button
              onClick={() => openConfirmation("READY")}
              disabled={isUpdating}
              className="w-full sm:w-auto px-4 h-9 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg font-semibold disabled:opacity-60 hover:shadow-sm transition inline-flex items-center justify-center gap-1.5"
            >
              {isUpdating && <Loader2 size={14} className="animate-spin" />}
              Mark Ready
            </button>
          )}

          {item.itemStatus === "READY" && (
            <div className="w-full sm:w-auto px-4 h-9 text-xs bg-green-100 text-green-800 border border-green-300 rounded-lg font-semibold inline-flex items-center justify-center gap-1.5">
              ✓ Ready to Serve
            </div>
          )}
        </div>
      </div>

      <ChefStatusConfirmationModal
        isOpen={showModal}
        status={pendingStatus}
        itemName={item.name}
        tableName={tableName}
        onClose={closeModal}
        onConfirm={updateStatus}
        isLoading={isUpdating}
      />
    </>
  );
}
