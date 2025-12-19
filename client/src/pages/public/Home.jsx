import React from "react";
import { Link } from "react-router-dom";
import useMobile from "../../hooks/useMobile";

const Home = () => {
  const [isMobile] = useMobile();

  return (
    <div className="bg-[#FFF9F2] text-[#1A1C1E] min-h-screen font-sans selection:bg-[#E65F41] selection:text-white">
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-8 sm:pt-12 md:pt-16 lg:pt-28 pb-12 sm:pb-16 md:pb-20 lg:pb-32 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#E65F41_0.5px,transparent_0.5px)] bg-size-[24px_24px]"></div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7">
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full bg-[#E65F41]/10 border border-[#E65F41]/20 text-[#E65F41] text-xs font-bold uppercase tracking-widest mb-4 sm:mb-6 md:mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E65F41] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E65F41]"></span>
                </span>
                The Standard for Modern Dining
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight sm:leading-[1.1] lg:leading-[1.1] mb-4 sm:mb-6 tracking-tight">
                Run your <span className="text-[#E65F41]">Restaurant</span>{" "}
                better with Plato.
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-xl leading-relaxed mb-6 sm:mb-8 md:mb-10">
                A single, powerful platform for owners to control digital menus,
                QR ordering, and kitchen workflows across all branches.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  to="/register"
                  className="px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-[#E65F41] text-white rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:opacity-90 transition-all transform hover:-translate-y-1 shadow-lg shadow-[#E65F41]/20 text-center"
                >
                  Start Your Brand
                </Link>
                <a
                  href="#how-it-works"
                  className="px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-white border-2 border-[#1A1C1E] text-[#1A1C1E] rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:bg-[#1A1C1E] hover:text-white transition-all text-center"
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Feature Card Side */}
            <div className="lg:col-span-5 mt-8 sm:mt-10 md:mt-12 lg:mt-0">
              <div className="bg-white border border-gray-200 p-5 sm:p-6 md:p-8 lg:p-10 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-[#E65F41]/5 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
                <h3 className="text-[#1A1C1E] font-bold text-lg sm:text-xl md:text-2xl mb-5 sm:mb-6 md:mb-8 flex items-center gap-2 sm:gap-3">
                  <span className="w-8 sm:w-10 h-1 sm:h-1.5 bg-[#E65F41] rounded-full"></span>
                  Owner Control
                </h3>
                <ul className="space-y-3 sm:space-y-4 md:space-y-5">
                  {[
                    "Unified Brand Dashboard",
                    "Global Menu Management",
                    "Real-time Sales Analytics",
                    "Branch-wise Performance",
                    "Automated Staff Tracking",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 sm:gap-3 md:gap-4 text-gray-700 font-semibold text-sm sm:text-base md:text-lg"
                    >
                      <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-[#E65F41]/10 flex items-center justify-center shrink-0">
                        <svg
                          className="w-3 sm:w-4 h-3 sm:h-4 text-[#E65F41]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section
        id="how-it-works"
        className="py-12 sm:py-16 md:py-20 lg:py-24 px-3 sm:px-4 md:px-6 bg-white border-y border-gray-100"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4">
              How it Works
            </h2>
            <p className="text-gray-500 text-sm sm:text-base md:text-lg">
              From setup to scale in four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                step: "01",
                title: "Brand Identity",
                desc: "Define your global settings, taxes, and brand logos.",
              },
              {
                step: "02",
                title: "Setup Branches",
                desc: "Launch physical locations and sync them instantly.",
              },
              {
                step: "03",
                title: "Master Menu",
                desc: "Build once, deploy everywhere. Live updates to all QRs.",
              },
              {
                step: "04",
                title: "Full Visibility",
                desc: "Track every order, bill, and staff action in real-time.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="relative p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-[#FFF9F2] border border-transparent hover:border-[#E65F41]/20 transition-all group"
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-[#E65F41]/10 group-hover:text-[#E65F41]/20 transition-colors mb-3 sm:mb-4">
                  {item.step}
                </div>
                <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">
                  {item.title}
                </h4>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed">
                  {item.desc}
                </p>
                <div className="mt-4 sm:mt-5 md:mt-6 h-0.5 sm:h-1 w-8 bg-[#E65F41]/20 group-hover:w-full group-hover:bg-[#E65F41] transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ROLES SECTION - Manager Added ================= */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-3 sm:px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 sm:mb-12 md:mb-16 gap-4 sm:gap-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">
              Complete Ecosystem
            </h2>
            <div className="h-px hidden md:block flex-1 bg-gray-200 mx-10"></div>
            <p className="text-gray-500 font-medium text-xs sm:text-sm md:text-base">
              One system, multiple interfaces.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {[
              "Owner Dashboard",
              "Branch Manager",
              "Waiter App",
              "Chef Display",
              "Customer QR",
            ].map((role) => (
              <div
                key={role}
                className="group bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl lg:rounded-4xl border border-gray-100 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-[#FFF9F2] rounded-lg sm:rounded-xl md:rounded-2xl mx-auto mb-4 sm:mb-5 md:mb-6 flex items-center justify-center group-hover:bg-[#E65F41] transition-colors shadow-sm">
                  <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-[#E65F41] rounded-full group-hover:bg-white transition-colors"></div>
                </div>
                <h4 className="font-bold text-sm sm:text-base md:text-lg text-[#1A1C1E]">
                  {role}
                </h4>
                <p className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest text-gray-400 mt-1.5 sm:mt-2 font-bold group-hover:text-[#E65F41] transition-colors">
                  Standard Module
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-3 sm:px-4 md:px-6 mb-10 sm:mb-16 md:mb-20">
        <div className="max-w-6xl mx-auto bg-[#1A1C1E] rounded-3xl sm:rounded-[2.5rem] md:rounded-[3rem] lg:rounded-[3.5rem] p-6 sm:p-8 md:p-12 lg:p-24 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-60 sm:w-80 h-60 sm:h-80 bg-[#E65F41] opacity-10 rounded-full -mr-20 sm:-mr-40 -mt-20 sm:-mt-40"></div>
          <div className="absolute bottom-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-white opacity-[0.03] rounded-full -ml-24 sm:-ml-32 -mb-24 sm:-mb-32"></div>

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 md:mb-8 lg:mb-8 tracking-tight leading-tight sm:leading-tight">
              Ready to take full{" "}
              <span className="text-[#E65F41]">control?</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed px-3 sm:px-0">
              Join the new generation of restaurant owners using Plato to
              simplify operations and increase revenue.
            </p>
            <Link
              to="/register"
              className="inline-block px-6 sm:px-8 md:px-10 lg:px-12 py-3 sm:py-3.5 md:py-4 lg:py-5 bg-[#E65F41] text-white rounded-lg sm:rounded-xl md:rounded-2xl font-black text-sm sm:text-base md:text-lg lg:text-2xl hover:scale-105 transition-transform shadow-2xl shadow-[#E65F41]/40"
            >
              Create Your Restaurant Brand
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
