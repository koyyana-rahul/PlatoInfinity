import Bill from "../models/bill.model.js";
import User from "../models/user.model.js";

/**
 * ============================
 * WAITER WISE SALES REPORT
 * ============================
 * GET /api/reports/waiter-sales?date=YYYY-MM-DD
 * Access: MANAGER / OWNER
 */
export async function waiterWiseSalesReport(req, res) {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "date query is required (YYYY-MM-DD)",
        error: true,
        success: false,
      });
    }

    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59);

    // Fetch PAID bills for the day
    const bills = await Bill.find({
      status: "PAID",
      createdAt: { $gte: start, $lte: end },
    }).lean();

    const waiterMap = {};

    for (const bill of bills) {
      if (!bill.closedByUserId) continue;

      const waiterId = bill.closedByUserId.toString();

      if (!waiterMap[waiterId]) {
        waiterMap[waiterId] = {
          waiterId,
          totalBills: 0,
          totalSales: 0,
        };
      }

      waiterMap[waiterId].totalBills += 1;
      waiterMap[waiterId].totalSales += bill.total;
    }

    // Attach waiter names
    const waiterIds = Object.keys(waiterMap);
    const waiters = await User.find(
      { _id: { $in: waiterIds } },
      { name: 1 }
    ).lean();

    const waiterNameMap = {};
    waiters.forEach((w) => {
      waiterNameMap[w._id.toString()] = w.name;
    });

    const report = Object.values(waiterMap).map((w) => ({
      waiterId: w.waiterId,
      waiterName: waiterNameMap[w.waiterId] || "Unknown",
      totalBills: w.totalBills,
      totalSales: w.totalSales,
    }));

    return res.json({
      success: true,
      error: false,
      date,
      totalWaiters: report.length,
      data: report,
    });
  } catch (err) {
    console.error("waiterWiseSalesReport:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}
