import LandingNavbar from "./components/LandingNavbar";
import LandingHero from "./components/LandingHero";
import LandingFeatures from "./components/LandingFeatures";
import LandingHowItWorks from "./components/LandingHowItWorks";
import LandingAbout from "./components/LandingAbout";
import LandingContact from "./components/LandingContact";
import LandingCTA from "./components/LandingCTA";
import LandingFooter from "./components/LandingFooter";

const LandingHome = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <LandingNavbar scrollToSection={scrollToSection} />
      <main>
        <LandingHero scrollToSection={scrollToSection} />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingAbout />
        <LandingContact />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingHome;
