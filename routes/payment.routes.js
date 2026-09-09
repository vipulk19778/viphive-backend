const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const validationMiddleware = require("../middleware/validation.middleware");
const {
  getPayments,
  createPayment,
  verifyPayment,
} = require("../controllers/payment.controller");

const {
  createPaymentSchema,
  verifyPaymentSchema,
} = require("../validation/payment.validation");

const router = express.Router();

/**
 * Payment Routes
 * Base Route: /api/payments
 */

// Get all payments (Admin)
router.get("/", authMiddleware, adminMiddleware, getPayments);

// Create Razorpay order (User)
router.post(
  "/create-payment",
  authMiddleware,
  validationMiddleware(createPaymentSchema),
  createPayment,
);

// Verify Razorpay signature (User)
router.post(
  "/verify-payment",
  authMiddleware,
  validationMiddleware(verifyPaymentSchema),
  verifyPayment,
);

module.exports = router;
