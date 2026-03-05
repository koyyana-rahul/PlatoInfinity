import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import clsx from "clsx";
import {
  FiMapPin,
  FiUsers,
  FiBookOpen,
  FiArrowRight,
  FiX,
} from "react-icons/fi";

/**
 * Getting Started Info Card - Shows setup progress on dashboard
 * Professional card similar to Swiggy/Zomato dashboards
 */
export default function GettingStartedCard({ onClose, onShowGuide }) {
  const navigate = useNavigate();
  const { brandSlug } = useParams();

  const steps = [
    {
      id: 1,
      title: "Create Restaurant",
      icon: FiMapPin,
      color: "orange",
      path: "restaurants",
    },
    {
      id: 2,
      title: "Add Managers",
      icon: FiUsers,
      color: "blue",
      path: "restaurants",
    },
    {
      id: 3,
      title: "Create Menu",
      icon: FiBookOpen,
      color: "green",
      path: "master-menu",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-white to-orange-50 rounded-2xl border-2 border-orange-200 overflow-hidden shadow-lg hover:shadow-xl transition-all">
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🚀</span>
              <h3 className="text-lg sm:text-xl font-black text-gray-900">
                Get Started in 3 Steps
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              Set up your admin dashboard to start managing your restaurant
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all flex-shrink-0"
          >
            <FiX size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {steps.map(({ id, title, icon: Icon, color, path }) => {
            const colorClasses = {
              orange: "from-orange-100 to-orange-50 border-orange-200",
              blue: "from-blue-100 to-blue-50 border-blue-200",
              green: "from-green-100 to-green-50 border-green-200",
            };

            const iconColor = {
              orange: "text-orange-600",
              blue: "text-blue-600",
              green: "text-green-600",
            };

            return (
              <button
                key={id}
                onClick={() => navigate(`/${brandSlug}/admin/${path}`)}
                className={clsx(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:shadow-md active:scale-95",
                  `bg-gradient-to-br ${colorClasses[color]}`,
                )}
              >
                <Icon
                  className={clsx("flex-shrink-0", iconColor[color])}
                  size={24}
                />
                <span className="text-xs font-bold text-gray-900 text-center leading-tight">
                  {title}
                </span>
                <span className="text-[10px] font-semibold text-gray-600 mt-1">
                  Step {id}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <button
          onClick={onShowGuide}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30 transition-all active:scale-95"
        >
          <span>View Setup Guide</span>
          <FiArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
