const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const Otp = require("../model/otp.model");
const ApiError = require("../errors/api-error");

const {
  OTP_PURPOSES,
  OTP_MAX_ATTEMPTS,
  getOtpExpiryDate,
} = require("../config/otp.config");

/**
 * Generate a cryptographically secure 6-digit OTP.
 */
const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Create a new OTP.
 *
 * Used when an OTP does not already exist, such as
 * initial registration.
 *
 * Schema defaults handle:
 * - attempts = 0
 * - expiresAt = getOtpExpiryDate()
 */
const createOtp = async (email, purpose) => {
  const otp = generateOtp();

  const hashedOtp = await bcrypt.hash(otp, 10);

  await Otp.create({
    email,
    otp: hashedOtp,
    purpose,
  });

  return otp;
};

/**
 * Replace an existing OTP.
 *
 * Used for resend operations.
 *
 * Explicitly resets:
 * - attempts
 * - expiresAt
 */
const updateOtp = async (email, purpose) => {
  const otp = generateOtp();

  const hashedOtp = await bcrypt.hash(otp, 10);

  const otpRecord = await Otp.findOneAndUpdate(
    {
      email,
      purpose,
    },
    {
      $set: {
        otp: hashedOtp,
        attempts: 0,
        expiresAt: getOtpExpiryDate(),
      },
    },
  );

  if (!otpRecord) {
    throw new ApiError(400, "OTP not found. Please request a new OTP.");
  }

  return otp;
};

/**
 * Issue an OTP.
 *
 * If an OTP already exists, replace it.
 * Otherwise, create a new one.
 *
 * This allows the same function to be used for:
 * - registration
 * - resend OTP
 * - forgot password
 * - change password
 * - delete account
 */
const issueOtp = async (email, purpose) => {
  const existingOtp = await Otp.exists({
    email,
    purpose,
  });

  if (existingOtp) {
    return updateOtp(email, purpose);
  }

  return createOtp(email, purpose);
};

/**
 * Verify an OTP.
 *
 * Returns the OTP record if valid.
 * Does not delete the OTP.
 *
 * The caller decides what should happen after
 * successful verification.
 */
const verifyOtp = async (email, otp, purpose) => {
  const otpRecord = await Otp.findOne({
    email,
    purpose,
  }).select("+otp");

  if (!otpRecord) {
    throw new ApiError(400, "OTP not found. Please request a new OTP.");
  }

  // Check expiry
  if (otpRecord.expiresAt <= new Date()) {
    await otpRecord.deleteOne();

    throw new ApiError(400, "OTP expired. Please request a new OTP.");
  }

  // Check maximum attempts
  if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
    await otpRecord.deleteOne();

    throw new ApiError(
      429,
      "Too many invalid attempts. Please request a new OTP.",
    );
  }

  const isOtpMatched = await bcrypt.compare(otp, otpRecord.otp);

  if (!isOtpMatched) {
    otpRecord.attempts += 1;
    await otpRecord.save();

    const remainingAttempts = OTP_MAX_ATTEMPTS - otpRecord.attempts;

    throw new ApiError(
      401,
      `Invalid OTP. ${remainingAttempts} attempt${
        remainingAttempts === 1 ? "" : "s"
      } remaining.`,
    );
  }

  return otpRecord;
};

/**
 * Consume a successfully verified OTP.
 */
const consumeOtp = async (email, purpose) => {
  await Otp.deleteOne({
    email,
    purpose,
  });
};

module.exports = {
  generateOtp,
  createOtp,
  updateOtp,
  issueOtp,
  verifyOtp,
  consumeOtp,
};
