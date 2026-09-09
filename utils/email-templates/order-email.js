const toTitleCase = (value = "") =>
  value
    .toString()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const formatOrderItems = (items = []) =>
  items
    .map((item) => {
      const name = item?.product?.name || "Product";
      return `- ${name} x ${item.qty}`;
    })
    .join("\n");

const buildOrderCreatedEmail = (order) => {
  const userName = order?.user?.name || "there";
  const userEmail = order?.user?.email;
  const itemsList = formatOrderItems(order?.items || []);
  const orderId = order._id.toString();

  return {
    to: userEmail,
    subject: `VIPHive - Order Confirmed (${orderId.slice(-6)})`,
    text: `Hello ${userName}!

Your order has been placed successfully.

Order Id: ${orderId}
Status: ${toTitleCase(order.status)}
Total Amount: ${order.totalAmount}

Items:
${itemsList}

Thank you for shopping with VIPHive.`,
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order Confirmed</title>
  </head>
  <body style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
    <h2>Hello ${userName}!</h2>
    <p>Your order has been placed successfully.</p>
    <p><strong>Order Id:</strong> ${orderId}</p>
    <p><strong>Status:</strong> ${toTitleCase(order.status)}</p>
    <p><strong>Total Amount:</strong> ${order.totalAmount}</p>
    <p><strong>Items:</strong></p>
    <pre style="background: #f9fafb; padding: 12px; border-radius: 8px;">${itemsList}</pre>
    <p>Thank you for shopping with VIPHive.</p>
  </body>
</html>`,
  };
};

const buildOrderStatusEmail = (order) => {
  const userName = order?.user?.name || "there";
  const userEmail = order?.user?.email;
  const orderId = order._id.toString();

  return {
    to: userEmail,
    subject: `VIPHive - Order Status Updated (${orderId.slice(-6)})`,
    text: `Hello ${userName}!

Your order status has been updated.

Order Id: ${orderId}
New Status: ${toTitleCase(order.status)}

Thank you for shopping with VIPHive.`,
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order Status Updated</title>
  </head>
  <body style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
    <h2>Hello ${userName}!</h2>
    <p>Your order status has been updated.</p>
    <p><strong>Order Id:</strong> ${orderId}</p>
    <p><strong>New Status:</strong> ${toTitleCase(order.status)}</p>
    <p>Thank you for shopping with VIPHive.</p>
  </body>
</html>`,
  };
};

module.exports = {
  buildOrderCreatedEmail,
  buildOrderStatusEmail,
};
