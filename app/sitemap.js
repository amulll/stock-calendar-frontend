import { DEFAULT_BACKEND_URL } from "../lib/backend";
import { getExMonthDividends } from "../lib/exDividendData";
import { getMonthWindow, monthSlug, summarizeMonth } from "../lib/exDividendMonths.mjs";

const MONTH_FETCH_BATCH = 7;

const BASE_URL = "https://ugoodly.com";

function asLastModified(value) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? undefined : parsed;
}

// 只列出確定有資料的除權息月份頁；抓取失敗或空月份（頁面為 noindex）不列入。
// 與月份頁共用同一個後端位址與 fetch 快取；分批請求以避開後端每分鐘限流。
async function getExDividendMonthRoutes() {
  const months = getMonthWindow();
  const results = [];
  for (let start = 0; start < months.length; start += MONTH_FETCH_BATCH) {
    const batch = months.slice(start, start + MONTH_FETCH_BATCH);
    results.push(
      ...(await Promise.all(batch.map((value) => getExMonthDividends({ ...value, revalidate: 86400 }))))
    );
  }
  return months.flatMap((value, index) => {
    const result = results[index];
    if (!result.ok || result.rows.length === 0) return [];
    return [
      {
        url: `${BASE_URL}/ex-dividend/${monthSlug(value)}`,
        lastModified: asLastModified(summarizeMonth(result.rows).lastUpdated),
        changeFrequency: "weekly",
        priority: 0.7,
      },
    ];
  });
}

export default async function sitemap() {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_URL;
  const serviceToken = process.env.SERVICE_TOKEN;
  const staticRoutes = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/screener`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/ranking/consecutive-dividend`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/ranking/high-yield`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/ex-dividend`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/knowledge`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/knowledge/stock-split-dividend-yield`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/methodology`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/about`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/disclaimer`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const monthRoutes = await getExDividendMonthRoutes();

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
    return [...staticRoutes, ...monthRoutes, ...stockRoutes];
  } catch (error) {
    console.error("[Sitemap] SEO stock inventory unavailable:", error);
    // Do not fall back to every stock row: a partial sitemap is safer than
    // re-advertising thin pages when the eligibility source is unavailable.
    return [...staticRoutes, ...monthRoutes];
  }
}
