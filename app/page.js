import CalendarClient from "../components/CalendarClient";
import { format } from "date-fns";
import { Suspense } from "react"; // 1. 引入 Suspense

// 這是 Server Component
async function getData() {
  // ⚠️ 在 Zeabur Build 時，確保這個變數有被讀到。
  // 如果是跨服務溝通，建議確認 Zeabur 的內網/公網網址設定。
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

// 2. 建立一個 Loading 元件 (可選，這是 Suspense 等待時顯示的內容)
function CalendarFallback() {
  return <div className="min-h-screen flex items-center justify-center">載入中...</div>;
}

export default async function Page() {
  const data = await getData();

  return (
    // 3. 使用 Suspense 包裹 Client Component
    <Suspense fallback={<CalendarFallback />}>
      <CalendarClient 
        initialDividends={data.initialDividends} 
        initialAllStocks={data.initialAllStocks} 
      />
    </Suspense>
  );
}