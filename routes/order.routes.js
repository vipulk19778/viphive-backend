const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const validationMiddleware = require("../middleware/validation.middleware.js");

const {
  getOrders,
  getMyOrders,
  createOrder,
  updateOrderStatus,
} = require("../controllers/order.controller.js");
const {
  createOrderSchema,
  updateOrderStatusSchema,
} = require("../validation/order.validation.js");

const router = express.Router();

/**
 * Order Routes
 * Base Route: /api/orders
 */

// Get all orders (Admin) | Create a new order (User)
router
  .route("/")
  .get(authMiddleware, adminMiddleware, getOrders)
  .post(authMiddleware, validationMiddleware(createOrderSchema), createOrder);

// Get my orders(User)
router.route("/my-orders").get(authMiddleware, getMyOrders);

// Update order status by ID (Admin only)
router
  .route("/:id/status")
  .put(
    authMiddleware,
    adminMiddleware,
    validationMiddleware(updateOrderStatusSchema),
    updateOrderStatus,
  );

module.exports = router;
