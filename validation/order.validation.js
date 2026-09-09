const Joi = require("joi");
const { ORDER_STATUS_VALUES } = require("../config/order.config");

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().pattern(objectIdPattern).required().messages({
          "string.empty": "Product reference is required.",
          "string.pattern.base": "Product reference must be a valid id.",
          "any.required": "Product reference is required.",
        }),
        qty: Joi.number().integer().min(1).required().messages({
          "number.base": "Product quantity must be a number.",
          "number.integer": "Product quantity must be an integer.",
          "number.min": "Quantity must be at least 1.",
          "any.required": "Product quantity is required.",
        }),
        price: Joi.number().min(0).required().messages({
          "number.base": "Product price must be a number.",
          "number.min": "Price cannot be negative.",
          "any.required": "Product price is required.",
        }),
      }),
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Items must be a valid list.",
      "array.min": "At least one order item is required.",
      "any.required": "Order items are required.",
    }),

  totalAmount: Joi.number().min(0).required().messages({
    "number.base": "Total amount must be a number.",
    "number.min": "Total amount cannot be negative.",
    "any.required": "Total amount is required.",
  }),

  address: Joi.object({
    fullName: Joi.string().trim().required().messages({
      "string.empty": "Full name is required.",
      "any.required": "Full name is required.",
    }),
    street: Joi.string().trim().required().messages({
      "string.empty": "Street address is required.",
      "any.required": "Street address is required.",
    }),
    city: Joi.string().trim().required().messages({
      "string.empty": "City is required.",
      "any.required": "City is required.",
    }),
    state: Joi.string().trim().required().messages({
      "string.empty": "State is required.",
      "any.required": "State is required.",
    }),
    postalCode: Joi.string().trim().required().messages({
      "string.empty": "Postal code is required.",
      "any.required": "Postal code is required.",
    }),
    country: Joi.string().trim().required().messages({
      "string.empty": "Country is required.",
      "any.required": "Country is required.",
    }),
  })
    .required()
    .messages({
      "object.base": "Address must be a valid object.",
      "any.required": "Address is required.",
    }),

  paymentId: Joi.string().trim().optional().allow(null, "").messages({
    "string.base": "Payment ID must be a string.",
  }),
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...ORDER_STATUS_VALUES)
    .required()
    .messages({
      "string.empty": "Order status is required.",
      "any.only": "Status is not valid.",
      "any.required": "Order status is required.",
    }),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
};
