import {
  Crown,
  Users,
  ChefHat,
  Utensils,
  User,
  TrendingUp,
  Lock,
  AlertCircle,
  Zap,
  CheckCircle,
} from "lucide-react";

/**
 * LandingFeatures Component
 *
 * Explanation:
 * - Three problems section: Addresses key pain points in restaurant operations (Kitchen Chaos, Fraud, No Accountability)
 * - Six core features showing direct solutions to identified problems
 * - Five roles section: Detailed benefits for each stakeholder (Owner, Manager, Chef, Waiter, Customer)
 * - Each role includes advantages array (specific benefits) and challenges (honest challenges)
 * - Color-coded cards help visual differentiation and memorability
 * - Key Insight box explains the systemic value - it's not just features, it's an OS
 * - Uses Lucide icons for consistent, professional appearance throughout
 */

const roles = [
  {
    title: "Brand Admin (Owner)",
    subtitle: "Total Control",
    icon: Crown,
    color: "from-purple-600 to-purple-400",
    advantages: [
      "Real-time sales dashboard across all branches",
      "Master Menu consistency for entire chain",
      "Full accountability and staff tracking",
      "Fraud detection and prevention",
    ],
    challenges: "System dependency for entire business",
  },
  {
    title: "Branch Manager",
    subtitle: "End the Chaos",
    icon: Users,
    color: "from-orange-600 to-orange-400",
    advantages: [
      "Smart kitchen routing eliminates confusion",
      "Timestamps prove staff accountability",
      "Real-time prank order detection",
      "Clear performance metrics for team",
    ],
    challenges: "First-line support for technical issues",
  },
  {
    title: "Chef",
    subtitle: "Clarity & Speed",
    icon: ChefHat,
    color: "from-red-600 to-red-400",
    advantages: [
      "Clean digital list of orders only for their station",
      "No more shouting or confusing paper tickets",
      "Ready timestamps prove their speed",
      "Reduced stress with organized workflow",
    ],
    challenges: "PIN entry during peak rush hours",
  },
  {
    title: "Waiter",
    subtitle: "Fair & Transparent",
    icon: Utensils,
    color: "from-blue-600 to-blue-400",
    advantages: [
      "Fair pickup alerts for all staff",
      "Timestamps prove their service speed",
      "Professional table PIN system",
      "Instant second-order capability",
    ],
    challenges: "Full transparency of cash handling",
  },
  {
    title: "Customer",
    subtitle: "Speed & Simplicity",
    icon: User,
    color: "from-green-600 to-green-400",
    advantages: [
      "No account creation required",
      "Instant second orders without waiting",
      "See real-time running tab",
      "Secure one-time table PIN system",
    ],
    challenges: "Requires phone and app browsing",
  },
];

const coreFeatures = [
  {
    icon: Zap,
    title: "Smart Kitchen Routing",
    description:
      "Orders automatically route to correct stations (e.g., drinks to bar, paneer tikka to tandoor)",
  },
  {
    icon: Lock,
    title: "Fraud Prevention",
    description:
      "One-time table PIN stops external fraud + quantity limits stop prank orders",
  },
  {
    icon: AlertCircle,
    title: "Suspicious Order Detection",
    description:
      "System flags unusual orders (e.g., 50x items) for manager approval",
  },
  {
    icon: CheckCircle,
    title: "Full Accountability",
    description:
      "Every action (ready, served, paid) is timestamped and attributed to staff",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Analytics",
    description:
      "Track sales, staff performance, and order accuracy across all branches",
  },
  {
    icon: Users,
    title: "Unified Team Management",
    description:
      "Manage all staff roles with automated PIN generation and role assignments",
  },
];

const LandingFeatures = () => {
  return (
    <>
      {/* ============================================================
           CORE FEATURES SECTION
           Shows the three main problems and six core features that solve them
           Pedagogical approach: Problem → Solution via Features
          ============================================================ */}
      <section
        id="features"
        className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-orange-50/30"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header: Clear problem statement */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              The Three Problems We Solve
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Every restaurant faces kitchen chaos, fraud risks, and
              accountability gaps. Plato OS replaces them with systematic
              control, security, and transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {/* Problem 1 */}
            <div className="bg-white rounded-2xl border-2 border-red-200 p-8 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Kitchen Chaos
              </h3>
              <p className="text-gray-600">
                Wrong orders going to wrong stations, drinks at tandoor,
                confusion and delays
              </p>
            </div>

            {/* Problem 2 */}
            <div className="bg-white rounded-2xl border-2 border-orange-200 p-8 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                <Lock className="text-orange-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fraud</h3>
              <p className="text-gray-600">
                Ghost orders from internet, prank orders (50x Biryani), fake
                bills, lost money
              </p>
            </div>

            {/* Problem 3 */}
            <div className="bg-white rounded-2xl border-2 border-blue-200 p-8 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Users className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                No Accountability
              </h3>
              <p className="text-gray-600">
                Blame game between staff, no proof of who did what, missing cash
                tracking
              </p>
            </div>
          </div>

          {/* Solutions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 hover:shadow-lg hover:border-orange-300 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center mb-4">
                    <Icon className="text-[#FC8019]" size={24} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ROLES & BENEFITS SECTION */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              The 5 Roles in Your Restaurant OS
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Each role gets what they need: transparency, control, speed, and
              accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-8 hover:border-gray-300 hover:shadow-xl transition-all duration-300"
                >
                  {/* Role Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className={`bg-gradient-to-br ${role.color} p-3 rounded-xl flex-shrink-0 shadow-md`}
                    >
                      <Icon className="text-white" size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {role.title}
                      </h3>
                      <p className="text-sm font-semibold text-gray-500 mt-1">
                        {role.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Advantages */}
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
                      ✅ Advantages
                    </h4>
                    <ul className="space-y-2">
                      {role.advantages.map((advantage, i) => (
                        <li
                          key={i}
                          className="text-gray-600 text-sm flex items-start gap-3"
                        >
                          <span className="text-[#FC8019] font-bold mt-0.5">
                            •
                          </span>
                          {advantage}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Challenge */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">
                      <strong>Challenge:</strong> {role.challenges}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Key Insight */}
          <div className="mt-16 bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-[#FC8019] rounded-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              💡 The Real Magic
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Every role gets transparency they didn't have before. The Chef
              knows exactly who picked up their food and when. The Waiter knows
              if the order is ready. The Customer can see their running tab. The
              Manager has proof of everything. The Owner sleeps better at night
              knowing there's control, not chaos.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingFeatures;
