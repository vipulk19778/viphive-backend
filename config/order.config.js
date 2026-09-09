const ORDER_STATUSES = Object.freeze({
  PENDING: "pending",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
});

const ORDER_STATUS_VALUES = Object.values(ORDER_STATUSES);
const DEFAULT_ORDER_STATUS = ORDER_STATUSES.PENDING;

module.exports = {
  ORDER_STATUSES,
  ORDER_STATUS_VALUES,
  DEFAULT_ORDER_STATUS,
};
