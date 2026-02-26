import { useState } from "react";
import { FiX, FiAlertTriangle, FiTrash2, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import clsx from "clsx";

/**
 * Delete Restaurant Modal - Professional confirmation dialog
 */
export default function DeleteRestaurantModal({
  restaurant,
  onClose,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const toastId = toast.loading("Deleting restaurant...");
    setLoading(true);

    try {
      await Axios.delete(`/api/restaurants/${restaurant._id}`);
      toast.success("Restaurant deleted successfully", { id: toastId });
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to delete restaurant",
        { id: toastId },
      );
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      {/* MODAL */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        {/* HEADER */}
        <div className="px-5 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-start gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <FiAlertTriangle size={20} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Delete Restaurant
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all disabled:opacity-50"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Restaurant Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🏪</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {restaurant.name}
                </p>
                {restaurant.addressText && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {restaurant.addressText}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex gap-3">
              <FiAlertTriangle
                className="text-red-600 shrink-0 mt-0.5"
                size={18}
              />
              <div>
                <p className="text-sm font-semibold text-red-900 mb-1">
                  Warning
                </p>
                <p className="text-xs text-red-700 leading-relaxed">
                  Deleting this restaurant will permanently remove all
                  associated data, including managers, menu items, and order
                  history. This action cannot be reversed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-5 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className={clsx(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
              loading
                ? "bg-gray-300 text-gray-600"
                : "bg-red-600 hover:bg-red-700 hover:shadow-lg text-white",
            )}
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" size={16} />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <FiTrash2 size={16} />
                <span>Delete Restaurant</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
