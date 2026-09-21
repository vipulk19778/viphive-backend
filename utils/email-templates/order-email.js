const {
  emailShell,
  escapeHtml,
  formatCurrency,
  toTitleCase,
  BRAND_COLORS,
} = require("./email-utils");

const getOrderId = (order) => order?._id?.toString() || "unknown";

const getItemRows = (items = []) =>
  items
    .map((item) => {
      const name = escapeHtml(item?.product?.name || "Product");
      const quantity = Number(item?.qty) || 0;
      const price = formatCurrency(item?.price);
      const image = item?.product?.imageUrl;
      const imageCell = image
        ? `<img src="${escapeHtml(image)}" alt="" width="48" height="48" style="display:block;width:48px;height:48px;border-radius:10px;object-fit:cover;" />`
        : `<div style="width:48px;height:48px;border-radius:10px;background:${BRAND_COLORS.slate100};"></div>`;

      return `<tr>
        <td style="padding:14px 0;border-bottom:1px solid ${BRAND_COLORS.slate200};">${imageCell}</td>
        <td style="padding:14px 10px;border-bottom:1px solid ${BRAND_COLORS.slate200};color:${BRAND_COLORS.slate900};font-weight:700;">${name}</td>
        <td align="center" style="padding:14px 6px;border-bottom:1px solid ${BRAND_COLORS.slate200};color:${BRAND_COLORS.slate500};">${quantity}</td>
        <td align="right" style="padding:14px 0;border-bottom:1px solid ${BRAND_COLORS.slate200};color:${BRAND_COLORS.slate900};font-weight:700;">${price}</td>
      </tr>`;
    })
    .join("");

const getPlainItems = (items = []) =>
  items
    .map((item) => `- ${item?.product?.name || "Product"} x ${item.qty}`)
    .join("\n");

const buildOrderCreatedEmail = (order) => {
  const userName = order?.user?.name || "there";
  const userEmail = order?.user?.email;
  const orderId = getOrderId(order);
  const shortOrderId = orderId.slice(-8).toUpperCase();
  const status = toTitleCase(order?.status || "pending");
  const total = formatCurrency(order?.totalAmount);
  const address = order?.address;

  return {
    to: userEmail,
    subject: `VIPHive order confirmed - #${shortOrderId}`,
    text: `Hello ${userName}!\n\nYour VIPHive order has been confirmed.\n\nOrder: #${shortOrderId}\nStatus: ${status}\nTotal: ${total}\n\nItems:\n${getPlainItems(order?.items)}\n\nThank you for shopping with VIPHive.`,
    html: emailShell({
      title: "Order confirmed",
      preview: `Your VIPHive order #${shortOrderId} has been confirmed.`,
      content: `<p style="margin:0;color:${BRAND_COLORS.amber500};font-size:12px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;">Order confirmed</p>
        <h1 style="margin:10px 0 8px;font-size:28px;line-height:1.2;color:${BRAND_COLORS.slate900};">Thanks for your order, ${escapeHtml(userName)}.</h1>
        <p style="margin:0;color:${BRAND_COLORS.slate600};font-size:15px;line-height:1.7;">We have received your order and will keep you updated as it moves through delivery.</p>
        <div style="margin:24px 0;padding:18px;border:1px solid ${BRAND_COLORS.slate200};border-radius:14px;background:${BRAND_COLORS.slate100};">
          <div style="font-size:12px;color:${BRAND_COLORS.slate500};text-transform:uppercase;letter-spacing:1px;">Order number</div>
          <div style="margin-top:5px;font-size:20px;font-weight:800;color:${BRAND_COLORS.slate900};">#${shortOrderId}</div>
          <div style="margin-top:14px;font-size:13px;color:${BRAND_COLORS.slate600};">Status <strong style="color:${BRAND_COLORS.slate900};">${escapeHtml(status)}</strong></div>
          <div style="margin-top:5px;font-size:13px;color:${BRAND_COLORS.slate600};">Total <strong style="color:${BRAND_COLORS.slate900};">${total}</strong></div>
        </div>
        <h2 style="margin:26px 0 8px;font-size:17px;color:${BRAND_COLORS.slate900};">Items in your order</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><th align="left" colspan="2" style="padding:8px 0;color:${BRAND_COLORS.slate500};font-size:11px;text-transform:uppercase;">Product</th><th style="padding:8px 6px;color:${BRAND_COLORS.slate500};font-size:11px;text-transform:uppercase;">Qty</th><th align="right" style="padding:8px 0;color:${BRAND_COLORS.slate500};font-size:11px;text-transform:uppercase;">Price</th></tr>${getItemRows(order?.items)}</table>
        ${address ? `<div style="margin-top:24px;padding-top:20px;border-top:1px solid ${BRAND_COLORS.slate200};color:${BRAND_COLORS.slate600};font-size:13px;line-height:1.7;"><strong style="color:${BRAND_COLORS.slate900};">Delivery address</strong><br />${escapeHtml(address.fullName)}<br />${escapeHtml(address.street)}, ${escapeHtml(address.city)}, ${escapeHtml(address.state)} ${escapeHtml(address.postalCode)}<br />${escapeHtml(address.country)}</div>` : ""}`,
    }),
  };
};

const buildOrderStatusEmail = (order) => {
  const userName = order?.user?.name || "there";
  const userEmail = order?.user?.email;
  const orderId = getOrderId(order);
  const shortOrderId = orderId.slice(-8).toUpperCase();
  const status = toTitleCase(order?.status || "pending");

  return {
    to: userEmail,
    subject: `VIPHive order update - #${shortOrderId}`,
    text: `Hello ${userName}!\n\nYour VIPHive order status is now ${status}.\n\nOrder: #${shortOrderId}\nStatus: ${status}\n\nThank you for shopping with VIPHive.`,
    html: emailShell({
      title: "Order status updated",
      preview: `Your VIPHive order #${shortOrderId} is now ${status}.`,
      content: `<p style="margin:0;color:${BRAND_COLORS.amber500};font-size:12px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;">Order update</p>
        <h1 style="margin:10px 0 8px;font-size:28px;line-height:1.2;color:${BRAND_COLORS.slate900};">Your order is now ${escapeHtml(status)}.</h1>
        <p style="margin:0;color:${BRAND_COLORS.slate600};font-size:15px;line-height:1.7;">Hello ${escapeHtml(userName)}, your VIPHive order status has changed.</p>
        <div style="margin-top:24px;padding:20px;border-radius:14px;background:${BRAND_COLORS.slate950};color:${BRAND_COLORS.white};"><div style="font-size:12px;color:${BRAND_COLORS.slate300};text-transform:uppercase;letter-spacing:1px;">Order</div><div style="margin-top:5px;font-size:22px;font-weight:800;">#${shortOrderId}</div><div style="margin-top:14px;display:inline-block;padding:7px 11px;border-radius:999px;background:${BRAND_COLORS.amber400};color:${BRAND_COLORS.slate900};font-size:12px;font-weight:800;">${escapeHtml(status)}</div></div>
  <p style="margin:24px 0 0;color:${BRAND_COLORS.slate600};font-size:14px;line-height:1.7;">We will send another update when your order reaches its next milestone.</p>`,
    }),
  };
};

module.exports = { buildOrderCreatedEmail, buildOrderStatusEmail };
