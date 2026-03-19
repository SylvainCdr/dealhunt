import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: String,
  sku: String,
  image: String,
  price: String,
  createdAt: Date,
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
