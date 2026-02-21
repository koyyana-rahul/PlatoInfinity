const steps = [
  {
    number: "01",
    title: "Set Up Your Menu",
    description:
      "Easily create and customize your digital menu with our intuitive dashboard. Add categories, items, descriptions, and images in minutes.",
  },
  {
    number: "02",
    title: "Generate QR Codes",
    description:
      "Generate unique QR codes for each of your tables. Customers can scan these codes with their smartphones to access the menu instantly.",
  },
  {
    number: "03",
    title: "Customers Order & Pay",
    description:
      "Customers browse the menu, place their orders, and pay directly from their devices. Orders are sent instantly to your kitchen.",
  },
  {
    number: "04",
    title: "Track & Analyze",
    description:
      "Monitor your sales, track your inventory, and gain valuable insights into your restaurant's performance through our analytics dashboard.",
  },
];

const LandingHowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 sm:py-24 lg:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get your restaurant online in 4 simple steps. No technical expertise
            required.
          </p>
        </div>

        {/* Desktop - Alternating Timeline */}
        <div className="hidden lg:block relative mb-12">
          {/* Center Line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 h-full bg-gradient-to-b from-indigo-600 via-blue-600 to-indigo-600"></div>

          <div className="space-y-0">
            {steps.map((step, index) => (
              <div key={index} className="relative py-16">
                <div
                  className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                >
                  {/* Content Card */}
                  <div
                    className={`w-5/12 ${index % 2 === 0 ? "pr-12 text-right" : "pl-12"}`}
                  >
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 group h-full flex flex-col justify-center">
                      <div
                        className={`flex items-center ${index % 2 === 0 ? "justify-end" : "justify-start"} mb-4`}
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                          {index + 1}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Center Dot */}
                  <div className="w-2/12 flex justify-center">
                    <div className="w-8 h-8 rounded-full bg-white border-4 border-indigo-600 shadow-lg relative z-10"></div>
                  </div>

                  {/* Empty Space */}
                  <div className="w-5/12"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile - Vertical Steps */}
        <div className="lg:hidden">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Vertical Line on Left */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-20 w-1 h-24 bg-gradient-to-b from-indigo-600 to-indigo-200"></div>
                )}

                <div className="flex gap-6">
                  {/* Step Circle */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="inline-flex gap-4 flex-col sm:flex-row">
            <button className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all duration-300 active:scale-95">
              Start Free Trial
            </button>
            <button className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-all duration-300">
              View Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHowItWorks;
