import { NextResponse } from "next/server";
import { DEFAULT_BACKEND_URL } from "../../../../lib/backend";

const ALLOWED_PREFIXES = [
  "api/dividends",
  "api/stocks",
  "api/stock",
  "api/screener",
  "api/calendar.ics",
];

export async function GET(request, { params }) {
  const path = params.path.join("/"); // 取得網址路徑 (例如: stocks/list)
  const searchParams = request.nextUrl.searchParams.toString(); // 取得查詢參數 (例如: ?year=2024)
  
  // 後端真實網址 (內網或外網皆可)
  const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || DEFAULT_BACKEND_URL;
  const SERVICE_TOKEN = process.env.SERVICE_TOKEN; // 從環境變數讀取密碼

  const isAllowed = ALLOWED_PREFIXES.some((prefix) => {
    return path === prefix || path.startsWith(`${prefix}/`);
  });

  if (!isAllowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 只使用 Next/runtime 提供的 IP，不轉發瀏覽器可偽造的 x-forwarded-for。
  // 若部署平台未提供 request.ip，後端會退回代理來源 IP 做限流。
  const clientIp = request.ip || "";

  try {
    const url = `${BACKEND_URL}/${path}${searchParams ? `?${searchParams}` : ""}`;

    const res = await fetch(url, {
      headers: {
        "X-Service-Token": SERVICE_TOKEN, // 🔥 關鍵：在這裡偷加密碼
        ...(clientIp ? { "X-Proxy-Client-IP": clientIp } : {}),
      },
      cache: 'no-store', // 代理本身不快取，依賴後端 Redis
      signal: AbortSignal.timeout(15000), // 後端卡住時不讓請求無限掛著
    });

    const contentType = res.headers.get("content-type") || "";

    // ICS 行事曆訂閱：原樣透傳文字內容，Google/Apple 行事曆才能訂閱
    if (contentType.includes("text/calendar")) {
      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: { "content-type": "text/calendar; charset=utf-8" },
      });
    }

    const data = contentType.includes("application/json")
      ? await res.json()
      : { error: "Invalid upstream response" };

    // 回傳給瀏覽器
    return NextResponse.json(data, { status: res.status });

  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return NextResponse.json({ error: "Upstream timeout" }, { status: 504 });
    }
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
