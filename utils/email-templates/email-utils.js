const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const toTitleCase = (value = "") =>
  String(value)
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const BRAND_COLORS = {
  slate950: "#020617",
  slate900: "#0f172a",
  slate700: "#334155",
  slate600: "#475569",
  slate500: "#64748b",
  slate300: "#cbd5e1",
  slate200: "#e2e8f0",
  slate100: "#f1f5f9",
  amber500: "#f59e0b",
  amber400: "#fbbf24",
  amber100: "#fef3c7",
  white: "#ffffff",
};

const emailShell = ({ title, preview, content }) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:${BRAND_COLORS.slate100};color:${BRAND_COLORS.slate900};font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preview)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_COLORS.slate100};padding:28px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:${BRAND_COLORS.white};border:1px solid ${BRAND_COLORS.slate200};border-radius:18px;overflow:hidden;">
          <tr><td style="background:${BRAND_COLORS.slate950};padding:18px 28px;">
            <img src="cid:viphive-logo" alt="VIPHive" width="160" style="display:block;width:160px;height:auto;" />
            <div style="margin-top:8px;color:${BRAND_COLORS.slate300};font-size:12px;letter-spacing:1.8px;text-transform:uppercase;">More than a marketplace</div>
          </td></tr>
          <tr><td style="padding:32px 28px;">${content}</td></tr>
          <tr><td style="background:${BRAND_COLORS.slate100};padding:18px 28px;color:${BRAND_COLORS.slate500};font-size:12px;line-height:1.6;">
            You are receiving this email because of activity on your VIPHive account.<br />© ${new Date().getFullYear()} VIPHive
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

module.exports = {
  escapeHtml,
  formatCurrency,
  toTitleCase,
  emailShell,
  BRAND_COLORS,
};
