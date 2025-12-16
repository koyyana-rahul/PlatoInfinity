import Bill from "../models/bill.model.js";
import Order from "../models/order.model.js";
import mongoose from "mongoose";

/**
 * =========================
 * GST REPORT
 * =========================
 */
export async function getGSTReport({ restaurantId, from, to }) {
  const bills = await Bill.find({
    restaurantId,
    status: "PAID",
    createdAt: {
      $gte: new Date(from),
      $lte: new Date(to),
    },
  }).lean();

  let cgst = 0;
  let sgst = 0;
  let totalTax = 0;

  for (const bill of bills) {
    totalTax += bill.taxes || 0;
    cgst += (bill.taxes || 0) / 2;
    sgst += (bill.taxes || 0) / 2;
  }

  return {
    billsCount: bills.length,
    totalTax,
    cgst,
    sgst,
  };
}

/**
 * =========================
 * TOP SELLING ITEMS
 * =========================
 */
export async function getTopSellingItems({
  restaurantId,
  from,
  to,
  limit = 10,
}) {
  return Order.aggregate([
    {
      $match: {
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        createdAt: {
          $gte: new Date(from),
          $lte: new Date(to),
        },
      },
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.name",
        totalQty: { $sum: "$items.quantity" },
        totalRevenue: {
          $sum: { $multiply: ["$items.price", "$items.quantity"] },
        },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: limit },
  ]);
}
