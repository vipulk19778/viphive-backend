const RATE_LIMIT_CONFIG = {
  GLOBAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
  },

  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10,
  },

  OTP: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 5,
  },

  ADMIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
  },
};

module.exports = {
  RATE_LIMIT_CONFIG,
};
