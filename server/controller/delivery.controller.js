import DeliveryOrder from "../models/deliveryOrder.model.js";
import Restaurant from "../models/restaurant.model.js";
import User from "../models/user.model.js";
import BranchMenuItem from "../models/branchMenuItem.model.js";
import { emitter } from "../socket/emitter.js";
import { ErrorResponse } from "../utils/errorResponse.js";
import crypto from "crypto";

/**
 * Generate unique delivery order ID
 * Format: PLD-{timestamp}-{random4chars}
 */
const generateUniqueOrderId = () => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `PLD-${timestamp}-${random}`;
};

/**
 * Create Delivery Order from online platform
 * Used for Swiggy, Zomato, or custom online orders
 */
export const createDeliveryOrderController = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const {
      platform,
      platformOrderId,
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      items,
      itemsSubtotal,
      packagingCharges,
      deliveryCharges,
      discount,
      tax,
      paymentMethod,
      specialInstructions,
      scheduledDeliveryTime,
    } = req.body;

    // Validate restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res
        .status(404)
        .json(new ErrorResponse("Restaurant not found", 404));
    }

    // Validate and fetch items
    const validatedItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const branchItem = await BranchMenuItem.findById(item.branchMenuItemId);
      if (!branchItem) {
        return res
          .status(400)
          .json(
            new ErrorResponse(`Item ${item.branchMenuItemId} not found`, 400),
          );
      }

      const itemTotal = item.price * item.quantity;
      calculatedSubtotal += itemTotal;

      validatedItems.push({
        branchMenuItemId: item.branchMenuItemId,
        name: branchItem.itemName || item.name,
        price: item.price,
        quantity: item.quantity,
        selectedModifiers: item.selectedModifiers || [],
        itemStatus: "NEW",
      });
    }

    // Calculate total
    const calculatedTax =
      tax || Math.round(calculatedSubtotal * 0.05 * 100) / 100; // 5% tax
    const totalAmount =
      calculatedSubtotal +
      (packagingCharges || 0) +
      (deliveryCharges || 0) +
      calculatedTax -
      (discount || 0);

    // Create delivery order
    const deliveryOrder = new DeliveryOrder({
      restaurantId,
      orderId: generateUniqueOrderId(),
      platform: platform || "OWN_PLATFORM",
      platformOrderId,
      customerName,
      customerPhone,
      customerEmail: customerEmail || null,
      deliveryAddress,
      items: validatedItems,
      itemsSubtotal: calculatedSubtotal,
      packagingCharges: packagingCharges || 0,
      deliveryCharges: deliveryCharges || 0,
      discount: discount || 0,
      tax: calculatedTax,
      totalAmount,
      paymentMethod: paymentMethod || "PREPAID",
      paymentStatus: paymentMethod === "CASH" ? "PENDING" : "COMPLETED",
      paidAt: paymentMethod === "CASH" ? null : new Date(),
      specialInstructions: specialInstructions || {},
      isScheduled: !!scheduledDeliveryTime,
      scheduledDeliveryTime: scheduledDeliveryTime || null,
      orderStatus: "NEW",
      statusTimeline: [{ status: "NEW", timestamp: new Date() }],
    });

    await deliveryOrder.save();

    // Emit socket event to kitchen
    emitter.emit("delivery:order-received", {
      deliveryOrder: deliveryOrder.toObject(),
      restaurantId,
    });

    res.status(201).json({
      success: true,
      message: "Delivery order created successfully",
      data: deliveryOrder,
    });
  } catch (error) {
    console.error("Create delivery order error:", error);
    res.status(500).json(new ErrorResponse(error.message, 500));
  }
};

/**
 * Get all delivery orders for a restaurant with filters
 */
export const listDeliveryOrdersController = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { status, platform, paymentStatus, page = 1, limit = 10 } = req.query;

    const query = { restaurantId };

    if (status) query.orderStatus = status;
    if (platform) query.platform = platform;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        {
          path: "deliveryPartner.userId",
          select: "name phone profileImage rating",
        },
        { path: "items.branchMenuItemId", select: "itemName" },
      ],
    };

    const result = await DeliveryOrder.paginate(query, options);

    res.status(200).json({
      success: true,
      data: result.docs,
      pagination: {
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        page: result.page,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });
  } catch (error) {
    console.error("List delivery orders error:", error);
    res.status(500).json(new ErrorResponse(error.message, 500));
  }
};

