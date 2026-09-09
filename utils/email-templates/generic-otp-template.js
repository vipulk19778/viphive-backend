const genericOtpTemplate = ({
  otp,
  heading = "Hello there!",
  message,
  expiryMinutes,
  ignoreLine,
}) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VIPHive OTP Verification</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
      font-family: Arial, sans-serif;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="background-color: #f4f4f4; padding: 30px 0"
    >
      <tr>
        <td align="center">
          <table
            width="600"
            cellpadding="0"
            cellspacing="0"
            style="
              background: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            "
          >
            <tr>
              <td align="center" style="background: #4f46e5; padding: 30px">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px">
                  VIPHive
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding: 40px 30px; color: #333333">
                <h2 style="margin-top: 0; color: #111827">${heading}</h2>

                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px">
                  ${message}
                </p>

                <div style="text-align: center; margin: 30px 0">
                  <span
                    style="
                      display: inline-block;
                      background: #eef2ff;
                      color: #4f46e5;
                      font-size: 32px;
                      font-weight: bold;
                      letter-spacing: 8px;
                      padding: 16px 32px;
                      border-radius: 10px;
                      border: 2px dashed #4f46e5;
                    "
                  >
                    ${otp}
                  </span>
                </div>

                <p style="font-size: 15px; color: #6b7280; line-height: 1.6">
                  This OTP is valid for ${expiryMinutes} minutes. Please do not share it
                  with anyone for security reasons.
                </p>

                <p style="font-size: 15px; color: #6b7280; line-height: 1.6">
                  ${ignoreLine || "If you did not request this OTP, please ignore this email."}
                </p>

                <p style="font-size: 16px; line-height: 1.6; margin-top: 30px">
                  Best regards,<br />
                  <strong>The VIPHive Team</strong>
                </p>
              </td>
            </tr>

            <tr>
              <td
                align="center"
                style="
                  background: #f9fafb;
                  padding: 20px;
                  color: #9ca3af;
                  font-size: 13px;
                "
              >
                © ${new Date().getFullYear()} VIPHive. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

module.exports = genericOtpTemplate;
