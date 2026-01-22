import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck, FiArrowRight, FiShield } from "react-icons/fi";

const BrandSuccess = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  // High-fidelity auto-redirect logic
  useEffect(() => {
    const duration = 3000; // 3 second transition
    const interval = 30; // 30ms resolution for smooth animation
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          navigate("/redirect");
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <section className="min-h-screen bg-[#FDFCFB] flex items-center justify-center px-4 py-12 animate-in fade-in duration-1000">
      <div className="max-w-md w-full relative">
        {/* ================= AMBIENT BACKGROUND ================= */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-100/20 blur-[120px] rounded-full pointer-events-none" />

        {/* ================= DYNAMIC SUCCESS TOKEN ================= */}
        <div className="flex justify-center mb-12 relative z-10">
          <div className="w-28 h-28 bg-white shadow-[0_25px_60px_rgba(16,185,129,0.12)] rounded-[40px] flex items-center justify-center border border-emerald-50 transition-transform hover:scale-105 duration-700">
            <div className="relative w-14 h-14 bg-emerald-500 rounded-[22px] shadow-inner flex items-center justify-center animate-in zoom-in spin-in-12 duration-1000 delay-300">
              <FiCheck className="text-white" size={32} strokeWidth={4} />
            </div>

            {/* Progress Ring Overlay */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
              <circle
                cx="50%"
                cy="50%"
                r="46%"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-emerald-50/50"
              />
              <circle
                cx="50%"
                cy="50%"
                r="46%"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="300"
                strokeDashoffset={300 - progress * 3}
                strokeLinecap="round"
                className="text-emerald-500 transition-all duration-75 ease-linear"
              />
            </svg>
          </div>
        </div>

        {/* ================= EXECUTIVE CONTENT CARD ================= */}
        <div className="relative z-10 bg-white rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.02)] border border-slate-50 p-10 sm:p-14 text-center transition-all">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border border-emerald-100 mb-8">
            <FiShield size={12} strokeWidth={2.5} /> System Validated
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none mb-5">
            Operational Ready
          </h1>

          <p className="text-sm font-medium text-slate-400 leading-relaxed mb-12 px-2">
            Your restaurant terminal is now synchronized with our cloud
            registry. Accessing your management dashboard.
          </p>

          <div className="space-y-6">
            <button
              onClick={() => navigate("/redirect")}
              className="group w-full bg-slate-900 text-white h-16 rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-2xl shadow-slate-200 hover:bg-emerald-600 active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-3"
            >
              Continue Manually
              <FiArrowRight
                className="group-hover:translate-x-1.5 transition-transform"
                strokeWidth={3}
              />
            </button>

            <div className="flex flex-col items-center gap-3">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] tabular-nums">
                Redirecting in {Math.max(0, Math.ceil(3 - progress / 33.3))}{" "}
                seconds
              </p>
              <div className="w-32 h-1 bg-slate-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-75 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================= SYSTEM FOOTER ================= */}
        <div className="mt-16 flex flex-col items-center opacity-30">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] mb-3">
            Terminal Registry Alpha-4
          </p>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-1 h-1 rounded-full ${progress / 33.3 >= i ? "bg-emerald-500" : "bg-slate-300"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandSuccess;
