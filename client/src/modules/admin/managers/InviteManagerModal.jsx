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
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-4">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* CENTERED MODAL CARD */}
      <div className="relative bg-white w-full max-w-md rounded-[32px] sm:rounded-[40px] shadow-[0_40px_100px_-20px_rgba(15,23,42,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[92vh] border border-slate-100">
        {/* HEADER - Tightened for Mobile */}
        <div className="px-5 py-4 sm:px-8 sm:py-6 border-b border-slate-50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shrink-0">
              <FiUserPlus size={18} className="sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight uppercase leading-none">
                Invite
              </h2>
              <p className="text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-[0.15em] mt-1">
                Authorization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-300 hover:text-slate-900 transition-all active:scale-90"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* CONTENT - Reduced Spacing */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-8 space-y-5 sm:space-y-8">
          {/* INFO BOX - Condensed for Mobile */}
          <div className="rounded-2xl sm:rounded-3xl bg-emerald-50/50 border border-emerald-100/50 p-4 sm:p-5 space-y-3">
            <p className="text-[9px] sm:text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
              <FiCheckCircle size={12} /> Protocol
            </p>
            <div className="space-y-2">
              <ProtocolStep num="01" text="Email dispatch" />
              <ProtocolStep num="02" text="Secure setup" />
              <ProtocolStep num="03" text="Live activation" />
            </div>
          </div>

          {/* FORM FIELDS */}
          <div className="space-y-4 sm:space-y-5">
            <div className="space-y-1.5 group">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-emerald-600 transition-colors">
                Manager Name
              </label>
              <div className="relative">
                <FiUser
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={14}
                />
                <input
                  autoFocus
                  className="w-full h-11 sm:h-14 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/50 px-10 sm:px-12 text-sm font-bold text-slate-900 focus:ring-4 sm:focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 shadow-sm"
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5 group">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-emerald-600 transition-colors">
                Manager Email
              </label>
              <div className="relative">
                <FiMail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={14}
                />
                <input
                  type="email"
                  className="w-full h-11 sm:h-14 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/50 px-10 sm:px-12 text-sm font-bold text-slate-900 focus:ring-4 sm:focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 shadow-sm"
                  placeholder="manager@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS - Compact and centered on mobile */}
        <div className="px-5 py-4 sm:px-8 sm:py-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between shrink-0 gap-4">
          <button
            onClick={onClose}
            className="text-[10px] sm:text-[11px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className={clsx(
              "h-11 sm:h-14 px-6 sm:px-10 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 sm:gap-3",
              loading
                ? "bg-slate-200 text-slate-500"
                : "bg-emerald-600 text-white shadow-emerald-200/50 hover:bg-emerald-700",
            )}
          >
            {loading ? (
              <FiLoader className="animate-spin" size={14} />
            ) : (
              <FiSend size={14} />
            )}
            <span>{loading ? "..." : "Send Invite"}</span>
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
