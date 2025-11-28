import CalendarClient from "../components/CalendarClient";
import Loading from "../components/Loading"; // 1. 引入
import { format } from "date-fns";
import { Suspense } from "react";

// 資料抓取函式 (加入參數)
async function getData(searchParams) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ggo.zeabur.app";
  const SERVICE_TOKEN = process.env.SERVICE_TOKEN; // 讀取密碼
  const now = new Date();
  
  // 1. 優先使用網址參數，若無則使用當前時間
  // 注意：searchParams 傳進來通常是字串
  // 🔥 修改這裡：優先判斷 date 參數，讓伺服器直接抓對月份
  let targetDate = now;
  if (searchParams?.date) {
    const parsed = new Date(searchParams.date);
    if (!isNaN(parsed.getTime())) {
      targetDate = parsed;
    }
  }

  // 如果網址有 year/month 就用網址的，否則就用 targetDate (可能是今天，也可能是 date 參數那天)
  const year = searchParams?.year || format(targetDate, "yyyy");
  const month = searchParams?.month || format(targetDate, "M");
  try {
    // 平行發送請求
    const [dividendRes, stockRes] = await Promise.all([
      // 根據參數抓取特定月份
      fetch(`${API_URL}/api/dividends?year=${year}&month=${month}`, { 
        headers: { "X-Service-Token": SERVICE_TOKEN },
        next: { revalidate: 3600 } 
      }),
      fetch(`${API_URL}/api/stocks/list`, { 
        headers: { "X-Service-Token": SERVICE_TOKEN },
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loading text="正在載入股利日曆..." />
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