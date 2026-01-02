import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { FaImage } from "react-icons/fa";

import Axios from "../../api/axios";
import brandApi from "../../api/brand.api";
import summaryApi from "../../api/summaryApi";
import { setUserDetails } from "../../store/auth/userSlice";

const CreateBrand = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogo(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Brand name is required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      if (logo) formData.append("logo", logo);

      // ✅ 1. Create brand
      const res = await Axios({
        ...brandApi.createBrand,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!res.data.success) {
        toast.error(res.data.message || "Failed to create brand");
        return;
      }

      toast.success("Brand created successfully");

      // ✅ 2. IMPORTANT: Re-fetch /auth/me
      const meRes = await Axios(summaryApi.me);

      if (meRes.data.success) {
        dispatch(setUserDetails(meRes.data.data));
      } else {
        toast.error("Failed to refresh user data");
        return;
      }

      // ✅ 3. Single redirect logic
      navigate("/redirect", { replace: true });
    } catch (err) {
      if (err?.response?.status === 409) {
        toast.error("Brand name already exists");
      } else {
        toast.error(err?.response?.data?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#FFF9F2] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1A1C1E]">
            Create Your Brand
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            This will be your restaurant’s identity
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Brand Name */}
          <input
            type="text"
            placeholder="Brand name (e.g. Golden Spice)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-[#E65F41]/30"
          />

          {/* Logo Upload */}
          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition">
            {preview ? (
              <img
                src={preview}
                alt="Brand Logo"
                className="h-24 object-contain"
              />
            ) : (
              <>
                <FaImage className="text-gray-400 text-2xl mb-2" />
                <span className="text-sm text-gray-600">
                  Upload brand logo (optional)
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
          </label>

          {/* Submit */}
          <button
            disabled={loading}
            className={`w-full py-2.5 rounded-xl font-semibold transition
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#E65F41] hover:bg-[#d65339] text-white"
              }`}
          >
            {loading ? "Creating Brand..." : "Create Brand"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default CreateBrand;
