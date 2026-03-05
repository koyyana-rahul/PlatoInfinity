import WaiterAlert from "../models/waiterAlert.model.js";
import Table from "../models/table.model.js";

/**
 * SAVE WAITER ALERT
 * POST /api/waiter-alerts/save
 * Called by client when alert occurs
 */
export async function saveWaiterAlertController(req, res) {
  try {
    const restaurantId = req.user?.restaurantId || req.body.restaurantId;
    const {
      tableId,
      tableName,
      reason = "Call button pressed",
      createdAt,
    } = req.body;

    if (!restaurantId || !tableId || !tableName) {
      return res.status(400).json({
        success: false,
        message: "restaurantId, tableId, and tableName are required",
      });
    }

    // Calculate time slot (hourly bucket)
    const alertDate = createdAt ? new Date(createdAt) : new Date();
    const dateSlot = alertDate.toISOString().split("T")[0]; // YYYY-MM-DD
    const hour = String(alertDate.getHours()).padStart(2, "0");
    const timeSlot = `${hour}:00-${String(
      (alertDate.getHours() + 1) % 24,
    ).padStart(2, "0")}:00`;

    // Save alert to database
    const alert = new WaiterAlert({
      restaurantId,
      tableId,
      tableName,
      reason,
      status: "PENDING",
      dateSlot,
      timeSlot,
      createdBySessionId: req.headers["x-session-token"] || null,
    });

    await alert.save();

    console.log("✅ AlertStored:", {
      _id: alert._id,
      table: tableName,
      dateSlot,
      timeSlot,
    });

    res.status(201).json({
      success: true,
      message: "Alert saved successfully",
      alert: {
        _id: alert._id,
        tableId: alert.tableId,
        tableName: alert.tableName,
      },
    });
  } catch (err) {
    console.error("❌ Error saving waiter alert:", err);
    res.status(500).json({
      success: false,
      message: "Error saving alert",
    });
  }
}

/**
 * ACKNOWLEDGE WAITER ALERT
 * PATCH /api/waiter-alerts/:alertId/acknowledge
 * Called when waiter marks alert as attended
 */
export async function acknowledgeWaiterAlertController(req, res) {
  try {
    const { alertId } = req.params;
    const waiterId = req.user?._id;

    if (!alertId) {
      return res.status(400).json({
        success: false,
        message: "alertId is required",
      });
    }

    const alert = await WaiterAlert.findById(alertId);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    // Calculate response time
    const responseTimeMs = new Date() - new Date(alert.createdAt);

    // Update alert
    alert.status = "ATTENDED";
    alert.attendedByWaiterId = waiterId || null;
    alert.attendedAt = new Date();
    alert.responseTimeMs = responseTimeMs;

    await alert.save();

    console.log("✅ Alert acknowledged:", {
      _id: alert._id,
      responseTimeMs,
      table: alert.tableName,
    });

    res.status(200).json({
      success: true,
      message: "Alert acknowledged",
      alert: {
        _id: alert._id,
        status: alert.status,
        responseTimeMs: alert.responseTimeMs,
      },
    });
  } catch (err) {
    console.error("❌ Error acknowledging alert:", err);
    res.status(500).json({
      success: false,
      message: "Error acknowledging alert",
    });
  }
}

/**
 * GET ALERTS BY TIME SLOT
 * GET /api/waiter-alerts/history?dateSlot=2026-03-06&timeSlot=14:00-15:00
 * Retrieve historical alerts for a specific time slot
 */
export async function getAlertsByTimeSlotController(req, res) {
  try {
    const restaurantId = req.user?.restaurantId;
    const {
      dateSlot,
      timeSlot,
      status = "ALL",
      page = 1,
      limit = 50,
    } = req.query;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "restaurantId required",
      });
    }

    const query = { restaurantId };

    if (dateSlot) {
      query.dateSlot = dateSlot;
    }

    if (timeSlot) {
      query.timeSlot = timeSlot;
    }

    const normalizedStatus = String(status || "ALL").toUpperCase();
    if (!["ALL", "PENDING", "ATTENDED"].includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use ALL, PENDING, or ATTENDED",
      });
    }

    if (normalizedStatus !== "ALL") {
      query.status = normalizedStatus;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: "tableId", select: "tableNumber" },
        { path: "attendedByWaiterId", select: "username" },
      ],
    };

    const result = await WaiterAlert.paginate(query, options);

    res.status(200).json({
      success: true,
      message: "Alerts retrieved successfully",
      data: {
        alerts: result.docs,
        pagination: {
          totalDocs: result.totalDocs,
          totalPages: result.totalPages,
          page: result.page,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage,
        },
      },
    });
  } catch (err) {
    console.error("❌ Error fetching alerts by time slot:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching alerts",
    });
  }
}

/**
 * GET ALERT HISTORY (BY DATE)
 * GET /api/waiter-alerts/history/daily?dateSlot=2026-03-06
 * Get all alerts for a specific date with time slot grouping
 */
