import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import staffApi from "../../../api/staff.api";
import kitchenStationApi from "../../../api/kitchenStation.api";
import { FiX, FiCheckCircle, FiUser, FiCopy } from "react-icons/fi";

const ROLES = [
  { value: "WAITER", label: "Waiter" },
  { value: "CHEF", label: "Chef" },
  { value: "CASHIER", label: "Cashier" },
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
  const [stations, setStations] = useState([]);
  const [stationsLoading, setStationsLoading] = useState(false);

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
      toast.error(err?.response?.data?.message || "Unable to create staff");
    } finally {
      setLoading(false);
    }
  };

  if (createdStaff) {
    const copyCredentials = async () => {
      const text = `Staff Login Details\nCode: ${createdStaff.staffCode}\nPIN: ${createdStaff.staffPin}`;
      try {
        await navigator.clipboard.writeText(text);
        toast.success("Credentials copied");
      } catch {
        toast.error("Unable to copy credentials");
      }
    };

    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl border border-gray-200 p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3">
            <FiCheckCircle size={30} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Staff Added Successfully
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Member is now available in your Staff Team.
          </p>

          <div className="mt-5 bg-gray-50 border border-gray-200 rounded-lg p-3 text-left">
            <p className="text-xs text-gray-500 uppercase">Name</p>
            <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center gap-2">
              <FiUser size={14} className="text-orange-500" />
              {createdStaff.name || "New Staff"}
            </p>
          </div>

          <div className="mt-3 space-y-3 text-left">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-xs text-orange-700 uppercase">Login Code</p>
              <p className="text-lg font-semibold text-gray-900 mt-1 break-all">
                {createdStaff.staffCode}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-700 uppercase">Access PIN</p>
              <p className="text-2xl font-bold text-green-700 tracking-widest mt-1">
                {createdStaff.staffPin}
              </p>
            </div>
          </div>

          <button
            onClick={copyCredentials}
            className="mt-4 w-full h-10 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <FiCopy size={14} /> Copy Credentials
          </button>

          <button
            onClick={onClose}
            className="mt-5 w-full h-10 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600"
          >
            Back to Staff Team
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-2 rounded-md text-gray-500 hover:bg-gray-100"
        >
          <FiX size={18} />
        </button>

        <div className="p-6 sm:p-7 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add Staff</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create staff profile and login credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                First Name
              </label>
              <input
                value={form.firstName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, firstName: e.target.value }))
                }
                className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Last Name
              </label>
              <input
                value={form.lastName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, lastName: e.target.value }))
                }
                className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <StyledDropdown
            label="Role"
            value={form.role}
            placeholder="Select role"
            options={ROLES.map((r) => ({ value: r.value, label: r.label }))}
            onChange={(value) =>
              setForm((p) => ({
                ...p,
                role: value,
                kitchenStationId: "",
              }))
            }
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Mobile (optional)
            </label>
            <input
              value={form.mobile}
              onChange={(e) =>
                setForm((p) => ({ ...p, mobile: e.target.value }))
              }
              inputMode="numeric"
              placeholder="10-digit mobile"
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {form.role === "CHEF" && (
            <StyledDropdown
              label="Kitchen Station"
              value={form.kitchenStationId}
              placeholder={
                stationsLoading ? "Loading stations..." : "Select station"
              }
              options={stations.map((s) => ({ value: s._id, label: s.name }))}
              onChange={(value) =>
                setForm((p) => ({ ...p, kitchenStationId: value }))
              }
              disabled={stationsLoading}
            />
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
            A secure staff code and PIN will be generated automatically.
          </div>

          <div className="pt-1 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-10 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={loading}
              className="flex-1 h-10 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Staff"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StyledDropdown({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={wrapperRef}>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white flex items-center justify-between disabled:opacity-60"
      >
        <span className={selected ? "text-gray-900" : "text-gray-400"}>
          {selected?.label || placeholder}
        </span>
        <span className="text-gray-400">▾</span>
      </button>

      {open && !disabled && (
        <div className="mt-1 border border-gray-200 rounded-lg bg-white max-h-40 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No options</div>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-orange-50 ${
                  value === opt.value
                    ? "text-orange-600 font-semibold"
                    : "text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
