// API Route: /api/affiliate/featured
// POST — Toggle featured status (manual curation)
// GET — List featured deals

import { connectDB } from "../../../utils/database.js";
import Deal from "../../../models/Deal.js";

export default async function handler(req, res) {
  try {
    await connectDB();

    if (req.method === "GET") {
      const deals = await Deal.find({ featured: true, active: true })
        .sort({ updatedAt: -1 })
        .lean();
      return res.status(200).json({ deals });
    }

    if (req.method === "POST") {
      // Simple admin protection via secret
      const adminSecret = req.headers["x-admin-secret"];
      if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { dealId, featured } = req.body;
      if (!dealId) {
        return res.status(400).json({ error: "dealId required" });
      }

      const deal = await Deal.findByIdAndUpdate(
        dealId,
        { featured: featured !== false, updatedAt: new Date() },
        { new: true },
      );

      if (!deal) {
        return res.status(404).json({ error: "Deal not found" });
      }

      return res.status(200).json({ deal });
    }

    // POST manual deal creation
    if (req.method === "PUT") {
      const adminSecret = req.headers["x-admin-secret"];
      if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const {
        title,
        image,
        price,
        originalPrice,
        affiliateUrl,
        category,
        source,
      } = req.body;

      if (!title || !affiliateUrl || !price) {
        return res
          .status(400)
          .json({ error: "title, affiliateUrl, and price are required" });
      }

      const deal = await Deal.create({
        sourceId: `manual_${Date.now()}`,
        source: source || "manual",
        title,
        image: image || "",
        price,
        originalPrice: originalPrice || null,
        discount: originalPrice
          ? Math.round((1 - price / originalPrice) * 100)
          : null,
        affiliateUrl,
        category: category || "general",
        featured: true,
        active: true,
      });

      return res.status(201).json({ deal });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("API /affiliate/featured error:", error);
    return res.status(500).json({ error: error.message });
  }
}
