const ApiError = require("../../errors/api-error");
const genericOtpTemplate = require("./generic-otp-template");

const { OTP_EXPIRY_MINUTES, OTP_PURPOSES } = require("../../config/otp.config");

const OTP_EMAIL_CONTENT = {
  [OTP_PURPOSES.REGISTER]: {
    subject: "VIPHive - Your Registration OTP",
    action: "registration",
    message: "Use this OTP to complete your registration.",
    ignoreLine: "If you did not request this OTP, please ignore this email.",
  },

  [OTP_PURPOSES.FORGOT_PASSWORD]: {
    subject: "VIPHive - Your Password Reset OTP",
    action: "password reset",
    message: "Use this OTP to reset your VIPHive account password.",
    ignoreLine:
      "If you did not request a password reset, please ignore this email.",
  },

  [OTP_PURPOSES.CHANGE_PASSWORD]: {
    subject: "VIPHive - Your Change Password OTP",
    action: "password change",
    message: "Use this OTP to confirm your password change request.",
    ignoreLine: "If you did not request this OTP, please ignore this email.",
  },

  [OTP_PURPOSES.DELETE_ACCOUNT]: {
    subject: "VIPHive - Your Delete Account OTP",
    action: "account deletion",
    message: "Use this OTP to confirm your account deletion request.",
    ignoreLine: "If you did not request this OTP, please ignore this email.",
  },

  [OTP_PURPOSES.CHANGE_EMAIL]: {
    subject: "VIPHive - Your Change Email OTP",
    action: "email change",
    message: "Use this OTP to confirm your email change request.",
    ignoreLine: "If you did not request this OTP, please ignore this email.",
  },
};

const buildOtpEmail = ({ purpose, name, otp }) => {
  const config = OTP_EMAIL_CONTENT[purpose];
  const displayName =
    typeof name === "string" && name.trim() ? name.trim() : "there";

  if (!config) {
    throw new ApiError(400, "Unsupported OTP purpose.");
  }

  return {
    subject: config.subject,

    text: `Hello ${displayName}!

Your ${config.action} OTP is: ${otp}

This OTP is valid for ${OTP_EXPIRY_MINUTES} minutes.

${config.ignoreLine}`,

    html: genericOtpTemplate({
      otp,
      heading:
        purpose === OTP_PURPOSES.REGISTER
          ? `Welcome to VIPHive, ${displayName}!`
          : `Hello ${displayName}!`,
      message: config.message,
      expiryMinutes: OTP_EXPIRY_MINUTES,
      ignoreLine: config.ignoreLine,
    }),
  };
};

module.exports = buildOtpEmail;
