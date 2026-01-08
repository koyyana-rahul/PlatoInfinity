// import { useMemo, useState } from "react";
// import IndiaStateDistrict from "india-state-district";
// import { search } from "india-pincode-search";

// /* ---------- FULL STATE MAP ---------- */
// const STATE_CODE_TO_NAME = {
//   AP: "Andhra Pradesh",
//   AR: "Arunachal Pradesh",
//   AS: "Assam",
//   BR: "Bihar",
//   CG: "Chhattisgarh",
//   GA: "Goa",
//   GJ: "Gujarat",
//   HR: "Haryana",
//   HP: "Himachal Pradesh",
//   JH: "Jharkhand",
//   KA: "Karnataka",
//   KL: "Kerala",
//   MP: "Madhya Pradesh",
//   MH: "Maharashtra",
//   MN: "Manipur",
//   ML: "Meghalaya",
//   MZ: "Mizoram",
//   NL: "Nagaland",
//   OD: "Odisha",
//   PB: "Punjab",
//   RJ: "Rajasthan",
//   SK: "Sikkim",
//   TN: "Tamil Nadu",
//   TG: "Telangana",
//   TR: "Tripura",
//   UP: "Uttar Pradesh",
//   UK: "Uttarakhand",
//   WB: "West Bengal",
//   DL: "Delhi",
// };

// const STATE_NAME_TO_CODE = Object.fromEntries(
//   Object.entries(STATE_CODE_TO_NAME).map(([k, v]) => [v, k])
// );

// /* ---------- SEARCHABLE DROPDOWN ---------- */
// function SearchDropdown({ label, value, options, placeholder, onSelect }) {
//   const [open, setOpen] = useState(false);
//   const [query, setQuery] = useState("");

//   const filtered = useMemo(() => {
//     return options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));
//   }, [query, options]);

//   return (
//     <div className="relative w-full">
//       <label className="text-xs text-gray-500">{label}</label>

//       <input
//         value={open ? query : value || ""}
//         placeholder={placeholder}
//         onFocus={() => {
//           setOpen(true);
//           setQuery("");
//         }}
//         onChange={(e) => setQuery(e.target.value)}
//         className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm
//                    focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
//       />

//       {open && (
//         <div
//           className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto
//                      rounded-lg border bg-white shadow-lg"
//         >
//           {filtered.length === 0 && (
//             <div className="px-3 py-2 text-sm text-gray-400">No results</div>
//           )}

//           {filtered.map((opt) => (
//             <button
//               key={opt}
//               type="button"
//               onMouseDown={() => {
//                 onSelect(opt);
//                 setOpen(false);
//               }}
//               className="block w-full text-left px-3 py-2 text-sm
//                          hover:bg-emerald-50"
//             >
//               {opt}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// /* ---------- MAIN FORM ---------- */
// export default function IndiaAddressForm({ value = {}, onChange }) {
//   const states = Object.values(STATE_CODE_TO_NAME).sort();

//   const districts = useMemo(() => {
//     const code = STATE_NAME_TO_CODE[value.state];
//     return code ? IndiaStateDistrict.rawData[code] || [] : [];
//   }, [value.state]);

//   const update = (patch) => onChange({ ...value, ...patch });

//   /* ---------- PINCODE LOOKUP ---------- */
//   const handlePincode = (raw) => {
//     const pin = raw.replace(/\D/g, "").slice(0, 6);
//     update({ pincode: pin });

//     if (pin.length !== 6) return;

//     const result = search(pin);
//     if (!result?.length) return;

//     const d = result[0];

//     update({
//       state: d.stateName || value.state,
//       district: d.districtName || value.district,
//       mandal: d.taluk || "",
//       village: d.officeName || "",
//     });
//   };

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//       {/* STATE */}
//       <SearchDropdown
//         label="State"
//         value={value.state}
//         options={states}
//         placeholder="Select state"
//         onSelect={(state) =>
//           update({ state, district: "", mandal: "", village: "" })
//         }
//       />

//       {/* DISTRICT */}
//       <SearchDropdown
//         label="District"
//         value={value.district}
//         options={districts}
//         placeholder="Select district"
//         onSelect={(district) => update({ district })}
//       />

//       {/* PINCODE */}
//       <div>
//         <label className="text-xs text-gray-500">Pincode</label>
//         <input
//           inputMode="numeric"
//           value={value.pincode || ""}
//           onChange={(e) => handlePincode(e.target.value)}
//           placeholder="Enter 6-digit pincode"
//           className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm
//                      focus:ring-2 focus:ring-emerald-500 focus:outline-none"
//         />
//       </div>

