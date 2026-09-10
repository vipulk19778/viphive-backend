const validateEnv = () => {
  // Check for required environment variables in .env.example file and add the keys to the requiredEnvVariables array
  const requiredEnvVariables = [
    "NODE_ENV",
    "CORS_ORIGIN",
    "PORT",
    "MONGO_URI",
    "JWT_SECRET",
    "RESEND_API_KEY",
    "EMAIL_FROM",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
  ];

  const missingVariables = requiredEnvVariables.filter(
    (key) => !process.env[key],
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(", ")}`,
    );
  }
  console.log(
    "###########======All required environment variables are set.=======#########",
  );
};

module.exports = validateEnv;
