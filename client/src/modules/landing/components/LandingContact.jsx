import { useState } from "react";
import { Mail, Phone, MapPin, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

/**
 * LandingContact Component
 *
 * Explanation:
 * - Three contact info cards provide multiple ways to reach support (Phone, Email, Location)
 * - Professional form with validation and form state management
 * - Toast notifications provide immediate user feedback on submission
 * - Form states: default, submitting (loading), success (confirmation)
 * - All inputs follow design system standards (h-11 height, rounded-xl, orange focus)
 * - Responsive layout: stacked on mobile, three columns on desktop
 * - Success state shows CheckCircle confirmation ensuring good UX
 * - Form handles async submission with proper error handling
 */
const LandingContact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send contact form data to backend
      const response = await fetch("/api/public/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
        toast.success(
          data.message ||
            "Message sent successfully! We'll get back to you within 24 hours.",
        );
        setFormData({ name: "", email: "", phone: "", message: "" });

        setTimeout(() => {
          setIsSubmitted(false);
        }, 3000);
      } else {
        throw new Error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error(
        error.message ||
          "Failed to send message. Please try again or contact us directly at platomenu3@gmail.com",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-orange-50/30"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Clear CTA for getting in touch */}
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get In Touch
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ready to transform your restaurant? Have questions about Plato OS?
            Our team is here to help. Reach out and let's start your journey to
            operational excellence.
          </p>
        </div>

        {/* Contact Info Cards: Multiple touchpoints for customer convenience */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Call Us Card */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-[#FC8019] hover:shadow-lg transition-all duration-300 group">
            <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
              <Phone className="text-[#FC8019]" size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Call Us</h3>
            <p className="text-gray-600 mb-2 text-sm">Monday to Friday</p>
            <p className="text-lg font-semibold text-[#FC8019]">
              +91 7893780667
            </p>
          </div>

          {/* Email Card */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-[#FC8019] hover:shadow-lg transition-all duration-300 group">
            <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
              <Mail className="text-[#FC8019]" size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
            <p className="text-gray-600 mb-2 text-sm">
              We'll respond within 24 hours
            </p>
            <p className="text-lg font-semibold text-[#FC8019]">
              platomenu3@gmail.com
            </p>
          </div>

          {/* Location Card */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-[#FC8019] hover:shadow-lg transition-all duration-300 group">
            <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
              <MapPin className="text-[#FC8019]" size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Visit Us</h3>
            <p className="text-gray-600 mb-2">Bangalore, India</p>
            <p className="text-lg font-semibold text-gray-900">Plato HQ</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border-2 border-gray-200 p-8 sm:p-12 hover:border-[#FC8019]/50 transition-all">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-900 mb-3"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="block w-full bg-white border-2 border-gray-200 rounded-xl py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FC8019]/40 focus:border-[#FC8019] transition-all h-11"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-gray-900 mb-3"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876-5432-10"
                  className="block w-full bg-white border-2 border-gray-200 rounded-xl py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FC8019]/40 focus:border-[#FC8019] transition-all h-11"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-900 mb-3"
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
                className="block w-full bg-white border-2 border-gray-200 rounded-xl py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FC8019]/40 focus:border-[#FC8019] transition-all h-11"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-semibold text-gray-900 mb-3"
              >
                Message
              </label>
              <textarea
                name="message"
                id="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Tell us about your restaurant and how we can help..."
                className="block w-full bg-white border-2 border-gray-200 rounded-xl py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FC8019]/40 focus:border-[#FC8019] transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#FC8019] to-[#FF6B35] hover:shadow-lg text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : isSubmitted ? (
                <>
                  <CheckCircle size={20} />
                  Message Sent!
                </>
              ) : (
                "Send Message"
              )}
            </button>

            <p className="text-sm text-gray-600 text-center">
              We typically respond within 24 hours. Looking forward to hearing
              from you!
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LandingContact;
