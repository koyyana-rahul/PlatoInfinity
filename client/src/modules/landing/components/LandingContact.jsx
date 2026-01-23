import { FiGithub, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { useState } from "react";

const LandingContact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <section id="contact" className="py-12 sm:py-16 md:py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Get In Touch
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-400">
            Have questions? We'd love to hear from you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
          {/* Contact Form */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 sm:p-5 md:p-6 lg:p-8 border border-slate-700">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6">
              Send us a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-emerald-500 focus:outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-emerald-500 focus:outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="How can we help?"
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-emerald-500 focus:outline-none transition text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Your message here..."
                  rows="4"
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-emerald-500 focus:outline-none transition resize-none text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-semibold transition text-sm sm:text-base"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 sm:p-5 md:p-6 lg:p-8 border border-slate-700">
              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <FiMail className="w-5 sm:w-6 h-5 sm:h-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold mb-0.5 sm:mb-1 text-sm sm:text-base">
                    Email Support
                  </h4>
                  <p className="text-slate-400 text-xs sm:text-sm">
                    support@platoinf.com
                  </p>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5 sm:mt-1">
                    Response within 24 hours
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 sm:p-5 md:p-6 lg:p-8 border border-slate-700">
              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <FiPhone className="w-5 sm:w-6 h-5 sm:h-6 text-cyan-400" />
                </div>
                <div>
                  <h4 className="font-bold mb-0.5 sm:mb-1 text-sm sm:text-base">
                    Phone Support
                  </h4>
                  <p className="text-slate-400 text-xs sm:text-sm">
                    +1 (555) 123-4567
                  </p>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5 sm:mt-1">
                    Monday - Friday, 9AM - 6PM EST
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 sm:p-5 md:p-6 lg:p-8 border border-slate-700">
              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="w-5 sm:w-6 h-5 sm:h-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-bold mb-0.5 sm:mb-1 text-sm sm:text-base">
                    Address
                  </h4>
                  <p className="text-slate-400 text-xs sm:text-sm">
                    123 Tech Street
                  </p>
                  <p className="text-slate-400 text-xs sm:text-sm">
                    San Francisco, CA 94103
                  </p>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5 sm:mt-1">
                    USA
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 sm:p-5 md:p-6 lg:p-8 border border-slate-700">
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">
                Follow Us
              </h4>
              <div className="flex gap-2 sm:gap-3">
                <a
                  href="#"
                  className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg bg-slate-700 hover:bg-emerald-500 flex items-center justify-center transition text-sm"
                >
                  <FiGithub className="w-4 sm:w-5 h-4 sm:h-5" />
                </a>
                <button className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg bg-slate-700 hover:bg-emerald-500 flex items-center justify-center transition text-sm">
                  f
                </button>
                <button className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg bg-slate-700 hover:bg-emerald-500 flex items-center justify-center transition text-sm">
                  𝕏
                </button>
                <button className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg bg-slate-700 hover:bg-emerald-500 flex items-center justify-center transition text-xs sm:text-sm">
                  in
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingContact;
