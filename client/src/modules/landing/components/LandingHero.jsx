import { Link } from "react-router-dom";
import { ArrowRight, ChefHat, Zap } from "lucide-react";

/**
 * LandingHero Component
 *
 * Explanation:
 * - Hero section with compelling headline that speaks to restaurant pain points
 * - Decorative blur circles provide visual interest without clutter (design borrowed from Swiggy/Zomato)
 * - Badge introduces the core value proposition: "The Operating System for Restaurants"
 * - Main headline uses orange gradient for brand consistency
 * - Three key benefits presented as small indicators (Smart Kitchen Routing, Fraud Prevention, Full Accountability)
 * - Dual CTA: Primary "Start Free Trial" (high contrast) and secondary "See How It Works" (subtle call)
 * - Trust indicators section builds credibility with customer logos
 * - Responsive design with stacked layout on mobile, side-by-side on desktop
 */
const LandingHero = ({ scrollToSection }) => {
  return (
    <section
      id="hero"
      className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-[#FDFCFB] via-white to-orange-50/50 overflow-hidden pt-20"
    >
      {/* Decorative Background Blur Elements - Creates premium visual depth */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-[#FC8019]/10 to-[#FF6B35]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-5 w-96 h-96 bg-gradient-to-tr from-orange-100/20 to-orange-50/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 py-12 max-w-5xl mx-auto">
        {/* Badge: Introduces Core Concept */}
        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-2 mb-6 hover:bg-orange-100 transition-colors duration-300">
          <Zap size={16} className="text-[#FC8019]" />
          <span className="text-sm font-semibold text-[#FC8019]">
            The Operating System for Restaurants
          </span>
        </div>

        {/* Main Headline: Addresses Core Problem */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-gray-900">
          Stop the Chaos,
          <span className="block bg-gradient-to-r from-[#FC8019] to-[#FF6B35] bg-clip-text text-transparent">
            Start the Control
          </span>
        </h1>

        {/* Subheading: Clear Value Statement */}
        <p className="text-lg sm:text-xl md:text-2xl mb-5 max-w-3xl mx-auto text-gray-600 leading-relaxed">
          Replace kitchen chaos, fraud, and the blame game with a unified
          operating system that connects your Owner, Manager, Chef, Waiter, and
          Customer into one seamless experience.
        </p>

        {/* Key Benefits: Visual indicators of main advantages */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-10 text-gray-700">
          <div className="flex items-center gap-2 justify-center px-4 py-2 rounded-full bg-orange-50/50">
            <span className="w-2 h-2 rounded-full bg-[#FC8019]"></span>
            <span className="text-sm font-medium">Smart Kitchen Routing</span>
          </div>
          <div className="flex items-center gap-2 justify-center px-4 py-2 rounded-full bg-orange-50/50">
            <span className="w-2 h-2 rounded-full bg-[#FC8019]"></span>
            <span className="text-sm font-medium">Fraud Prevention</span>
          </div>
          <div className="flex items-center gap-2 justify-center px-4 py-2 rounded-full bg-orange-50/50">
            <span className="w-2 h-2 rounded-full bg-[#FC8019]"></span>
            <span className="text-sm font-medium">Full Accountability</span>
          </div>
        </div>

        {/* CTA Buttons: Primary and Secondary actions */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
          <Link
            to="/register"
            className="w-full sm:w-auto bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            Start Your Free Trial
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="w-full sm:w-auto bg-white/80 hover:bg-white border-2 border-gray-200 text-gray-900 px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold transition-all duration-300 hover:shadow-lg active:scale-[0.98] hover:border-[#FC8019]"
          >
            See How It Works
          </button>
        </div>

        {/* Trust Section: Social proof with restaurant logos */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-6 font-medium uppercase tracking-wider">
            Trusted by restaurant chains across India
          </p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-gray-500 font-semibold hover:text-[#FC8019] transition-colors"
              >
                <ChefHat size={20} className="text-orange-400" />
                <span>Restaurant {i}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