//       {/* MANDAL */}
//       <div>
//         <label className="text-xs text-gray-500">Mandal / Taluk</label>
//         <input
//           disabled
//           value={value.mandal || ""}
//           className="w-full h-11 rounded-lg bg-gray-100 border px-3 text-sm"
//         />
//       </div>

//       {/* VILLAGE */}
//       <div className="sm:col-span-2">
//         <label className="text-xs text-gray-500">Village / Post Office</label>
//         <input
//           disabled
//           value={value.village || ""}
//           className="w-full h-11 rounded-lg bg-gray-100 border px-3 text-sm"
//         />
//       </div>
//     </div>
//   );
// }


// src/components/address/IndiaAddressForm.jsx
import { useMemo, useState } from "react";
import IndiaStateDistrict from "india-state-district";
import { search } from "india-pincode-search";

const STATE_CODE_TO_NAME = {
  AP: "Andhra Pradesh", AR: "Arunachal Pradesh", AS: "Assam", BR: "Bihar",
  CG: "Chhattisgarh", GA: "Goa", GJ: "Gujarat", HR: "Haryana", HP: "Himachal Pradesh",
  JH: "Jharkhand", KA: "Karnataka", KL: "Kerala", MP: "Madhya Pradesh", MH: "Maharashtra",
  MN: "Manipur", ML: "Meghalaya", MZ: "Mizoram", NL: "Nagaland", OD: "Odisha",
  PB: "Punjab", RJ: "Rajasthan", SK: "Sikkim", TN: "Tamil Nadu", TG: "Telangana",
  TR: "Tripura", UP: "Uttar Pradesh", UK: "Uttarakhand", WB: "West Bengal", DL: "Delhi",
};

const STATE_NAME_TO_CODE = Object.fromEntries(
  Object.entries(STATE_CODE_TO_NAME).map(([k, v]) => [v, k])
);

/* ---------- SEARCHABLE DROPDOWN COMPONENT ---------- */
function SearchDropdown({ label, value, options, placeholder, onSelect }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));
  }, [query, options]);

  return (
    <div className="relative w-full">
      <label className="text-[11px] font-semibold text-gray-500 uppercase mb-1 block">{label}</label>
      <input
        value={open ? query : value || ""}
        placeholder={placeholder}
        onFocus={() => { setOpen(true); setQuery(""); }}
        onBlur={() => setTimeout(() => setOpen(false), 200)} // delay to allow button click
        onChange={(e) => setQuery(e.target.value)}
        className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
      />
      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-auto rounded-lg border bg-white shadow-xl">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">No results found</div>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onSelect(opt); setOpen(false); }}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 transition-colors"
              >
                {opt}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- MAIN FORM ---------- */
export default function IndiaAddressForm({ value = {}, onChange }) {
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
        {/* PINCODE - Moved to top as it's the primary driver in India */}
        <div>
          <label className="text-[11px] font-semibold text-gray-500 uppercase mb-1 block">Pincode *</label>
          <input
            inputMode="numeric"
            value={value.pincode || ""}
            onChange={(e) => handlePincode(e.target.value)}
            placeholder="6-digit PIN"
            className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* STATE */}
        <SearchDropdown
          label="State *"
          value={value.state}
          options={states}
          placeholder="Select state"
          onSelect={(state) => update({ state, district: "", mandal: "", village: "" })}
        />

        {/* DISTRICT */}
        <SearchDropdown
          label="District *"
          value={value.district}
          options={districts}
          placeholder="Select district"
          onSelect={(district) => update({ district })}
        />

        {/* MANDAL - Now Editable */}
        <div>
          <label className="text-[11px] font-semibold text-gray-500 uppercase mb-1 block">Mandal / Taluk</label>
          <input
            value={value.mandal || ""}
            onChange={(e) => update({ mandal: e.target.value })}
            placeholder="e.g. Uppal"
            className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* VILLAGE - Now Editable */}
        <div className="sm:col-span-2">
          <label className="text-[11px] font-semibold text-gray-500 uppercase mb-1 block">Village / Area / Post Office</label>
          <input
            value={value.village || ""}
            onChange={(e) => update({ village: e.target.value })}
            placeholder="e.g. Ramanthapur, Flat No, Street"
            className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>
    </div>
  );
}