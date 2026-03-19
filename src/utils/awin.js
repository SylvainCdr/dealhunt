// Awin Product Feed integration
// Docs: https://wiki.awin.com/index.php/Product_Feed

// Awin provides CSV/XML product feeds per advertiser
// You download feeds and import them into your DB

const AWIN_API_BASE = "https://productdata.awin.com";

export async function fetchAwinFeed({ advertiserId, feedId }) {
  const apiKey = process.env.AWIN_API_KEY;
  const publisherId = process.env.AWIN_PUBLISHER_ID;

  if (!apiKey || !publisherId) {
    console.warn("Awin credentials not configured");
    return [];
  }

  // Awin product feed URL format
  const feedUrl = `${AWIN_API_BASE}/datafeed/list/apikey/${apiKey}`;

  try {
    const res = await fetch(feedUrl);
    if (!res.ok) {
      console.error("Awin feed fetch failed:", res.status);
      return [];
    }
    const data = await res.json();
    return data || [];
  } catch (err) {
    console.error("Awin fetch error:", err.message);
    return [];
  }
}

// Parse Awin CSV feed into normalized deal format
export function parseAwinProducts(products, category) {
  if (!Array.isArray(products)) return [];

  return products
    .map((p) => ({
      sourceId: `awin_${p.product_id || p.aw_product_id}`,
      source: "awin",
      title: p.product_name || p.title || "",
      description: p.description || "",
      image: p.merchant_image_url || p.aw_image_url || "",
      price: parseFloat(p.search_price || p.store_price || 0),
      originalPrice: p.rrp_price ? parseFloat(p.rrp_price) : null,
      discount:
        p.rrp_price && p.search_price
          ? Math.round(
              (1 - parseFloat(p.search_price) / parseFloat(p.rrp_price)) * 100,
            )
          : null,
      currency: p.currency || "EUR",
      affiliateUrl: p.aw_deep_link || p.merchant_deep_link || "",
      category: category || p.merchant_category || "general",
      rating: p.rating ? parseFloat(p.rating) : null,
      orders: null,
    }))
    .filter((p) => p.affiliateUrl && p.title);
}
