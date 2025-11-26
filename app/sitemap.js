// app/sitemap.js

export default async function sitemap() {
  // 1. 定義您的網域
  const baseUrl = 'https://ugoodli.com';
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // 2. 定義靜態頁面 (固定有的)
  const staticRoutes = [
    '',
    '/privacy',
    '/disclaimer',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  }));

  // 3. 抓取所有股票清單 (動態生成)
  let stockRoutes = [];
  try {
    // 呼叫後端 API 取得所有股票代號
    // 設定 next: { revalidate: 86400 } 代表這份清單每天更新一次即可
    const res = await fetch(`${API_URL}/api/stocks/list`, { 
        next: { revalidate: 86400 } 
    });
    
    if (res.ok) {
      const stocks = await res.json();
      
      // 為每一檔股票產生一個 sitemap 項目
      stockRoutes = stocks
      .filter(stock => stock.has_dividend_this_year && stock.yield_rate > 0) // 關鍵過濾！
      .map((stock) => ({
        url: `${baseUrl}/stock/${stock.stock_code}`,
        lastModified: new Date(),
        changeFrequency: 'weekly', // 股利資訊不用每天變，設週更即可
        priority: 0.8,             // 權重設高一點，因為這是主要內容
      }));
    }
  } catch (error) {
    console.error("Sitemap generate failed:", error);
  }

  // 4. 合併回傳
  return [...staticRoutes, ...stockRoutes];
}