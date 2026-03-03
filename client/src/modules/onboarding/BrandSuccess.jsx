import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck, FiArrowRight, FiZap } from "react-icons/fi";

const BrandSuccess = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 3000; // 3 second transition
    const interval = 30;
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
    <section className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center px-4 py-12 animate-in fade-in duration-1000 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-200/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Success Icon */}
        <div className="flex justify-center mb-10 relative">
          <div className="relative">
            <div className="w-32 h-32 bg-white rounded-full shadow-2xl border-4 border-emerald-100 flex items-center justify-center animate-in zoom-in duration-700">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <FiCheck className="text-white" size={48} strokeWidth={3} />
              </div>
            </div>

            {/* Animated Badge */}
            <div className="absolute -top-2 -right-2 animate-pulse">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                ✓
              </div>
            </div>
          </div>
        </div>

        {/* Success Content Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 p-10 text-center space-y-6 animate-in slide-in-from-bottom duration-700">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wide border border-emerald-200">
            <FiZap size={14} />
            System Verified
          </div>

          {/* Main Heading */}
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2 leading-tight">
              Restaurant Ready!
            </h1>
            <p className="text-gray-600 text-base">
              Your restaurant is now live on our platform
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-3 my-6 pt-4 border-t border-gray-100">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-bold text-blue-900">📊 Complete</p>
              <p className="text-xs text-blue-700 mt-1">Profile Setup</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs font-bold text-green-900">⚡ Enabled</p>
              <p className="text-xs text-green-700 mt-1">Live Orders</p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => navigate("/redirect")}
            className="group w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-base uppercase tracking-wide shadow-xl hover:shadow-2xl hover:shadow-orange-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            Enter Dashboard
            <FiArrowRight
              className="group-hover:translate-x-2 transition-transform"
              size={20}
              strokeWidth={2.5}
            />
          </button>

          {/* Auto-Redirect Info */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Auto-redirecting in {Math.max(0, Math.ceil(3 - progress / 33.3))}s
            </p>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-75 ease-linear rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 space-y-2">
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  progress / 33.3 >= i ? "bg-emerald-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Restaurant Terminal Ready
          </p>
        </div>
      </div>
    </section>
  );
};

export default BrandSuccess;
