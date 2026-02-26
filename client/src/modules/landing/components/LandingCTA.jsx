import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

/**
 * LandingCTA Component
 *
 * Explanation:
 * - Full-width gradient background (orange) dominates with high visual impact
 * - Decorative blur circles add visual depth and sophistication (Swiggy/Zomato style)
 * - Badge with "Limited Time Offer" creates urgency (psychological trigger)
 * - Large, bold headline speaks directly to converting: "Stop Running... Start..."
 * - Subheading reinforces transformation narrative and social proof
 * - Two CTAs: Primary action (high contrast) and secondary (subtle)
 * - Bottom callout with emojis and three key metrics makes offer tangible
 * - Perfect placement: last section before footer to capture interested users
 */
const LandingCTA = () => {
  return (
    <section
      id="cta"
      className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-[#FC8019] via-[#FF6B35] to-orange-600 relative overflow-hidden"
    >
      {/* Decorative blur elements for premium feel */}
      <div className="absolute top-10 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Badge: Creates urgency and highlights offer */}
        <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-2 mb-6 backdrop-blur-sm hover:bg-white/30 transition-colors">
          <Sparkles size={16} className="text-white" />
          <span className="text-sm font-semibold text-white">
            Limited Time Offer
          </span>
        </div>

        {/* Headline: Powerful transformation message */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
          Stop Running Your Restaurant on Hope
        </h2>

        {/* Subheading: Reinforces transformation and social proof */}
        <p className="text-lg sm:text-xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-10">
          Start running it on <strong>Control</strong>. Join restaurant chains
          across India who've replaced kitchen chaos with clarity, fraud with
          security, and blame with accountability. Your operating system awaits.
        </p>

        {/* CTA Buttons: Primary and Secondary actions */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
          <Link
            to="/register"
            className="bg-white text-[#FC8019] px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold hover:shadow-xl transition-all duration-300 shadow-lg active:scale-[0.98] inline-flex items-center gap-2 group"
          >
            Get Started for Free
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <button
            onClick={() => window.open("https://calendly.com", "_blank")}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold transition-all duration-300 border-2 border-white/50 active:scale-[0.98] hover:border-white"
          >
            Schedule Demo
          </button>
        </div>

        {/* Bottom Callout: Tangible benefits with metrics */}
        <p className="mt-10 text-white/90 font-medium text-base">
          🚀 <strong>5 minutes to setup</strong> • 🔒{" "}
          <strong>Instant fraud detection</strong> • 📊{" "}
          <strong>Real-time analytics</strong>
        </p>
      </div>
    </section>
  );
};

export default LandingCTA;
