// pages/api/products.js
import { getAccessToken } from "../../utils/cjAuth";

export default async function handler(req, res) {
  try {
    const token = await getAccessToken();
    const { categoryId, pageNum = 1, pageSize = 20 } = req.query;

    // Construire l'URL avec query params
    const params = new URLSearchParams({ pageNum, pageSize });
    if (categoryId) params.append("categoryId", categoryId);

    const url = `https://developers.cjdropshipping.com/api2.0/v1/product/list?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "CJ-Access-Token": token,
      },
    });

    const data = await response.json();

    if (!data.result) {
      console.error("CJ API error:", data.message, data.code);
      return res.status(500).json({ error: data.message, code: data.code });
    }

    res.status(200).json({ products: data.data.list || [] });
  } catch (e) {
    console.error("API /products error:", e);
    res.status(500).json({ error: e.message });
  }
}
