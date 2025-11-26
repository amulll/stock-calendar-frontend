// ⚠️ 路徑修正：因為 CalendarClient 在 components/ 底下 (與 app 平行)
import CalendarClient from "../components/CalendarClient"; 
import SeoContent from "../components/SeoContent"; // 🆕 引入元件
import { format } from "date-fns";

// 這是 Server Component
async function getData() {
  // ⚠️ 注意：Server Component 無法讀取 NEXT_PUBLIC_ 開頭的環境變數，需要使用完整的絕對路徑
  // 請確保您在部署平台 (Zeabur) 設定了完整的後端網址，或者在這裡寫死 (若都在同一內網)
  // 建議：如果是在 Zeabur，後端網址可能是 http://stock-calendar-backend.zeabur.internal:8000 (內網)
  // 但為了保險起見，這裡先用公開網址。
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const now = new Date();
  
  const year = format(now, "yyyy");
  const month = format(now, "M");

  try {
    // 平行發送請求
    const [dividendRes, stockRes] = await Promise.all([
      // 當月股利資料：ISR 快取 1 小時
      fetch(`${API_URL}/api/dividends?year=${year}&month=${month}`, { 
        next: { revalidate: 3600 } 
      }),
      // 所有股票清單：ISR 快取 24 小時
      fetch(`${API_URL}/api/stocks/list`, { 
        next: { revalidate: 86400 } 
      })
    ]);

    if (!dividendRes.ok || !stockRes.ok) {
      console.error("Server fetch failed:", dividendRes.status, stockRes.status);
      // 出錯時不拋出 Error 讓頁面掛掉，而是回傳空陣列，讓 Client Component 自己去 fetch
      return { initialDividends: [], initialAllStocks: [] };
    }

    const initialDividends = await dividendRes.json();
    const initialAllStocks = await stockRes.json();

    return { initialDividends, initialAllStocks };

  } catch (error) {
    console.error("Server-side fetch error:", error);
    return { initialDividends: [], initialAllStocks: [] };
  }
}

export default async function Page() {
  const data = await getData();

  return (
    <>
      <CalendarClient 
        initialDividends={data.initialDividends} 
        initialAllStocks={data.initialAllStocks} 
      />
      {/* 🆕 將 SEO 文字放在主程式下方，不影響操作，但爬蟲讀得到 */}
      <SeoContent />
    </>
  );
}