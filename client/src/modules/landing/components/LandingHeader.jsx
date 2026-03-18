import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const LandingHeader = ({ scrollToSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoLoadError, setLogoLoadError] = useState(false);
  const user = useSelector((state) => state.auth.user);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="flex items-center space-x-2">
              {logoLoadError ? (
                <div className="w-10 h-10 bg-gradient-to-br from-[#FC8019] to-[#FF6B35] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
              ) : (
                <img
                  src="/plato.png"
                  alt="Plato Logo"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-contain"
                  loading="eager"
                  onError={() => setLogoLoadError(true)}
                />
              )}
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
                Plato Menu
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <nav className="flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
              >
                Contact
              </button>
              <div className="flex items-center space-x-4 border-l border-gray-200 pl-8">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-6 py-2 text-gray-900 font-medium hover:text-indigo-600 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
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
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-indigo-600 hover:bg-gray-100"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16m-7 6h7"
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100">
            <nav className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => {
                  scrollToSection("features");
                  setIsMenuOpen(false);
                }}
                className="text-gray-600 hover:text-indigo-600 hover:bg-gray-50 block w-full text-left px-3 py-2 rounded-md font-medium"
              >
                Features
              </button>
              <button
                onClick={() => {
                  scrollToSection("how-it-works");
                  setIsMenuOpen(false);
                }}
                className="text-gray-600 hover:text-indigo-600 hover:bg-gray-50 block w-full text-left px-3 py-2 rounded-md font-medium"
              >
                How It Works
              </button>
              <button
                onClick={() => {
                  scrollToSection("about");
                  setIsMenuOpen(false);
                }}
                className="text-gray-600 hover:text-indigo-600 hover:bg-gray-50 block w-full text-left px-3 py-2 rounded-md font-medium"
              >
                About
              </button>
              <button
                onClick={() => {
                  scrollToSection("contact");
                  setIsMenuOpen(false);
                }}
                className="text-gray-600 hover:text-indigo-600 hover:bg-gray-50 block w-full text-left px-3 py-2 rounded-md font-medium"
              >
                Contact
              </button>
              <div className="border-t border-gray-100 pt-2 mt-2 space-y-2">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-gray-900 hover:bg-gray-100 block w-full text-left px-3 py-2 rounded-md font-medium"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium"
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

export default LandingHeader;
