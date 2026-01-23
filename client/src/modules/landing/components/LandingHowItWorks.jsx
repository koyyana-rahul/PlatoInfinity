import { FiArrowRight } from "react-icons/fi";

const LandingHowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Startup & Setup",
      color: "emerald",
      points: [
        "Admin Registration: Restaurant owner creates account and verifies email",
        "Brand Creation: Set up restaurant details (name, address, contact)",
        "Restaurant Profile: Add compliance info (GST, FSSAI), billing details",
        "Admin Dashboard: Full access to all operations and analytics",
      ],
    },
    {
      number: 2,
      title: "Team Management",
      color: "cyan",
      points: [
        "Invite Managers: Admin invites restaurant managers with custom links",
        "Manager Access: Managers set password and get full operational dashboard",
        "Staff Management: Create chef, waiter, and cashier accounts",
        "Role-based Access: Each staff gets dedicated interface for their role",
      ],
    },
    {
      number: 3,
      title: "Menu & Table Setup",
      color: "purple",
      points: [
        "Master Menu: Admin creates global menu items with categories & pricing",
        "Branch Menu: Manager customizes branch specific items, availability",
        "Kitchen Stations: Setup station types (grill, fryer, pantry, etc)",
        "Tables: Create and configure dining tables with QR codes",
      ],
    },
    {
      number: 4,
      title: "Customer Ordering",
      color: "blue",
      points: [
        "QR Scanning: Customer scans table QR code to join session",
        "Browse Menu: View menu items with descriptions and prices",
        "Add to Cart: Select items, customize quantity and options",
        "Place Order: Submit order to kitchen directly from table",
      ],
    },
    {
      number: 5,
      title: "Real-time Order Processing",
      color: "orange",
      points: [
        "Chef Dashboard: Chefs see orders in real-time kitchen queue",
        "Preparation: Mark items as preparing, ready, and served",
        "Waiter Updates: Waiters receive notifications when orders ready",
        "Customer Alerts: Customers get real-time updates on their orders",
      ],
    },
    {
      number: 6,
      title: "Billing & Analytics",
      color: "red",
      points: [
        "Bill Generation: Cashier generates invoice with all items and taxes",
        "Payment Processing: Accept cash, card, or online payments",
        "Reports: Admin & managers view sales, staff, and item reports",
        "Analytics: Detailed insights on revenue, peak hours, popular items",
      ],
    },
  ];

  const colorMap = {
    emerald: "bg-emerald-500",
    cyan: "bg-cyan-500",
    purple: "bg-purple-500",
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
  };

  return (
    <section id="flow" className="py-12 sm:py-16 md:py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Complete Website Flow
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto">
            Understand how Plato Menu connects every part of your restaurant
          </p>
        </div>

        {/* Flow Steps */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 sm:p-5 md:p-6 lg:p-8 border border-slate-700"
            >
              <div className="flex items-start gap-3 sm:gap-4 md:gap-6">
                <div className="flex-shrink-0">
                  <div
                    className={`w-10 sm:w-11 md:w-12 h-10 sm:h-11 md:h-12 rounded-full ${colorMap[step.color]} flex items-center justify-center font-bold text-base sm:text-lg md:text-lg`}
                  >
                    {step.number}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-lg md:text-xl lg:text-2xl font-bold mb-2 sm:mb-3">
                    {step.title}
                  </h3>
                  <div className="space-y-1.5 sm:space-y-2 text-slate-300 text-xs sm:text-sm">
                    {step.points.map((point, idx) => (
                      <p key={idx}>
                        ✓ <strong>{point.split(":")[0]}:</strong>{" "}
                        {point.split(":")[1]}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Data Flow Diagram */}
        <div className="mt-8 sm:mt-12 md:mt-16 bg-slate-800/50 rounded-xl p-4 sm:p-5 md:p-6 lg:p-8 border border-slate-700">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 md:mb-8 text-center">
            System Architecture
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 md:gap-4 text-center">
            <div className="bg-slate-700 rounded-lg p-2 sm:p-3 md:p-4">
              <p className="text-xs sm:text-sm font-semibold text-emerald-400">
                Customers
              </p>
            </div>
            <div className="flex items-center justify-center">
              <FiArrowRight className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-slate-500" />
            </div>
            <div className="bg-slate-700 rounded-lg p-2 sm:p-3 md:p-4">
              <p className="text-xs sm:text-sm font-semibold text-cyan-400">
                Orders
              </p>
            </div>
            <div className="items-center justify-center hidden sm:flex">
              <FiArrowRight className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-slate-500" />
            </div>
            <div className="bg-slate-700 rounded-lg p-2 sm:p-3 md:p-4">
              <p className="text-xs sm:text-sm font-semibold text-blue-400">
                Kitchen
              </p>
            </div>
          </div>
          <div className="text-center mt-3 sm:mt-4 text-slate-400 text-xs sm:text-sm">
            ↓ Real-time Socket.io Sync ↓
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 text-center mt-3 sm:mt-4">
            <div className="bg-slate-700 rounded-lg p-2 sm:p-3 md:p-4">
              <p className="text-xs sm:text-sm font-semibold text-purple-400">
                Manager Dashboard
              </p>
            </div>
            <div className="bg-slate-700 rounded-lg p-2 sm:p-3 md:p-4">
              <p className="text-xs sm:text-sm font-semibold text-orange-400">
                Admin Stats
              </p>
            </div>
            <div className="bg-slate-700 rounded-lg p-2 sm:p-3 md:p-4">
              <p className="text-xs sm:text-sm font-semibold text-red-400">
                Cashier Bill
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHowItWorks;