/**
 * Get specific delivery order details
 */
export const getDeliveryOrderDetailController = async (req, res) => {
  try {
    const { restaurantId, orderId } = req.params;

    const deliveryOrder = await DeliveryOrder.findOne({
      restaurantId,
      _id: orderId,
    })
      .populate("deliveryPartner.userId", "name phone profileImage rating")
      .populate("items.branchMenuItemId", "itemName")
      .lean();

    if (!deliveryOrder) {
      return res
        .status(404)
        .json(new ErrorResponse("Delivery order not found", 404));
    }

    res.status(200).json({
      success: true,
      data: deliveryOrder,
    });
  } catch (error) {
    console.error("Get delivery order detail error:", error);
    res.status(500).json(new ErrorResponse(error.message, 500));
  }
};

/**
 * Update delivery order status
 */
export const updateDeliveryOrderStatusController = async (req, res) => {
  try {
    const { restaurantId, orderId } = req.params;
    const { status, note } = req.body;

    const validStatuses = [
      "CONFIRMED",
      "PREPARING",
      "READY_FOR_PICKUP",
      "PICKED_UP",
      "OUT_FOR_DELIVERY",
      "NEARBY",
      "DELIVERED",
      "CANCELLED",
      "FAILED",
    ];

    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json(new ErrorResponse(`Invalid status: ${status}`, 400));
    }

    const deliveryOrder = await DeliveryOrder.findOneAndUpdate(
      { restaurantId, _id: orderId },
      {
        orderStatus: status,
        $push: {
          statusTimeline: {
            status,
            timestamp: new Date(),
            note: note || null,
          },
        },
      },
      { new: true },
    );

    if (!deliveryOrder) {
      return res
        .status(404)
        .json(new ErrorResponse("Delivery order not found", 404));
    }

    // Emit socket event based on status
    const socketEventMap = {
      CONFIRMED: "delivery:confirmed",
      PREPARING: "delivery:preparing",
      READY_FOR_PICKUP: "delivery:ready-for-pickup",
      PICKED_UP: "delivery:picked-up",
      OUT_FOR_DELIVERY: "delivery:out-for-delivery",
      NEARBY: "delivery:nearby",
      DELIVERED: "delivery:delivered",
      CANCELLED: "delivery:cancelled",
    };

    const eventName = socketEventMap[status];
    if (eventName) {
      emitter.emit(eventName, {
        deliveryOrder: deliveryOrder.toObject(),
        restaurantId,
      });
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: deliveryOrder,
    });
  } catch (error) {
    console.error("Update delivery order status error:", error);
    res.status(500).json(new ErrorResponse(error.message, 500));
  }
};

/**
 * Assign delivery partner to order
 */
export const assignDeliveryPartnerController = async (req, res) => {
  try {
    const { restaurantId, orderId } = req.params;
    const { deliveryPartnerId, estimatedDeliveryTime } = req.body;

    // Validate delivery partner
    const deliveryPartner = await User.findOne({
      _id: deliveryPartnerId,
      role: { $in: ["DELIVERY_PARTNER", "STAFF"] },
    });

    if (!deliveryPartner) {
      return res
        .status(404)
        .json(new ErrorResponse("Delivery partner not found", 404));
    }

    const deliveryOrder = await DeliveryOrder.findOneAndUpdate(
      { restaurantId, _id: orderId },
      {
        "deliveryPartner.userId": deliveryPartnerId,
        "deliveryPartner.name": deliveryPartner.name,
        "deliveryPartner.phone": deliveryPartner.phone,
        "deliveryPartner.rating": deliveryPartner.rating || null,
        "deliveryPartner.profileImage": deliveryPartner.profileImage || null,
        "deliveryTracking.estimatedDeliveryTime":
          estimatedDeliveryTime || new Date(Date.now() + 30 * 60000), // 30 mins default
        orderStatus: "CONFIRMED",
        $push: {
          statusTimeline: {
            status: "CONFIRMED",
            timestamp: new Date(),
            note: `Assigned to ${deliveryPartner.name}`,
          },
        },
      },
      { new: true },
    );

    if (!deliveryOrder) {
      return res
        .status(404)
        .json(new ErrorResponse("Delivery order not found", 404));
    }

    // Emit socket events
    emitter.emit("delivery:partner-assigned", {
      deliveryOrder: deliveryOrder.toObject(),
      restaurantId,
    });

    emitter.emit("delivery-partner:order-assigned", {
      deliveryOrder: deliveryOrder.toObject(),
      deliveryPartnerId,
    });

    res.status(200).json({
      success: true,
      message: "Delivery partner assigned successfully",
      data: deliveryOrder,
    });
  } catch (error) {
    console.error("Assign delivery partner error:", error);
    res.status(500).json(new ErrorResponse(error.message, 500));
  }
};

