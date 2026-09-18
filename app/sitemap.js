import { DEFAULT_BACKEND_URL } from "../lib/backend";

const BASE_URL = "https://ugoodly.com";

function asLastModified(value) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? undefined : parsed;
}

export default async function sitemap() {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_URL;
  const serviceToken = process.env.SERVICE_TOKEN;
  const staticRoutes = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/screener`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/ranking/consecutive-dividend`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/ranking/high-yield`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/knowledge`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/knowledge/stock-split-dividend-yield`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/methodology`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/about`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/disclaimer`, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const response = await fetch(`${apiUrl}/api/stocks/seo-index`, {
      next: { revalidate: 86400 },
      headers: {
        "User-Agent": "Nextjs-Sitemap-Generator",
        "X-Service-Token": serviceToken,
      },
    });
    if (!response.ok) throw new Error(`SEO index API returned ${response.status}`);

    const stocks = await response.json();
    const stockRoutes = stocks.map((stock) => ({
      url: `${BASE_URL}/stock/${stock.stock_code}`,
      lastModified: asLastModified(stock.last_modified),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
    return [...staticRoutes, ...stockRoutes];
  } catch (error) {
    console.error("[Sitemap] SEO stock inventory unavailable:", error);
    // Do not fall back to every stock row: a partial sitemap is safer than
    // re-advertising thin pages when the eligibility source is unavailable.
    return staticRoutes;
  }
}
