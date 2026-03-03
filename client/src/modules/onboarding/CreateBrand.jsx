import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { FiImage, FiX } from "react-icons/fi";
import clsx from "clsx";

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
  const [errors, setErrors] = useState({});

  const validateName = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "Restaurant name is required";
    if (trimmed.length < 2) return "Name must be at least 2 characters";
    if (trimmed.length > 50) return "Name cannot exceed 50 characters";
    return "";
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setLogo(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeLogo = (e) => {
    e.preventDefault();
    setLogo(null);
    setPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const nameError = validateName(name);
    if (nameError) {
      setErrors({ name: nameError });
      toast.error(nameError);
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name.trim());
      if (logo) formData.append("logo", logo);

      const res = await Axios({
        ...brandApi.createBrand,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!res.data.success) throw new Error(res.data.message);

      toast.success("Restaurant created successfully!");

      const meRes = await Axios(summaryApi.me);
      if (meRes.data.success) dispatch(setUserDetails(meRes.data.data));

      navigate("/redirect", { replace: true });
    } catch (err) {
      if (err?.response?.status === 409) {
        const errorMsg = `"${name.trim()}" is already registered. Please choose a different name.`;
        setErrors({ name: errorMsg });
        toast.error(errorMsg, { duration: 4000 });
      } else {
        const errorMsg =
          err?.response?.data?.message ||
          "Failed to create restaurant. Please try again.";
        toast.error(errorMsg, { duration: 3000 });
      }
      console.error("Brand creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-white flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Create Restaurant
          </h1>
          <p className="text-gray-600 text-sm">
            Set up your restaurant profile
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-10 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Restaurant Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Restaurant Name
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Enter restaurant name"
                value={name}
                onChange={handleNameChange}
                maxLength="50"
                className={clsx(
                  "w-full px-4 py-3 border-2 rounded-lg text-base",
                  "placeholder:text-gray-400 placeholder:font-normal",
                  "focus:outline-none transition-colors",
                  errors.name
                    ? "border-red-400 bg-red-50 focus:border-red-500"
                    : "border-gray-300 bg-gray-50 focus:border-orange-500",
                )}
              />
              {errors.name && (
                <p className="mt-2 text-xs text-red-600 font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Logo{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>

              {preview ? (
                <div className="relative">
                  <div className="h-32 bg-gray-50 rounded-lg border-2 border-gray-200 p-4 flex items-center justify-center">
                    <img
                      src={preview}
                      alt="Logo"
                      className="h-full object-contain"
                    />
                  </div>
                  <button
                    onClick={removeLogo}
                    type="button"
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg py-8 cursor-pointer hover:bg-gray-50">
                  <FiImage className="text-gray-400 mb-2" size={24} />
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG (Max 5MB)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Submit Button */}
            <button
              disabled={loading || !name.trim()}
              type="submit"
              className={clsx(
                "w-full py-3 rounded-lg font-semibold text-white transition-all mt-8",
                loading || !name.trim()
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 active:scale-95",
              )}
            >
              {loading ? "Creating..." : "Create Restaurant"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CreateBrand;
