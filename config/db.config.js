const mongoose = require("mongoose");

let connectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_URI)
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  const conn = await connectionPromise;

  if (conn.connection.readyState === 1) {
    console.log("MongoDB connected successfully");
  }

  return conn;
};

module.exports = connectDB;
