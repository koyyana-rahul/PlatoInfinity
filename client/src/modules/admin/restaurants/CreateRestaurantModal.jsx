// // src/pages/restaurants/components/CreateRestaurantModal.jsx
// import { useState } from "react";
// import toast from "react-hot-toast";
// import Axios from "../../../api/axios";
// import IndiaAddressForm from "../../../components/address/IndiaAddressForm";

// export default function CreateRestaurantModal({ onClose, onSuccess }) {
//   const [form, setForm] = useState({
//     name: "",
//     phone: "",
//     address: {
//       state: "",
//       district: "",
//       mandal: "",
//       village: "",
//       pincode: "",
//     },
//   });

//   const [loading, setLoading] = useState(false);

//   /* ---------- SUBMIT ---------- */
//   const submit = async () => {
//     const { name, phone, address } = form;

//     if (!name.trim()) {
//       toast.error("Restaurant name is required");
//       return;
//     }

//     if (!address.state || address.pincode?.length !== 6) {
//       toast.error("Valid state and 6-digit pincode are required");
//       return;
//     }

//     const addressText = [
//       address.village,
//       address.mandal,
//       address.district,
//       address.state,
//       address.pincode,
//     ]
//       .filter(Boolean)
//       .join(", ");

//     try {
//       setLoading(true);

//       await Axios.post("/api/restaurants", {
//         name: name.trim(),
//         phone: phone?.trim(),
//         address,
//         addressText,
//       });

//       toast.success("Restaurant created successfully 🎉");
//       onSuccess?.();
//       onClose();
//     } catch (err) {
//       toast.error(
//         err?.response?.data?.message || "Failed to create restaurant"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
//       <div className="bg-white w-full max-w-xl rounded-2xl p-6 space-y-5 shadow-xl animate-scaleIn">
//         {/* ---------- HEADER ---------- */}
//         <div className="flex items-center justify-between">
//           <h2 className="text-lg font-semibold text-gray-800">
//             Create Restaurant
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 text-xl leading-none"
//             aria-label="Close"
//           >
//             ×
//           </button>
//         </div>

//         {/* ---------- RESTAURANT NAME ---------- */}
//         <div className="space-y-1">
//           <label className="text-xs font-medium text-gray-600">
//             Restaurant Name <span className="text-red-500">*</span>
//           </label>
//           <input
//             className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm
//                        focus:ring-2 focus:ring-emerald-500 focus:outline-none"
//             placeholder="e.g. Paradise Biryani"
//             value={form.name}
//             onChange={(e) => setForm({ ...form, name: e.target.value })}
//           />
//         </div>

//         {/* ---------- PHONE ---------- */}
//         <div className="space-y-1">
//           <label className="text-xs font-medium text-gray-600">
//             Phone (optional)
//           </label>
//           <input
//             className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm
//                        focus:ring-2 focus:ring-emerald-500 focus:outline-none"
//             placeholder="e.g. 9876543210"
//             inputMode="numeric"
//             value={form.phone}
//             onChange={(e) =>
//               setForm({
//                 ...form,
//                 phone: e.target.value.replace(/\D/g, ""),
//               })
//             }
//           />
//         </div>

//         {/* ---------- ADDRESS ---------- */}
//         <div className="space-y-1">
//           <label className="text-xs font-medium text-gray-600">
//             Address <span className="text-red-500">*</span>
//           </label>

//           <IndiaAddressForm
//             value={form.address}
//             onChange={(address) => setForm({ ...form, address })}
//           />
//         </div>

//         {/* ---------- ACTIONS ---------- */}
//         <div className="flex justify-end gap-3 pt-4">
//           <button
//             onClick={onClose}
//             disabled={loading}
//             className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
//           >
//             Cancel
//           </button>

//           <button
//             onClick={submit}
//             disabled={loading}
//             className="bg-emerald-600 hover:bg-emerald-700 text-white
//                        px-5 py-2 rounded-lg text-sm font-medium
//                        disabled:opacity-60 disabled:cursor-not-allowed"
//           >
//             {loading ? "Creating..." : "Create Restaurant"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/pages/restaurants/components/CreateRestaurantModal.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import IndiaAddressForm from "../../../components/address/IndiaAddressForm";

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

  const submit = async () => {
    const { name, phone, address } = form;

    // Validation
    if (!name.trim()) return toast.error("Restaurant name is required");
    if (!address.state) return toast.error("Please select a state");
    if (!address.district) return toast.error("Please select a district");
    if (address.pincode?.length !== 6)
      return toast.error("Valid 6-digit pincode is required");

    // Constructing a clean address text for search/display
    const addressText = [
      address.village,
      address.mandal,
      address.district,
      address.state,
      address.pincode,
    ]
      .filter((val) => val && val.trim() !== "") // Remove empty fields
      .join(", ");

    try {
      setLoading(true);
      await Axios.post("/api/restaurants", {
        name: name.trim(),
        phone: phone?.trim(),
        address, // Structured for Meta
        addressText, // Flattened for display
      });

      toast.success("Restaurant created successfully 🎉");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to create restaurant"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">New Restaurant</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Basic Info Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Restaurant Name *
              </label>
              <input
                className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. Paradise Biryani"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Phone Number
              </label>
              <input
                className="w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="9876543210"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })
                }
              />
            </div>
          </div>

          <hr />

          {/* Address Section */}
          <IndiaAddressForm
            value={form.address}
            onChange={(address) => setForm({ ...form, address })}
          />
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2 rounded-lg text-sm font-bold shadow-lg shadow-emerald-200 disabled:opacity-50 transition-all"
          >
            {loading ? "Creating..." : "Create Restaurant"}
          </button>
        </div>
      </div>
    </div>
  );
}
