import { NextResponse } from "next/server";

// 這是 Next.js 的 API Route (在伺服器端執行)
export async function GET(request, { params }) {
  const path = params.path.join("/"); // 取得網址路徑 (例如: stocks/list)
  const searchParams = request.nextUrl.searchParams.toString(); // 取得查詢參數 (例如: ?year=2024)
  
  // 後端真實網址 (內網或外網皆可)
  const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || "https://ggo.zeabur.app";
  const SERVICE_TOKEN = process.env.SERVICE_TOKEN; // 從環境變數讀取密碼

  try {
    const url = `${BACKEND_URL}/api/${path}${searchParams ? `?${searchParams}` : ""}`;
    
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "X-Service-Token": SERVICE_TOKEN, // 🔥 關鍵：在這裡偷加密碼
      },
      cache: 'no-store' // 代理本身不快取，依賴後端 Redis
    });

    const data = await res.json();
    
    // 回傳給瀏覽器
    return NextResponse.json(data, { status: res.status });

  } catch (error) {
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}