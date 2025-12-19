import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import Axios from "../../utils/Axios";
import SummaryApi from "../../common/SummaryApi";
import AxiosToastError from "../../utils/AxiosToastError";
import fetchUserDetails from "../../utils/fetchUserDetails";
import { setBrandDetails } from "../../store/brandSlice";
import { setUserDetails } from "../../store/userSlice";
import useMobile from "../../hooks/useMobile"; // Import useMobile hook

const CreateBrand = () => {
  const [formData, setFormData] = useState({
    brandName: "",
    brandSlug: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isMobile] = useMobile(); // Initialize useMobile hook

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo") {
      setLogoFile(files[0]);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.brandName || !formData.brandSlug || !logoFile) {
      toast.error("Brand Name, Brand Slug, and Logo are required.");
      setLoading(false);
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append("name", formData.brandName);
    dataToSend.append("slug", formData.brandSlug);
    dataToSend.append("logo", logoFile);

    try {
      const response = await Axios({
        ...SummaryApi.createBrand,
        data: dataToSend,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.error) {
        toast.error(response.data.message);
        setLoading(false);
        return;
      }

      if (response.data.success) {
        toast.success(response.data.message);
        const updatedUserDetails = await fetchUserDetails();
        dispatch(setUserDetails(updatedUserDetails.data));
        if (updatedUserDetails.data.brand) {
          dispatch(setBrandDetails(updatedUserDetails.data.brand));
        }
        navigate(`/${formData.brandSlug}/admin/dashboard`, { replace: true });
        setFormData({ brandName: "", brandSlug: "" });
        setLogoFile(null);
      }
    } catch (error) {
      AxiosToastError(error);
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#FFF9F2] flex items-center justify-center px-3 py-8 sm:px-4 md:px-6">
      <div className="bg-white my-4 w-full max-w-sm sm:max-w-md lg:max-w-lg rounded-2xl shadow-lg sm:shadow-xl p-6 sm:p-8 text-center">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1A1C1E] mb-4">
          Create Your Brand
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mb-6">
          This is the onboarding step to set up your new restaurant brand.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="brandName"
              className="block text-left text-sm font-medium text-gray-700"
            >
              Brand Name
            </label>
            <input
              type="text"
              id="brandName"
              name="brandName"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E65F41]/20 focus:border-[#E65F41] sm:text-sm"
              placeholder="e.g., Pizza Heaven"
              value={formData.brandName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="brandSlug"
              className="block text-left text-sm font-medium text-gray-700"
            >
              Brand Slug (URL friendly)
            </label>
            <input
              type="text"
              id="brandSlug"
              name="brandSlug"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E65F41]/20 focus:border-[#E65F41] sm:text-sm"
              placeholder="e.g., pizza-heaven"
              value={formData.brandSlug}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="logo"
              className="block text-left text-sm font-medium text-gray-700"
            >
              Brand Logo
            </label>
            <input
              type="file"
              id="logo"
              name="logo"
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              onChange={handleChange}
              required
              disabled={loading}
            />
            {logoFile && (
              <p className="text-xs text-gray-500 mt-1 text-left">
                Selected file: {logoFile.name}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#E65F41] hover:bg-[#d65339] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E65F41]"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Brand"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default CreateBrand;
