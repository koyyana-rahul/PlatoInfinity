import { Link } from "react-router-dom";

const LandingHero = ({ scrollToSection }) => {
  return (
    <section
      id="hero"
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center pt-16"
      style={{
        backgroundImage:
          "url('https://source.unsplash.com/random/1600x900/?restaurant')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70"></div>
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 py-12 max-w-4xl mx-auto">
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
          The Future of Dining is Here
        </h2>
        <p className="text-lg sm:text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-gray-100 leading-relaxed">
          Experience seamless ordering, real-time menu updates, and effortless
          payments with Plato Menu. Elevate your restaurant's efficiency and
          delight your customers.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
          <Link
            to="/register"
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
          >
            Get Started
          </Link>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="w-full sm:w-auto bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white text-white px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-bold transition-all duration-300 hover:shadow-lg active:scale-95"
          >
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
