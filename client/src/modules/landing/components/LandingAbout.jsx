import { CheckCircle, AlertCircle, Lock } from "lucide-react";

/**
 * LandingAbout Component
 *
 * Explanation:
 * - Establishes credibility by clearly defining the problem (Kitchen Chaos, Fraud, No Accountability)
 * - Uses three problems with icon cards for visual hierarchy and easy scanning
 * - Presents the "Cost of Chaos" section to illustrate business impact
 * - Offers three solution pillars that directly address identified problems
 * - "Built for Indian Restaurants" section with localized features and checkmarks
 * - Uses alternating layout for visual variety and keeps content engaging
 * - Includes visual hierarchy and proper spacing matching Swiggy/Zomato design
 */
const LandingAbout = () => {
  return (
    <section id="about" className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Heading: Establishes What Plato OS Is */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            What is Plato OS?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A complete operating system for Indian restaurants that replaces
            chaos with control, fraud with security, and blame with
            accountability.
          </p>
        </div>

        {/* Core Concept: Problem Statement with Icon Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center mb-16">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              The Problem Every Restaurant Faces
            </h3>

            {/* Problem Cards with Icons and Explanations */}
            <div className="space-y-4 mb-8">
              {/* Problem 1: Kitchen Chaos */}
              <div className="flex gap-4">
                <AlertCircle
                  className="text-red-600 flex-shrink-0 mt-1 shadow-sm rounded-lg p-1 bg-red-50"
                  size={28}
                />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Kitchen Chaos
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Orders go to wrong stations. A drink order reaches the
                    tandoor. Everyone's yelling. Nothing is clear.
                  </p>
                </div>
              </div>

              {/* Problem 2: Fraud & Security */}
              <div className="flex gap-4">
                <Lock
                  className="text-orange-600 flex-shrink-0 mt-1 shadow-sm rounded-lg p-1 bg-orange-50"
                  size={28}
                />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Fraud & Prank Orders
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Internet pranksters order 50x Biryani as a joke. Ghost
                    orders appear from nowhere. Money vanishes.
                  </p>
                </div>
              </div>

              {/* Problem 3: No Accountability */}
              <div className="flex gap-4">
                <AlertCircle
                  className="text-blue-600 flex-shrink-0 mt-1 shadow-sm rounded-lg p-1 bg-blue-50"
                  size={28}
                />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    No Accountability
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Who served the food? Did the chef delay it? Did the waiter
                    pocket the cash? Everyone blames everyone.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed font-semibold">
              Most restaurants run on <span className="text-red-600">hope</span>{" "}
              (hoping staff doesn't steal) and{" "}
              <span className="text-red-600">chaos</span> (accepting confusion
              as normal).
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border-2 border-red-200 p-8 h-full flex flex-col justify-center">
            <p className="text-2xl font-bold text-gray-900 mb-4">
              The Real Cost of Chaos:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span className="text-gray-700">
                  Wasted food from prank orders
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span className="text-gray-700">
                  Missing cash from dishonest staff
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span className="text-gray-700">
                  Slow service from kitchen confusion
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span className="text-gray-700">
                  Low customer ratings due to delays
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span className="text-gray-700">
                  Manager stress from "blame game"
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span className="text-gray-700">
                  Can't scale to multiple branches safely
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* The Solution */}
        <div className="bg-gradient-to-r from-[#FC8019]/5 to-[#FF6B35]/5 border-2 border-[#FC8019]/20 rounded-2xl p-8 md:p-12 mb-16">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
            Our Solution: Replace Chaos with Control
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 border-2 border-green-200">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-3">Smart Routing</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Every order automatically goes to the correct station. Paneer
                Tikka → Tandoor. Coke → Bar. No confusion. No shouting.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-blue-200">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <Lock className="text-blue-600" size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-3">Fraud Prevention</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Table PIN stops internet pranksters. Quantity limits stop fake
                orders. Manager approves suspicious orders. No waste.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-orange-200">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                <CheckCircle className="text-[#FC8019]" size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-3">
                Full Accountability
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Every action timestamped. Chef ready at 7:30. Waiter served at
                7:32. Manager sees cash per staff. No blame game.
              </p>
            </div>
          </div>
        </div>

        {/* Why Buy Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="order-2 lg:order-1">
            <img
              src="https://source.unsplash.com/random/800x600/?restaurant,modern"
              alt="Plato OS Dashboard"
              className="rounded-2xl shadow-lg w-full h-auto border-2 border-[#FC8019]/20 hover:shadow-xl transition-all duration-300"
            />
          </div>

          <div className="order-1 lg:order-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Built for Indian Restaurants
            </h3>

            <p className="text-gray-700 mb-4 text-lg leading-relaxed">
              Plato OS was created by restaurant people, for restaurant people.
              We understand the Indian dining system: multiple kitchen stations,
              cash handling, large orders, real-time pressure.
            </p>

            <p className="text-gray-700 mb-4 text-lg leading-relaxed">
              We're not a QR code ordering system. We're not just a payment
              processor.{" "}
              <strong>
                We're the operating system that runs your entire restaurant.
              </strong>
            </p>

            <div className="space-y-3 mt-8">
              <div className="flex gap-3 items-start">
                <CheckCircle
                  className="text-[#FC8019] flex-shrink-0 mt-1"
                  size={20}
                />
                <div>
                  <p className="font-semibold text-gray-900">Unified Control</p>
                  <p className="text-gray-600 text-sm">
                    One dashboard for Owner, Manager, Chef, Waiter, Customer
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <CheckCircle
                  className="text-[#FC8019] flex-shrink-0 mt-1"
                  size={20}
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    Scales Instantly
                  </p>
                  <p className="text-gray-600 text-sm">
                    Add a new branch and manage it from the same system
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <CheckCircle
                  className="text-[#FC8019] flex-shrink-0 mt-1"
                  size={20}
                />
                <div>
                  <p className="font-semibold text-gray-900">Proven ROI</p>
                  <p className="text-gray-600 text-sm">
                    Reduce fraud losses, increase order speed, eliminate theft
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingAbout;
