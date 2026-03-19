// models/Cart.js


import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
  cartId: { type: String, required: true, unique: true },
  items: [
    {
      productId: String,
      variantId: String,
      productNameEn: String,
      sellPrice: Number,
      qty: Number,
      product: Object,     // toutes infos pour analytics
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);
