import { useState, useEffect } from "react";

/**
 * useAdminOnboarding Hook
 * Manages first-time admin onboarding experience
 * Tracks completion and shows guide on first access
 */
export function useAdminOnboarding() {
  const [showGuide, setShowGuide] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);

  // Check if user has already completed onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(
      "admin_onboarding_completed",
    );

    if (hasCompletedOnboarding === "true") {
      setIsOnboardingCompleted(true);
    } else {
      // Show guide on first access
      setShowGuide(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem("admin_onboarding_completed", "true");
    setIsOnboardingCompleted(true);
    setShowGuide(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem("admin_onboarding_completed", "true");
    setIsOnboardingCompleted(true);
    setShowGuide(false);
  };

  const showOnboardingGuide = () => {
    setShowGuide(true);
  };

  return {
    showGuide,
    isOnboardingCompleted,
    completeOnboarding,
    skipOnboarding,
    showOnboardingGuide,
  };
}

export default useAdminOnboarding;
