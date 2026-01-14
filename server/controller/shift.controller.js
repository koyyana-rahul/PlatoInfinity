import crypto from "crypto";
import Shift from "../models/shift.model.js";
import User from "../models/user.model.js";

/* ================= OPEN SHIFT ================= */
export async function openShiftController(req, res) {
  try {
    const manager = req.user;

    if (!manager.restaurantId) {
      return res.status(400).json({ message: "Restaurant missing" });
    }

    // ❌ Prevent multiple open shifts
    const existing = await Shift.findOne({
      restaurantId: manager.restaurantId,
      status: "OPEN",
    });

    if (existing) {
      return res.status(409).json({
        message: "Shift already open",
      });
    }

    const qrToken = crypto.randomBytes(24).toString("hex");

    const shift = await Shift.create({
      userId: manager._id,
      restaurantId: manager.restaurantId,
      openedCash: req.body.openedCash || 0,

      qrToken,
      qrIsActive: true,
      qrExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min QR
    });

    return res.status(201).json({
      success: true,
      data: {
        shiftId: shift._id,
        qrToken: shift.qrToken,
        qrExpiresAt: shift.qrExpiresAt,
      },
    });
  } catch (err) {
    console.error("openShiftController:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ================= REFRESH QR ================= */
export async function refreshShiftQrController(req, res) {
  try {
    const manager = req.user;

    const shift = await Shift.findOne({
      restaurantId: manager.restaurantId,
      status: "OPEN",
    });

    if (!shift) {
      return res.status(404).json({ message: "No open shift" });
    }

    shift.qrToken = crypto.randomBytes(24).toString("hex");
    shift.qrExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    shift.qrIsActive = true;

    await shift.save();

    return res.json({
      success: true,
      data: {
        qrToken: shift.qrToken,
        qrExpiresAt: shift.qrExpiresAt,
      },
    });
  } catch (err) {
    console.error("refreshShiftQrController:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ================= CLOSE SHIFT ================= */
// export async function closeShiftController(req, res) {
//   try {
//     const manager = req.user;

//     const shift = await Shift.findOne({
//       restaurantId: manager.restaurantId,
//       status: "OPEN",
//     });

//     if (!shift) {
//       return res.status(404).json({ message: "No open shift" });
//     }

//     shift.status = "CLOSED";
//     shift.closedAt = new Date();
//     shift.qrIsActive = false;
//     shift.closedCash = req.body.closedCash || 0;

//     await shift.save();

//     return res.json({
//       success: true,
//       message: "Shift closed successfully",
//     });
//   } catch (err) {
//     console.error("closeShiftController:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// }

/* ================= CLOSE SHIFT ================= */
export async function closeShiftController(req, res) {
  try {
    const manager = req.user;

    const shift = await Shift.findOne({
      restaurantId: manager.restaurantId,
      status: "OPEN",
    });

    if (!shift) {
      return res.status(404).json({ message: "No open shift" });
    }

    const closedCash =
      typeof req.body?.closedCash === "number" ? req.body.closedCash : 0;

    shift.status = "CLOSED";
    shift.closedAt = new Date();
    shift.qrIsActive = false;
    shift.closedCash = closedCash;

    await shift.save();

    return res.json({
      success: true,
      message: "Shift closed successfully",
      data: {
        closedAt: shift.closedAt,
        closedCash: shift.closedCash,
      },
    });
  } catch (err) {
    console.error("closeShiftController:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ================= GET ACTIVE SHIFT ================= */
export async function getActiveShiftController(req, res) {
  try {
    const manager = req.user;

    const shift = await Shift.findOne({
      restaurantId: manager.restaurantId,
      status: "OPEN",
    }).lean();

    if (!shift) {
      return res.json({
        success: true,
        data: null,
      });
    }

    return res.json({
      success: true,
      data: {
        shiftId: shift._id,
        openedAt: shift.openedAt,
        qrToken: shift.qrToken,
        qrExpiresAt: shift.qrExpiresAt,
      },
    });
  } catch (err) {
    console.error("getActiveShiftController:", err);
    res.status(500).json({ message: "Server error" });
  }
}
