import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  X,
  Save,
  ChefHat,
  CheckCircle2,
  ChevronDown,
  PackageCheck,
} from "lucide-react";
import clsx from "clsx";

import Axios from "../../../../api/axios";
import branchMenuApi from "../../../../api/branchMenu.api";
import kitchenStationApi from "../../../../api/kitchenStation.api";

export default function EditBranchItemModal({ item, onClose, onSuccess }) {
  const restaurantId = useSelector((s) => s.user.restaurantId);

  const [form, setForm] = useState({
    name: item?.name || "",
    price: item?.price ?? 0,
    station: item?.station || "",
    status: item?.status || "ON",
  });

  const [stations, setStations] = useState([]);
  const [stationLoading, setStationLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStations = async () => {
      if (!restaurantId) return;
      try {
        setStationLoading(true);
        const res = await Axios(kitchenStationApi.list(restaurantId));
        setStations(res.data?.data || []);
      } catch (err) {
        toast.error("Failed to load kitchen stations");
      } finally {
        setStationLoading(false);
      }
    };
    loadStations();
  }, [restaurantId]);

  const submit = async () => {
    if (!form.name.trim()) return toast.error("Item name is required");
    if (Number(form.price) < 0) return toast.error("Price cannot be negative");

    try {
      setLoading(true);
      await Axios({
        ...branchMenuApi.updateItem(restaurantId, item._id),
        data: {
          name: form.name.trim(),
          price: Number(form.price),
          station: form.station || null,
          status: form.status,
        },
      });
      toast.success("Item updated successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      title="Edit Menu Item"
      onClose={onClose}
      subTitle="Item Details & Workflow"
    >
      <div className="space-y-6">
        {/* AVAILABILITY TOGGLE */}
        <div
          onClick={() =>
            setForm({ ...form, status: form.status === "ON" ? "OFF" : "ON" })
          }
          className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div
              className={clsx(
                "p-2 rounded-xl transition-colors",
                form.status === "ON"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-slate-200 text-slate-500",
              )}
            >
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 tracking-tight">
                Available to Order
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                Status: {form.status}
              </p>
            </div>
          </div>
          <div
            className={clsx(
              "w-12 h-6 rounded-full transition-all duration-300 relative",
              form.status === "ON" ? "bg-emerald-500" : "bg-slate-300",
            )}
          >
            <div
              className={clsx(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                form.status === "ON" ? "left-7" : "left-1",
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <Input
            label="Item Display Name"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
          />

          <Input
            label="Base Price"
            type="number"
            prefix="₹"
            value={form.price}
            onChange={(v) => setForm({ ...form, price: v })}
          />

          <CustomSelect
            label="Assigned Kitchen Station"
            icon={<ChefHat size={16} />}
            value={form.station}
            options={[
              { value: "", label: "No Specific Station" },
              ...stations.map((s) => ({ value: s.name, label: s.name })),
            ]}
            onChange={(v) => setForm({ ...form, station: v })}
            disabled={stationLoading}
          />
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="
            relative w-full h-14 bg-emerald-500 text-white 
            rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] 
            shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)]
            active:scale-95 transition-all flex items-center justify-center gap-2
            disabled:opacity-50
          "
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </ModalShell>
  );
}

/* ================= CUSTOM COMPONENTS ================= */

function ModalShell({ title, subTitle, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white sm:rounded-[32px] rounded-t-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-500">
        <header className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {title}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {subTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-50 text-slate-400 active:scale-90 transition-all"
          >
            <X size={20} />
          </button>
        </header>
        <div className="p-8 max-h-[75vh] overflow-y-auto hide-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, prefix, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">
            {prefix}
          </span>
        )}
        <input
          {...props}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={clsx(
            "w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none transition-all",
            "focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white",
            prefix ? "pl-10 pr-5" : "px-5",
          )}
        />
      </div>
    </div>
  );
}

function CustomSelect({ label, value, options, onChange, disabled, icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">
        {label}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full h-14 px-5 flex items-center justify-between bg-slate-50 border transition-all rounded-2xl",
          isOpen
            ? "border-emerald-500 ring-4 ring-emerald-500/10 bg-white"
            : "border-slate-100",
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-emerald-500">{icon}</span>
          <span className="text-sm font-bold text-slate-900">
            {selectedOption?.label}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={clsx(
            "text-slate-400 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-[120] bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-48 overflow-y-auto hide-scrollbar p-1.5">
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={clsx(
                  "px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer mb-0.5 last:mb-0",
                  value === opt.value
                    ? "bg-emerald-500 text-white"
                    : "text-slate-600 hover:bg-slate-50",
                )}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
