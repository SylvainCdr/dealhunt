// pages/api/categories.js
import { getAccessToken } from "../../utils/cjAuth";

export default async function handler(req, res) {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      "https://developers.cjdropshipping.com/api2.0/v1/product/getCategory",
      {
        method: "GET",
        headers: { "CJ-Access-Token": token },
      }
    );

    const data = await response.json();

    if (!data.result) {
      // ⚠️ result = false -> erreur
      console.error("CJ API error:", data.message, data.code);
      return res.status(500).json({ error: data.message, code: data.code });
    }

    res.status(200).json({ categories: data.data || [] });
  } catch (e) {
    console.error("API /categories error:", e);
    res.status(500).json({ error: e.message });
  }
}
