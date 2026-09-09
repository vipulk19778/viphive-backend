const ApiError = require("../errors/api-error");

const validationMiddleware = (schema, property = "body") => {
  return (req, res, next) => {
    const requestData = req[property] ?? {};

    const { error, value } = schema.validate(requestData, {
      abortEarly: false, // return all errors
      stripUnknown: true, // remove unknown fields
    });

    if (error) {
      const validationError = new ApiError(
        400,
        "Validation failed.",
        error.details.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      );

      return next(validationError); // pass the error to the global error handler
    }

    req[property] = value;

    next();
  };
};

module.exports = validationMiddleware;
