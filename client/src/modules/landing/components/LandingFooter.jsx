import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ShieldAlert,
} from "lucide-react";

/**
 * LandingFooter Component
 *
 * Explanation:
 * - Dark background (bg-gray-900) provides contrast with orange branding above
 * - Four-column layout: Brand story, Product links, Company links, Social media
 * - Brand column includes logo and brief description establishing credibility
 * - Product/Company links organize navigation for easy access
 * - Social icons use Lucide React with hover effects changing to orange
 * - Dynamic copyright year ensures freshness
 * - Scroll-to-section links for quick navigation back to key sections
 * - Professional footer structure matches Swiggy/Zomato patterns
 */
const LandingFooter = ({ scrollToSection }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Main Footer Content: 4 columns with organized information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Column: Establishes identity and credibility */}
          <div>
            {/* Logo and Brand Name */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-11 h-11 bg-gradient-to-br from-[#FC8019] to-[#FF6B35] rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                <ShieldAlert
                  className="text-white"
                  size={24}
                  strokeWidth={2.5}
                />
              </div>
              <div>
                <h4 className="text-lg font-bold bg-gradient-to-r from-[#FC8019] to-[#FF6B35] bg-clip-text text-transparent">
                  Plato OS
                </h4>
                <p className="text-xs text-gray-500 font-semibold">
                  Restaurant OS
                </p>
              </div>
            </div>
            {/* Brand Description */}
            <p className="text-gray-400 leading-relaxed text-sm">
              The complete operating system that replaces kitchen chaos with
              control, fraud with security, and blame with accountability for
              Indian restaurants.
            </p>
          </div>

          {/* Product Links Column */}
          <div>
            <h4 className="text-lg font-bold text-white mb-5">Product</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-gray-400 hover:text-[#FC8019] transition-colors duration-200 text-sm font-medium text-left"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="text-gray-400 hover:text-[#FC8019] transition-colors duration-200 text-sm font-medium text-left"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-gray-400 hover:text-[#FC8019] transition-colors duration-200 text-sm font-medium text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-gray-400 hover:text-[#FC8019] transition-colors duration-200 text-sm font-medium text-left"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Company Links Column */}
          <div>
            <h4 className="text-lg font-bold text-white mb-5">Company</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-gray-400 hover:text-[#FC8019] transition-colors duration-200 text-sm font-medium cursor-not-allowed opacity-50"
                  title="Coming Soon"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-gray-400 hover:text-[#FC8019] transition-colors duration-200 text-sm font-medium cursor-not-allowed opacity-50"
                  title="Coming Soon"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-gray-400 hover:text-[#FC8019] transition-colors duration-200 text-sm font-medium cursor-not-allowed opacity-50"
                  title="Coming Soon"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-gray-400 hover:text-[#FC8019] transition-colors duration-200 text-sm font-medium cursor-not-allowed opacity-50"
                  title="Coming Soon"
                >
                  Terms
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links Column */}
          <div>
            <h4 className="text-lg font-bold text-white mb-5">Follow Us</h4>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-[#FC8019] hover:bg-gray-700 transition-all duration-300"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-[#FC8019] hover:bg-gray-700 transition-all duration-300"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-[#FC8019] hover:bg-gray-700 transition-all duration-300"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-[#FC8019] hover:bg-gray-700 transition-all duration-300"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800"></div>

        {/* Bottom Bar: Copyright and additional links */}
        <div className="mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm font-medium">
            © {currentYear} Plato OS. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-gray-500 hover:text-[#FC8019] text-sm transition-colors cursor-not-allowed opacity-50"
              title="Coming Soon"
            >
              Status
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-gray-500 hover:text-[#FC8019] text-sm transition-colors cursor-not-allowed opacity-50"
              title="Coming Soon"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
