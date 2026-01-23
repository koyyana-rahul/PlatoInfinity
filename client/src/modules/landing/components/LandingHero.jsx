import {
  FiArrowRight,
  FiPlay,
  FiCheck,
  FiShoppingCart,
  FiUsers,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const LandingHero = ({ scrollToSection }) => {
  const navigate = useNavigate();

  return (
    <section
      id="hero"
      className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-32"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-4">
              <p className="text-sm sm:text-base md:text-lg text-emerald-400 font-semibold">
                🚀 Modern Restaurant Management
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Smart Menu System for
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  {" "}
                  Modern Restaurants
                </span>
              </h1>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed">
              Streamline your restaurant operations with real-time order
              management, kitchen coordination, and customer engagement. Join
              hundreds of restaurants transforming their business.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => navigate("/register")}
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-semibold flex items-center justify-center gap-2 transition transform hover:scale-105 text-sm sm:text-base"
              >
                Start Free Trial <FiArrowRight />
              </button>
              <button
                onClick={() => scrollToSection("flow")}
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg border border-slate-700 hover:border-emerald-500 hover:bg-slate-800 font-semibold flex items-center justify-center gap-2 transition text-sm sm:text-base"
              >
                <FiPlay className="w-4 sm:w-5 h-4 sm:h-5" /> Watch Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <FiCheck className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-400 flex-shrink-0" />
                14-day free trial
              </div>
              <div className="flex items-center gap-2">
                <FiCheck className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-400 flex-shrink-0" />
                No credit card needed
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-3xl opacity-20" />
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700 rounded-lg p-3 sm:p-4 h-20 sm:h-24 flex items-end justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="h-2 bg-emerald-400 rounded w-3/4" />
                      <div className="h-1 bg-slate-600 rounded w-1/2" />
                    </div>
                    <div className="flex gap-1">
                      <div className="w-1 h-10 sm:h-12 bg-emerald-400 rounded" />
                      <div className="w-1 h-6 sm:h-8 bg-emerald-500 rounded" />
                      <div className="w-1 h-14 sm:h-16 bg-emerald-600 rounded" />
                    </div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-center">
                    <div className="w-12 h-12 text-emerald-400">📊</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-center">
                    <div className="w-12 h-12 text-cyan-400">👥</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4 h-24 flex flex-col justify-between">
                    <div className="text-sm font-semibold text-slate-300">
                      Live Orders
                    </div>
                    <div className="text-2xl font-bold text-emerald-400">
                      24
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
