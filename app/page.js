import CalendarClient from "./components/CalendarClient";
import { format } from "date-fns";

// 這是 Server Component，在伺服器端執行
async function getData() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const now = new Date();
  
  const year = format(now, "yyyy");
  const month = format(now, "M");

  try {
    // 🚀 平行發送請求
    const [dividendRes, stockRes] = await Promise.all([
      // 1. 當月股利資料：ISR 快取 1 小時
      fetch(`${API_URL}/api/dividends?year=${year}&month=${month}`, { 
        next: { revalidate: 3600 } 
      }),
      // 2. 所有股票清單：ISR 快取 24 小時
      fetch(`${API_URL}/api/stocks/list`, { 
        next: { revalidate: 86400 } 
      })
    ]);

    if (!dividendRes.ok || !stockRes.ok) {
      throw new Error("Failed to fetch initial data");
    }

    const initialDividends = await dividendRes.json();
    const initialAllStocks = await stockRes.json();

    return { initialDividends, initialAllStocks };

  } catch (error) {
    console.error("Server-side fetch error:", error);
    // 出錯時回傳空陣列，讓 Client Component 自己去 Client-side fetch 試試看
    return { initialDividends: [], initialAllStocks: [] };
  }
}

export default async function Page() {
  const data = await getData();

  return (
    <CalendarClient 
      initialDividends={data.initialDividends} 
      initialAllStocks={data.initialAllStocks} 
    />
  );
}