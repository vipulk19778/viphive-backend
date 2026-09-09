const multer = require("multer");
const { errorResponse } = require("../utils/response");

const errorHandlerMiddleware = (err, req, res, next) => {
  console.error(err);

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const errors = Object.keys(err.errors).map((field) => ({
      field,
      message: err.errors[field].message,
    }));

    return errorResponse(res, {
      statusCode: 400,
      message: "Validation failed",
      errors,
    });
  }

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    return errorResponse(res, {
      statusCode: 400,
      message: "Invalid resource ID",
    });
  }

  // Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];

    return errorResponse(res, {
      statusCode: 409,
      message: `${field} already exists`,
    });
  }

  // Invalid JWT
  if (err.name === "JsonWebTokenError") {
    return errorResponse(res, {
      statusCode: 401,
      message: "Not authorized, invalid token",
    });
  }

  // Expired JWT
  if (err.name === "TokenExpiredError") {
    return errorResponse(res, {
      statusCode: 401,
      message: "Not authorized, token expired",
    });
  }

  if (err instanceof multer.MulterError) {
    return errorResponse(res, {
      statusCode: 400,
      message: err.message,
    });
  }

  if (
    err.message === "Multipart: Boundary not found" ||
    err.message === "Unexpected end of form"
  ) {
    return errorResponse(res, {
      statusCode: 400,
      message: err.message,
    });
  }

  // Custom API Error
  if (err.statusCode) {
    return errorResponse(res, {
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
  }

  // Fallback
  return errorResponse(res, {
    statusCode: 500,
    message: "Internal Server Error",
  });
};

module.exports = errorHandlerMiddleware;
