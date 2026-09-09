const fs = require("fs/promises");

const cloudinary = require("../config/cloudinary.config");
const ApiError = require("../errors/api-error");

const deleteTempFile = async (filePath) => {
  await fs.unlink(filePath).catch((error) => {
    console.error("Failed to delete temporary upload file:", error.message);
  });
};

const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath);

    return result;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message);

    switch (error.http_code) {
      case 400:
        throw new ApiError(400, "Invalid image file.");

      case 401:
      case 403:
        throw new ApiError(500, "Image upload service is misconfigured.");

      case 404:
        throw new ApiError(
          500,
          "Image upload service configuration is invalid.",
        );

      case 429:
        throw new ApiError(
          503,
          "Image upload service is busy. Please try again later.",
        );

      default:
        throw new ApiError(
          503,
          "Image upload service is temporarily unavailable.",
        );
    }
  } finally {
    await deleteTempFile(filePath);
  }
};

module.exports = {
  uploadImage,
};
