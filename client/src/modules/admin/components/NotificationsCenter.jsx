import React, { useState } from "react";
import {
  FiX,
  FiBell,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiClock,
} from "react-icons/fi";

/**
 * Notification Item Component
 */
const NotificationItem = ({ notification, onDismiss }) => {
  const typeConfig = {
    success: {
      icon: FiCheckCircle,
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      badge: "bg-green-100 text-green-700",
    },
    warning: {
      icon: FiAlertCircle,
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-700",
      badge: "bg-yellow-100 text-yellow-700",
    },
    error: {
      icon: FiAlertCircle,
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      badge: "bg-red-100 text-red-700",
    },
    info: {
      icon: FiInfo,
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      badge: "bg-blue-100 text-blue-700",
    },
  };

  const config = typeConfig[notification.type] || typeConfig.info;
  const Icon = config.icon;

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div
      className={`${config.bg} ${config.border} border rounded-lg p-4 flex gap-3 hover:shadow-sm transition-shadow`}
    >
      <Icon className={`${config.text} flex-shrink-0 mt-0.5`} size={18} />
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${config.text}`}>
          {notification.title}
        </p>
        <p className={`text-xs ${config.text} opacity-75 mt-1`}>
          {notification.message}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          {timeAgo(notification.timestamp)}
        </p>
      </div>
      <button
        onClick={() => onDismiss(notification.id)}
        className="text-slate-400 hover:text-slate-600 flex-shrink-0"
      >
        <FiX size={16} />
      </button>
    </div>
  );
};

/**
 * Notifications Center Component
 */
export const NotificationsCenter = ({
  notifications = [],
  onDismiss,
  loading,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (loading) {
    return <div className="h-10 bg-slate-100 rounded-lg animate-pulse w-10" />;
  }

  const displayNotifications = notifications.slice(0, 5);
  const unreadCount = notifications.length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isExpanded && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900">Notifications</h3>
            <p className="text-xs text-slate-500 mt-1">
              {unreadCount} unread notifications
            </p>
          </div>

          <div className="space-y-2 p-3">
            {displayNotifications.length > 0 ? (
              displayNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onDismiss={onDismiss}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <FiBell className="text-slate-300 mx-auto mb-2" size={32} />
                <p className="text-sm text-slate-500">No new notifications</p>
              </div>
            )}
          </div>

          {unreadCount > 5 && (
            <div className="border-t border-slate-200 p-3 text-center">
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
