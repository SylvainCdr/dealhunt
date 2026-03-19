// Affiliate service for AliExpress Portals API
// Docs: https://portals.aliexpress.com/help/api

const AE_API_BASE = "https://api-sg.aliexpress.com/sync";

// AliExpress affiliate link generation & product search
// Requires: ALIEXPRESS_APP_KEY, ALIEXPRESS_APP_SECRET, ALIEXPRESS_TRACKING_ID in .env

async function signRequest(params, secret) {
  // AliExpress uses HMAC-SHA256 signing
  // Sort params alphabetically, concatenate, then HMAC
  const sorted = Object.keys(params).sort();
  const baseString = sorted.map((k) => `${k}${params[k]}`).join("");

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(baseString),
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

async function callAliExpressAPI(method, bizParams) {
  const appKey = process.env.ALIEXPRESS_APP_KEY;
  const appSecret = process.env.ALIEXPRESS_APP_SECRET;

  if (!appKey || !appSecret) {
    console.warn("AliExpress API credentials not configured");
    return null;
  }

  const params = {
    app_key: appKey,
    method,
    sign_method: "sha256",
    timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
    format: "json",
    v: "2.0",
    ...bizParams,
  };

  params.sign = await signRequest(params, appSecret);

  const queryString = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  const res = await fetch(`${AE_API_BASE}?${queryString}`);
  return res.json();
}

// Search products with affiliate links
export async function searchAliExpressProducts({
  keywords,
  category,
  pageNo = 1,
  pageSize = 20,
}) {
  const trackingId = process.env.ALIEXPRESS_TRACKING_ID;
  if (!trackingId) {
    console.warn("ALIEXPRESS_TRACKING_ID not set");
    return [];
  }

  const params = {
    keywords: keywords || "",
    tracking_id: trackingId,
    target_currency: "USD",
    target_language: "EN",
    page_no: String(pageNo),
    page_size: String(pageSize),
    sort: "SALE_PRICE_ASC",
  };

  if (category) params.category_ids = category;

  const data = await callAliExpressAPI(
    "aliexpress.affiliate.product.query",
    params,
  );

  if (!data) return [];

  const response = data?.aliexpress_affiliate_product_query_response;
  const products = response?.resp_result?.result?.products?.product || [];

  return products.map((p) => ({
    sourceId: p.product_id,
    source: "aliexpress",
    title: p.product_title,
    image: p.product_main_image_url,
    price: parseFloat(p.target_sale_price || p.target_original_price),
    originalPrice: parseFloat(p.target_original_price),
    discount: p.discount ? parseInt(p.discount) : null,
    currency: "USD",
    affiliateUrl: p.promotion_link || p.product_detail_url,
    category: keywords || "general",
    rating: p.evaluate_rate ? parseFloat(p.evaluate_rate) : null,
    orders: p.lastest_volume ? parseInt(p.lastest_volume) : 0,
  }));
}

// Get hot products (trending)
export async function getAliExpressHotProducts({
  category,
  pageNo = 1,
  pageSize = 20,
}) {
  const trackingId = process.env.ALIEXPRESS_TRACKING_ID;
  if (!trackingId) return [];

  const params = {
    tracking_id: trackingId,
    target_currency: "USD",
    target_language: "EN",
    page_no: String(pageNo),
    page_size: String(pageSize),
  };

  if (category) params.category_ids = category;

  const data = await callAliExpressAPI(
    "aliexpress.affiliate.hotproduct.query",
    params,
  );

  if (!data) return [];

  const response = data?.aliexpress_affiliate_hotproduct_query_response;
  const products = response?.resp_result?.result?.products?.product || [];

  return products.map((p) => ({
    sourceId: p.product_id,
    source: "aliexpress",
    title: p.product_title,
    image: p.product_main_image_url,
    price: parseFloat(p.target_sale_price || p.target_original_price),
    originalPrice: parseFloat(p.target_original_price),
    discount: p.discount ? parseInt(p.discount) : null,
    currency: "USD",
    affiliateUrl: p.promotion_link || p.product_detail_url,
    category: category || "hot",
    rating: p.evaluate_rate ? parseFloat(p.evaluate_rate) : null,
    orders: p.lastest_volume ? parseInt(p.lastest_volume) : 0,
  }));
}
