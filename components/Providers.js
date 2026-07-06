"use client";

import { SWRConfig } from "swr";
import { fetcher } from "../lib/fetcher";

// 全站 SWR 設定：共用 fetcher、關閉聚焦自動重抓 (股利資料變動慢)，
// 並以 10 分鐘去重複，取代原本手寫的記憶體快取。
export default function Providers({ children }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        dedupingInterval: 10 * 60 * 1000,
        errorRetryCount: 2,
      }}
    >
      {children}
    </SWRConfig>
  );
}
