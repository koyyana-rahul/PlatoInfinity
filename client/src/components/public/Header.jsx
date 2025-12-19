import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import useMobile from "../../hooks/useMobile";

export default function Header() {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState(null);
  const [isMobile] = useMobile();

  const toggleMobileSubmenu = (menu) => {
    setExpandedMobileMenu(expandedMobileMenu === menu ? null : menu);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#1A1C1E] text-[#FFF9F2]">
      <nav className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-[#E65F41]">
            Plato
          </Link>

          {/* Desktop Menu */}
          {!isMobile && (
            <>
              <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
                <li>
                  <Link to="/" className="hover:text-[#F4A261]">
                    Home
                  </Link>
                </li>

                {/* Product Dropdown */}
                <li
                  className="relative"
                  onMouseEnter={() => setOpenMenu("product")}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <button className="flex items-center gap-1 hover:text-[#F4A261]">
                    Product <ChevronDown size={16} />
                  </button>

                  {openMenu === "product" && (
                    <Dropdown>
                      <DropdownItem
                        title="QR Digital Menu"
                        desc="Scan & order from mobile"
                      />
                      <DropdownItem
                        title="Live Orders"
                        desc="Real-time kitchen updates"
                      />
                      <DropdownItem
                        title="Kitchen Display"
                        desc="Station-wise chef screen"
                      />
                      <DropdownItem
                        title="Billing & Payments"
                        desc="Auto bills & settlements"
                      />
                      <DropdownItem
                        title="Reports & Analytics"
                        desc="Sales & P&L insights"
                      />
                    </Dropdown>
                  )}
                </li>

                {/* How It Works Dropdown */}
                <li
                  className="relative"
                  onMouseEnter={() => setOpenMenu("how")}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <button className="flex items-center gap-1 hover:text-[#F4A261]">
                    How It Works <ChevronDown size={16} />
                  </button>

                  {openMenu === "how" && (
                    <Dropdown>
                      <DropdownItem
                        title="1. Create Account"
                        desc="Sign up as restaurant owner"
                      />
                      <DropdownItem
                        title="2. Create Brand"
                        desc="Your restaurant identity"
                      />
                      <DropdownItem
                        title="3. Add Branches"
                        desc="Manage multiple locations"
                      />
                      <DropdownItem
                        title="4. Assign Staff"
                        desc="Managers, waiters, chefs"
                      />
                      <DropdownItem
                        title="5. Build Menu"
                        desc="Master menu for all branches"
                      />
                    </Dropdown>
                  )}
                </li>

                <li>
                  <Link to="/about" className="hover:text-[#F4A261]">
                    About Us
                  </Link>
                </li>

                <li>
                  <Link to="/contact" className="hover:text-[#F4A261]">
                    Contact
                  </Link>
                </li>
              </ul>

              {/* CTA - Desktop */}
              <Link
                to="/register"
                className="bg-[#F4A261] text-[#1A1C1E] px-5 py-2 rounded-xl font-semibold hover:opacity-90"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#FFF9F2]"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobile && mobileMenuOpen && (
          <div className="pb-4 border-t border-[#FFF9F2]/20">
            <ul className="flex flex-col gap-4 text-sm font-medium py-4">
              <li>
                <Link
                  to="/"
                  className="hover:text-[#F4A261]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
              </li>

              {/* Product Mobile Dropdown */}
              <li>
                <button
                  onClick={() => toggleMobileSubmenu("product")}
                  className="flex items-center gap-1 w-full hover:text-[#F4A261]"
                >
                  Product{" "}
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      expandedMobileMenu === "product" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedMobileMenu === "product" && (
                  <div className="ml-4 mt-2 flex flex-col gap-3 border-l border-[#F4A261]/40 pl-4">
                    <MobileDropdownItem
                      title="QR Digital Menu"
                      desc="Scan & order from mobile"
                    />
                    <MobileDropdownItem
                      title="Live Orders"
                      desc="Real-time kitchen updates"
                    />
                    <MobileDropdownItem
                      title="Kitchen Display"
                      desc="Station-wise chef screen"
                    />
                    <MobileDropdownItem
                      title="Billing & Payments"
                      desc="Auto bills & settlements"
                    />
                    <MobileDropdownItem
                      title="Reports & Analytics"
                      desc="Sales & P&L insights"
                    />
                  </div>
                )}
              </li>

              {/* How It Works Mobile Dropdown */}
              <li>
                <button
                  onClick={() => toggleMobileSubmenu("how")}
                  className="flex items-center gap-1 w-full hover:text-[#F4A261]"
                >
                  How It Works{" "}
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      expandedMobileMenu === "how" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedMobileMenu === "how" && (
                  <div className="ml-4 mt-2 flex flex-col gap-3 border-l border-[#F4A261]/40 pl-4">
                    <MobileDropdownItem
                      title="1. Create Account"
                      desc="Sign up as restaurant owner"
                    />
                    <MobileDropdownItem
                      title="2. Create Brand"
                      desc="Your restaurant identity"
                    />
                    <MobileDropdownItem
                      title="3. Add Branches"
                      desc="Manage multiple locations"
                    />
                    <MobileDropdownItem
                      title="4. Assign Staff"
                      desc="Managers, waiters, chefs"
                    />
                    <MobileDropdownItem
                      title="5. Build Menu"
                      desc="Master menu for all branches"
                    />
                  </div>
                )}
              </li>

              <li>
                <Link
                  to="/about"
                  className="hover:text-[#F4A261]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="hover:text-[#F4A261]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </li>

              {/* CTA - Mobile */}
              <li>
                <Link
                  to="/register"
                  className="block bg-[#F4A261] text-[#1A1C1E] px-4 py-2 rounded-xl font-semibold hover:opacity-90 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}

/* ------------------ Reusable Components ------------------ */

function Dropdown({ children }) {
  return (
    <div className="absolute top-full left-0 mt-3 w-72 bg-[#FFF9F2] text-[#1A1C1E] rounded-xl shadow-xl p-3">
      {children}
    </div>
  );
}

function DropdownItem({ title, desc }) {
  return (
    <div className="p-3 rounded-lg hover:bg-[#F4A261]/20 cursor-pointer">
      <div className="font-semibold">{title}</div>
      <div className="text-xs text-gray-600">{desc}</div>
    </div>
  );
}

function MobileDropdownItem({ title, desc }) {
  return (
    <div className="py-2">
      <div className="font-semibold text-sm">{title}</div>
      <div className="text-xs text-[#FFF9F2]/70">{desc}</div>
    </div>
  );
}
