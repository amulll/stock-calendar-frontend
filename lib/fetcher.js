import { proxyGet } from "./proxy-client";

// SWR 共用 fetcher：key 直接是代理路徑 (可含 query string)，例如
//   "api/stock/2330"、"api/dividends?year=2026&month=7"
// proxyGet 內部會處理回應解析與非 2xx 時丟出錯誤，正好符合 SWR 的預期。
export const fetcher = (key) => proxyGet(key);
