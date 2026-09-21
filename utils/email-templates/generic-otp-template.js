const { emailShell, escapeHtml, BRAND_COLORS } = require("./email-utils");

const genericOtpTemplate = ({
  otp,
  heading = "Hello there!",
  message,
  expiryMinutes,
  ignoreLine,
}) =>
  emailShell({
    title: "VIPHive verification code",
    preview: `Your VIPHive verification code is ${otp}.`,
    content: `<p style="margin:0;color:${BRAND_COLORS.amber500};font-size:12px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;">Account verification</p>
      <h1 style="margin:10px 0 8px;font-size:28px;line-height:1.2;color:${BRAND_COLORS.slate900};">${escapeHtml(heading)}</h1>
      <p style="margin:0;color:${BRAND_COLORS.slate600};font-size:15px;line-height:1.7;">${escapeHtml(message)}</p>
      <div style="margin:26px 0;text-align:center;"><div style="display:inline-block;min-width:190px;padding:18px 24px;border:2px dashed ${BRAND_COLORS.amber500};border-radius:14px;background:${BRAND_COLORS.amber100};color:${BRAND_COLORS.slate900};font-size:32px;font-weight:800;letter-spacing:9px;">${escapeHtml(otp)}</div></div>
      <div style="padding:15px 16px;border-left:4px solid ${BRAND_COLORS.amber500};background:${BRAND_COLORS.slate100};color:${BRAND_COLORS.slate600};font-size:13px;line-height:1.6;">This code expires in <strong style="color:${BRAND_COLORS.slate900};">${escapeHtml(expiryMinutes)} minutes</strong>. Never share it with anyone.</div>
      <p style="margin:22px 0 0;color:${BRAND_COLORS.slate500};font-size:13px;line-height:1.7;">${escapeHtml(ignoreLine || "If you did not request this code, you can safely ignore this email.")}</p>`,
  });

module.exports = genericOtpTemplate;
