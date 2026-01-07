// src/modules/manager/staff/CreateStaffModal.jsx
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import staffApi from "../../../api/staff.api";
import kitchenStationApi from "../../../api/kitchenStation.api";

import {
  FiChevronDown,
  FiUser,
  FiCoffee,
  FiDollarSign,
  FiInfo,
} from "react-icons/fi";

/* ================= ROLE CONFIG ================= */
const ROLES = [
  {
    value: "WAITER",
    label: "Waiter",
    icon: FiUser,
    desc: "Takes orders & serves customers",
    codePrefix: "WTR",
  },
  {
    value: "CHEF",
    label: "Chef",
    icon: FiCoffee,
    desc: "Prepares food at kitchen station",
    codePrefix: "CHF",
  },
  {
    value: "CASHIER",
    label: "Cashier",
    icon: FiDollarSign,
    desc: "Handles billing & payments",
    codePrefix: "CSH",
  },
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

  /* ================= ROLE DROPDOWN ================= */
  const [roleOpen, setRoleOpen] = useState(false);
  const roleRef = useRef(null);

  /* ================= STATION DROPDOWN ================= */
  const [stations, setStations] = useState([]);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [stationOpen, setStationOpen] = useState(false);
  const stationRef = useRef(null);

  const activeRole = ROLES.find((r) => r.value === form.role);
  const activeStation = stations.find((s) => s._id === form.kitchenStationId);

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const handler = (e) => {
      if (roleRef.current && !roleRef.current.contains(e.target)) {
        setRoleOpen(false);
      }
      if (stationRef.current && !stationRef.current.contains(e.target)) {
        setStationOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ================= LOAD STATIONS ================= */
  useEffect(() => {
    if (form.role !== "CHEF") return;

    const loadStations = async () => {
      try {
        setStationsLoading(true);
        const res = await Axios(kitchenStationApi.list(restaurantId));
        setStations(res.data?.data || []);
      } catch {
        toast.error("Unable to load kitchen stations");
      } finally {
        setStationsLoading(false);
      }
    };

    loadStations();
  }, [form.role, restaurantId]);

  /* ================= VALIDATION ================= */
  const validate = () => {
    if (!form.firstName.trim()) {
      toast.error("First name is required");
      return false;
    }

    if (form.mobile && !/^\d{10}$/.test(form.mobile)) {
      toast.error("Mobile number must be 10 digits");
      return false;
    }

    if (form.role === "CHEF" && !form.kitchenStationId) {
      toast.error("Please select a kitchen station");
      return false;
    }

    return true;
  };

  /* ================= SUBMIT ================= */
  const submit = async () => {
    if (!validate()) return;

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

      toast.success(
        `Staff created • Code ${res.data?.data?.staffCode || "assigned"}`
      );

      onSuccess?.(res.data?.data);
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Unable to create staff. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-5 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Add Staff Member
          </h2>
          <p className="text-sm text-gray-700 mt-1">
            Staff are identified using Staff Code & secure PIN
          </p>
        </div>

        {/* BODY */}
        <div className="px-6 py-6 space-y-6">
          {/* NAME */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="First Name"
              required
              value={form.firstName}
              onChange={(v) => setForm({ ...form, firstName: v })}
            />
            <Field
              label="Last Name"
              optional
              value={form.lastName}
              onChange={(v) => setForm({ ...form, lastName: v })}
            />
          </div>

          {/* ROLE DROPDOWN */}
          <Dropdown
            label="Role"
            open={roleOpen}
            setOpen={setRoleOpen}
            refEl={roleRef}
            trigger={
              <>
                <activeRole.icon />
                <div>
                  <p className="font-semibold">{activeRole.label}</p>
                  <p className="text-xs text-gray-600">{activeRole.desc}</p>
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
                  setForm({
                    ...form,
                    role: r.value,
                    kitchenStationId: "",
                  });
                  setRoleOpen(false);
                }}
              />
            ))}
          </Dropdown>

          {/* MOBILE */}
          <Field
            label="Mobile Number"
            optional
            value={form.mobile}
            onChange={(v) => setForm({ ...form, mobile: v })}
            inputMode="numeric"
          />

          {/* ✅ KITCHEN STATION DROPDOWN */}
          {form.role === "CHEF" && (
            <Dropdown
              label="Kitchen Station"
              open={stationOpen}
              setOpen={setStationOpen}
              refEl={stationRef}
              loading={stationsLoading}
              empty={!stationsLoading && stations.length === 0}
              trigger={
                <>
                  <FiCoffee />
                  <p className="font-semibold">
                    {activeStation?.name || "Select kitchen station"}
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

          {/* INFO */}
          <div className="flex gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-sm">
            <FiInfo />
            <p>
              A unique Staff Code & 4-digit PIN will be generated automatically.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="text-sm text-gray-700">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="bg-emerald-600 text-white px-6 py-2 rounded-xl"
          >
            {loading ? "Creating…" : "Create Staff"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= REUSABLE UI ================= */

function Dropdown({
  label,
  open,
  setOpen,
  refEl,
  trigger,
  children,
  loading,
  empty,
}) {
  return (
    <div ref={refEl}>
      <label className="text-xs font-semibold text-gray-700">{label}</label>
      <button
        onClick={() => setOpen(!open)}
        className="w-full h-12 px-4 border rounded-xl flex items-center justify-between"
      >
        <div className="flex items-center gap-3">{trigger}</div>
        <FiChevronDown className={open ? "rotate-180" : ""} />
      </button>

      {open && (
        <div className="mt-2 border rounded-xl shadow-lg overflow-hidden bg-white">
          {loading && (
            <p className="px-4 py-3 text-sm text-gray-500">Loading…</p>
          )}
          {empty && (
            <p className="px-4 py-3 text-sm text-red-600">
              No kitchen stations found
            </p>
          )}
          {!loading && !empty && children}
        </div>
      )}
    </div>
  );
}

function DropdownItem({ icon: Icon, title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 flex gap-3 hover:bg-gray-50 text-left"
    >
      {Icon && <Icon className="mt-1" />}
      <div>
        <p className="font-semibold">{title}</p>
        {desc && <p className="text-xs text-gray-600">{desc}</p>}
      </div>
    </button>
  );
}

function Field({ label, value, onChange, optional, required, inputMode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-700">
        {label} {optional && "(optional)"} {required && "*"}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={inputMode}
        className="w-full h-12 rounded-xl border px-3 mt-1"
      />
    </div>
  );
}
