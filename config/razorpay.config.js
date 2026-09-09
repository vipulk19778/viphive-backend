const Razorpay = require("razorpay");

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

if (!RAZORPAY_KEY_ID) {
  throw new Error("RAZORPAY_KEY_ID is not configured");
}

if (!RAZORPAY_KEY_SECRET) {
  throw new Error("RAZORPAY_KEY_SECRET is not configured");
}

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

module.exports = {
  razorpay,
  razorpayKeyId: RAZORPAY_KEY_ID,
  razorpayKeySecret: RAZORPAY_KEY_SECRET,
};
