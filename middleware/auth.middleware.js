const jwt = require("jsonwebtoken");

const User = require("../model/user.model");
const ApiError = require("../errors/api-error");

const asyncHandlerMiddlware = require("./asynchandler.middleware");

//=======================================================
// Authentication Middleware
//=======================================================

const authMiddleware = asyncHandlerMiddlware(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Not authorized, no token provided");
  }

  const token = authHeader.split(" ")[1];

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).lean();

  if (!user) {
    throw new ApiError(401, "Not authorized, user not found");
  }

  req.user = user;

  next();
});

module.exports = authMiddleware;
