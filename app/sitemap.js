// app/sitemap.js

export default async function sitemap() {
  const baseUrl = 'https://ugoodly.com';
  
  // 1. 讀取環境變數
  // 在 Zeabur Build 階段，SERVICE_TOKEN 必須存在於前端變數中
  const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://ggo.zeabur.app";
  const SERVICE_TOKEN = process.env.SERVICE_TOKEN;

  console.log(`[Sitemap] Starting generation... Target API: ${API_URL}`);

  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  let stockRoutes = [];
  try {
    // 2. 呼叫 API (🔥 關鍵修改：加入 X-Service-Token Header)
    console.log(`[Sitemap] Fetching stocks from ${API_URL}/api/stocks/list`);
    
    const res = await fetch(`${API_URL}/api/stocks/list`, { 
        next: { revalidate: 86400 },
        headers: {
            'User-Agent': 'Nextjs-Sitemap-Generator',
            // 👇 加上這行，帶上通行證
            'X-Service-Token': SERVICE_TOKEN 
        }
    });
    
    if (res.ok) {
      const stocks = await res.json();
      console.log(`[Sitemap] Successfully fetched ${stocks.length} stocks.`);
      
      stockRoutes = stocks.map((stock) => ({
        url: `${baseUrl}/stock/${stock.stock_code}`,
        lastModified: new Date(),
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