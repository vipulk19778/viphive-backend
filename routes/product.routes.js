const express = require("express");
const multer = require("multer");

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const upload = multer({ dest: "uploads/" });

const validationMiddleware = require("../middleware/validation.middleware.js");
const {
  createProductSchema,
  updateProductSchema,
} = require("../validation/product.validation.js");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller.js");

const router = express.Router();

const validateProductUpdate = (req, res, next) => {
  const hasUploadedImage = Boolean(req.file);
  const hasBodyFields = Object.keys(req.body ?? {}).length > 0;

  if (hasUploadedImage && !hasBodyFields) {
    return next();
  }

  return validationMiddleware(updateProductSchema)(req, res, next);
};

/**
 * Product Routes
 * Base Route: /api/products
 */

// Get all products (Public) | Create a new product (Admin)
router
  .route("/")
  .get(getProducts)
  .post(
    authMiddleware,
    adminMiddleware,
    upload.single("image"),
    validationMiddleware(createProductSchema),
    createProduct,
  );

// Get by ID (Public) | Update or Delete a product by ID (Admin)
router
  .route("/:id")
  .get(getProductById)
  .put(
    authMiddleware,
    adminMiddleware,
    upload.single("image"),
    validateProductUpdate,
    updateProduct,
  )
  .delete(authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;
