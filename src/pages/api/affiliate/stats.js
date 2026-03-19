// API Route: /api/affiliate/stats
// GET — Simple analytics dashboard data

import { connectDB } from "../../../utils/database.js";
import Deal from "../../../models/Deal.js";
import Click from "../../../models/Click.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Simple admin protection
  const adminSecret = req.headers["x-admin-secret"] || req.query.secret;
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  await connectDB();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalDeals,
    totalClicks,
    clicksToday,
    clicks7Days,
    topDeals,
    clicksBySource,
  ] = await Promise.all([
    Deal.countDocuments({ active: true }),
    Click.countDocuments(),
    Click.countDocuments({ timestamp: { $gte: today } }),
    Click.countDocuments({ timestamp: { $gte: last7Days } }),
    Deal.find({ active: true }).sort({ clicks: -1 }).limit(10).lean(),
    Click.aggregate([
      { $match: { timestamp: { $gte: last7Days } } },
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  return res.status(200).json({
    totalDeals,
    totalClicks,
    clicksToday,
    clicks7Days,
    topDeals: topDeals.map((d) => ({
      id: d._id,
      title: d.title,
      source: d.source,
      clicks: d.clicks,
      price: d.price,
    })),
    clicksBySource,
  });
}
