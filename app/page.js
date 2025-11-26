import CalendarClient from "../components/CalendarClient";
import { format } from "date-fns";
import { Suspense } from "react";

// 資料抓取函式 (加入參數)
async function getData(searchParams) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const now = new Date();
  
  // 1. 優先使用網址參數，若無則使用當前時間
  // 注意：searchParams 傳進來通常是字串
  const year = searchParams?.year || format(now, "yyyy");
  const month = searchParams?.month || format(now, "M");

  try {
    // 平行發送請求
    const [dividendRes, stockRes] = await Promise.all([
      // 根據參數抓取特定月份
      fetch(`${API_URL}/api/dividends?year=${year}&month=${month}`, { 
        next: { revalidate: 3600 } 
      }),
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

function CalendarFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="animate-pulse">正在載入股利日曆...</p>
    </div>
  );
}

// 2. Page 接收 props.searchParams (Next.js 預設功能)
export default async function Page({ searchParams }) {
  const data = await getData(searchParams);

  return (
    <Suspense fallback={<CalendarFallback />}>
      <CalendarClient 
        initialDividends={data.initialDividends} 
        initialAllStocks={data.initialAllStocks} 
      />
    </Suspense>
  );
}