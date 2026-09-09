const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

const validationMiddleware = require("../middleware/validation.middleware");
const {
  registerSchema,
  loginSchema,
  verifyOtpPublicSchema,
  verifyOtpAuthSchema,
  sendOtpPublicSchema,
  sendOtpAuthSchema,
} = require("../validation/auth.validation");

const {
  registerUser,
  loginUser,
  getUsers,
  verifyOtp,
  sendOtp,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", validationMiddleware(registerSchema), registerUser);
router.post("/login", validationMiddleware(loginSchema), loginUser);
router.post(
  "/verify-otp",
  validationMiddleware(verifyOtpPublicSchema),
  verifyOtp,
);
router.post("/send-otp", validationMiddleware(sendOtpPublicSchema), sendOtp);
router.post(
  "/verify-auth-otp",
  authMiddleware,
  validationMiddleware(verifyOtpAuthSchema),
  verifyOtp,
);
router.post(
  "/send-auth-otp",
  authMiddleware,
  validationMiddleware(sendOtpAuthSchema),
  sendOtp,
);
router.get("/users", authMiddleware, adminMiddleware, getUsers);

module.exports = router;
