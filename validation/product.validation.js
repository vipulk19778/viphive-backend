const Joi = require("joi");

const createProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),

  description: Joi.string().trim().min(10).required(),

  price: Joi.number().positive().precision(2).required(),

  category: Joi.string().trim().required(),

  stock: Joi.number().integer().min(0).required(),
});

const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),

  description: Joi.string().trim().min(10),

  price: Joi.number().positive().precision(2),

  category: Joi.string().trim(),

  stock: Joi.number().integer().min(0),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update.",
  });

module.exports = {
  createProductSchema,
  updateProductSchema,
};
