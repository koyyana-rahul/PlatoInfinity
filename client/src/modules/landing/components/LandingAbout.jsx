const LandingAbout = () => {
  return (
    <section id="about" className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
            About Plato Menu
          </h3>
          <p className="mt-4 text-lg sm:text-xl text-gray-600">
            We are passionate about helping restaurants thrive in the digital
            age.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="order-2 lg:order-1">
            <img
              src="https://source.unsplash.com/random/800x600/?restaurant,team"
              alt="Plato Menu Team"
              className="rounded-2xl shadow-lg w-full h-auto border border-gray-200 hover:shadow-xl transition-shadow duration-300"
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-gray-700 mb-6 text-lg leading-relaxed">
              Plato Menu was born from a simple idea: to make dining out a more
              enjoyable and efficient experience for both customers and
              restaurant owners. We saw the challenges faced by the industry,
              from outdated paper menus to long wait times for ordering and
              payment.
            </p>
            <p className="text-gray-700 mb-6 text-lg leading-relaxed">
              Our team of experienced developers, designers, and restaurant
              enthusiasts came together to create a solution that is powerful,
              easy to use, and affordable for businesses of all sizes.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              We are committed to continuously improving our platform and
              providing exceptional support to our partners. Join us on our
              mission to revolutionize the restaurant industry.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingAbout;