export async function getDailyAlertHistoryController(req, res) {
  try {
    const restaurantId = req.user?.restaurantId;
    const { dateSlot } = req.query;

    if (!restaurantId || !dateSlot) {
      return res.status(400).json({
        success: false,
        message: "restaurantId and dateSlot are required",
      });
    }

    // Group alerts by time slot
    const alerts = await WaiterAlert.find({
      restaurantId,
      dateSlot,
    }).sort({ createdAt: -1 });

    // Group by time slot
    const groupedByTimeSlot = {};
    alerts.forEach((alert) => {
      if (!groupedByTimeSlot[alert.timeSlot]) {
        groupedByTimeSlot[alert.timeSlot] = [];
      }
      groupedByTimeSlot[alert.timeSlot].push(alert);
    });

    // Calculate statistics
    const stats = {
      totalAlerts: alerts.length,
      attended: alerts.filter((a) => a.status === "ATTENDED").length,
      pending: alerts.filter((a) => a.status === "PENDING").length,
      avgResponseTimeMs:
        alerts.filter((a) => a.responseTimeMs).length > 0
          ? Math.round(
              alerts
                .filter((a) => a.responseTimeMs)
                .reduce((sum, a) => sum + a.responseTimeMs, 0) /
                alerts.filter((a) => a.responseTimeMs).length,
            )
          : 0,
    };

    res.status(200).json({
      success: true,
      message: "Daily alert history retrieved",
      data: {
        dateSlot,
        stats,
        alertsByTimeSlot: groupedByTimeSlot,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching daily alert history:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching alert history",
    });
  }
}

/**
 * GET ALERT ANALYTICS/REPORT
 * GET /api/waiter-alerts/analytics?startDate=2026-03-01&endDate=2026-03-06
 * Get comprehensive analytics for a date range
 */
export async function getAlertAnalyticsController(req, res) {
  try {
    const restaurantId = req.user?.restaurantId;
    const { startDate, endDate } = req.query;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "restaurantId required",
      });
    }

    const query = { restaurantId };

    if (startDate && endDate) {
      query.dateSlot = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const alerts = await WaiterAlert.find(query).sort({ createdAt: -1 });

    // Statistics
    const stats = {
      totalAlerts: alerts.length,
      attendedAlerts: alerts.filter((a) => a.status === "ATTENDED").length,
      pendingAlerts: alerts.filter((a) => a.status === "PENDING").length,
      avgResponseTimeMs:
        alerts.filter((a) => a.responseTimeMs).length > 0
          ? Math.round(
              alerts
                .filter((a) => a.responseTimeMs)
                .reduce((sum, a) => sum + a.responseTimeMs, 0) /
                alerts.filter((a) => a.responseTimeMs).length,
            )
          : 0,
    };

    // Group by date
    const alertsByDate = {};
    alerts.forEach((alert) => {
      if (!alertsByDate[alert.dateSlot]) {
        alertsByDate[alert.dateSlot] = [];
      }
      alertsByDate[alert.dateSlot].push(alert);
    });

    // Group by table
    const alertsByTable = {};
    alerts.forEach((alert) => {
      const tableKey = `${alert.tableName} (${alert.tableId})`;
      if (!alertsByTable[tableKey]) {
        alertsByTable[tableKey] = {
          count: 0,
          alerts: [],
        };
      }
      alertsByTable[tableKey].count += 1;
      alertsByTable[tableKey].alerts.push(alert);
    });

    res.status(200).json({
      success: true,
      message: "Analytics retrieved successfully",
      data: {
        dateRange: { startDate, endDate },
        stats,
        alertsByDate,
        alertsByTable,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching analytics:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics",
    });
  }
}

/**
 * EXPORT ALERTS (for proof/compliance)
 * GET /api/waiter-alerts/export?dateSlot=2026-03-06&format=json|csv
 * Export alerts in CSV/JSON format for audit/proof
 */
export async function exportAlertsController(req, res) {
  try {
    const restaurantId = req.user?.restaurantId;
    const { dateSlot, format = "json" } = req.query;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "restaurantId required",
      });
    }

    const query = { restaurantId };
    if (dateSlot) {
      query.dateSlot = dateSlot;
    }

    const alerts = await WaiterAlert.find(query)
      .sort({ createdAt: 1 })
      .populate([
        { path: "tableId", select: "tableNumber" },
        { path: "attendedByWaiterId", select: "username" },
      ]);

    if (format === "csv") {
      // Convert to CSV
      const csvHeader =
        "Alert ID,Date,Time Slot,Table,Reason,Status,Created At,Attended At,Response Time (ms)\n";
      const csvRows = alerts
        .map(
          (a) =>
            `"${a._id}","${a.dateSlot}","${a.timeSlot}","${a.tableName}","${a.reason}","${a.status}","${a.createdAt.toISOString()}","${a.attendedAt ? a.attendedAt.toISOString() : "N/A"}","${a.responseTimeMs || "N/A"}"`,
        )
        .join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="alerts_${dateSlot || "all"}.csv"`,
      );
      res.send(csvHeader + csvRows);
    } else {
      // JSON format
      res.status(200).json({
        success: true,
        message: "Alerts exported",
        data: {
          dateSlot: dateSlot || "all",
          totalAlerts: alerts.length,
          alerts,
        },
      });
    }
  } catch (err) {
    console.error("❌ Error exporting alerts:", err);
    res.status(500).json({
      success: false,
      message: "Error exporting alerts",
    });
  }
}
