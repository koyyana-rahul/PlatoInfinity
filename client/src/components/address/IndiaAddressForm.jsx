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
      <label className="text-xs font-medium text-gray-700 mb-1.5 block ml-1">
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
          "w-full h-11 rounded-lg border px-3.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#FC8019] focus:border-[#FC8019] outline-none transition-all placeholder:text-gray-400",
          disabled
            ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-60"
            : "bg-white border-gray-300",
        )}
      />
      {open && !disabled && (
        <div className="absolute left-0 right-0 z-[300] mt-2 max-h-52 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-xs text-gray-500 italic">
              No matches found
            </div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(opt);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#FC8019] cursor-pointer transition-colors border-b border-gray-100 last:border-0"
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* PINCODE */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700 mb-1.5 block ml-1">
            Pincode *
          </label>
          <input
            inputMode="numeric"
            value={value.pincode || ""}
            onChange={(e) => handlePincode(e.target.value)}
            placeholder="6-digit PIN"
            className="w-full h-11 rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#FC8019] focus:border-[#FC8019] outline-none transition-all placeholder:text-gray-400"
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
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700 mb-1.5 block ml-1">
            Mandal / Taluk
          </label>
          <input
            value={value.mandal || ""}
            onChange={(e) => update({ mandal: e.target.value })}
            placeholder="e.g. Uppal"
            className="w-full h-11 rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#FC8019] focus:border-[#FC8019] outline-none transition-all placeholder:text-gray-400"
          />
        </div>

        {/* VILLAGE */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-medium text-gray-700 mb-1.5 block ml-1">
            Village / Post Office / Street
          </label>
          <input
            value={value.village || ""}
            onChange={(e) => update({ village: e.target.value })}
            placeholder="Building, Street Name, Area"
            className="w-full h-11 rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#FC8019] focus:border-[#FC8019] outline-none transition-all placeholder:text-gray-400"
          />
        </div>
      </div>
    </div>
  );
}
