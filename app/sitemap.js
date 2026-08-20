// app/sitemap.js
import { DEFAULT_BACKEND_URL } from "../lib/backend";

export default async function sitemap() {
  const baseUrl = 'https://ugoodly.com';
  
  // 1. 讀取環境變數
  // API_URL: 後端網址 (建議在 Zeabur 設定環境變數，或在此寫死)
  // SERVICE_TOKEN: 通行證密碼 (必須與後端一致)
  const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND_URL;
  const SERVICE_TOKEN = process.env.SERVICE_TOKEN;

  console.log(`[Sitemap] Starting generation... Target API: ${API_URL}`);

  const staticRoutes = [
    {
      url: `${baseUrl}`,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/screener`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ranking/consecutive-dividend`,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ranking/high-yield`,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/knowledge`,
      changeFrequency: 'monthly',
      priority: 0.7, // 給予較高的權重
    },
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/disclaimer`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  let stockRoutes = [];
  try {
    // 2. 呼叫 API
    console.log(`[Sitemap] Fetching stocks from ${API_URL}/api/stocks/list`);
    
    const res = await fetch(`${API_URL}/api/stocks/list`, { 
        next: { revalidate: 86400 },
        headers: {
            // 加入 User-Agent 識別
            'User-Agent': 'Nextjs-Sitemap-Generator',
            // 🔥 關鍵修改：加入 Service Token 通行證
            'X-Service-Token': SERVICE_TOKEN 
        }
    });
    
    if (res.ok) {
      const stocks = await res.json();
      console.log(`[Sitemap] Successfully fetched ${stocks.length} stocks.`);
      
      stockRoutes = stocks.map((stock) => ({
        url: `${baseUrl}/stock/${stock.stock_code}`,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    } else {
      console.error(`[Sitemap] API returned error status: ${res.status}`);
      const text = await res.text();
      console.error(`[Sitemap] Error body: ${text}`);
    }
  } catch (error) {
    console.error("[Sitemap] Fetch failed:", error);
  }

  console.log(`[Sitemap] Total URLs generated: ${staticRoutes.length + stockRoutes.length}`);
  return [...staticRoutes, ...stockRoutes];
}
