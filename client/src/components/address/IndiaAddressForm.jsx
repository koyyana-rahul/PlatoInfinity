// src/components/address/IndiaAddressForm.jsx
import { useMemo, useState } from "react";
import IndiaStateDistrict from "india-state-district";
import { search } from "india-pincode-search";
import clsx from "clsx";

const STATE_CODE_TO_NAME = {
  AP: "Andhra Pradesh",
  AR: "Arunachal Pradesh",
  AS: "Assam",
  BR: "Bihar",
  CG: "Chhattisgarh",
  GA: "Goa",
  GJ: "Gujarat",
  HR: "Haryana",
  HP: "Himachal Pradesh",
  JH: "Jharkhand",
  KA: "Karnataka",
  KL: "Kerala",
  MP: "Madhya Pradesh",
  MH: "Maharashtra",
  MN: "Manipur",
  ML: "Meghalaya",
  MZ: "Mizoram",
  NL: "Nagaland",
  OD: "Odisha",
  PB: "Punjab",
  RJ: "Rajasthan",
  SK: "Sikkim",
  TN: "Tamil Nadu",
  TG: "Telangana",
  TR: "Tripura",
  UP: "Uttar Pradesh",
  UK: "Uttarakhand",
  WB: "West Bengal",
  DL: "Delhi",
};

const STATE_NAME_TO_CODE = Object.fromEntries(
  Object.entries(STATE_CODE_TO_NAME).map(([k, v]) => [v, k]),
);

/* ---------- SEARCHABLE DROPDOWN ---------- */
function SearchDropdown({
  label,
  value,
  options,
  placeholder,
  onSelect,
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return (options || []).filter((o) =>
      o.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query, options]);

  return (
    <div className="relative w-full">
      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">
        {label}
      </label>
      <input
        value={open ? query : value || ""}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => {
          if (!disabled) {
            setOpen(true);
            setQuery("");
          }
        }}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        onChange={(e) => setQuery(e.target.value)}
        className={clsx(
          "w-full h-12 rounded-2xl border border-slate-100 px-5 text-sm font-bold text-slate-900 focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 shadow-sm",
          disabled
            ? "bg-slate-100 cursor-not-allowed opacity-60"
            : "bg-slate-50/50",
        )}
      />
      {open && !disabled && (
        <div className="absolute left-0 right-0 z-[300] mt-2 max-h-52 overflow-y-auto rounded-2xl border border-slate-100 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="px-5 py-4 text-xs font-bold text-slate-400 italic">
              No matches found
            </div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt}
                // ✅ FIX: onMouseDown fires before onBlur, ensuring the click is registered
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(opt);
                  setOpen(false);
                }}
                className="w-full text-left px-5 py-3.5 text-sm font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
              >
                {opt}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- MAIN FORM ---------- */
export default function IndiaAddressForm({ value, onChange }) {
  if (!value) return null;

  const states = Object.values(STATE_CODE_TO_NAME).sort();

  const districts = useMemo(() => {
    const code = STATE_NAME_TO_CODE[value.state];
    return code ? IndiaStateDistrict.rawData[code] || [] : [];
  }, [value.state]);

  const update = (patch) => onChange({ ...value, ...patch });

  const handlePincode = (raw) => {
    const pin = raw.replace(/\D/g, "").slice(0, 6);
    update({ pincode: pin });

    if (pin.length === 6) {
      const result = search(pin);
      if (result && result.length > 0) {
        const d = result[0];
        update({
          pincode: pin,
          state: d.stateName || value.state,
          district: d.districtName || value.district,
          mandal: d.taluk || value.mandal,
          village: d.officeName || value.village,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* PINCODE */}
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">
            Pincode *
          </label>
          <input
            inputMode="numeric"
            value={value.pincode || ""}
            onChange={(e) => handlePincode(e.target.value)}
            placeholder="6-digit PIN"
            className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 text-sm font-bold text-slate-900 focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 shadow-sm"
          />
        </div>

        {/* STATE */}
        <SearchDropdown
          label="State *"
          value={value.state}
          options={states}
          placeholder="Select state"
          onSelect={(state) =>
            update({ state, district: "", mandal: "", village: "" })
          }
        />

        {/* DISTRICT */}
        <SearchDropdown
          label="District *"
          value={value.district}
          options={districts}
          placeholder={value.state ? "Select district" : "Select state first"}
          disabled={!value.state}
          onSelect={(district) => update({ district })}
        />

        {/* MANDAL */}
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">
            Mandal / Taluk
          </label>
          <input
            value={value.mandal || ""}
            onChange={(e) => update({ mandal: e.target.value })}
            placeholder="e.g. Uppal"
            className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 text-sm font-bold text-slate-900 focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 shadow-sm"
          />
        </div>

        {/* VILLAGE */}
        <div className="sm:col-span-2 space-y-2">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">
            Village / Post Office / Street
          </label>
          <input
            value={value.village || ""}
            onChange={(e) => update({ village: e.target.value })}
            placeholder="Building, Street Name, Area"
            className="w-full h-12 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 text-sm font-bold text-slate-900 focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
