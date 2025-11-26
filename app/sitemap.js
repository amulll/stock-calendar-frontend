// app/sitemap.js

export default async function sitemap() {
  const baseUrl = 'https://ugoodli.com';
  
  // 1. 優先讀取環境變數，若無則使用預設值
  // 注意：在 Server Side 執行時，有時候讀不到 NEXT_PUBLIC_ 開頭的變數
  // 建議在 Zeabur 額外設定一個名為 "API_URL" 的變數，或者直接在這裡寫死您的後端網址以確保萬無一失
  const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "https://ggo.zeabur.app"; // <--- 建議暫時先寫死您的後端網址測試

  console.log(`[Sitemap] Starting generation... Target API: ${API_URL}`);

  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0, // 首頁最重要
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly', // 幾乎不會改
      priority: 0.3, // 權重低
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
    // 2. 呼叫 API
    console.log(`[Sitemap] Fetching stocks from ${API_URL}/api/stocks/list`);
    
    const res = await fetch(`${API_URL}/api/stocks/list`, { 
        next: { revalidate: 86400 },
        headers: {
            // 避免被自己的 Rate Limit 擋住，雖然通常內網/同IP不會
            'User-Agent': 'Nextjs-Sitemap-Generator'
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