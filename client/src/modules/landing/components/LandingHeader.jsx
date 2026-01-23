import { useState } from "react";
import { FiMenu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const LandingHeader = ({ scrollToSection }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuClose = () => setMobileMenuOpen(false);
  const handleNavClick = (sectionId) => {
    scrollToSection(sectionId);
    handleMenuClose();
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
      <nav className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2 font-bold text-lg sm:text-xl md:text-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          <FiMenu className="w-5 sm:w-6 md:w-7 h-5 sm:h-6 md:h-7 text-emerald-400" />
          <span className="hidden sm:inline">Plato Menu</span>
          <span className="sm:hidden">Plato</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-8">
          <button
            onClick={() => scrollToSection("hero")}
            className="text-xs xl:text-sm text-slate-300 hover:text-white transition"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection("features")}
            className="text-xs xl:text-sm text-slate-300 hover:text-white transition"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("flow")}
            className="text-xs xl:text-sm text-slate-300 hover:text-white transition"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection("about")}
            className="text-xs xl:text-sm text-slate-300 hover:text-white transition"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="text-xs xl:text-sm text-slate-300 hover:text-white transition"
          >
            Contact
          </button>
        </div>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-4">
          <button
            onClick={() => navigate("/login")}
            className="px-3 xl:px-6 py-1.5 xl:py-2 text-xs xl:text-sm rounded-lg text-slate-300 hover:text-white transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-3 xl:px-6 py-1.5 xl:py-2 text-xs xl:text-sm rounded-lg bg-emerald-500 hover:bg-emerald-600 transition font-semibold"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 hover:bg-slate-800 rounded-lg"
        >
          <FiMenu className="w-5 sm:w-6 h-5 sm:h-6" />
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur p-3 sm:p-4 space-y-2 sm:space-y-3">
          <button
            onClick={() => handleNavClick("hero")}
            className="block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-sm hover:bg-slate-800 rounded"
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick("features")}
            className="block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-sm hover:bg-slate-800 rounded"
          >
            Features
          </button>
          <button
            onClick={() => handleNavClick("flow")}
            className="block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-sm hover:bg-slate-800 rounded"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavClick("about")}
            className="block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-sm hover:bg-slate-800 rounded"
          >
            About
          </button>
          <button
            onClick={() => handleNavClick("contact")}
            className="block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-sm hover:bg-slate-800 rounded"
          >
            Contact
          </button>
          <div className="flex gap-2 pt-2 sm:pt-3">
            <button
              onClick={() => navigate("/login")}
              className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded border border-emerald-500 hover:bg-emerald-500/10 transition text-xs sm:text-sm"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-emerald-500 hover:bg-emerald-600 font-semibold text-xs sm:text-sm"
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingHeader;
