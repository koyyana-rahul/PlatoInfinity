// src/controllers/restaurant.controller.js
import RestaurantModel from "../models/restaurant.model.js";
import AuditLog from "../models/auditLog.model.js"; // optional
import axios from "axios";

// controllers/restaurant.controller.js
export async function createRestaurantController(req, res) {
  try {
    const admin = req.user;
    const { name, phone, address, addressText, placeId, location } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Restaurant name required" });
    }

    /* ========= CASE 1: Indian Address (NEW) ========= */
    let finalAddressText = addressText;
    let finalLocation = location;

    if (address && address.pincode) {
      finalAddressText =
        addressText ||
        `${address.village || ""}, ${address.mandal || ""}, ${
          address.district || ""
        }, ${address.state || ""} - ${address.pincode}`;

      // Optional: fallback geo (India center)
      finalLocation = {
        type: "Point",
        coordinates: [78.9629, 20.5937],
      };
    }

    /* ========= CASE 2: Google Maps (OLD – still works) ========= */
    if (!finalAddressText || !finalLocation) {
      return res.status(400).json({
        message: "Address information missing",
      });
    }

    const restaurant = await Restaurant.create({
      brandId: admin.brandId,
      name,
      phone,
      addressText: finalAddressText,
      placeId: placeId || "INDIA_MANUAL",
      location: finalLocation,
      meta: {
        address, // 🔥 store structured Indian address
      },
    });

    return res.status(201).json({
      success: true,
      data: restaurant,
    });
  } catch (err) {
    console.error("createRestaurantController:", err);

    if (err.code === 11000) {
      return res.status(409).json({ message: "Restaurant already exists" });
    }

    return res.status(500).json({ message: "Server error" });
  }
}

export async function listRestaurantsController(req, res) {
  try {
    const admin = req.user;
    if (!admin.brandId)
      return res
        .status(400)
        .json({ message: "Admin has no brand", error: true, success: false });
    const restaurants = await RestaurantModel.find({
      brandId: admin.brandId,
      isArchived: false,
    }).lean();
    return res.json({
      message: "restaurants",
      error: false,
      success: true,
      data: restaurants,
    });
  } catch (err) {
    console.error("listRestaurantsController error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: true, success: false });
  }
}

// src/controllers/restaurant.controller.js
export async function getRestaurantByIdController(req, res) {
  try {
    const admin = req.user;
    const { restaurantId } = req.params;

    const restaurant = await RestaurantModel.findOne({
      _id: restaurantId,
      brandId: admin.brandId,
      isArchived: false,
    }).lean();

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    return res.json({
      success: true,
      data: restaurant,
    });
  } catch (err) {
    console.error("getRestaurantByIdController:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}
