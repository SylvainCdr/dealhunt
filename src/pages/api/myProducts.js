// pages/api/myProducts.js
import { getAccessToken } from "../../utils/cjAuth";

export default async function handler(req, res) {
  try {
    const { keyword, categoryId, startAt, endAt } = req.query;
    const token = await getAccessToken();

    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);
    if (categoryId) params.append("categoryId", categoryId);
    if (startAt) params.append("startAt", startAt);
    if (endAt) params.append("endAt", endAt);

    const response = await fetch(
      `https://developers.cjdropshipping.com/api2.0/v1/product/myProduct/query?${params.toString()}`,
      {
        headers: { "CJ-Access-Token": token },
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
