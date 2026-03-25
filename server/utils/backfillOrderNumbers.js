import crypto from "crypto";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/connectDB.js";
import Order from "../models/order.model.js";
import Restaurant from "../models/restaurant.model.js";
import Brand from "../models/brand.model.js";
import OrderCounter from "../models/orderCounter.model.js";

dotenv.config();

function toCode(value, fallback) {
  const normalized = String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  if (normalized.length >= 2) return normalized.slice(0, 3);
  return (normalized || fallback).slice(0, 3);
}

function buildOrderNumber(brandCode, branchCode) {
  return `${brandCode}-${branchCode}`;
}

async function backfillOrderNumbers() {
  await connectDB();

  const missingFilter = {
    $or: [
      { orderNumber: { $exists: false } },
      { orderNumber: null },
      { orderNumber: "" },
    ],
  };

  const cursor = Order.find(missingFilter).cursor();
  let updated = 0;
  let skipped = 0;
  const restaurantCache = new Map();
  const brandCache = new Map();

  for await (const order of cursor) {
    let attempts = 0;
    let success = false;

    let brandCode = "PLT";
    let branchCode = "BR";

    if (order.restaurantId) {
      const restaurantId = String(order.restaurantId);
      let restaurant = restaurantCache.get(restaurantId);
      if (!restaurant) {
        restaurant = await Restaurant.findById(order.restaurantId)
          .select("name brandId")
          .lean();
        restaurantCache.set(restaurantId, restaurant || null);
      }

      if (restaurant) {
        branchCode = toCode(restaurant.name, "BR");
        const brandId = restaurant.brandId ? String(restaurant.brandId) : null;
        if (brandId) {
          let brand = brandCache.get(brandId);
          if (!brand) {
            brand = await Brand.findById(restaurant.brandId)
              .select("slug name")
              .lean();
            brandCache.set(brandId, brand || null);
          }
          brandCode = toCode(brand?.slug || brand?.name, "PLT");
        }
      }
    }

    while (!success && attempts < 5) {
      const counter = await OrderCounter.findOneAndUpdate(
        { restaurantId: order.restaurantId },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      ).lean();

      const seq = counter?.seq || 1;
      const nextNumber = `${buildOrderNumber(brandCode, branchCode)}-${String(
        seq,
      ).padStart(4, "0")}`;
      try {
        await Order.updateOne(
          { _id: order._id },
          { $set: { orderNumber: nextNumber } },
          { runValidators: true },
        );
        updated += 1;
        success = true;
      } catch (error) {
        if (error?.code === 11000) {
          attempts += 1;
          continue;
        }
        throw error;
      }
    }

    if (!success) {
      skipped += 1;
    }
  }

  console.log(
    `Backfill complete. Updated: ${updated}, Skipped (duplicate retries): ${skipped}`,
  );
  await mongoose.connection.close();
}

backfillOrderNumbers().catch((error) => {
  console.error("Backfill failed:", error);
  mongoose.connection.close().finally(() => process.exit(1));
});
