// API Route: /api/affiliate/deals
// GET — Returns deals for the frontend with filtering & pagination

import { connectDB } from "../../../utils/database.js";
import Deal from "../../../models/Deal.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDB();

    const {
      category,
      source,
      featured,
      sort = "newest",
      page = "1",
      limit = "20",
    } = req.query;

    const filter = { active: true };

    if (category) filter.category = category;
    if (source) filter.source = source;
    if (featured === "true") filter.featured = true;

    // Sort options
    const sortOptions = {
      newest: { createdAt: -1 },
      popular: { clicks: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      discount: { discount: -1 },
    };

    const sortBy = sortOptions[sort] || sortOptions.newest;
    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * pageSize;

    const [deals, total] = await Promise.all([
      Deal.find(filter).sort(sortBy).skip(skip).limit(pageSize).lean(),
      Deal.countDocuments(filter),
    ]);

    // Get available categories for filter
    const categories = await Deal.distinct("category", { active: true });

    return res.status(200).json({
      deals,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / pageSize),
      categories,
    });
  } catch (error) {
    console.error("API /affiliate/deals error:", error);
    return res.status(500).json({ error: error.message });
  }
}
