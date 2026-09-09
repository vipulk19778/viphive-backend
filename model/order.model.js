const mongoose = require("mongoose");
const {
  ORDER_STATUS_VALUES,
  DEFAULT_ORDER_STATUS,
} = require("../config/order.config");
const {
  PAYMENT_STATUS_VALUES,
  DEFAULT_PAYMENT_STATUS,
} = require("../config/payment.config");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required."],
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product reference is required."],
        },
        qty: {
          type: Number,
          required: [true, "Product quantity is required."],
          min: [1, "Quantity must be at least 1."],
        },
        price: {
          type: Number,
          required: [true, "Product price is required."],
          min: [0, "Price cannot be negative."],
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: [true, "Total amount is required."],
      min: [0, "Total amount cannot be negative."],
    },

    address: {
      fullName: {
        type: String,
        required: [true, "Full name is required."],
        trim: true,
      },
      street: {
        type: String,
        required: [true, "Street address is required."],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required."],
        trim: true,
      },
      state: {
        type: String,
        required: [true, "State is required."],
        trim: true,
      },
      postalCode: {
        type: String,
        required: [true, "Postal code is required."],
        trim: true,
      },
      country: {
        type: String,
        required: [true, "Country is required."],
        trim: true,
      },
    },

    paymentId: {
      type: String,
      trim: true,
      default: null,
    },

    razorpayOrderId: {
      type: String,
      trim: true,
      default: null,
    },

    paymentStatus: {
      type: String,
      enum: {
        values: PAYMENT_STATUS_VALUES,
        message: "Payment status is not valid.",
      },
      default: DEFAULT_PAYMENT_STATUS,
    },

    paymentVerifiedAt: {
      type: Date,
      default: null,
    },

    paymentFailedAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ORDER_STATUS_VALUES,
        message: "Status is not valid.",
      },
      default: DEFAULT_ORDER_STATUS,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
