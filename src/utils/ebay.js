// eBay Partner Network integration via Browse API
// Docs: https://developer.ebay.com/api-docs/buy/browse/overview.html
// Sign up: https://developer.ebay.com/signin

const EBAY_API_BASE = "https://api.ebay.com";

// Get OAuth token (Client Credentials flow)
let cachedToken = null;
let tokenExpiry = 0;

async function getEbayToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn("eBay credentials not configured");
    return null;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const res = await fetch(`${EBAY_API_BASE}/identity/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope",
  });

  if (!res.ok) {
    console.error("eBay token error:", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  cachedToken = data.access_token;
  // Expire 5 min early
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
  return cachedToken;
}

export async function searchEbayProducts({
  keywords,
  category,
  limit = 50,
  offset = 0,
}) {
  const token = await getEbayToken();
  if (!token) return [];

  const affiliateCampaignId = process.env.EBAY_CAMPAIGN_ID || "";

  const params = new URLSearchParams({
    q: keywords,
    limit: String(Math.min(limit, 200)),
    offset: String(offset),
    filter: "deliveryCountry:US,priceCurrency:USD,conditionIds:{1000}", // New items
    sort: "price",
    fieldgroups: "EXTENDED",
  });

  // Add category filter if we have an eBay category ID mapping
  const ebayCategoryId = CATEGORY_MAP[category];
  if (ebayCategoryId) {
    params.append("category_ids", ebayCategoryId);
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
  };

  // Add affiliate tracking if campaign ID is set
  if (affiliateCampaignId) {
    headers["X-EBAY-C-ENDUSERCTX"] =
      `affiliateCampaignId=${affiliateCampaignId}`;
  }

  try {
    const res = await fetch(
      `${EBAY_API_BASE}/buy/browse/v1/item_summary/search?${params}`,
      { headers },
    );

    if (!res.ok) {
      console.error("eBay search error:", res.status);
      return [];
    }

    const data = await res.json();
    if (!data.itemSummaries) return [];

    return data.itemSummaries
      .map((item) => {
        const price = parseFloat(item.price?.value || 0);
        const originalPrice = item.marketingPrice?.originalPrice
          ? parseFloat(item.marketingPrice.originalPrice.value)
          : null;
        const discount =
          originalPrice && originalPrice > price
            ? Math.round((1 - price / originalPrice) * 100)
            : item.marketingPrice?.discountPercentage
              ? Math.round(parseFloat(item.marketingPrice.discountPercentage))
              : null;

        return {
          sourceId: `ebay_${item.itemId}`,
          source: "ebay",
          title: item.title || "",
          description: item.shortDescription || "",
          image:
            item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl || "",
          price,
          originalPrice:
            originalPrice && originalPrice > price ? originalPrice : null,
          discount,
          currency: "USD",
          affiliateUrl: item.itemAffiliateWebUrl || item.itemWebUrl || "",
          category: category || "general",
          rating: null,
          orders: item.buyingOptions?.includes("AUCTION")
            ? null
            : parseInt(item.topRatedBuyingExperience ? "100" : "0"),
        };
      })
      .filter((p) => p.affiliateUrl && p.title && p.price > 0);
  } catch (err) {
    console.error("eBay fetch error:", err.message);
    return [];
  }
}

// eBay Browse API category IDs for common categories
const CATEGORY_MAP = {
  tech: "293", // Electronics
  gaming: "1249", // Video Games & Consoles
  home: "11700", // Home & Garden
  beauty: "26395", // Health & Beauty
  fashion: "11450", // Clothing, Shoes & Accessories
  sports: "888", // Sporting Goods
  outdoors: "888", // Sporting Goods (camping subcategory)
  auto: "6000", // Motors Parts & Accessories
  pets: "1281", // Pet Supplies
  toys: "220", // Toys & Hobbies
};
