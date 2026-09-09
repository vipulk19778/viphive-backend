const bcrypt = require("bcryptjs");

const asyncHandlerMiddlware = require("../middleware/asynchandler.middleware");

const User = require("../model/user.model");

const ApiError = require("../errors/api-error");

const sendEmail = require("../services/send-email.service");
const {
  issueOtp,
  verifyOtp: verifyOtpService,
  consumeOtp,
} = require("../services/otp.service");

const { successResponse } = require("../utils/response");
const createAuthToken = require("../utils/create-auth-token");

const { OTP_PURPOSES } = require("../config/otp.config");
const buildOtpEmail = require("../utils/email-templates/otp-email");

const PUBLIC_OTP_PURPOSES = [
  OTP_PURPOSES.REGISTER,
  OTP_PURPOSES.FORGOT_PASSWORD,
];
const AUTH_OTP_PURPOSES = [
  OTP_PURPOSES.CHANGE_PASSWORD,
  OTP_PURPOSES.DELETE_ACCOUNT,
  OTP_PURPOSES.CHANGE_EMAIL,
];
//=======================================================

// ================================================================
// Helper: Create and send registration OTP
// ================================================================

const sendRegistrationOtp = async (user) => {
  let otp;

  // Generate and store OTP
  try {
    otp = await issueOtp(user.email, OTP_PURPOSES.REGISTER);
  } catch (error) {
    console.error("Registration OTP creation failed:", error.message);

    throw new ApiError(
      500,
      "Unable to generate registration OTP. Please try again later.",
    );
  }

  // Build OTP email
  const { subject, text, html } = buildOtpEmail({
    purpose: OTP_PURPOSES.REGISTER,
    name: user.name,
    otp,
  });

  // Send OTP email
  try {
    await sendEmail(user.email, subject, text, html);
  } catch (error) {
    console.error("Registration OTP email failed:", error.message);

    // Remove OTP because it was not delivered
    try {
      await consumeOtp(user.email, OTP_PURPOSES.REGISTER);
    } catch (cleanupError) {
      console.error("Registration OTP cleanup failed:", cleanupError.message);
    }

    throw new ApiError(
      500,
      "Unable to send registration OTP. Please try again later.",
    );
  }
};

/**
 * @route   POST /api/auth/register
 * @access  Public
 * @desc    Register a new user
 */
