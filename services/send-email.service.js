const resend = require("../config/email.config");
const ApiError = require("../errors/api-error");

const sendEmail = async (to, subject, text, html) => {
  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [to],
      subject,
      text,
      html,
    });

    if (error) throw new Error(error.message);
  } catch (error) {
    console.error("Email Error:", error.message);

    throw new ApiError(503, "Unable to send email. Please try again later.");
  }
};

module.exports = sendEmail;
