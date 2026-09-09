const mongoose = require("mongoose");

const Product = require("../model/product.model");
const asyncHandlerMiddlware = require("../middleware/asynchandler.middleware");
const { successResponse } = require("../utils/response");
const ApiError = require("../errors/api-error");
const { uploadImage } = require("../services/cloudinary.service");

/**
 * @route   GET /api/products
 * @access  Public
 * @desc    Get all products with pagination
 */
const getProducts = asyncHandlerMiddlware(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find({}).skip(skip).limit(limit).lean(),
    Product.countDocuments(),
  ]);

  return successResponse(res, {
    message: "Products fetched successfully",
    data: products,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  });
});

/**
 * @route   GET /api/products/:id
 * @access  Public
 * @desc    Get product by ID
 */
const getProductById = asyncHandlerMiddlware(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid product id.");
  }
  const product = await Product.findById(id).lean();

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return successResponse(res, {
    message: "Product fetched successfully",
    data: product,
  });
});

/**
 * @route   POST /api/products
 * @access  Private/Admin
 * @desc    Create a new product
 */
const createProduct = asyncHandlerMiddlware(async (req, res) => {
  const { name, description, price, category, stock } = req.body;

  if (!req.file) {
    throw new ApiError(400, "Product image is required.");
  }

  const result = await uploadImage(req.file.path);

  const product = await Product.create({
    name,
    description,
    price,
    category,
    stock,
    imageUrl: result.secure_url,
  });

  return successResponse(res, {
    statusCode: 201,
    message: "Product created successfully.",
    data: product,
  });
});

/**
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 * @desc    Update an existing product
 */
const updateProduct = asyncHandlerMiddlware(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid product id.");
  }

  const { name, description, price, category, stock } = req.body;

  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  if (req.file) {
    const result = await uploadImage(req.file.path);
    product.imageUrl = result.secure_url;
  }

  product.name = name ?? product.name;
  product.description = description ?? product.description;
  product.price = price ?? product.price;
  product.category = category ?? product.category;
  product.stock = stock ?? product.stock;

  const updatedProduct = await product.save();

  return successResponse(res, {
    message: "Product updated successfully.",
    data: updatedProduct,
  });
});

/**
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 * @desc    Delete a product
 */
const deleteProduct = asyncHandlerMiddlware(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid product id.");
  }
  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  await product.deleteOne();

  return successResponse(res, {
    message: "Product deleted successfully.",
  });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
