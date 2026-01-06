// src/modules/admin/managers/InviteManagerModal.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import { FiUserPlus, FiMail, FiUser } from "react-icons/fi";

import Axios from "../../../api/axios";
import managerApi from "../../../api/manager.api";

export default function InviteManagerModal({
  restaurantId,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);

  /* ---------- SUBMIT ---------- */
  const submit = async () => {
    if (!form.name.trim()) {
      toast.error("Manager name is required");
      return;
    }

    if (!form.email.trim()) {
      toast.error("Manager email is required");
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

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 sm:p-7 space-y-6">
        {/* ================= HEADER ================= */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <FiUserPlus size={18} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Invite Manager
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Give a trusted person access to manage this restaurant
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* ================= INFO BOX ================= */}
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-sm">
          <p className="font-medium text-emerald-900 mb-2">
            What happens next?
          </p>

          <ul className="space-y-1 text-emerald-800">
            <li>• Invitation email will be sent</li>
            <li>• Manager sets their password securely</li>
            <li>• Access activates after acceptance</li>
          </ul>
        </div>

        {/* ================= FORM ================= */}
        <div className="space-y-4">
          {/* NAME */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Manager Name <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <FiUser
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                className="w-full h-11 rounded-lg border border-gray-300 pl-9 pr-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Manager Email <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <FiMail
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                className="w-full h-11 rounded-lg border border-gray-300 pl-9 pr-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="manager@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <p className="text-xs text-gray-400">
              Invite link will be sent to this email address
            </p>
          </div>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Sending invite…" : "Send Invite"}
          </button>
        </div>
      </div>
    </div>
  );
}
