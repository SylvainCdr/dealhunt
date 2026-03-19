// pages/api/sitemap.js — Dynamic XML sitemap for SEO

import { connectDB } from "../../utils/database.js";
import Deal from "../../models/Deal.js";

export default async function handler(req, res) {
  await connectDB();

  const baseUrl = process.env.SITE_URL || "https://dealhuntify.com";

  // Get all categories
  const categories = await Deal.distinct("category", { active: true });

  // Static pages
  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/deals", priority: "0.9", changefreq: "hourly" },
    { url: "/blog", priority: "0.8", changefreq: "weekly" },
  ];

  // Category pages
  const categoryPages = categories.map((cat) => ({
    url: `/deals/${cat}`,
    priority: "0.8",
    changefreq: "daily",
  }));

  // Blog articles
  const blogPages = getBlogSlugs().map((slug) => ({
    url: `/blog/${slug}`,
    priority: "0.7",
    changefreq: "monthly",
  }));

  const allPages = [...staticPages, ...categoryPages, ...blogPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (p) => `  <url>
    <loc>${baseUrl}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  return res.status(200).send(sitemap);
}

function getBlogSlugs() {
  return [
    "best-tech-gadgets-under-10-dollars",
    "top-gaming-accessories-2026",
    "best-kitchen-gadgets-aliexpress",
    "phone-accessories-must-have",
    "home-organization-hacks-cheap",
  ];
}
