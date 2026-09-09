const ApiError = require("../errors/api-error");

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    throw new ApiError(403, "Access denied. Admin privileges required.");
  }

  next();
};

module.exports = adminMiddleware;
