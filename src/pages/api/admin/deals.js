// pages/api/admin/deals.js — Full CRUD for admin dashboard
// PUT: update deal, DELETE: remove deal, PATCH: toggle active

import { connectDB } from "../../../utils/database.js";
import Deal from "../../../models/Deal.js";

function checkAuth(req) {
  const secret = req.headers["x-admin-secret"];
  return secret && secret === process.env.ADMIN_SECRET;
}

export default async function handler(req, res) {
  if (!checkAuth(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  await connectDB();

  // UPDATE deal
  if (req.method === "PUT") {
    const {
      dealId,
      title,
      image,
      price,
      originalPrice,
      affiliateUrl,
      category,
      source,
      description,
    } = req.body;
    if (!dealId) return res.status(400).json({ error: "dealId required" });

    const discount =
      originalPrice && originalPrice > price
        ? Math.round((1 - price / originalPrice) * 100)
        : null;

    const deal = await Deal.findByIdAndUpdate(
      dealId,
      {
        title,
        image,
        price,
        originalPrice: originalPrice || null,
        discount,
        affiliateUrl,
        category,
        source,
        description,
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!deal) return res.status(404).json({ error: "Deal not found" });
    return res.status(200).json({ deal });
  }

  // DELETE deal
  if (req.method === "DELETE") {
    const { dealId } = req.body;
    if (!dealId) return res.status(400).json({ error: "dealId required" });

    await Deal.findByIdAndDelete(dealId);
    return res.status(200).json({ success: true });
  }

  // TOGGLE active
  if (req.method === "PATCH") {
    const { dealId, active } = req.body;
    if (!dealId) return res.status(400).json({ error: "dealId required" });

    const deal = await Deal.findByIdAndUpdate(
      dealId,
      { active, updatedAt: new Date() },
      { new: true },
    );

    if (!deal) return res.status(404).json({ error: "Deal not found" });
    return res.status(200).json({ deal });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
