# Technical Development Log

## 2026-03-23 – Stock Meta Description Hardening (SEO)
- **個股頁 metadata fallback 與長度一致化**  
  *Why*: 外部 SEO 健檢指出多個個股頁出現 meta description 過短或缺失，且在上游資料暫時失敗時更容易被爬蟲放大。  
  *Impact*:  
  1. `app/stock/[id]/page.js` 在查無資料時改為回傳完整 fallback metadata（title/description/openGraph/twitter），避免空白或過短描述。  
  2. 新增 `buildStockMetaDescription(...)` 與 `buildStockFallbackDescription(...)`，統一 `description`、`openGraph.description`、`twitter.description` 文案來源。  
  3. `getStockData` 改用 `cache(...)` 做 request-level memoization，降低同一請求內 metadata 與頁面重複打 API 的失敗率。  
  4. `app/not-found.js` 新增 metadata，補齊 404 頁的 title/description。  

## 2026-03-18 – Cache Policy Adjustment (Performance)
- **延長前端快取 TTL (Performance)**  
  *Why*: 月份與個股視圖在 5 分鐘內常被重複開啟，依舊會頻繁打到 proxy。  
  *Impact*: 將 in-memory cache TTL 自 5 分鐘延長到 10 分鐘，搭配 StockModal 詳細資料快取後，可顯著降低 `/api/dividends` 與 `/api/stock/:code` 的重複請求；代價是若後端在 10 分鐘內更新資料，使用者需重新整理才能即時看到最新值。

## 2026-03-18 – Accessibility & Feedback Hardening
- **FilterBar 語意補強 (UX/UI)**  
  *Why*: 建議清單缺乏完整的 combobox 語意，螢幕閱讀器無法感知焦點與結果數。  
  *Impact*: 以 `role="combobox"`、`aria-activedescendant`、`aria-live` 等語意描述輸入狀態，並為 Watchlist / High-Yield 控制加入 aria 屬性，讓鍵盤與輔助工具都能安全操作。  
- **StockModal 錯誤提示一致化 (UX/Reliability)**  
  *Why*: axios 錯誤僅寫入 `console.error`，後端 403/500 時使用者看不到回饋。  
  *Impact*: 將資料請求改成可取消的 async 流程並統一導入 `ToastProvider`，即時顯示「無法載入個股資料」等訊息，同時避免 race condition 造成閃爍。

## 2026-03-18 – Modal UX & Error Handling
- **Modal Accessibility Upgrade (UX/UI)**  
  *Why*: 分散式 Modal 缺乏 focus trap、Esc 與 ARIA，鍵盤／螢幕閱讀器體驗受限。  
  *Impact*: `ModalContainer` 統一處理焦點循環與遮罩關閉，Dividend/Stock/Watchlist/Yield 皆採用，確保彈窗可被輔助工具順利操作。
- **Global Toast Provider (UX/Reliability)**  
  *Why*: `alert` / `console.error` 沒有一致提示，錯誤容易被忽略。  
  *Impact*: `ToastProvider` 包在 `app/layout`，Calendar 與 Yield Modal 流程出錯會顯示 toast，提升回饋透明度。

## 2026-03-17 – Calendar Performance & Architecture
- **Client-side Cache + Debounced Search (Performance)**  
  *Why*: 月份切換與股票跳轉頻繁觸發 API，造成延遲與後端壓力。  
  *Impact*: 5 分鐘 TTL 的 in-memory cache（`lib/cache.js`）加上 250 ms debounce，減少重複請求並讓搜尋輸入更順暢。
- **CalendarClient 拆分與 Memoization (Architecture)**  
  *Why*: 巨型 `CalendarClient` 不利維護，URL 同步與 render 成本過高。  
  *Impact*: `useCalendarQueryState`、`FilterBar`、`CalendarGrid` 分離責任；透過 memoization 將日曆 render 降為 O(N)，方便後續擴充。

## 2026-03-16 – Security & Data Accuracy
- **Proxy Layer Hardening (Security)**  
  *Why*: 需要統一的 service token 邊界並防止 proxy 被濫用。  
  *Impact*: `/api/proxy` 只允許 `api/dividends|stocks|stock` 前綴並注入 `X-Service-Token`；`lib/proxy-client.js` 讓前端維持單一出口。
- **Ex-Date Link 修復 (UX/Accuracy)**  
  *Why*: 個股頁的除息日連結指到發放日，誤導使用者。  
  *Impact*: 改成直接帶入 `ex_date` 參數，讓日曆定位正確日期。  
- **Initial Foundations (Infrastructure) [Pending Merge]**  
  完成 App Router 架構、SSR 初始資料與 UI 主題，打底後續優化。

---

## Backlog / Technical Debt

| Priority | Item | Category | Note |
| --- | --- | --- | --- |
| High | 使用 `router.replace` 同步篩選狀態，避免污染瀏覽器歷史 | UX/UI | 月份與篩選目前會 push history，造成返回鍵需要多次點擊 |
| High | 將舊有 axios 呼叫改寫成 `proxyGet` 並共用錯誤處理 | Security | CalendarClient、WatchlistModal 仍繞過 helper，沒有統一 token 驗證與失敗訊息 |
| Medium | 安裝依賴、產生 lockfile、串接 lint/test CI | Infrastructure | 維護版本鎖定並早期攔截回歸問題 |

（後續任何重要決策請依同樣格式補上 Why / Impact，以維護決策脈絡。）
