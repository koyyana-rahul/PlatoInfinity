import { useState } from "react";
import toast from "react-hot-toast";
import {
  FiUserPlus,
  FiMail,
  FiUser,
  FiX,
  FiCheckCircle,
  FiSend,
  FiLoader,
} from "react-icons/fi";
import clsx from "clsx";

import Axios from "../../../api/axios";
import managerApi from "../../../api/manager.api";

export default function InviteManagerModal({
  restaurantId,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);
      await Axios({
        ...managerApi.inviteManager(restaurantId),
        data: {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
        },
      });
      toast.success("Invite sent successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to send invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* CENTERED MODAL CARD */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-200">
        {/* HEADER */}
        <div className="px-5 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FC8019] to-[#FF6B35] rounded-xl flex items-center justify-center shadow-md">
              <FiUserPlus size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Invite Manager
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Send invitation email
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* INFO BOX */}
          <div className="rounded-xl bg-green-50 border border-green-200 p-4 space-y-2">
            <p className="text-xs font-semibold text-green-700 flex items-center gap-2">
              <FiCheckCircle size={14} /> Invitation Process
            </p>
            <div className="space-y-1.5 text-xs text-green-800">
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-bold">1.</span>
                <span>Email dispatch to manager</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-bold">2.</span>
                <span>Secure account setup</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-bold">3.</span>
                <span>Live activation</span>
              </div>
            </div>
          </div>

          {/* FORM FIELDS */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 ml-1">
                Manager Name *
              </label>
              <div className="relative">
                <FiUser
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  autoFocus
                  className="w-full h-11 rounded-lg border border-gray-300 bg-white pl-10 pr-3.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#FC8019] focus:border-[#FC8019] outline-none transition-all placeholder:text-gray-400"
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 ml-1">
                Manager Email *
              </label>
              <div className="relative">
                <FiMail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="email"
                  className="w-full h-11 rounded-lg border border-gray-300 bg-white pl-10 pr-3.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#FC8019] focus:border-[#FC8019] outline-none transition-all placeholder:text-gray-400"
                  placeholder="manager@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-5 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className={clsx(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
              loading
                ? "bg-gray-300 text-gray-600"
                : "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] hover:shadow-lg text-white",
            )}
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" size={16} />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <FiSend size={16} />
                <span>Send Invite</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProtocolStep({ num, text }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-black text-emerald-600/40 tabular-nums">
        {num}
      </span>
      <p className="text-[11px] font-bold text-emerald-800/70 truncate">
        {text}
      </p>
    </div>
  );
}
