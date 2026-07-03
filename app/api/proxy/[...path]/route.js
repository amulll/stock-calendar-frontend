import { NextResponse } from "next/server";

const ALLOWED_PREFIXES = ["api/dividends", "api/stocks", "api/stock"];

export async function GET(request, { params }) {
  const path = params.path.join("/"); // 取得網址路徑 (例如: stocks/list)
  const searchParams = request.nextUrl.searchParams.toString(); // 取得查詢參數 (例如: ?year=2024)
  
  // 後端真實網址 (內網或外網皆可)
  const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || "https://ggo.zeabur.app";
  const SERVICE_TOKEN = process.env.SERVICE_TOKEN; // 從環境變數讀取密碼

  const isAllowed = ALLOWED_PREFIXES.some((prefix) => {
    return path === prefix || path.startsWith(`${prefix}/`);
  });

  if (!isAllowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 轉發使用者真實 IP，後端限流才能按個別使用者計算，
  // 而不是把所有人算在代理伺服器的同一個 IP 上
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.ip ||
    "";

  try {
    const url = `${BACKEND_URL}/${path}${searchParams ? `?${searchParams}` : ""}`;

    const res = await fetch(url, {
      headers: {
        "X-Service-Token": SERVICE_TOKEN, // 🔥 關鍵：在這裡偷加密碼
        ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
      },
      cache: 'no-store' // 代理本身不快取，依賴後端 Redis
    });

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await res.json()
      : { error: "Invalid upstream response" };
    
    // 回傳給瀏覽器
    return NextResponse.json(data, { status: res.status });

  } catch (error) {
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
