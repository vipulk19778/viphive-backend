const Joi = require("joi");
const { OTP_PURPOSES } = require("../config/otp.config");

/**========================================
 * Validation schemas for authentication routes
 * =======================================*/

const PUBLIC_OTP_PURPOSES = [
  OTP_PURPOSES.REGISTER,
  OTP_PURPOSES.FORGOT_PASSWORD,
];

const AUTH_OTP_PURPOSES = [
  OTP_PURPOSES.CHANGE_PASSWORD,
  OTP_PURPOSES.DELETE_ACCOUNT,
  OTP_PURPOSES.CHANGE_EMAIL,
];

const publicOtpPurposeSchema = Joi.string()
  .valid(...PUBLIC_OTP_PURPOSES)
  .required()
  .messages({
    "any.only": "Invalid OTP purpose for public flow.",
    "any.required": "OTP purpose is required.",
    "string.empty": "OTP purpose is required.",
  });

const authOtpPurposeSchema = Joi.string()
  .valid(...AUTH_OTP_PURPOSES)
  .required()
  .messages({
    "any.only": "Invalid OTP purpose for authenticated flow.",
    "any.required": "OTP purpose is required.",
    "string.empty": "OTP purpose is required.",
  });

/**========================================
 * Reusable email validation schema
 * =======================================*/

const reusableEmailSchema = Joi.string()
  .trim()
  .email()
  .lowercase()
  .required()
  .messages({
    "string.empty": "Email is required.",
    "string.email": "Please enter a valid email address.",
    "any.required": "Email is required.",
  });

/**========================================
 * Validation schema for user registration
 * =======================================*/

const registerSchema = Joi.object({
  name: Joi.string().trim().min(3).max(50).required().messages({
    "string.empty": "Name is required.",
    "string.min": "Name must be at least 3 characters.",
    "string.max": "Name cannot exceed 50 characters.",
    "any.required": "Name is required.",
  }),

  email: reusableEmailSchema,

  password: Joi.string().min(8).max(30).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password must be at least 8 characters.",
    "string.max": "Password cannot exceed 30 characters.",
    "any.required": "Password is required.",
  }),
});

/**========================================
 * Validation schema for user login
 * =======================================*/

const loginSchema = Joi.object({
  email: reusableEmailSchema,

  password: Joi.string().required().messages({
    "string.empty": "Password is required.",
    "any.required": "Password is required.",
  }),
});

/**========================================
 * Validation schema for OTP verification
 * =======================================*/

const verifyOtpPublicSchema = Joi.object({
  email: reusableEmailSchema,

  otp: Joi.string()
    .trim()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.empty": "OTP is required.",
      "string.pattern.base": "OTP must be a valid 6-digit OTP.",
      "any.required": "OTP is required.",
    }),

  purpose: publicOtpPurposeSchema,
});

const verifyOtpAuthSchema = Joi.object({
  otp: Joi.string()
    .trim()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.empty": "OTP is required.",
      "string.pattern.base": "OTP must be a valid 6-digit OTP.",
      "any.required": "OTP is required.",
    }),

  purpose: authOtpPurposeSchema,
});

/**========================================
 * Validation schema for sending OTP
 * =======================================*/

const sendOtpPublicSchema = Joi.object({
  email: reusableEmailSchema,

  purpose: publicOtpPurposeSchema,
});

const sendOtpAuthSchema = Joi.object({
  purpose: authOtpPurposeSchema,
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyOtpPublicSchema,
  verifyOtpAuthSchema,
  sendOtpPublicSchema,
  sendOtpAuthSchema,
  PUBLIC_OTP_PURPOSES,
  AUTH_OTP_PURPOSES,
};
