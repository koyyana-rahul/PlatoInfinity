import {
  Settings,
  Users,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Zap,
  Clock,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Manager Setup",
    subtitle: "Configure Your Restaurant",
    description:
      "Manager maps kitchen routes: send 'Paneer Tikka' to Tandoor, 'Coke' to Bar. Creates staff PINs automatically.",
    icon: Settings,
    color: "from-blue-600 to-blue-400",
    benefit: "Smart Routing",
  },
  {
    number: "02",
    title: "Staff Clock-In",
    subtitle: "Authentication",
    description:
      "Waiter enters PIN 1122. Chef enters PIN 5566 at Tandoor tablet. All actions now tracked.",
    icon: Users,
    color: "from-purple-600 to-purple-400",
    benefit: "Full Attribution",
  },
  {
    number: "03",
    title: "Table Handshake",
    subtitle: "Customer Verification",
    description:
      "Customer sits at Table 5. System generates unique secure PIN 3456. Internet pranksters? Blocked.",
    icon: Smartphone,
    color: "from-green-600 to-green-400",
    benefit: "Fraud Stop",
  },
  {
    number: "04",
    title: "Smart Routing",
    subtitle: "Instant Orders",
    description:
      "Order arrives: Paneer Tikka → Tandoor tablet instantly. Coke → Bar tablet instantly. Zero confusion.",
    icon: Zap,
    color: "from-orange-600 to-orange-400",
    benefit: "Fast Lane",
  },
  {
    number: "05",
    title: "Fraud Detection",
    subtitle: "Suspicious Orders",
    description:
      "Prank order detected: 50x Biryani. System flags it. Manager gets alert. Approves or rejects.",
    icon: AlertTriangle,
    color: "from-red-600 to-red-400",
    benefit: "Smart Firewall",
  },
  {
    number: "06",
    title: "Real-Time Tracking",
    subtitle: "Every Action Logged",
    description:
      "Chef ready: 7:30 PM. Waiter served: 7:32 PM. 2-minute gap tracked. No accusations. Pure facts.",
    icon: Clock,
    color: "from-cyan-600 to-cyan-400",
    benefit: "Accountability",
  },
  {
    number: "07",
    title: "Cash Settlement",
    subtitle: "Transparent Billing",
    description:
      "Customer pays cash. Bill closed by 'ramesh-id'. Manager sees exact cash per staff. No mystery.",
    icon: DollarSign,
    color: "from-emerald-600 to-emerald-400",
    benefit: "Zero Loss",
  },
];

const LandingHowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-24 lg:py-32 bg-gradient-to-b from-white via-white to-orange-50/30"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 rounded-full px-4 py-2 mb-6">
            <Zap size={16} className="text-[#FC8019]" />
            <span className="text-sm font-semibold text-[#FC8019]">
              7-Step Process
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Watch the Magic Happen
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From manager setup to final payment. Watch how Plato OS transforms a
            chaotic meal into a perfectly orchestrated experience.
          </p>
        </div>

        {/* Desktop Timeline - Modern Card Layout */}
        <div className="hidden lg:block mb-20">
          <div className="grid grid-cols-7 gap-2 mb-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute top-14 left-1/2 w-full h-1 bg-gradient-to-r from-[#FC8019] to-[#FF6B35] -ml-1/2 z-0"></div>
                )}

                {/* Step Card */}
                <div className="relative z-10 text-center">
                  <div
                    className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg mb-4 hover:scale-110 transition-transform duration-300`}
                  >
                    {step.number}
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{step.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Cards Below Timeline */}
          <div className="grid grid-cols-7 gap-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border-2 border-gray-200 p-4 hover:border-[#FC8019] hover:shadow-lg transition-all duration-300 h-full flex flex-col group"
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="text-white" size={20} />
                  </div>

                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {step.subtitle}
                  </h4>

                  <p className="text-xs text-gray-600 leading-relaxed flex-1 mb-3">
                    {step.description}
                  </p>

                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <div className="w-2 h-2 rounded-full bg-[#FC8019]"></div>
                    <span className="text-xs font-semibold text-gray-700">
                      {step.benefit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile - Vertical Step-by-Step */}
        <div className="lg:hidden">
          <div className="space-y-6 relative">
            {/* Vertical Line */}
            <div className="absolute left-5 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FC8019] via-orange-400 to-[#FF6B35]"></div>

            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative pl-20">
                  {/* Step Number Badge */}
                  <div
                    className={`absolute left-0 top-0 w-11 h-11 rounded-full bg-gradient-to-br ${step.color} border-4 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm z-10`}
                  >
                    {index + 1}
                  </div>

                  {/* Content Card */}
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 hover:border-[#FC8019] hover:shadow-lg transition-all">
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`w-9 h-9 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-md`}
                      >
                        <Icon className="text-white" size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          {step.subtitle}
                        </h4>
                        <h3 className="text-base font-bold text-gray-900">
                          {step.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed mb-3 ml-12">
                      {step.description}
                    </p>

                    <div className="flex items-center gap-2 ml-12 pt-2 border-t border-gray-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FC8019]"></div>
                      <span className="text-xs font-semibold text-gray-700">
                        {step.benefit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Insight Section */}
        <div className="mt-20 bg-gradient-to-r from-[#FC8019]/10 to-[#FF6B35]/10 border-2 border-[#FC8019]/30 rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#FC8019]/20 flex items-center justify-center">
                  <CheckCircle className="text-[#FC8019]" size={24} />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  The Real Power
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Each step removes one layer of chaos. The Handshake PIN blocks
                fraud instantly. Smart routing eliminates kitchen confusion.
                Timestamps end the blame game completely.
              </p>
              <ul className="space-y-2">
                <li className="flex gap-2 items-start">
                  <span className="text-[#FC8019] font-bold mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">
                    No more ghost orders or prank orders
                  </span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-[#FC8019] font-bold mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">
                    Every action is tracked and attributed
                  </span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-[#FC8019] font-bold mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">
                    Complete transparency: no arguments, only facts
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#FC8019]/20 flex items-center justify-center">
                  <TrendingUp className="text-[#FC8019]" size={24} />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  Scaling Impact
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Got 1 branch? You have control. Adding 5 more? Same system, same
                control. This is how you scale without scaling chaos.
              </p>
              <ul className="space-y-2">
                <li className="flex gap-2 items-start">
                  <span className="text-[#FC8019] font-bold mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">
                    Owner sees real-time metrics from all branches
                  </span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-[#FC8019] font-bold mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">
                    Manager runs each branch with same playbook
                  </span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="text-[#FC8019] font-bold mt-0.5">✓</span>
                  <span className="text-gray-700 text-sm">
                    Staff accountability is consistent everywhere
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 font-medium mb-6">
            Ready to see this in your restaurant?
          </p>
          <div className="inline-flex gap-4 flex-col sm:flex-row">
            <a
              href="#contact"
              className="px-8 py-4 bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white rounded-xl font-bold transition-all duration-300 hover:shadow-lg active:scale-[0.98] inline-flex items-center justify-center gap-2"
            >
              <Zap size={20} />
              See It In Action
            </a>
            <button
              onClick={() => window.open("https://calendly.com", "_blank")}
              className="px-8 py-4 border-2 border-[#FC8019] text-[#FC8019] rounded-xl font-bold transition-all duration-300 hover:bg-orange-50 active:scale-[0.98]"
            >
              Schedule 15-Min Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHowItWorks;
