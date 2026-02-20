import mongoose from "mongoose";
import SessionModel from "../models/session.model.js";

export async function resolveCustomerSession(req, res, next) {
  try {
    const tableId =
      req.body?.tableId ||
      req.params?.tableId ||
      req.query?.tableId ||
      req.headers["x-table-id"];

    const deviceId =
      req.body?.deviceId ||
      req.query?.deviceId ||
      req.headers["x-device-id"] ||
      null;

    if (!tableId) {
      return res.status(400).json({
        success: false,
        message: "tableId required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(tableId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tableId",
      });
    }

    const session = await SessionModel.findOne({
      tableId,
      status: "OPEN",
    });

    if (!session) {
      return res.status(400).json({
        success: false,
        message: "Table session not found or closed",
      });
    }

    req.sessionDoc = session;
    req.sessionId = session._id;
    req.deviceId = deviceId;

    return next();
  } catch (err) {
    console.error("resolveCustomerSession error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

export default resolveCustomerSession;
