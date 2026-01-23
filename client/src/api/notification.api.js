/**
 * Notification API endpoints
 */

const notificationApi = {
  // Send alert to all staff
  sendAlert: () => ({
    method: "POST",
    url: "/api/notifications/send-alert",
  }),

  // Get notifications for user
  getNotifications: () => ({
    method: "GET",
    url: "/api/notifications/list",
  }),

  // Dismiss notification
  dismissNotification: (notificationId) => ({
    method: "PATCH",
    url: `/api/notifications/${notificationId}/dismiss`,
  }),

  // Mark as read
  markAsRead: (notificationId) => ({
    method: "PATCH",
    url: `/api/notifications/${notificationId}/read`,
  }),
};

export default notificationApi;
