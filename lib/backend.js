// 後端 API 網址的單一來源 (預設 / fallback)。
// 搬後端或改網址時，只需改這一行。
export const DEFAULT_BACKEND_URL = "https://ggo.soleiltolune.com";

// 伺服器端 (SSR / ISR / route handler / sitemap) 呼叫後端時用的網址，在執行期間讀取：
// 1. BACKEND_INTERNAL_URL：執行期間才設定 (VPS 上是 http://backend:8080，走 Docker 內網)。
//    build 時沒有這個變數，所以 build 期間的預先產生頁面仍走公開網址，build 不需要連到內網。
// 2. API_URL：舊的 sitemap 專用變數，保留相容。
// 3. NEXT_PUBLIC_API_URL：build 時寫死的公開網址。
// 只能在伺服器端使用：瀏覽器端讀不到 BACKEND_INTERNAL_URL，瀏覽器一律走 /api/proxy。
export function getServerBackendUrl() {
  return (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_BACKEND_URL
  );
}
