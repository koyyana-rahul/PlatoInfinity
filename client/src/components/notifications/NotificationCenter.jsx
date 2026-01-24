/**
 * NotificationCenter.jsx
 * Production-ready notification system
 * Shows real-time alerts and notifications
 * Fully responsive
 */

import { useState, useEffect } from "react";
import { X, Bell, AlertCircle, CheckCircle, Info, Zap } from "lucide-react";
import { useSocket } from "../socket/SocketProvider";
import toast from "react-hot-toast";
import clsx from "clsx";

export default function NotificationCenter({ restaurantId }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for notifications
    socket.on("notification:new", (notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 20)); // Keep last 20
      handleNotificationSound(notification.type);
    });

    // Kitchen alerts
    socket.on("kitchen:order-ready", (order) => {
      setNotifications((prev) =>
        [
          {
            id: `ready-${order._id}`,
            type: "success",
            title: "Order Ready",
            message: `Order #${order.orderNumber} is ready for service`,
            timestamp: new Date(),
          },
          ...prev,
        ].slice(0, 20),
      );
    });

    // Table alerts
    socket.on("table:call-bell", (data) => {
      setNotifications((prev) =>
        [
          {
            id: `call-${data.tableId}`,
            type: "alert",
            title: "Table Call",
            message: `Table ${data.tableName} needs assistance`,
            timestamp: new Date(),
            action: {
              label: "Attend",
              onClick: () => handleAttendCall(data.tableId),
            },
          },
          ...prev,
        ].slice(0, 20),
      );
      handleNotificationSound("alert");
    });

    // Order updates
    socket.on("order:status-changed", (order) => {
      setNotifications((prev) =>
        [
          {
            id: `order-${order._id}`,
            type: "info",
            title: "Order Update",
            message: `Order #${order.orderNumber} status: ${order.status}`,
            timestamp: new Date(),
          },
          ...prev,
        ].slice(0, 20),
      );
    });

    return () => {
      socket.off("notification:new");
      socket.off("kitchen:order-ready");
      socket.off("table:call-bell");
      socket.off("order:status-changed");
    };
  }, [socket]);

  const handleNotificationSound = (type) => {
    if ("Notification" in window && Notification.permission === "granted") {
      if (type === "alert") {
        // Play a beep sound
        playBeep(1000, 0.3, 200);
      }
    }
  };

  const playBeep = (frequency, duration, timeout) => {
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + duration / 1000,
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  };

  const handleAttendCall = (tableId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== `call-${tableId}`));
    toast.success("Attending table...");
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "alert":
        return <Zap className="w-5 h-5 text-red-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "alert":
        return "bg-red-50 border-red-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 max-w-md">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow mb-4 w-12 h-12 flex items-center justify-center"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {Math.min(notifications.length, 9)}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={clsx(
                    "p-3 sm:p-4 border-l-4",
                    getNotificationColor(notif.type),
                  )}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">
                        {notif.title}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notif.timestamp).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {notif.action && (
                        <button
                          onClick={() => {
                            notif.action.onClick?.();
                            removeNotification(notif.id);
                          }}
                          className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                        >
                          {notif.action.label} →
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => removeNotification(notif.id)}
                      className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-3 sm:p-4">
              <button
                onClick={() => setNotifications([])}
                className="w-full text-center text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
