import { connectDB } from "../../utils/database.js";
import Product from "../../models/Product.js";

export default async function handler(req, res) {
  await connectDB();

  const p = await Product.create({
    productId: "CJXFLPJY00674",
    name: "Règle de mesure électronique",
    sku: "CJXFLPJY00674",
    image: "https://cf.cjdropshipping.com/74e7659c-c381-4668-919a-348c64114d35.jpg",
    price: "10.45-52.24",
    createdAt: new Date(),
  });

  res.status(200).json({ success: true, product: p });
}
