import Modal from "../ui/Modal";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";

export default function SessionInfoModal({ info, onClose }) {
  if (!info) return null;

  const copyPin = async () => {
    try {
      await navigator.clipboard.writeText(String(info.tablePin || ""));
      toast.success("PIN copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <Modal title="Customer PIN" onClose={onClose}>
      <div className="text-center space-y-4">
        <div className="text-5xl font-extrabold tracking-[0.25em] text-orange-600">
          {info.tablePin}
        </div>

        <p className="text-sm text-gray-600">
          Ask customer to enter this PIN on their phone.
        </p>

        <button
          onClick={copyPin}
          className="mx-auto h-10 px-4 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2"
        >
          <Copy size={14} /> Copy PIN
        </button>
      </div>
    </Modal>
  );
}
