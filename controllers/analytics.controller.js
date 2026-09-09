const Order = require("../model/order.model");
const asyncHandlerMiddlware = require("../middleware/asynchandler.middleware");
const { successResponse } = require("../utils/response");
const { PAYMENT_STATUSES } = require("../config/payment.config");

/**
 * @route   GET /api/analytics
 * @access  Private/Admin
 * @desc    Get analytics for dashboard
 */
const getAnalytics = asyncHandlerMiddlware(async (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 365);
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const [overview, statusBreakdown, recentTrend] = await Promise.all([
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", PAYMENT_STATUSES.VERIFIED] },
                "$totalAmount",
                0,
              ],
            },
          },
          verifiedPayments: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", PAYMENT_STATUSES.VERIFIED] },
                1,
                0,
              ],
            },
          },
          createdPayments: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", PAYMENT_STATUSES.CREATED] },
                1,
                0,
              ],
            },
          },
          failedPayments: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", PAYMENT_STATUSES.FAILED] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
    Order.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", PAYMENT_STATUSES.VERIFIED] },
                "$totalAmount",
                0,
              ],
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]),
    Order.aggregate([
      {
        $match: {
          paymentStatus: PAYMENT_STATUSES.VERIFIED,
          paymentVerifiedAt: { $gte: fromDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$paymentVerifiedAt" },
          },
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const summary = overview[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    verifiedPayments: 0,
    createdPayments: 0,
    failedPayments: 0,
  };

  const successRate =
    summary.totalOrders > 0
      ? Number(
          ((summary.verifiedPayments / summary.totalOrders) * 100).toFixed(2),
        )
      : 0;

  return successResponse(res, {
    message: "Payment analytics fetched successfully.",
    data: {
      window: {
        days,
        from: fromDate,
        to: new Date(),
      },
      summary: {
        ...summary,
        successRate,
      },
      statusBreakdown,
      recentTrend,
    },
  });
});

module.exports = {
  getAnalytics,
};
