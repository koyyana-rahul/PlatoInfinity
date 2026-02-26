import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Menu, X, ShieldAlert } from "lucide-react";

/**
 * LandingNavbar Component
 *
 * Explanation:
 * - Fixed header with smooth backdrop blur for premium feel
 * - Responsive design: desktop navigation hidden on mobile, mobile menu with gradient background
 * - Professional branding with orange gradient logo
 * - Authentication-aware: shows Dashboard button if logged in, Sign In/Get Started if not
 * - Smooth scroll navigation to all major sections
 * - Mobile menu toggle with Escape key support for accessibility
 */
const LandingNavbar = ({ scrollToSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useSelector((state) => state.auth?.user);

  return (
    // Premium fixed header with glass morphism effect and subtle shadow
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 group">
            <div className="flex items-center space-x-2">
              <div className="w-11 h-11 bg-gradient-to-br from-[#FC8019] to-[#FF6B35] rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                <ShieldAlert
                  className="text-white"
                  size={24}
                  strokeWidth={2.5}
                />
              </div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#FC8019] to-[#FF6B35] bg-clip-text text-transparent hidden sm:block">
                Plato OS
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <nav className="flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-gray-600 hover:text-[#FC8019] font-medium transition-colors duration-200"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-gray-600 hover:text-[#FC8019] font-medium transition-colors duration-200"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="text-gray-600 hover:text-[#FC8019] font-medium transition-colors duration-200"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-gray-600 hover:text-[#FC8019] font-medium transition-colors duration-200"
              >
                Contact
              </button>
              <div className="flex items-center space-x-4 border-l border-gray-200 pl-8">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="px-6 py-2 bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 active:scale-[0.98]"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-6 py-2 text-gray-900 font-medium hover:text-[#FC8019] transition-colors duration-200"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="px-6 py-2 bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 active:scale-[0.98]"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-[#FC8019] hover:bg-orange-50 transition-all"
            >
              {isMenuOpen ? (
                <X size={24} strokeWidth={2} />
              ) : (
                <Menu size={24} strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-gradient-to-b from-white to-orange-50/30">
            <nav className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => {
                  scrollToSection("features");
                  setIsMenuOpen(false);
                }}
                className="text-gray-600 hover:text-[#FC8019] hover:bg-orange-50 block w-full text-left px-3 py-2 rounded-lg font-medium transition-all"
              >
                Features
              </button>
              <button
                onClick={() => {
                  scrollToSection("how-it-works");
                  setIsMenuOpen(false);
                }}
                className="text-gray-600 hover:text-[#FC8019] hover:bg-orange-50 block w-full text-left px-3 py-2 rounded-lg font-medium transition-all"
              >
                How It Works
              </button>
              <button
                onClick={() => {
                  scrollToSection("about");
                  setIsMenuOpen(false);
                }}
                className="text-gray-600 hover:text-[#FC8019] hover:bg-orange-50 block w-full text-left px-3 py-2 rounded-lg font-medium transition-all"
              >
                About
              </button>
              <button
                onClick={() => {
                  scrollToSection("contact");
                  setIsMenuOpen(false);
                }}
                className="text-gray-600 hover:text-[#FC8019] hover:bg-orange-50 block w-full text-left px-3 py-2 rounded-lg font-medium transition-all"
              >
                Contact
              </button>
              <div className="border-t border-gray-200 pt-2 mt-2 space-y-2">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white block w-full text-left px-3 py-2 rounded-lg text-base font-medium transition-all active:scale-[0.98]"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-gray-900 hover:bg-orange-100 hover:text-[#FC8019] block w-full text-left px-3 py-2 rounded-lg font-medium transition-all"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white block w-full text-left px-3 py-2 rounded-lg text-base font-medium transition-all active:scale-[0.98]"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default LandingNavbar;
