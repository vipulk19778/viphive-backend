const jwt = require("jsonwebtoken");
const ApiError = require("../errors/api-error");

const createAuthToken = (userId) => {
  try {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
  } catch (error) {
    console.error("JWT generation failed:", error);

    throw new ApiError(
      500,
      "Unable to complete authentication. Please try again later.",
    );
  }
};

module.exports = createAuthToken;
