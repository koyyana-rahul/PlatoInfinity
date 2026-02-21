import { Link } from "react-router-dom";

const LandingCTA = () => {
  return (
    <section
      id="cta"
      className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-indigo-600 to-blue-600"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
          Ready to Elevate Your Restaurant?
        </h3>
        <p className="mt-6 text-lg sm:text-xl text-indigo-100 max-w-3xl mx-auto leading-relaxed">
          Join the growing number of restaurants that are delighting their
          customers and streamlining their operations with Plato Menu.
        </p>
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="bg-white text-indigo-600 px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-bold hover:bg-indigo-50 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 inline-block"
          >
            Get Started for Free
          </Link>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-bold transition-all duration-300 border border-white/30 active:scale-95 inline-block"
          >
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default LandingCTA;
