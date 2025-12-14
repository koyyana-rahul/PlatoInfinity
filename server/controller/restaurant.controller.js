// src/controllers/restaurant.controller.js
import RestaurantModel from "../models/restaurant.model.js";
import AuditLog from "../models/auditLog.model.js"; // optional

export async function createRestaurantController(req, res) {
  try {
    const admin = req.user;
    const { name, address = "", phone = "", timezone = "" } = req.body;
    if (!name)
      return res
        .status(400)
        .json({ message: "name required", error: true, success: false });

    // create branch under admin.brandId - ensure admin has a brandId
    if (!admin.brandId)
      return res
        .status(400)
        .json({
          message:
            "Admin does not have a brandId. Create or assign a brand first.",
          error: true,
          success: false,
        });

    const restaurant = await RestaurantModel.create({
      brandId: admin.brandId,
      name,
      address,
      phone,
      timezone,
    });

    try {
      await AuditLog.create({
        actorType: "USER",
        actorId: String(admin._id),
        action: "CREATE_RESTAURANT",
        entityType: "Restaurant",
        entityId: String(restaurant._id),
      });
    } catch (e) {
      /* ignore */
    }

    return res
      .status(201)
      .json({
        message: "Restaurant (branch) created",
        error: false,
        success: true,
        data: restaurant,
      });
  } catch (err) {
    console.error("createRestaurantController error:", err);
    if (err.code === 11000)
      return res
        .status(409)
        .json({
          message: "Duplicate branch (name/phone)",
          error: true,
          success: false,
        });
    return res
      .status(500)
      .json({ message: "Server error", error: true, success: false });
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
