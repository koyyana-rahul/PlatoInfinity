import Session from "../models/session.model.js";
import Table from "../models/table.model.js";

export async function closeInactiveSessions() {
  const timeout = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hrs

  const sessions = await Session.find({
    status: "OPEN",
    lastActivityAt: { $lt: timeout },
  });

  for (const s of sessions) {
    s.status = "CLOSED";
    s.closedAt = new Date();
    await s.save();

    await Table.findByIdAndUpdate(s.tableId, {
      status: "FREE",
    });
  }
}
