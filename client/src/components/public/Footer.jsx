import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative bg-[#1A1C1E] text-[#FFF9F2] overflow-hidden">
      {/* Subtle Background Accent */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#E65F41] opacity-[0.03] blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12 relative z-10">
        <div className="grid gap-12 md:grid-cols-12 mb-16">
          {/* ================= BRAND COLUMN ================= */}
          <div className="md:col-span-4">
            <h2 className="text-3xl font-black tracking-tighter italic text-[#E65F41] mb-6">
              Plato<span className="text-white">.</span>
            </h2>
            <p className="text-gray-400 font-medium leading-relaxed max-w-xs">
              The unified operating system for modern hospitality. Powering the
              next generation of dining experiences.
            </p>
            <div className="mt-8 flex gap-4">
              {/* Social Placeholders */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-[#E65F41]/50 transition-colors cursor-pointer"
                >
                  <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= LINKS COLUMNS ================= */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">
              Product
            </h4>
            <ul className="space-y-4 text-sm font-bold text-gray-400">
              <li>
                <Link to="/" className="hover:text-[#E65F41] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/features"
                  className="hover:text-[#E65F41] transition-colors"
                >
                  Platform
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="hover:text-[#E65F41] transition-colors"
                >
                  Enterprise
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-[#E65F41] transition-colors"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">
              Solutions
            </h4>
            <ul className="space-y-4 text-sm font-bold text-gray-400">
              <li className="cursor-default hover:text-white transition-colors">
                Multi-Branch Chains
              </li>
              <li className="cursor-default hover:text-white transition-colors">
                Cloud Kitchens
              </li>
              <li className="cursor-default hover:text-white transition-colors">
                Fine Dining OS
              </li>
              <li className="cursor-default hover:text-white transition-colors">
                QR Technology
              </li>
            </ul>
          </div>

          {/* ================= CTA COLUMN ================= */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#E65F41] mb-6">
              Join the Future
            </h4>
            <p className="text-sm font-medium text-gray-400 mb-6 leading-relaxed">
              Ready to digitize your restaurant brand? Setup takes less than 10
              minutes.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center w-full bg-white text-[#1A1C1E] px-6 py-3 rounded-xl font-black text-sm hover:bg-[#E65F41] hover:text-white transition-all duration-300 shadow-xl"
            >
              Create Brand Account
            </Link>
          </div>
        </div>

        {/* ================= BOTTOM BAR ================= */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
            © {new Date().getFullYear()} Plato Systems Inc. Built for Scale.
          </div>

          <div className="flex gap-8 text-[10px] font-black tracking-widest text-gray-500 uppercase">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
