// api/carts.js

import { connectDB } from "../../utils/database";
import Cart from "../../models/Cart";


export default async function handler(req, res) {
  await connectDB();

  if (req.method === "POST") {
    const { cartId, items } = req.body;
    if (!cartId) {
      return res
        .status(400)
        .json({ success: false, message: "cartId manquant" });
    }

    console.log("📥 Payload reçu:", JSON.stringify(items, null, 2)); // 👀 debug

    // Normaliser items selon ton schéma
   const sanitizedItems = items.map((item) => ({
  productId: item.productId || item.pid,
  variantId: item.variantId || null,
  productNameEn: item.productNameEn || item.product?.productNameEn || "",
  sellPrice: item.sellPrice || item.product?.sellPrice || 0,
  qty: item.qty || 0,
  product: item.product || {},
}));


    const cart = await Cart.findOneAndUpdate(
  { cartId },
  {
    $setOnInsert: { cartId }, // si nouveau document
    $push: { items: { $each: sanitizedItems } }, // ajoute les items
    $set: { updatedAt: new Date() },
  },
  { new: true, upsert: true }
);

    return res.json({ success: true, cart });
  }

  res.status(405).end();
}
