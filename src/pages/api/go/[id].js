// API Route: /api/go/[id]
// Redirect to affiliate URL + track click

import { connectDB } from "../../../utils/database.js";
import Deal from "../../../models/Deal.js";
import Click from "../../../models/Click.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  await connectDB();

  const deal = await Deal.findById(id);
  if (!deal || !deal.active) {
    return res.status(404).json({ error: "Deal not found" });
  }

  // Track the click asynchronously (don't block redirect)
  Click.create({
    dealId: deal._id,
    source: deal.source,
    userAgent: req.headers["user-agent"] || "",
    referer: req.headers["referer"] || "",
  }).catch(() => {}); // silently fail tracking

  // Increment click counter on the deal
  Deal.updateOne({ _id: deal._id }, { $inc: { clicks: 1 } }).catch(() => {});

  // 302 redirect to affiliate URL
  return res.redirect(302, deal.affiliateUrl);
}
