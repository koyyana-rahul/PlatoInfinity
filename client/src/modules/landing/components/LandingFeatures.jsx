const features = [
  {
    title: "Contactless Ordering",
    description:
      "Guests can scan a QR code to view the menu and place orders from their own devices, minimizing contact and improving hygiene.",
    icon: (
      <svg
        className="w-8 h-8 text-indigo-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
        ></path>
      </svg>
    ),
  },
  {
    title: "Real-time Menu Updates",
    description:
      "Keep your menu updated in real-time, reflecting availability and price changes instantly. No more reprinting paper menus!",
    icon: (
      <svg
        className="w-8 h-8 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 4v5h5V4H4zm0 9h5v5H4v-5zm9-9h5v5h-5V4zm0 9h5v5h-5v-5z"
        ></path>
      </svg>
    ),
  },
  {
    title: "Seamless Payments",
    description:
      "Allow guests to pay their bills directly from their phones, supporting various payment methods for a smooth and quick checkout process.",
    icon: (
      <svg
        className="w-8 h-8 text-indigo-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        ></path>
      </svg>
    ),
  },
  {
    title: "Insightful Analytics",
    description:
      "Gain valuable insights into your sales, popular items, and customer behavior with our powerful analytics dashboard.",
    icon: (
      <svg
        className="w-8 h-8 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        ></path>
      </svg>
    ),
  },
  {
    title: "Staff Management",
    description:
      "Easily manage your staff, assign roles, and track their performance. Empower your team to provide the best service.",
    icon: (
      <svg
        className="w-8 h-8 text-indigo-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.28-1.25-1.43-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.28-1.25 1.43-1.857m0 0A5.002 5.002 0 0112 15a5.002 5.002 0 015.57 2.143M12 15v-3a2.5 2.5 0 00-2.5-2.5h-1A2.5 2.5 0 006 12v3"
        ></path>
      </svg>
    ),
  },
  {
    title: "Kitchen Display System",
    description:
      "Streamline your kitchen operations with a digital display that shows incoming orders in real-time, improving accuracy and reducing ticket times.",
    icon: (
      <svg
        className="w-8 h-8 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        ></path>
      </svg>
    ),
  },
];

const LandingFeatures = () => {
  return (
    <section id="features" className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
            Why Choose Plato Menu?
          </h3>
          <p className="mt-4 text-lg sm:text-xl text-gray-600">
            A complete solution to modernize your restaurant.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start mb-5">
                <div className="flex-shrink-0 bg-gradient-to-br from-indigo-50 to-blue-50 p-3 rounded-xl mr-4">
                  {feature.icon}
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900">
                  {feature.title}
                </h4>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
