import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { FiImage, FiX, FiCheck, FiArrowRight } from "react-icons/fi";
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

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024)
      return toast.error("File exceeds 2MB limit");

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
    if (!name.trim()) return toast.error("Identifier required");

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

      toast.success("Identity Secured");

      const meRes = await Axios(summaryApi.me);
      if (meRes.data.success) dispatch(setUserDetails(meRes.data.data));

      navigate("/redirect", { replace: true });
    } catch (err) {
      toast.error(
        err?.response?.status === 409
          ? "Identifier taken"
          : "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#FDFCFB] flex items-center justify-center px-4 py-8 sm:py-12 animate-in fade-in duration-1000">
      <div className="w-full max-w-md relative">
        {/* ================= BRAND TOKEN ================= */}
        <div className="flex justify-center mb-6 sm:mb-10 relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white shadow-[0_15px_40px_rgba(249,115,22,0.12)] rounded-[24px] sm:rounded-[28px] flex items-center justify-center border border-orange-50 transition-transform hover:rotate-12 duration-500">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-[12px] sm:rounded-[14px] shadow-inner flex items-center justify-center">
              <FiCheck className="text-white" size={18} strokeWidth={4} />
            </div>
          </div>
        </div>

        {/* ================= MAIN CARD ================= */}
        <div className="relative z-10 bg-white rounded-[32px] sm:rounded-[40px] shadow-[0_30px_80px_rgba(0,0,0,0.03)] border border-slate-50 p-6 sm:p-12 transition-all">
          <div className="text-center mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
              Brand Hub
            </h1>
            <p className="text-[11px] sm:text-sm font-medium text-slate-400 mt-2 sm:mt-3 tracking-tight">
              Create a unique identity for your restaurant terminal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* NAME INPUT */}
            <div className="space-y-2 sm:space-y-3">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">
                Official Descriptor
              </label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Spice Route Kitchen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-3.5 sm:py-4.5 bg-slate-50/50 border border-slate-100 rounded-2xl
                           text-sm sm:text-base text-slate-900 font-bold placeholder:text-slate-200 placeholder:font-medium
                           focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20
                           transition-all duration-300 shadow-inner"
              />
            </div>

            {/* LOGO AREA */}
            <div className="space-y-2 sm:space-y-3">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1 flex justify-between">
                Brand Mark{" "}
                <span className="lowercase font-medium opacity-60">
                  (optional)
                </span>
              </label>

              <div className="relative group">
                {preview ? (
                  <div className="relative h-32 sm:h-44 w-full bg-slate-50/50 rounded-2xl sm:rounded-3xl border border-slate-100 p-6 sm:p-8 flex items-center justify-center animate-in zoom-in-95 duration-500 group">
                    <img
                      src={preview}
                      alt="Brand Logo"
                      className="h-full object-contain filter drop-shadow-xl"
                    />
                    <button
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-white text-slate-400 hover:text-red-500 shadow-xl rounded-full flex items-center justify-center border border-slate-50 transition-all hover:scale-110 active:scale-90"
                    >
                      <FiX size={16} strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl sm:rounded-3xl h-32 sm:h-44 cursor-pointer hover:bg-slate-50/50 hover:border-orange-500/20 transition-all duration-500 group">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-orange-500 group-hover:bg-orange-50 transition-all duration-500 shadow-sm">
                      <FiImage size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <p className="text-[10px] sm:text-[11px] font-black text-slate-300 mt-4 uppercase tracking-widest group-hover:text-slate-400">
                      Upload Symbol
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
            </div>

            {/* ACTION BUTTON */}
            <div className="pt-2">
              <button
                disabled={loading || !name.trim()}
                className={clsx(
                  "w-full py-4 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.25em] transition-all duration-500 flex items-center justify-center gap-3",
                  loading || !name.trim()
                    ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                    : "bg-slate-900 text-white hover:bg-orange-500 hover:shadow-[0_20px_40px_rgba(249,115,22,0.25)] active:scale-[0.97]",
                )}
              >
                {loading ? (
                  "Syncing..."
                ) : (
                  <>
                    Initialize Dashboard <FiArrowRight strokeWidth={3} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Meta Info */}
        <div className="flex flex-col items-center mt-8 space-y-2 opacity-30">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
            Authorized Module
          </p>
        </div>
      </div>
    </section>
  );
};

export default CreateBrand;
