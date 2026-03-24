// API Route: /api/affiliate/fetch
// Called by CRON job to auto-fetch deals from all affiliate sources
// Secured with CRON_SECRET to prevent unauthorized calls

import { connectDB } from "../../../utils/database.js";
import Deal from "../../../models/Deal.js";
import {
  searchAliExpressProducts,
  getAliExpressHotProducts,
} from "../../../utils/aliexpress.js";
import { searchAmazonProducts } from "../../../utils/amazon.js";
import { searchEbayProducts } from "../../../utils/ebay.js";
import { fetchAwinFeed, parseAwinProducts } from "../../../utils/awin.js";

// Categories/keywords to fetch automatically — US market
const SEARCH_QUERIES = [
  // Tech & Gadgets
  { keywords: "smart gadgets", category: "tech" },
  { keywords: "phone accessories", category: "tech" },
  { keywords: "wireless earbuds", category: "tech" },
  { keywords: "laptop accessories", category: "tech" },
  { keywords: "smart watch", category: "tech" },
  { keywords: "LED lights", category: "tech" },
  { keywords: "portable charger", category: "tech" },
  { keywords: "gaming accessories", category: "gaming" },
  { keywords: "gaming mouse keyboard", category: "gaming" },
  // Home & Kitchen
  { keywords: "kitchen gadgets", category: "home" },
  { keywords: "home organization", category: "home" },
  { keywords: "home decor", category: "home" },
  { keywords: "bathroom accessories", category: "home" },
  { keywords: "cleaning tools", category: "home" },
  // Fashion & Beauty
  { keywords: "beauty tools", category: "beauty" },
  { keywords: "skincare tools", category: "beauty" },
  { keywords: "hair accessories", category: "beauty" },
  { keywords: "sunglasses", category: "fashion" },
  { keywords: "jewelry women", category: "fashion" },
  { keywords: "men accessories", category: "fashion" },
  // Sports & Outdoors
  { keywords: "fitness equipment", category: "sports" },
  { keywords: "yoga accessories", category: "sports" },
  { keywords: "outdoor camping", category: "outdoors" },
  { keywords: "cycling accessories", category: "outdoors" },
  // Car & Tools
  { keywords: "car accessories", category: "auto" },
  { keywords: "car gadgets", category: "auto" },
  // Pets
  { keywords: "pet supplies", category: "pets" },
  { keywords: "dog toys", category: "pets" },
  // Kids & Toys
  { keywords: "kids toys educational", category: "toys" },
  { keywords: "baby products", category: "toys" },
];

async function upsertDeals(deals) {
  let inserted = 0;
  let updated = 0;

  for (const deal of deals) {
    try {
      const result = await Deal.findOneAndUpdate(
        { sourceId: deal.sourceId, source: deal.source },
        { ...deal, updatedAt: new Date() },
        { upsert: true, new: true },
      );
      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        inserted++;
      } else {
        updated++;
      }
    } catch (err) {
      // Skip duplicates silently
      if (err.code !== 11000) {
        console.error("Upsert error:", err.message);
      }
    }
  }

  return { inserted, updated };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify cron secret
  const cronSecret = req.headers["x-cron-secret"] || req.query.secret;
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  await connectDB();

  const results = {
    aliexpress: { inserted: 0, updated: 0 },
    amazon: { inserted: 0, updated: 0 },
    ebay: { inserted: 0, updated: 0 },
    awin: { inserted: 0, updated: 0 },
  };

  // 1. Fetch AliExpress hot products (multiple pages)
  for (let page = 1; page <= 5; page++) {
    try {
      const hotProducts = await getAliExpressHotProducts({
        pageNo: page,
        pageSize: 50,
      });
      if (hotProducts.length > 0) {
        const r = await upsertDeals(hotProducts);
        results.aliexpress.inserted += r.inserted;
        results.aliexpress.updated += r.updated;
      } else break;
    } catch (err) {
      console.error(`AliExpress hot products page ${page} error:`, err.message);
    }
  }

  // 2. Fetch by search queries (AliExpress + Amazon)
  for (const query of SEARCH_QUERIES) {
    try {
      const aeProducts = await searchAliExpressProducts({
        keywords: query.keywords,
        pageSize: 50,
      });
      // Override category with our label
      const aeWithCategory = aeProducts.map((p) => ({
        ...p,
        category: query.category,
      }));
      if (aeWithCategory.length > 0) {
        const r = await upsertDeals(aeWithCategory);
        results.aliexpress.inserted += r.inserted;
        results.aliexpress.updated += r.updated;
      }
    } catch (err) {
      console.error(
        `AliExpress search (${query.keywords}) error:`,
        err.message,
      );
    }

    try {
      const amzProducts = await searchAmazonProducts({
        keywords: query.keywords,
      });
      const amzWithCategory = amzProducts.map((p) => ({
        ...p,
        category: query.category,
      }));
      if (amzWithCategory.length > 0) {
        const r = await upsertDeals(amzWithCategory);
        results.amazon.inserted += r.inserted;
        results.amazon.updated += r.updated;
      }
    } catch (err) {
      console.error(`Amazon search (${query.keywords}) error:`, err.message);
    }

    // eBay
    try {
      const ebayProducts = await searchEbayProducts({
        keywords: query.keywords,
        category: query.category,
        limit: 50,
      });
      if (ebayProducts.length > 0) {
        const r = await upsertDeals(ebayProducts);
        results.ebay.inserted += r.inserted;
        results.ebay.updated += r.updated;
      }
    } catch (err) {
      console.error(`eBay search (${query.keywords}) error:`, err.message);
    }
  }

  // 3. Fetch Awin product feed (if configured)
  try {
    const awinRaw = await fetchAwinFeed({});
    const awinProducts = parseAwinProducts(awinRaw);
    if (awinProducts.length > 0) {
      const r = await upsertDeals(awinProducts);
      results.awin.inserted += r.inserted;
      results.awin.updated += r.updated;
    }
  } catch (err) {
    console.error("Awin fetch error:", err.message);
  }

  // 4. Remove deals older than 7 days that haven't been updated
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const removed = await Deal.deleteMany({
    updatedAt: { $lt: sevenDaysAgo },
    featured: false,
  });

  return res.status(200).json({
    success: true,
    results,
    removed: removed.deletedCount,
  });
}