/**
 * Update delivery partner location for tracking
 */
export const updateDeliveryPartnerLocationController = async (req, res) => {
  try {
    const { restaurantId, orderId } = req.params;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json(new ErrorResponse("Latitude and longitude required", 400));
    }

    const deliveryOrder = await DeliveryOrder.findOne({
      restaurantId,
      _id: orderId,
    });

    if (!deliveryOrder) {
      return res
        .status(404)
        .json(new ErrorResponse("Delivery order not found", 404));
    }

    // Update location
    deliveryOrder.deliveryPartner.location = {
      latitude,
      longitude,
      timestamp: new Date(),
    };

    await deliveryOrder.save();

    // Broadcast location to customer
    emitter.emit("delivery:location-updated", {
      orderId: deliveryOrder.orderId,
      location: { latitude, longitude },
      restaurantId,
    });

    res.status(200).json({
      success: true,
      message: "Location updated successfully",
      data: { location: deliveryOrder.deliveryPartner.location },
    });
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json(new ErrorResponse(error.message, 500));
  }
};

/**
 * Get delivery orders for delivery partner
 */
export const getDeliveryPartnerOrdersController = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const deliveryPartnerId = req.user.id;
    const { status = "OUT_FOR_DELIVERY", page = 1, limit = 10 } = req.query;

    const query = {
      restaurantId,
      "deliveryPartner.userId": deliveryPartnerId,
    };

    if (status) {
      query.orderStatus = { $in: status.split(",") };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: [{ path: "items.branchMenuItemId", select: "itemName" }],
    };

    const result = await DeliveryOrder.paginate(query, options);

    res.status(200).json({
      success: true,
      data: result.docs,
      pagination: {
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        page: result.page,
      },
    });
  } catch (error) {
    console.error("Get delivery partner orders error:", error);
    res.status(500).json(new ErrorResponse(error.message, 500));
  }
};

/**
 * Mark delivery order as delivered
 */
export const completeDeliveryController = async (req, res) => {
  try {
    const { restaurantId, orderId } = req.params;
    const { deliveryPartnerRating, deliveryPartnerReview } = req.body;

    const deliveryOrder = await DeliveryOrder.findOneAndUpdate(
      { restaurantId, _id: orderId },
      {
        orderStatus: "DELIVERED",
        "deliveryTracking.deliveredAt": new Date(),
        "feedback.deliveryRating": deliveryPartnerRating || null,
        "feedback.deliveryReview": deliveryPartnerReview || null,
        "feedback.feedbackAt": new Date(),
        $push: {
          statusTimeline: {
            status: "DELIVERED",
            timestamp: new Date(),
            note: "Order delivered successfully",
          },
        },
      },
      { new: true },
    );

    if (!deliveryOrder) {
      return res
        .status(404)
        .json(new ErrorResponse("Delivery order not found", 404));
    }

    emitter.emit("delivery:delivered", {
      deliveryOrder: deliveryOrder.toObject(),
      restaurantId,
    });

    res.status(200).json({
      success: true,
      message: "Order marked as delivered",
      data: deliveryOrder,
    });
  } catch (error) {
    console.error("Complete delivery error:", error);
    res.status(500).json(new ErrorResponse(error.message, 500));
  }
};

/**
 * Cancel delivery order
 */
