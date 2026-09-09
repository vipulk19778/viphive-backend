const Joi = require("joi");

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createPaymentSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    "number.base": "Amount must be a number.",
    "number.positive": "Amount must be greater than zero.",
    "any.required": "Amount is required.",
  }),
  currency: Joi.string().trim().uppercase().default("INR").messages({
    "string.base": "Currency must be a string.",
  }),
  receipt: Joi.string().trim().max(100).optional().messages({
    "string.base": "Receipt must be a string.",
    "string.max": "Receipt cannot exceed 100 characters.",
  }),
  notes: Joi.object().optional().messages({
    "object.base": "Notes must be a valid object.",
  }),
  orderId: Joi.string().pattern(objectIdPattern).optional().messages({
    "string.pattern.base": "orderId must be a valid id.",
  }),
});

const verifyPaymentSchema = Joi.object({
  razorpay_order_id: Joi.string().trim().required().messages({
    "string.empty": "razorpay_order_id is required.",
    "any.required": "razorpay_order_id is required.",
  }),
  razorpay_payment_id: Joi.string().trim().required().messages({
    "string.empty": "razorpay_payment_id is required.",
    "any.required": "razorpay_payment_id is required.",
  }),
  razorpay_signature: Joi.string().trim().required().messages({
    "string.empty": "razorpay_signature is required.",
    "any.required": "razorpay_signature is required.",
  }),
  orderId: Joi.string().pattern(objectIdPattern).optional().messages({
    "string.pattern.base": "orderId must be a valid id.",
  }),
});

module.exports = {
  createPaymentSchema,
  verifyPaymentSchema,
};
