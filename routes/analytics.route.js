const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const { getAnalytics } = require("../controllers/analytics.controller");

const router = express.Router();

/**
 * Analytics Routes
 * Base Route: /api/analytics
 */

// Analytics (Admin)
router.get("/", authMiddleware, adminMiddleware, getAnalytics);

module.exports = router;
