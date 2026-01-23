import { useState } from "react";
import {
  FiX,
  FiPlus,
  FiLoader,
  FiInfo,
  FiGlobe,
  FiMapPin,
  FiLayers,
  FiActivity,
} from "react-icons/fi";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import IndiaAddressForm from "../../../components/address/IndiaAddressForm";
import clsx from "clsx";

/**
 * CreateRestaurantModal
 * Pattern: Middle-Centered floating modal for both Mobile and Desktop
 */
export default function CreateRestaurantModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: {
      state: "",
      district: "",
      mandal: "",
      village: "",
      pincode: "",
    },
  });

  const [loading, setLoading] = useState(false);

  const handleAddressChange = (updatedAddress) => {
    setForm((prev) => ({ ...prev, address: updatedAddress }));
  };

  const submit = async () => {
    const { name, phone, address } = form;

    if (!name.trim()) return toast.error("Entity name is required");
    if (!address.state || !address.district)
      return toast.error("Complete geographical data required");
    if (address.pincode?.length !== 6)
      return toast.error("Valid 6-digit Pincode required");

    const addressText = [
      address.village,
      address.mandal,
      address.district,
      address.state,
      address.pincode,
    ]
      .filter((val) => val?.trim())
      .join(", ");

    try {
      setLoading(true);
      await Axios.post("/api/restaurants", {
        name: name.trim(),
        phone: phone?.trim(),
        address,
        addressText,
      });

      toast.success("New branch successfully established");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Protocol Failure");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      {/* 1. BLURRED BACKDROP - Higher blur for focus */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* 2. CENTERED MODAL CARD - Mobile Friendly Geometry */}
      <div className="relative bg-white w-full max-w-2xl rounded-[32px] sm:rounded-[40px] shadow-[0_40px_100px_-20px_rgba(15,23,42,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh] sm:max-h-[90vh] border border-slate-100">
        {/* HEADER: EXECUTIVE STYLE */}
        <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
              <FiLayers size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
                Establish Unit
              </h2>
              <p className="text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1 leading-none">
                <FiActivity size={10} className="animate-pulse" /> Live
                Registration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-300 hover:text-slate-900 transition-all active:scale-90"
          >
            <FiX size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-8 sm:space-y-10">
          {/* IDENTITY SUB-SECTION */}
          <div className="space-y-5 sm:space-y-6">
            <div className="flex items-center gap-2">
              <FiInfo className="text-slate-300" size={12} />
              <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Entity Identity
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-2 group">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-emerald-600 transition-colors">
                  Display Name
                </label>
                <input
                  autoFocus
                  className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/50 px-4 sm:px-6 text-sm font-bold text-slate-900 focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 shadow-sm"
                  placeholder="Official Unit Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2 group">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-emerald-600 transition-colors">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/50 px-4 sm:px-6 text-sm font-bold text-slate-900 focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 shadow-sm"
                  placeholder="Primary Contact"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value.replace(/\D/g, ""),
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* GEOGRAPHY SUB-SECTION */}
          <div className="space-y-5 sm:space-y-6">
            <div className="flex items-center gap-2">
              <FiMapPin className="text-slate-300" size={12} />
              <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Regional Assignment
              </p>
            </div>

            <div className="bg-slate-50/30 p-5 sm:p-8 rounded-[24px] sm:rounded-[32px] border border-slate-100/50 shadow-inner">
              <IndiaAddressForm
                value={form.address}
                onChange={handleAddressChange}
              />
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS - Fixed at bottom */}
        <div className="px-6 py-5 sm:px-8 sm:py-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="text-[10px] sm:text-[11px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors py-2"
          >
            Abort
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className={clsx(
              "h-12 sm:h-14 px-6 sm:px-10 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 sm:gap-3",
              loading
                ? "bg-slate-200 text-slate-500"
                : "bg-emerald-600 text-white shadow-emerald-200/50 hover:bg-emerald-700 hover:shadow-emerald-300/40",
            )}
          >
            {loading ? (
              <FiLoader className="animate-spin" size={14} />
            ) : (
              <FiPlus size={16} strokeWidth={3} />
            )}
            <span className="hidden xs:inline">
              {loading ? "Establishing..." : "Commit Unit"}
            </span>
            <span className="xs:hidden">
              {loading ? "Wait..." : "Establish"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
