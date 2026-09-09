const crypto = require("crypto");
const mongoose = require("mongoose");

const Order = require("../model/order.model");
const asyncHandlerMiddlware = require("../middleware/asynchandler.middleware");
const ApiError = require("../errors/api-error");
const { successResponse } = require("../utils/response");
const { PAYMENT_STATUSES } = require("../config/payment.config");
const {
  razorpay,
  razorpayKeyId,
  razorpayKeySecret,
} = require("../config/razorpay.config");

/**
 * @route   GET /api/payments
 * @access  Private/Admin
 * @desc    Get payment-related order records
 */
const getPayments = asyncHandlerMiddlware(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const query = {
    paymentStatus: {
      $in: [
        PAYMENT_STATUSES.CREATED,
        PAYMENT_STATUSES.VERIFIED,
        PAYMENT_STATUSES.FAILED,
      ],
    },
  };

  const [payments, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")
      .lean(),
    Order.countDocuments(query),
  ]);

  return successResponse(res, {
    message: "Payments fetched successfully.",
    data: payments,
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

/**
 * @route   POST /api/payments/create-payment
 * @access  Private/User
 * @desc    Create Razorpay order
 */
const createPayment = asyncHandlerMiddlware(async (req, res) => {
  const { amount, currency = "INR", receipt, notes, orderId } = req.body;

  const amountInPaise = Math.round(Number(amount) * 100);

  if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
    throw new ApiError(400, "Amount must be a valid positive value.");
  }

  let razorpayOrder;

  try {
    razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        ...(orderId ? { orderId } : {}),
        ...(notes || {}),
      },
    });
  } catch (error) {
    if (error.statusCode === 401 || error.status === 401) {
      throw new ApiError(
        502,
        "Razorpay credentials were rejected. Please update RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      );
    }

    throw error;
  }

  if (orderId) {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new ApiError(400, "Invalid order id.");
    }

    const order = await Order.findOne({ _id: orderId, user: req.user._id });

    if (!order) {
      throw new ApiError(404, "Order not found.");
    }

    order.razorpayOrderId = razorpayOrder.id;
    order.paymentStatus = PAYMENT_STATUSES.CREATED;
    order.paymentFailedAt = null;
    await order.save();
  }

  return successResponse(res, {
    statusCode: 201,
    message: "Payment order created successfully.",
    data: {
      keyId: razorpayKeyId,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
      status: razorpayOrder.status,
      notes: razorpayOrder.notes,
      createdAt: razorpayOrder.created_at,
    },
  });
});

/**
 * @route   POST /api/payments/verify-payment
 * @access  Private/User
 * @desc    Verify Razorpay payment signature
 */
const verifyPayment = asyncHandlerMiddlware(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  const hmac = crypto.createHmac("sha256", razorpayKeySecret);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = hmac.digest("hex");

  if (digest !== razorpay_signature) {
    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      await Order.updateOne(
        { _id: orderId, user: req.user._id },
        {
          $set: {
            paymentStatus: PAYMENT_STATUSES.FAILED,
            paymentFailedAt: new Date(),
          },
        },
      );
    }

    throw new ApiError(400, "Payment verification failed.");
  }

  const orderQuery = orderId
    ? { _id: orderId, user: req.user._id }
    : { razorpayOrderId: razorpay_order_id, user: req.user._id };

  const order = await Order.findOne(orderQuery);

  if (order) {
    order.razorpayOrderId = razorpay_order_id;
    order.paymentId = razorpay_payment_id;
    order.paymentStatus = PAYMENT_STATUSES.VERIFIED;
    order.paymentVerifiedAt = new Date();
    order.paymentFailedAt = null;
    await order.save();
  }

  return successResponse(res, {
    message: "Payment verified successfully.",
    data: {
      verified: true,
      orderLinked: Boolean(order),
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    },
  });
});

module.exports = {
  getPayments,
  createPayment,
  verifyPayment,
};
