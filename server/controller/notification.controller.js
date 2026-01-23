/**
 * Notification Controller
 * Handles sending alerts and managing notifications
 */

/**
 * ============================
 * SEND ALERT TO ALL STAFF
 * ============================
 * POST /api/notifications/send-alert
 * Access: ADMIN / MANAGER / BRAND_ADMIN
 */
export async function sendAlertController(req, res) {
  try {
    const { title, message, priority = "NORMAL" } = req.body;
    const user = req.user;

    // Validation
    if (!title || !message) {
      return res.status(400).json({
        message: "Title and message are required",
        error: true,
        success: false,
      });
    }

    console.log(`✅ Alert sent by ${user.name}:`);
    console.log(`   Title: ${title}`);
    console.log(`   Message: ${message}`);
    console.log(`   Priority: ${priority}`);

    // In a real application, you would:
    // 1. Create notification record in database
    // 2. Send push notifications via socket.io
    // 3. Send email notifications
    // 4. Log the action

    return res.json({
      success: true,
      error: false,
      message: "Alert sent successfully to all staff",
      data: {
        title,
        message,
        priority,
        sentBy: user.name,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("sendAlertController:", err);
    return res.status(500).json({
      message: "Failed to send alert",
      error: true,
      success: false,
    });
  }
}

/**
 * ============================
 * GET NOTIFICATIONS
 * ============================
 * GET /api/notifications/list
 * Access: All Authenticated Users
 */
export async function getNotificationsController(req, res) {
  try {
    const user = req.user;
    const { page = 1, limit = 10 } = req.query;

    // Mock notifications
    const notifications = [
      {
        _id: "1",
        title: "New Order",
        message: "New order placed - Table 5",
        type: "ORDER",
        priority: "HIGH",
        read: false,
        createdAt: new Date(),
      },
      {
        _id: "2",
        title: "Staff Alert",
        message: "Chef availability updated",
        type: "STAFF",
        priority: "NORMAL",
        read: false,
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        _id: "3",
        title: "System Notice",
        message: "Scheduled maintenance at 2 AM",
        type: "SYSTEM",
        priority: "INFO",
        read: true,
        createdAt: new Date(Date.now() - 86400000),
      },
    ];

    return res.json({
      success: true,
      error: false,
      data: notifications,
      pagination: {
        total: notifications.length,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error("getNotificationsController:", err);
    return res.status(500).json({
      message: "Failed to fetch notifications",
      error: true,
      success: false,
    });
  }
}

/**
 * ============================
 * DISMISS NOTIFICATION
 * ============================
 * PATCH /api/notifications/:notificationId/dismiss
 * Access: All Authenticated Users
 */
export async function dismissNotificationController(req, res) {
  try {
    const { notificationId } = req.params;

    return res.json({
      success: true,
      error: false,
      message: "Notification dismissed",
      data: {
        notificationId,
        dismissedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("dismissNotificationController:", err);
    return res.status(500).json({
      message: "Failed to dismiss notification",
      error: true,
      success: false,
    });
  }
}

/**
 * ============================
 * MARK NOTIFICATION AS READ
 * ============================
 * PATCH /api/notifications/:notificationId/read
 * Access: All Authenticated Users
 */
export async function markNotificationAsReadController(req, res) {
  try {
    const { notificationId } = req.params;

    return res.json({
      success: true,
      error: false,
      message: "Notification marked as read",
      data: {
        notificationId,
        readAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("markNotificationAsReadController:", err);
    return res.status(500).json({
      message: "Failed to mark notification as read",
      error: true,
      success: false,
    });
  }
}
