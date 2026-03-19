// Affiliate service for Amazon Product Advertising API (PA-API 5.0)
// Docs: https://webservices.amazon.com/paapi5/documentation/

const AMAZON_API_HOST = "webservices.amazon.com";
const AMAZON_API_PATH = "/paapi5/searchitems";
const AMAZON_REGION = "us-east-1";
const AMAZON_SERVICE = "ProductAdvertisingAPI";

// AWS Signature V4 signing
async function hmacSha256(key, message) {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    typeof key === "string" ? encoder.encode(key) : key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(
    await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message)),
  );
}

async function sha256(message) {
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(message));
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getSignatureKey(key, dateStamp, region, service) {
  let kDate = await hmacSha256("AWS4" + key, dateStamp);
  let kRegion = await hmacSha256(kDate, region);
  let kService = await hmacSha256(kRegion, service);
  return hmacSha256(kService, "aws4_request");
}

async function signedRequest(method, path, payload) {
  const accessKey = process.env.AMAZON_ACCESS_KEY;
  const secretKey = process.env.AMAZON_SECRET_KEY;

  if (!accessKey || !secretKey) {
    console.warn("Amazon PA-API credentials not configured");
    return null;
  }

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const body = JSON.stringify(payload);
  const payloadHash = await sha256(body);

  const canonicalHeaders =
    [
      `content-encoding:amz-1.0`,
      `content-type:application/json; charset=utf-8`,
      `host:${AMAZON_API_HOST}`,
      `x-amz-date:${amzDate}`,
      `x-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems`,
    ].join("\n") + "\n";

  const signedHeaders =
    "content-encoding;content-type;host;x-amz-date;x-amz-target";

  const canonicalRequest = [
    method,
    path,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${AMAZON_REGION}/${AMAZON_SERVICE}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    await sha256(canonicalRequest),
  ].join("\n");

  const signingKey = await getSignatureKey(
    secretKey,
    dateStamp,
    AMAZON_REGION,
    AMAZON_SERVICE,
  );
  const signatureBytes = await hmacSha256(signingKey, stringToSign);
  const signature = Array.from(signatureBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(`https://${AMAZON_API_HOST}${path}`, {
    method,
    headers: {
      "content-encoding": "amz-1.0",
      "content-type": "application/json; charset=utf-8",
      host: AMAZON_API_HOST,
      "x-amz-date": amzDate,
      "x-amz-target":
        "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems",
      Authorization: authHeader,
    },
    body,
  });

  return res.json();
}

export async function searchAmazonProducts({
  keywords,
  category,
  pageNum = 1,
}) {
  const partnerTag = process.env.AMAZON_PARTNER_TAG;
  if (!partnerTag) {
    console.warn("AMAZON_PARTNER_TAG not set");
    return [];
  }

  const payload = {
    Keywords: keywords,
    PartnerTag: partnerTag,
    PartnerType: "Associates",
    Marketplace: "www.amazon.com",
    Resources: [
      "Images.Primary.Large",
      "ItemInfo.Title",
      "Offers.Listings.Price",
      "Offers.Listings.SavingBasis",
      "CustomerReviews.StarRating",
    ],
    ItemCount: 10,
    ItemPage: pageNum,
  };

  if (category) payload.SearchIndex = category;

  const data = await signedRequest("POST", AMAZON_API_PATH, payload);
  if (!data || !data.SearchResult) return [];

  return data.SearchResult.Items.map((item) => {
    const listing = item.Offers?.Listings?.[0];
    const price = listing?.Price?.Amount || 0;
    const originalPrice = listing?.SavingBasis?.Amount || price;
    const discount =
      originalPrice > price
        ? Math.round((1 - price / originalPrice) * 100)
        : null;

    return {
      sourceId: item.ASIN,
      source: "amazon",
      title: item.ItemInfo?.Title?.DisplayValue || "",
      image: item.Images?.Primary?.Large?.URL || "",
      price,
      originalPrice: originalPrice > price ? originalPrice : null,
      discount,
      currency: "USD",
      affiliateUrl: item.DetailPageURL,
      category: keywords || "general",
      rating: item.CustomerReviews?.StarRating?.Value || null,
      orders: null,
    };
  });
}
