// =============================== Import Dependencies ================================
const dotenv = require("dotenv");
dotenv.config(); // load env variables

const validateEnv = require("./config/validate-env.config");
validateEnv();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db.config");
const transporter = require("./config/email.config");

const errorHandlerMiddleware = require("./middleware/error.middleware");

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//======================Import Routes =========================

const authRouter = require("./routes/auth.routes");
const productRouter = require("./routes/product.routes");
const orderRouter = require("./routes/order.routes");
const paymentRouter = require("./routes/payment.routes");
const analyticsRouter = require("./routes/analytics.route");

//======================Routes ==================================

/**
 * @route GET /api/health
 * @description Health check
 */
app.get("/api/health", (req, res) => {
  res.send("VIPHive Backend is working properly!");
});

/**
 * @route GET /api/auth
 * @description auth routes
 */
app.use("/api/auth", authRouter);

/**
 * @route GET /api/products
 * @description product routes
 */
app.use("/api/products", productRouter);

/**
 * @route GET /api/payments
 * @description payment routes
 */
app.use("/api/payments", paymentRouter);

/**
 * @route GET /api/orders
 * @description order routes
 */
app.use("/api/orders", orderRouter);

/**
 * @route GET /api/analytics
 * @description analytics routes
 */
app.use("/api/analytics", analyticsRouter);

//======================= Global Middleware ========================

/**
 * Global Error Handler (Always Last)
 */
app.use(errorHandlerMiddleware); // it tells express to use the errorHandler middleware

//==================== Start Server =====================
const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();

    try {
      await transporter.verify();
      console.log("SMTP Server Connected");
    } catch (error) {
      console.error("SMTP Verification Error:", error);
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Application startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
