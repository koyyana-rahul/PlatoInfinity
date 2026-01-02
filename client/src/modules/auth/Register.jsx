import { useState } from "react";
import { Link } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash, FaEnvelopeOpenText } from "react-icons/fa6";
import toast from "react-hot-toast";
import Axios from "../../api/axios";
import SummaryApi from "../../api/summaryApi";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successEmail, setSuccessEmail] = useState(null); // 🔑 KEY

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const isValid =
    form.name &&
    form.email &&
    form.password &&
    form.confirmPassword &&
    form.password === form.confirmPassword;

  const submit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await Axios({
        ...SummaryApi.register,
        data: {
          name: form.name,
          email: form.email,
          password: form.password,
        },
      });

      // ✅ DO NOT REDIRECT
      setSuccessEmail(form.email);
      toast.success("Verification email sent");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     SUCCESS STATE – CHECK EMAIL
  ====================================================== */
  if (successEmail) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#F9FBFA] px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center space-y-4">
          <FaEnvelopeOpenText className="mx-auto text-4xl text-[#00684A]" />
          <h2 className="text-2xl font-bold text-[#1A1C1E]">
            Verify your email
          </h2>
          <p className="text-sm text-gray-600">
            We’ve sent a verification link to
          </p>
          <p className="font-semibold text-[#00684A]">{successEmail}</p>

          <p className="text-xs text-gray-500">
            Please check your inbox and spam folder.
          </p>

          <Link
            to="/login"
            className="inline-block mt-4 text-[#00684A] font-semibold hover:underline"
          >
            Go to Login
          </Link>
        </div>
      </section>
    );
  }

  /* ======================================================
     REGISTER FORM
  ====================================================== */
  return (
    <section className="min-h-screen flex items-center justify-center bg-[#F9FBFA] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1A1C1E]">
            Create your Plato account
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Start managing your restaurant brand
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Restaurant Owner"
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="owner@restaurant.com"
          />

          <PasswordInput
            label="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            show={showPassword}
            toggle={() => setShowPassword((v) => !v)}
          />

          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            show={showConfirm}
            toggle={() => setShowConfirm((v) => !v)}
          />

          <button
            disabled={!isValid || loading}
            className={`w-full py-2.5 rounded-xl font-semibold transition
              ${
                isValid
                  ? "bg-[#00684A] hover:bg-[#00553D] text-white"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#00684A] hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}

/* ===========================
   REUSABLE INPUTS
=========================== */

function Input({ label, ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-2.5 border rounded-lg
        focus:outline-none focus:ring-2 focus:ring-[#00684A]/30"
      />
    </div>
  );
}

function PasswordInput({ label, show, toggle, ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          {...props}
          type={show ? "text" : "password"}
          className="w-full px-4 py-2.5 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-[#00684A]/30"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-3 text-gray-500"
        >
          {show ? <FaRegEyeSlash /> : <FaRegEye />}
        </button>
      </div>
    </div>
  );
}
