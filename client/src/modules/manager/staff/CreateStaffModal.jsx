// src/modules/manager/staff/CreateStaffModal.jsx
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import staffApi from "../../../api/staff.api";
import kitchenStationApi from "../../../api/kitchenStation.api";
import clsx from "clsx";

import {
  FiChevronDown,
  FiUser,
  FiCoffee,
  FiDollarSign,
  FiInfo,
  FiCheckCircle,
  FiX,
} from "react-icons/fi";

const ROLES = [
  { value: "WAITER", label: "Waiter", icon: FiUser, desc: "Orders & Service" },
  { value: "CHEF", label: "Chef", icon: FiCoffee, desc: "Kitchen Prep" },
  { value: "CASHIER", label: "Cashier", icon: FiDollarSign, desc: "Billing" },
];

export default function CreateStaffModal({ restaurantId, onClose, onSuccess }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    role: "WAITER",
    mobile: "",
    kitchenStationId: "",
  });
  const [loading, setLoading] = useState(false);
  const [createdStaff, setCreatedStaff] = useState(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const [stationOpen, setStationOpen] = useState(false);
  const [stations, setStations] = useState([]);
  const [stationsLoading, setStationsLoading] = useState(false);

  const roleRef = useRef(null);
  const stationRef = useRef(null);
  const activeRole = ROLES.find((r) => r.value === form.role);
  const activeStation = stations.find((s) => s._id === form.kitchenStationId);

  useEffect(() => {
    const handler = (e) => {
      if (roleRef.current && !roleRef.current.contains(e.target))
        setRoleOpen(false);
      if (stationRef.current && !stationRef.current.contains(e.target))
        setStationOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (form.role !== "CHEF") return;
    const loadStations = async () => {
      try {
        setStationsLoading(true);
        const res = await Axios(kitchenStationApi.list(restaurantId));
        setStations(res.data?.data || []);
      } catch {
        toast.error("Unable to load stations");
      } finally {
        setStationsLoading(false);
      }
    };
    loadStations();
  }, [form.role, restaurantId]);

  const submit = async () => {
    if (!form.firstName.trim()) return toast.error("First name required");
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
    try {
      setLoading(true);
      const res = await Axios({
        ...staffApi.create(restaurantId),
        data: {
          name: fullName,
          role: form.role,
          mobile: form.mobile || null,
          kitchenStationId: form.role === "CHEF" ? form.kitchenStationId : null,
        },
      });
      setCreatedStaff(res.data.data);
      onSuccess?.(res.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to create staff.");
    } finally {
      setLoading(false);
    }
  };

  if (createdStaff) {
    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
        <div className="relative bg-white w-full max-w-sm rounded-[32px] p-6 text-center shadow-2xl animate-in zoom-in-95">
          <FiCheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            Staff Created
          </h3>
          <div className="mt-6 space-y-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Login Code
              </p>
              <p className="text-lg font-black text-slate-900 uppercase tracking-tighter">
                {createdStaff.staffCode}
              </p>
            </div>
            <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                Access PIN
              </p>
              <p className="text-3xl font-black text-emerald-600 tracking-[0.2em]">
                {createdStaff.staffPin}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="mt-6 w-full h-12 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-lg"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-md rounded-[28px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="px-6 py-5 flex justify-between items-start border-b border-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
              Add Staff
            </h2>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-2">
              Registration Portal
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-50 text-slate-400 rounded-full hover:text-red-500 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {/* FIRST NAME & LAST NAME - STACKED */}
          <div className="flex flex-col gap-4">
            <Field
              label="First Name"
              required
              value={form.firstName}
              onChange={(v) => setForm({ ...form, firstName: v })}
              placeholder="e.g. Rahul"
            />
            <Field
              label="Last Name"
              optional
              value={form.lastName}
              onChange={(v) => setForm({ ...form, lastName: v })}
              placeholder="e.g. Sharma"
            />
          </div>

          <Dropdown
            label="Designation"
            required
            open={roleOpen}
            setOpen={setRoleOpen}
            refEl={roleRef}
            trigger={
              <>
                <div className="p-1 bg-emerald-50 text-emerald-600 rounded-lg">
                  <activeRole.icon size={16} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 leading-none">
                    {activeRole.label}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1 leading-none">
                    {activeRole.desc}
                  </p>
                </div>
              </>
            }
          >
            {ROLES.map((r) => (
              <DropdownItem
                key={r.value}
                icon={r.icon}
                title={r.label}
                desc={r.desc}
                onClick={() => {
                  setForm({ ...form, role: r.value, kitchenStationId: "" });
                  setRoleOpen(false);
                }}
              />
            ))}
          </Dropdown>

          <Field
            label="Mobile Number"
            optional
            value={form.mobile}
            onChange={(v) => setForm({ ...form, mobile: v })}
            inputMode="numeric"
            placeholder="10-digit mobile"
          />

          {form.role === "CHEF" && (
            <Dropdown
              label="Kitchen Station"
              required
              open={stationOpen}
              setOpen={setStationOpen}
              refEl={stationRef}
              loading={stationsLoading}
              empty={!stationsLoading && stations.length === 0}
              trigger={
                <>
                  <div className="p-1.5 bg-slate-50 text-slate-400 rounded-lg">
                    <FiCoffee size={16} />
                  </div>
                  <p
                    className={clsx(
                      "text-xs sm:text-sm font-bold",
                      activeStation ? "text-slate-900" : "text-slate-400",
                    )}
                  >
                    {activeStation?.name || "Select Station"}
                  </p>
                </>
              }
            >
              {stations.map((s) => (
                <DropdownItem
                  key={s._id}
                  title={s.name}
                  onClick={() => {
                    setForm({ ...form, kitchenStationId: s._id });
                    setStationOpen(false);
                  }}
                />
              ))}
            </Dropdown>
          )}

          <div className="flex gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl text-[10px] font-medium text-slate-500 leading-relaxed italic">
            <FiInfo
              className="mt-0.5 flex-shrink-0 text-emerald-600"
              size={14}
            />
            <p>
              System auto-generates a secure PIN. Ensure names are correct as
              per official ID.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-50 flex justify-end gap-3 items-center">
          <button
            onClick={onClose}
            className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="bg-slate-900 text-white px-6 sm:px-8 h-11 sm:h-12 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-slate-200"
          >
            {loading ? "..." : "Create Staff Member"}
          </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
}

/* ================= COMPONENT HELPERS ================= */

function Dropdown({
  label,
  open,
  setOpen,
  refEl,
  trigger,
  children,
  loading,
  empty,
  required,
}) {
  return (
    <div ref={refEl} className="relative">
      <div className="mb-1.5 px-1">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {label}{" "}
          {required && <span className="text-red-500 ml-0.5 font-bold">*</span>}
        </label>
      </div>

      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          "w-full h-11 sm:h-12 px-3 bg-white border rounded-xl flex items-center justify-between transition-all",
          open
            ? "border-emerald-500 ring-4 ring-emerald-500/5 shadow-sm"
            : "border-slate-200 hover:border-slate-300",
        )}
      >
        <div className="flex items-center gap-2">{trigger}</div>
        <FiChevronDown
          className={clsx(
            "text-slate-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute z-[160] w-full mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-top-2">
          {loading && (
            <p className="px-4 py-3 text-[10px] font-bold text-slate-400">
              Loading...
            </p>
          )}
          {empty && (
            <p className="px-4 py-3 text-[10px] font-bold text-red-400 text-center">
              No results
            </p>
          )}
          {!loading && !empty && (
            <div className="max-h-40 overflow-y-auto">{children}</div>
          )}
        </div>
      )}
    </div>
  );
}

function DropdownItem({ icon: Icon, title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
    >
      {Icon && <Icon className="text-slate-400 flex-shrink-0" size={14} />}
      <div>
        <p className="text-[11px] font-bold text-slate-800 leading-none">
          {title}
        </p>
        {desc && (
          <p className="text-[9px] text-slate-400 font-medium mt-1 leading-none">
            {desc}
          </p>
        )}
      </div>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  optional,
  required,
  inputMode,
  placeholder,
}) {
  return (
    <div className="w-full">
      <div className="mb-1.5 px-1">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {label}{" "}
          {required && <span className="text-red-500 ml-0.5 font-bold">*</span>}
          {optional && (
            <span className="text-[9px] font-bold text-slate-300 ml-1 lowercase italic opacity-80">
              (opt.)
            </span>
          )}
        </label>
      </div>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={inputMode}
        placeholder={placeholder}
        className="w-full h-11 sm:h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-slate-200 placeholder:font-medium shadow-sm"
      />
    </div>
  );
}
