const fs = require("fs");
const path = require("path");

const resend = require("../config/email.config");
const ApiError = require("../errors/api-error");

const logoPath = path.join(__dirname, "../images/VIPHive_logo_light.png");

const sendEmail = async (to, subject, text, html) => {
  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [to],
      subject,
      text,
      html,
      attachments: [
        {
          content: fs.readFileSync(logoPath),
          filename: "VIPHive_logo_light.png",
          contentType: "image/png",
          contentId: "viphive-logo",
        },
      ],
    });

    if (error) throw new Error(error.message);
  } catch (error) {
    console.error("Email Error:", error.message);

    throw new ApiError(503, "Unable to send email. Please try again later.");
  }
};

module.exports = sendEmail;
