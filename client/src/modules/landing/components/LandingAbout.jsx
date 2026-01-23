import { FiCheck } from "react-icons/fi";

const LandingAbout = () => {
  return (
    <section
      id="about"
      className="py-12 sm:py-16 md:py-20 lg:py-32 bg-slate-900/50"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6">
              About Plato Menu
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-300 mb-2 sm:mb-3 md:mb-4">
              Plato Menu is a modern, comprehensive restaurant management system
              built for the challenges of today's dining industry. We combine
              cutting-edge technology with practical restaurant operations
              knowledge.
            </p>
            <p className="text-sm sm:text-base md:text-lg text-slate-300 mb-4 sm:mb-5 md:mb-6">
              Our platform connects every part of your restaurant - from
              customers scanning QR codes at tables to chefs managing kitchen
              operations to managers monitoring real-time analytics.
            </p>

            <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
              <div className="flex gap-2 sm:gap-3">
                <FiCheck className="w-5 sm:w-6 h-5 sm:h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">
                    Founded with Purpose
                  </h4>
                  <p className="text-slate-400 text-xs sm:text-sm">
                    Built by restaurant experts and technology innovators
                  </p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <FiCheck className="w-5 sm:w-6 h-5 sm:h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">
                    Trusted by Restaurants
                  </h4>
                  <p className="text-slate-400 text-xs sm:text-sm">
                    Used by hundreds of restaurants globally
                  </p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <FiCheck className="w-5 sm:w-6 h-5 sm:h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">
                    Always Improving
                  </h4>
                  <p className="text-slate-400 text-xs sm:text-sm">
                    Regular updates and new features based on customer feedback
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-7 md:mt-8 grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
              <div className="text-center p-2 sm:p-3 md:p-4 bg-slate-800 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-emerald-400">
                  500+
                </div>
                <p className="text-xs sm:text-sm text-slate-400">Restaurants</p>
              </div>
              <div className="text-center p-2 sm:p-3 md:p-4 bg-slate-800 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-cyan-400">
                  50K+
                </div>
                <p className="text-xs sm:text-sm text-slate-400">
                  Daily Orders
                </p>
              </div>
              <div className="text-center p-2 sm:p-3 md:p-4 bg-slate-800 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-purple-400">
                  99.9%
                </div>
                <p className="text-xs sm:text-sm text-slate-400">Uptime</p>
              </div>
            </div>
          </div>

          {/* Right Content - Values */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 sm:p-5 md:p-6 lg:p-8 border border-slate-700">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4\">
                Our Mission
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-slate-300\">
                Empower restaurants of all sizes with intelligent technology
                that simplifies operations, enhances customer experience, and
                drives profitability.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 sm:p-5 md:p-6 lg:p-8 border border-slate-700\">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4\">
                Our Values
              </h3>
              <div className="space-y-1.5 sm:space-y-2 md:space-y-3 text-xs sm:text-sm md:text-base text-slate-300\">
                <p>
                  <strong>Innovation:</strong> Constantly evolving with industry
                  needs
                </p>
                <p>
                  <strong>Reliability:</strong> Enterprise-grade stability
                </p>
                <p>
                  <strong>Support:</strong> Dedicated customer success team
                </p>
                <p>
                  <strong>Security:</strong> Your data is protected
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 sm:p-5 md:p-6 lg:p-8 border border-slate-700\">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4\">
                Technology Stack
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-slate-300 mb-3 sm:mb-4\">
                Built on modern, scalable technologies:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 md:gap-2 text-xs sm:text-sm text-slate-400\">
                <p>✓ React 19 Frontend</p>
                <p>✓ Node.js Backend</p>
                <p>✓ MongoDB Database</p>
                <p>✓ Socket.io Real-time</p>
                <p>✓ Tailwind CSS</p>
                <p>✓ JWT Security</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingAbout;
