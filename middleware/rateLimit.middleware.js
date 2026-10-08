const rateLimit = require("express-rate-limit");
const { RATE_LIMIT_CONFIG } = require("../config/rateLimit.config");

const globalRateLimiter = rateLimit({
  ...RATE_LIMIT_CONFIG.GLOBAL,
  standardHeaders: "draft-7",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

const authRateLimiter = rateLimit({
  ...RATE_LIMIT_CONFIG.AUTH,
  standardHeaders: "draft-7",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

const otpRateLimiter = rateLimit({
  ...RATE_LIMIT_CONFIG.OTP,
  standardHeaders: "draft-7",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many OTP requests. Please try again later.",
  },
});

const adminRateLimiter = rateLimit({
  ...RATE_LIMIT_CONFIG.ADMIN,
  standardHeaders: "draft-7",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

module.exports = {
  globalRateLimiter,
  authRateLimiter,
  otpRateLimiter,
  adminRateLimiter,
};
