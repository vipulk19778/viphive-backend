const mongoose = require("mongoose");

const Order = require("../model/order.model");
const asyncHandlerMiddlware = require("../middleware/asynchandler.middleware");
const ApiError = require("../errors/api-error");
const { successResponse } = require("../utils/response");
const sendEmail = require("../services/send-email.service");
const {
  buildOrderCreatedEmail,
  buildOrderStatusEmail,
} = require("../utils/email-templates/order-email");

/**
 * Send an email notification to the user when a new order is created.
 *
 * @param {Object} order - The order object containing order details.
 */
const sendOrderCreatedEmail = async (order) => {
  const payload = buildOrderCreatedEmail(order);
  const userEmail = payload.to;

  if (!userEmail) {
    return;
  }

  await sendEmail(userEmail, payload.subject, payload.text, payload.html);
};

/**
 * Send an email notification to the user when the order status is updated.
 *
 * @param {Object} order - The order object containing order details.
 */
const sendOrderStatusEmail = async (order) => {
  const payload = buildOrderStatusEmail(order);
  const userEmail = payload.to;

  if (!userEmail) {
    return;
  }

  await sendEmail(userEmail, payload.subject, payload.text, payload.html);
};

/**===========================================
 * @route   GET /api/orders
 * @access  Private/Admin
 * @desc    Get all orders with pagination
 *==========================================*/
const getOrders = asyncHandlerMiddlware(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")
      .populate("items.product", "name imageUrl price")
      .lean(),
    Order.countDocuments(),
  ]);

  return successResponse(res, {
    message: "Orders fetched successfully.",
    data: orders,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  });
});

/**=====================================
 * @route   GET /api/orders/myorders
 * @access  Private/User
 * @desc    Get current user's orders
 *=====================================*/
const getMyOrders = asyncHandlerMiddlware(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("items.product", "name imageUrl price")
    .lean();

  return successResponse(res, {
    message: "Your orders fetched successfully.",
    data: orders,
  });
});

/**=============================
 * @route   POST /api/orders
 * @access  Private/User
 * @desc    Create a new order
 *=================================*/
const createOrder = asyncHandlerMiddlware(async (req, res) => {
  const { items, totalAmount, address, paymentId } = req.body;

  const order = await Order.create({
    user: req.user._id,
    items,
    totalAmount,
    address,
    paymentId,
  });

  const createdOrder = await Order.findById(order._id)
    .populate("user", "name email")
    .populate("items.product", "name imageUrl price")
    .lean();

  sendOrderCreatedEmail(createdOrder).catch((error) => {
    console.error("Order created email failed:", error.message);
  });

  return successResponse(res, {
    statusCode: 201,
    message: "Order created successfully.",
    data: createdOrder,
  });
});

/**====================================
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 * @desc    Update order status
 *====================================*/
const updateOrderStatus = asyncHandlerMiddlware(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid order id.");
  }

  const order = await Order.findById(id);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  order.status = status;
  await order.save();

  const updatedOrder = await Order.findById(order._id)
    .populate("user", "name email")
    .populate("items.product", "name imageUrl price")
    .lean();

  sendOrderStatusEmail(updatedOrder).catch((error) => {
    console.error("Order status email failed:", error.message);
  });

  return successResponse(res, {
    message: "Order status updated successfully.",
    data: updatedOrder,
  });
});

module.exports = {
  getOrders,
  getMyOrders,
  createOrder,
  updateOrderStatus,
};
