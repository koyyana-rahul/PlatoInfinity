import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

import Axios from "../../api/axios";
import SummaryApi from "../../api/summaryApi";
import { setUserDetails } from "../../store/auth/userSlice";
import { setBrandDetails } from "../../store/brand/brandSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ LOGIN
      await Axios({
        ...SummaryApi.login,
        data: form,
      });

      // 2️⃣ FETCH USER
      const meRes = await Axios(SummaryApi.me);
      const user = meRes.data.data;

      dispatch(setUserDetails(user));

      if (user.brand) {
        dispatch(setBrandDetails(user.brand));
      }

      toast.success("Welcome back 👋");
      navigate("/redirect", { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status === 403) {
        toast.error("Please verify your email before logging in");
      } else if (status === 401) {
        toast.error("Invalid email or password");
      } else {
        toast.error(message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#F9FBFA] px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-5"
      >
        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1A1C1E]">
            Welcome to Plato
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to manage your restaurants
          </p>
        </div>

        {/* EMAIL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@company.com"
            className="w-full px-4 py-2.5 border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-[#00684A]/30"
            required
          />
        </div>

        {/* PASSWORD */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-[#00684A]/30"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-3 text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* SUBMIT */}
        <button
          disabled={loading}
          className={`w-full py-2.5 rounded-xl font-semibold transition
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#00684A] hover:bg-[#00553D] text-white"
            }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* LINKS */}
        <div className="flex justify-between text-sm">
          <Link
            to="/forgot-password"
            className="text-[#E65F41] hover:underline"
          >
            Forgot password?
          </Link>
          <Link
            to="/register"
            className="text-[#00684A] font-medium hover:underline"
          >
            Create account
          </Link>
        </div>
      </form>
    </section>
  );
}
