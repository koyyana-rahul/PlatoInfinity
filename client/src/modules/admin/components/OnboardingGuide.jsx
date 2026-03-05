import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import clsx from "clsx";
import {
  FiX,
  FiCheckCircle,
  FiMapPin,
  FiUsers,
  FiBookOpen,
  FiArrowRight,
  FiSkipBack,
} from "react-icons/fi";
import toast from "react-hot-toast";

/**
 * Admin Onboarding Guide - Professional FTUX
 * Guides first-time admins through: Restaurant Setup → Add Managers → Create Menu
 */
export default function OnboardingGuide({ isVisible, onComplete, onSkip }) {
  const navigate = useNavigate();
  const { brandSlug } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const steps = [
    {
      id: 1,
      title: "Create Your First Restaurant",
      description:
        "Add your restaurant location and basic details to get started",
      icon: FiMapPin,
      action: "Create Restaurant",
      actionColor: "gradient-orange",
      details: [
        "Add restaurant name",
        "Enter location & contact details",
        "Configure branch settings",
      ],
      onAction: () => {
        navigate(`/${brandSlug}/admin/restaurants`);
        onComplete?.();
      },
    },
    {
      id: 2,
      title: "Add Managers",
      description: "Invite managers to oversee your restaurant operations",
      icon: FiUsers,
      action: "Manage Staff",
      actionColor: "gradient-blue",
      details: [
        "Invite managers via email",
        "Set manager permissions",
        "Assign to restaurants",
      ],
      onAction: () => {
        navigate(`/${brandSlug}/admin/restaurants`);
        onComplete?.();
      },
    },
    {
      id: 3,
      title: "Create Master Menu",
      description: "Build your menu categories, items, and pricing structure",
      icon: FiBookOpen,
      action: "Create Menu",
      actionColor: "gradient-green",
      details: [
        "Add menu categories",
        "Create food items with prices",
        "Set availability & variants",
      ],
      onAction: () => {
        navigate(`/${brandSlug}/admin/master-menu`);
        onComplete?.();
      },
    },
  ];

  const currentStepData = steps[currentStep];
  const IsIcon = currentStepData?.icon;
  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  const handleStepClick = (index) => {
    setCurrentStep(index);
  };

  const handleMarkComplete = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
      toast.success("✓ Step completed!");
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.success("🎉 Onboarding complete! You're all set.");
      onComplete?.();
    }
  };

  const allStepsCompleted = completedSteps.length === steps.length;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-100 animate-in zoom-in-95 duration-300">
        {/* ================= HEADER ================= */}
        <div className="relative h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
        <div className="px-6 sm:px-8 py-6 sm:py-8 bg-gradient-to-br from-gray-50 to-white border-b-2 border-gray-100">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                  Quick Setup Guide
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                Let's Get You Started! 🚀
              </h2>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Complete these steps to set up your restaurant admin dashboard
              </p>
            </div>
            <button
              onClick={() => onSkip?.()}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all flex-shrink-0 border-2 border-gray-200 hover:border-gray-300"
            >
              <FiX size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700">
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ================= MAIN CONTENT ================= */}
        <div className="p-6 sm:p-8">
          {/* Current Step Display */}
          <div className="mb-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
              {/* Icon */}
              <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl border-2 border-orange-200 flex-shrink-0">
                <IsIcon className="text-orange-600" size={32} strokeWidth={2} />
              </div>

              {/* Title & Description */}
              <div className="flex-1">
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
                  {currentStepData?.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {currentStepData?.description}
                </p>
              </div>
            </div>

            {/* Step Details */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-100 p-5 sm:p-6">
              <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">
                What you'll do:
              </h4>
              <ul className="space-y-3">
                {currentStepData?.details?.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 mt-1.5 flex-shrink-0" />
                    <span className="text-gray-700 font-medium text-sm">
                      {detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ================= STEPS NAVIGATION ================= */}
          <div className="mb-8">
            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">
              Your Journey:
            </h4>
            <div className="space-y-2">
              {steps.map((step, idx) => {
                const isCompleted = completedSteps.includes(idx);
                const isCurrent = idx === currentStep;

                return (
                  <button
                    key={idx}
                    onClick={() => handleStepClick(idx)}
                    className={clsx(
                      "w-full flex items-center gap-4 px-4 py-3 sm:py-4 rounded-2xl border-2 transition-all text-left active:scale-95",
                      isCurrent
                        ? "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300 shadow-lg"
                        : isCompleted
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 hover:shadow-md"
                          : "bg-white border-gray-200 hover:border-orange-300 hover:shadow-md",
                    )}
                  >
                    <div
                      className={clsx(
                        "w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0",
                        isCompleted
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                          : isCurrent
                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                            : "bg-gray-200 text-gray-700",
                      )}
                    >
                      {isCompleted ? (
                        <FiCheckCircle size={16} />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {step.description}
                      </p>
                    </div>
                    {isCompleted && (
                      <div className="text-green-600 font-bold text-xs hidden sm:block">
                        Done
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= FOOTER ACTIONS ================= */}
        <div className="px-6 sm:px-8 py-5 sm:py-6 bg-gradient-to-r from-gray-50 to-white border-t-2 border-gray-100 flex flex-col sm:flex-row gap-3 justify-between">
          <button
            onClick={() => onSkip?.()}
            className="px-5 py-3 rounded-xl font-bold text-sm text-gray-700 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 order-2 sm:order-1"
          >
            Skip for Now
          </button>

          <div className="flex gap-3 order-1 sm:order-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-gray-700 bg-white border-2 border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
              >
                <FiSkipBack size={16} />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            <button
              onClick={async () => {
                currentStepData?.onAction();
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30 hover:shadow-xl transition-all active:scale-95 flex-1 sm:flex-initial justify-center"
            >
              <span>{currentStepData?.action}</span>
              <FiArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Completion Message */}
        {allStepsCompleted && (
          <div className="px-6 sm:px-8 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-t-2 border-green-200 text-center">
            <p className="text-sm font-bold text-green-700">
              ✓ All setup steps completed! Start managing your restaurant.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
