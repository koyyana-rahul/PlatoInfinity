import { useNavigate } from "react-router-dom";

const LandingCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-y border-slate-800">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6">
          Ready to Transform Your Restaurant?
        </h2>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8">
          Start your free 14-day trial today. No credit card required.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            onClick={() => navigate("/register")}
            className="px-6 sm:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-semibold transition transform hover:scale-105 text-sm sm:text-base"
          >
            Start Free Trial
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-6 sm:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg border border-slate-700 hover:border-emerald-500 hover:bg-slate-800 font-semibold transition text-sm sm:text-base"
          >
            Sign In
          </button>
        </div>
      </div>
    </section>
  );
};

export default LandingCTA;
