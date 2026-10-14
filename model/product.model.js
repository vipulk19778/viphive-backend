const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Please add a name"] },
    description: { type: String, required: [true, "Please add a description"] },
    price: { type: Number, required: [true, "Please add a price"] },
    category: { type: String, required: [true, "Please add a category"] },
    stock: { type: Number, required: [true, "Please add a stock"] },
    imageUrl: {
      type: String,
      required: [true, "Please add an image"],
      trim: true,
      match: [/^https?:\/\/\S+$/i, "Please add a valid image URL"],
    },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
