const jwt = require("jsonwebtoken");
const ApiError = require("../errors/api-error");

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "30d";
const JWT_ISSUER = "viphive-api";
const JWT_AUDIENCE = "viphive-client";

const createAuthTokens = (userId, refreshTokenVersion = 0) => {
  try {
    const accessToken = jwt.sign(
      { id: userId, type: "access" },
      process.env.JWT_SECRET,
      {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      },
    );
    const refreshToken = jwt.sign(
      { id: userId, type: "refresh", tokenVersion: refreshTokenVersion },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      },
    );

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("JWT generation failed:", error.message);

    throw new ApiError(
      500,
      "Unable to complete authentication. Please try again later.",
    );
  }
};

const verifyRefreshToken = (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    if (decoded.type !== "refresh") {
      throw new Error("Invalid token type");
    }

    return decoded;
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token.");
  }
};

module.exports = { createAuthTokens, verifyRefreshToken };
