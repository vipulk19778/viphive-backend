const mongoose = require("mongoose");

const { OTP_PURPOSES, getOtpExpiryDate } = require("../config/otp.config");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      lowercase: true,
      trim: true,
    },

    otp: {
      type: String,
      required: [true, "OTP is required."],
      select: false,
    },

    purpose: {
      type: String,
      required: [true, "Purpose is required."],
      enum: {
        values: Object.values(OTP_PURPOSES),
        message: "Invalid OTP purpose.",
      },
    },

    expiresAt: {
      type: Date,
      required: [true, "Expiry time is required."],
      default: getOtpExpiryDate,
    },

    attempts: {
      type: Number,
      default: 0,
      min: [0, "Attempts cannot be negative."],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/**
 * One active OTP per email + purpose.
 *
 * Example:
 * name@example.com + REGISTER
 * name@example.com + FORGOT_PASSWORD
 *
 * Both can exist, but there can only be one
 * REGISTER OTP and one FORGOT_PASSWORD OTP for the same email.
 */
otpSchema.index({ email: 1, purpose: 1 }, { unique: true });

/**
 * Automatically remove OTP documents after expiresAt.
 */
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otp", otpSchema);
