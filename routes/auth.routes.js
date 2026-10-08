const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const {
  adminRateLimiter,
  authRateLimiter,
  otpRateLimiter,
} = require("../middleware/rateLimit.middleware");

const validationMiddleware = require("../middleware/validation.middleware");
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  resetPasswordSchema,
  verifyOtpPublicSchema,
  verifyOtpAuthSchema,
  sendOtpPublicSchema,
  sendOtpAuthSchema,
} = require("../validation/auth.validation");

const {
  registerUser,
  loginUser,
  changePassword,
  resetPassword,
  getUsers,
  verifyOtp,
  sendOtp,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post(
  "/register",
  authRateLimiter,
  validationMiddleware(registerSchema),
  registerUser,
);
router.post(
  "/login",
  authRateLimiter,
  validationMiddleware(loginSchema),
  loginUser,
);
router.post(
  "/change-password",
  authRateLimiter,
  authMiddleware,
  validationMiddleware(changePasswordSchema),
  changePassword,
);
router.post(
  "/reset-password",
  authRateLimiter,
  validationMiddleware(resetPasswordSchema),
  resetPassword,
);
router.post(
  "/verify-otp",
  otpRateLimiter,
  validationMiddleware(verifyOtpPublicSchema),
  verifyOtp,
);
router.post(
  "/send-otp",
  otpRateLimiter,
  validationMiddleware(sendOtpPublicSchema),
  sendOtp,
);
router.post(
  "/verify-auth-otp",
  otpRateLimiter,
  authMiddleware,
  validationMiddleware(verifyOtpAuthSchema),
  verifyOtp,
);
router.post(
  "/send-auth-otp",
  otpRateLimiter,
  authMiddleware,
  validationMiddleware(sendOtpAuthSchema),
  sendOtp,
);
router.get(
  "/users",
  adminRateLimiter,
  authMiddleware,
  adminMiddleware,
  getUsers,
);

module.exports = router;
