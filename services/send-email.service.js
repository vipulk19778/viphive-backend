const transporter = require("../config/email.config");
const ApiError = require("../errors/api-error");

const sendEmail = async (to, subject, text, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error("Email Error:", error.message);

    throw new ApiError(503, "Unable to send email. Please try again later.");
  }
};

module.exports = sendEmail;