export const cancelDeliveryOrderController = async (req, res) => {
  try {
    const { restaurantId, orderId } = req.params;
    const { cancelledBy, cancelReason, refundAmount } = req.body;

    const validCancelledBy = [
      "CUSTOMER",
      "RESTAURANT",
      "DELIVERY_PARTNER",
      "SYSTEM",
    ];

    if (!validCancelledBy.includes(cancelledBy)) {
      return res
        .status(400)
        .json(new ErrorResponse("Invalid cancelledBy value", 400));
    }

    const deliveryOrder = await DeliveryOrder.findOneAndUpdate(
      { restaurantId, _id: orderId },
      {
        orderStatus: "CANCELLED",
        cancelledBy,
        cancelledReason: cancelReason || null,
        cancelledAt: new Date(),
        refundStatus: "PENDING",
        refundAmount: refundAmount || 0,
        $push: {
          statusTimeline: {
            status: "CANCELLED",
            timestamp: new Date(),
            note: `Cancelled by ${cancelledBy}: ${cancelReason || "No reason provided"}`,
          },
        },
      },
      { new: true },
    );

    if (!deliveryOrder) {
      return res
        .status(404)
        .json(new ErrorResponse("Delivery order not found", 404));
    }

    emitter.emit("delivery:cancelled", {
      deliveryOrder: deliveryOrder.toObject(),
      restaurantId,
    });

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: deliveryOrder,
    });
  } catch (error) {
    console.error("Cancel delivery order error:", error);
    res.status(500).json(new ErrorResponse(error.message, 500));
  }
};

/**
 * Get delivery orders summary/analytics
 */
export const getDeliveryOrdersSummaryController = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { startDate, endDate } = req.query;

    const query = { restaurantId };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const [
      totalOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      averageOrderValue,
      paymentMethodBreakdown,
      platformBreakdown,
    ] = await Promise.all([
      DeliveryOrder.countDocuments(query),
      DeliveryOrder.countDocuments({ ...query, orderStatus: "DELIVERED" }),
      DeliveryOrder.countDocuments({ ...query, orderStatus: "CANCELLED" }),
      DeliveryOrder.aggregate([
        { $match: { ...query, orderStatus: "DELIVERED" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      DeliveryOrder.aggregate([
        { $match: query },
        { $group: { _id: null, average: { $avg: "$totalAmount" } } },
      ]),
      DeliveryOrder.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$paymentMethod",
            count: { $sum: 1 },
            amount: { $sum: "$totalAmount" },
          },
        },
      ]),
      DeliveryOrder.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$platform",
            count: { $sum: 1 },
            amount: { $sum: "$totalAmount" },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalOrders,
          completedOrders,
          completionRate:
            totalOrders > 0
              ? ((completedOrders / totalOrders) * 100).toFixed(2) + "%"
              : "0%",
          cancelledOrders,
          cancellationRate:
            totalOrders > 0
              ? ((cancelledOrders / totalOrders) * 100).toFixed(2) + "%"
              : "0%",
        },
        financials: {
          totalRevenue: totalRevenue[0]?.total || 0,
          averageOrderValue: averageOrderValue[0]?.average || 0,
        },
        paymentMethodBreakdown,
        platformBreakdown,
      },
    });
  } catch (error) {
    console.error("Get summary error:", error);
    res.status(500).json(new ErrorResponse(error.message, 500));
  }
};

/**
 * Webhook for platform callbacks (Swiggy, Zomato)
 * Update order based on platform notifications
 */
export const platformWebhookController = async (req, res) => {
  try {
    const { platform, event, data } = req.body;

    if (!platform || !event || !data) {
      return res
        .status(400)
        .json(new ErrorResponse("Platform, event, and data are required", 400));
    }

    // Verify webhook signature if needed
    // TODO: Add signature verification for security

    const deliveryOrder = await DeliveryOrder.findOne({
      platform,
      platformOrderId: data.orderId,
    });

    if (!deliveryOrder) {
      return res.status(404).json(new ErrorResponse("Order not found", 404));
    }

    // Handle different events
    const eventHandlers = {
      "order.confirmed": "CONFIRMED",
      "order.preparing": "PREPARING",
      "order.ready": "READY_FOR_PICKUP",
      "order.picked_up": "PICKED_UP",
      "order.out_for_delivery": "OUT_FOR_DELIVERY",
      "order.nearby": "NEARBY",
      "order.delivered": "DELIVERED",
      "order.cancelled": "CANCELLED",
    };

    if (eventHandlers[event]) {
      deliveryOrder.orderStatus = eventHandlers[event];
      deliveryOrder.statusTimeline.push({
        status: eventHandlers[event],
        timestamp: new Date(),
        note: `Updated from ${platform} webhook`,
      });

      await deliveryOrder.save();

      emitter.emit("delivery:status-updated", {
        deliveryOrder: deliveryOrder.toObject(),
        source: "platform_webhook",
      });
    }

    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json(new ErrorResponse(error.message, 500));
  }
};
