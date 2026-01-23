import {
  FiBarChart2,
  FiUsers,
  FiZap,
  FiSmartphone,
  FiLock,
  FiTrendingUp,
} from "react-icons/fi";
import { FiCheck } from "react-icons/fi";

const LandingFeatures = () => {
  return (
    <section
      id="features"
      className="py-12 sm:py-16 md:py-20 lg:py-32 bg-slate-900/50"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Powerful Features for Every Role
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto">
            Designed specifically for restaurants with dedicated dashboards for
            admins, managers, staff, and customers
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {/* Admin Features */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 sm:p-5 md:p-6 lg:p-8 border border-slate-700 hover:border-emerald-500 transition">
            <div className="mb-3 sm:mb-4">
              <div className="w-10 sm:w-11 md:w-12 h-10 sm:h-11 md:h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <FiBarChart2 className="w-5 sm:w-5.5 md:w-6 h-5 sm:h-5.5 md:h-6 text-emerald-400" />
              </div>
            </div>
            <h3 className="text-lg sm:text-lg md:text-lg lg:text-xl font-bold mb-2 sm:mb-3">
              Admin Dashboard
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-slate-300 text-xs sm:text-sm">
              <li className="flex gap-2">
                <FiCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                Real-time analytics & reports
              </li>
              <li className="flex gap-2">
                <FiCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                Multi-restaurant management
              </li>
              <li className="flex gap-2">
                <FiCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                Staff & manager oversight
              </li>
              <li className="flex gap-2">
                <FiCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                Revenue tracking & billing
              </li>
            </ul>
          </div>

          {/* Manager Features */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 sm:p-5 md:p-6 lg:p-8 border border-slate-700 hover:border-cyan-500 transition">
            <div className="mb-3 sm:mb-4">
              <div className="w-10 sm:w-11 md:w-12 h-10 sm:h-11 md:h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <FiUsers className="w-5 sm:w-5.5 md:w-6 h-5 sm:h-5.5 md:h-6 text-cyan-400" />
              </div>
            </div>
            <h3 className="text-lg sm:text-lg md:text-lg lg:text-xl font-bold mb-2 sm:mb-3">
              Manager Dashboard
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-slate-300 text-xs sm:text-sm">
              <li className="flex gap-2">
                <FiCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                Live order monitoring
              </li>
              <li className="flex gap-2">
                <FiCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                Advanced filtering & sorting
              </li>
              <li className="flex gap-2">
                <FiCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                Staff performance tracking
              </li>
              <li className="flex gap-2">
                <FiCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                Report generation & export
              </li>
            </ul>
          </div>

          {/* Staff Features */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 sm:p-5 md:p-6 lg:p-8 border border-slate-700 hover:border-blue-500 transition">
            <div className="mb-3 sm:mb-4">
              <div className="w-10 sm:w-11 md:w-12 h-10 sm:h-11 md:h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <FiZap className="w-5 sm:w-5.5 md:w-6 h-5 sm:h-5.5 md:h-6 text-blue-400" />
              </div>
            </div>
            <h3 className="text-lg sm:text-lg md:text-lg lg:text-xl font-bold mb-2 sm:mb-3">
              Staff Portal
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-slate-300 text-xs sm:text-sm">
              <li className="flex gap-2">
                <FiCheck className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                Chef kitchen queue system
              </li>
              <li className="flex gap-2">
                <FiCheck className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                Waiter order management
              </li>
              <li className="flex gap-2">
                <FiCheck className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                Cashier invoice system
              </li>
              <li className="flex gap-2">
                <FiCheck className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                Real-time alerts
              </li>
            </ul>
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-7 md:gap-8 mt-8 sm:mt-10 md:mt-12">
          <div className="flex gap-3 sm:gap-4">
            <div className="flex-shrink-0">
              <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <FiSmartphone className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                Mobile Friendly
              </h4>
              <p className="text-slate-400 text-xs sm:text-sm">
                Fully responsive design works seamlessly on all devices
              </p>
            </div>
          </div>

          <div className="flex gap-3 sm:gap-4">
            <div className="flex-shrink-0">
              <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <FiLock className="w-4 sm:w-5 h-4 sm:h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                Enterprise Security
              </h4>
              <p className="text-slate-400 text-xs sm:text-sm">
                Bank-grade encryption and secure data handling
              </p>
            </div>
          </div>

          <div className="flex gap-3 sm:gap-4">
            <div className="flex-shrink-0">
              <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <FiTrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                Analytics & Insights
              </h4>
              <p className="text-slate-400 text-xs sm:text-sm">
                Detailed reports to understand your business better
              </p>
            </div>
          </div>

          <div className="flex gap-3 sm:gap-4">
            <div className="flex-shrink-0">
              <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <FiZap className="w-4 sm:w-5 h-4 sm:h-5 text-orange-400" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                Real-time Sync
              </h4>
              <p className="text-slate-400 text-xs sm:text-sm">
                Instant updates across all devices and roles
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