const registerUser = asyncHandlerMiddlware(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email }).lean();

  // ============================================================
  // Existing user
  // ============================================================

  if (existingUser) {
    // Verified user cannot register again
    if (existingUser.verified) {
      throw new ApiError(409, "User already exists.");
    }

    /*
     * User exists but is not verified.
     *
     * Treat this as restarting the registration process:
     * - Update name
     * - Update password
     * - Generate a fresh OTP
     * - Send the OTP
     */
    const updatedHashedPassword = await bcrypt.hash(password, 10);

    let updatedUser;

    try {
      updatedUser = await User.findByIdAndUpdate(
        existingUser._id,
        {
          $set: {
            name,
            password: updatedHashedPassword,
          },
        },
        {
          returnDocument: "after",
        },
      ).lean();
    } catch (error) {
      console.error("Unverified user update failed:", error.message);

      throw new ApiError(
        500,
        "Unable to continue registration. Please try again later.",
      );
    }

    if (!updatedUser) {
      throw new ApiError(404, "User not found.");
    }

    // Generate and send fresh registration OTP
    await sendRegistrationOtp(updatedUser);

    return successResponse(res, {
      statusCode: 200,
      message:
        "Registration details updated. A fresh OTP has been sent to your email.",
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        verified: updatedUser.verified,
        requiresOtpVerification: true,
      },
    });
  }

  // ============================================================
  // New user
  // ============================================================

  const hashedPassword = await bcrypt.hash(password, 10);

  let user;

  try {
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      verified: false,
    });
  } catch (error) {
    console.error("User creation failed:", error.message);

    // Handle race condition caused by unique email index
    if (error.code === 11000) {
      throw new ApiError(409, "User already exists.");
    }

    throw new ApiError(
      500,
      "Unable to complete registration. Please try again later.",
    );
  }

  // ============================================================
  // Generate and send registration OTP
  // ============================================================

  try {
    await sendRegistrationOtp(user);
  } catch (error) {
    /*
     * OTP email is critical for registration.
     *
     * If the email cannot be sent, remove the newly
     * created user so registration does not remain
     * partially completed.
     */
    try {
      await user.deleteOne();
    } catch (rollbackError) {
      console.error(
        "Registration user rollback failed:",
        rollbackError.message,
      );
    }

    throw error;
  }

  // ============================================================
  // Response
  // ============================================================

  return successResponse(res, {
    statusCode: 201,
    message: "Registration successful. Please check your email for the OTP.",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified,
      requiresOtpVerification: true,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

//=======================================================

/**
 * @route   POST /api/auth/login
 * @access  Public
 * @desc    Login user
 */
const loginUser = asyncHandlerMiddlware(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password").lean();

  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (!user.verified) {
    throw new ApiError(403, "Please verify your email before logging in.");
  }

  const token = createAuthToken(user._id);

  return successResponse(res, {
    message: "Login successful.",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
      verified: user.verified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

//=======================================================

/**
 * @route   POST /api/auth/verify-otp || /api/auth/verify-auth-otp
 * @access  Public || Private
 * @desc    Verify OTP
 */
const verifyOtp = asyncHandlerMiddlware(async (req, res) => {
  const { otp, purpose } = req.body;

  const isAuthenticatedFlow = Boolean(req.user);
  const email = isAuthenticatedFlow ? req.user.email : req.body.email;

  if (!isAuthenticatedFlow && AUTH_OTP_PURPOSES.includes(purpose)) {
    throw new ApiError(403, "This OTP purpose requires authentication.");
  }

  if (isAuthenticatedFlow && PUBLIC_OTP_PURPOSES.includes(purpose)) {
    throw new ApiError(400, "Please use the public verify OTP endpoint.");
  }

  /*
   * Registration is currently the only flow that
   * completes authentication directly after OTP verification.
   */
  if (purpose === OTP_PURPOSES.REGISTER) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    if (user.verified) {
      throw new ApiError(400, "User is already verified.");
    }

    await verifyOtpService(email, otp, OTP_PURPOSES.REGISTER);

    /*
     * Generate token before modifying user state.
     */
    const token = createAuthToken(user._id);

    user.verified = true;
    await user.save();

    await consumeOtp(email, OTP_PURPOSES.REGISTER);

    return successResponse(res, {
      message: "OTP verified successfully.",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
        verified: user.verified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  }

  /*
   * The remaining OTP purposes are verified here,
   * but their business actions should be handled
   * explicitly by their respective flows.
   */
  await verifyOtpService(email, otp, purpose);

  await consumeOtp(email, purpose);

  return successResponse(res, {
    message: "OTP verified successfully.",
    data: {
      purpose,
    },
  });
});

//=======================================================

/**
 * @route   POST /api/auth/send-otp || /api/auth/send-auth-otp
 * @access  Public || Private
 * @desc    Issue/Resend OTP
 */
const sendOtp = asyncHandlerMiddlware(async (req, res) => {
  const { purpose } = req.body;

  const isAuthenticatedFlow = Boolean(req.user);
  const email = isAuthenticatedFlow ? req.user.email : req.body.email;

  if (!isAuthenticatedFlow && AUTH_OTP_PURPOSES.includes(purpose)) {
    throw new ApiError(403, "This OTP purpose requires authentication.");
  }

  if (isAuthenticatedFlow && PUBLIC_OTP_PURPOSES.includes(purpose)) {
    throw new ApiError(400, "Please use the public send OTP endpoint.");
  }

  const user = await User.findOne({ email }).lean();

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  /*
   * Registration OTP can only be issued
   * for an unverified user.
   */
  if (purpose === OTP_PURPOSES.REGISTER && user.verified) {
    throw new ApiError(400, "User is already verified.");
  }

  /*
   * Forgot-password OTP should only be issued
   * to a verified account.
   */
  if (purpose === OTP_PURPOSES.FORGOT_PASSWORD && !user.verified) {
    throw new ApiError(403, "Please verify your account first.");
  }

  let otp;

  try {
    otp = await issueOtp(email, purpose);
  } catch (error) {
    console.error("OTP creation failed:", error.message);

    throw new ApiError(500, "Unable to generate OTP. Please try again later.");
  }

  const { subject, text, html } = buildOtpEmail({
    purpose,
    name: user.name,
    otp,
  });

  try {
    await sendEmail(email, subject, text, html);
  } catch (error) {
    console.error("OTP email failed:", error.message);

    /*
     * Do not leave an OTP that the user never received.
     */
    await consumeOtp(email, purpose);

    throw new ApiError(500, "Unable to send OTP. Please try again later.");
  }

  return successResponse(res, {
    message: "OTP sent successfully.",
  });
});

//=======================================================

/**
 * @route   GET /api/auth/users
 * @access  Private/Admin
 * @desc    Get all users
 */
const getUsers = asyncHandlerMiddlware(async (req, res) => {
  const users = await User.find({}).lean();

  return successResponse(res, {
    message: "Users fetched successfully.",
    data: users,
  });
});

module.exports = {
  registerUser,
  loginUser,
  verifyOtp,
  sendOtp,
  getUsers,
};
