import { FiMenu } from "react-icons/fi";

const LandingFooter = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/50 py-8 sm:py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-bold text-base sm:text-lg mb-2 sm:mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              <FiMenu className="w-5 sm:w-6 h-5 sm:h-6 text-emerald-400" />
              Plato Menu
            </div>
            <p className="text-slate-400 text-xs sm:text-sm">
              Modern restaurant management system for the digital age.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-2 sm:mb-3 md:mb-4 text-sm md:text-base">
              Product
            </h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <a href="#features" className="hover:text-white transition">
                  Features
                </a>
              </li>
              <li>
                <a href="#flow" className="hover:text-white transition">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Security
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-2 sm:mb-3 md:mb-4 text-sm md:text-base">
              Company
            </h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <a href="#about" className="hover:text-white transition">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-2 sm:mb-3 md:mb-4 text-sm md:text-base">
              Legal
            </h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-white transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-slate-800 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-xs sm:text-sm">
          <p>&copy; 2026 Plato Menu. All rights reserved.</p>
          <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-0">
            <a href="#" className="hover:text-white transition">
              Twitter
            </a>
            <a href="#" className="hover:text-white transition">
              LinkedIn
            </a>
            <a href="#" className="hover:text-white transition">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
