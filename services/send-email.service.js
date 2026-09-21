const fs = require("fs");
const path = require("path");

const transporter = require("../config/email.config");
const ApiError = require("../errors/api-error");

const logoPath = path.join(__dirname, "../images/VIPHive_logo_light.png");

const sendEmail = async (to, subject, text, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
      attachments: [
        {
          content: fs.readFileSync(logoPath),
          filename: "VIPHive_logo_light.png",
          cid: "viphive-logo",
        },
      ],
    });
  } catch (error) {
    console.error("Email Error:", error.message);

    throw new ApiError(503, "Unable to send email. Please try again later.");
  }
};

module.exports = sendEmail;
