// src/controllers/kitchenStation.controller.js
import KitchenStation from "../models/kitchenStation.model.js";
import mongoose from "mongoose";

/**
 * MANAGER creates station
 */
export async function createKitchenStation(req, res) {
  try {
    const { restaurantId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Station name is required",
        error: true,
        success: false,
      });
    }

    const station = await KitchenStation.create({
      restaurantId,
      name,
    });

    return res.status(201).json({
      success: true,
      error: false,
      data: station,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Station already exists",
        error: true,
        success: false,
      });
    }

    console.error("createKitchenStation:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

/**
 * LIST stations for a restaurant
 */
/**
 * Disable station (soft delete)
 */

export async function listKitchenStations(req, res) {
  try {
    const { restaurantId } = req.params;
    const { includeArchived } = req.query;

    const filter = {
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
    };

    // Only show active stations by default
    if (includeArchived !== "true") {
      filter.isArchived = false;
    }

    const stations = await KitchenStation.find(filter).sort({ name: 1 }).lean();

    return res.json({
      success: true,
      error: false,
      data: stations,
    });
  } catch (err) {
    console.error("listKitchenStations:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

export async function disableKitchenStation(req, res) {
  try {
    const { stationId } = req.params;
    const manager = req.user;

    const station = await KitchenStation.findById(stationId);
    if (!station) {
      return res.status(404).json({
        message: "Kitchen station not found",
        error: true,
        success: false,
      });
    }

    // 🔐 Security: ensure manager belongs to same restaurant
    if (String(station.restaurantId) !== String(manager.restaurantId)) {
      return res.status(403).json({
        message: "Not allowed to disable this station",
        error: true,
        success: false,
      });
    }

    station.isArchived = true;
    await station.save();

    return res.json({
      success: true,
      error: false,
      message: "Kitchen station disabled",
    });
  } catch (err) {
    console.error("disableKitchenStation:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

// src/controller/kitchenStation.controller.js
export async function enableKitchenStation(req, res) {
  try {
    const { stationId } = req.params;
    const manager = req.user;

    const station = await KitchenStation.findById(stationId);
    if (!station) {
      return res.status(404).json({
        message: "Kitchen station not found",
        error: true,
        success: false,
      });
    }

    // security: same restaurant
    if (String(station.restaurantId) !== String(manager.restaurantId)) {
      return res.status(403).json({
        message: "Not allowed",
        error: true,
        success: false,
      });
    }

    if (!station.isArchived) {
      return res.json({
        success: true,
        error: false,
        message: "Kitchen station already enabled",
      });
    }

    station.isArchived = false;
    await station.save();

    return res.json({
      success: true,
      error: false,
      message: "Kitchen station enabled",
      data: station,
    });
  } catch (err) {
    console.error("enableKitchenStation:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}
