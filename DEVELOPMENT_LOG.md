# Technical Development Log

## 2026-04-01 – Design Reference Adaptation
- Status: done
- Priority: medium
- Area: UX/UI
- Files:
  - components/CalendarClient.js
  - components/FilterBar.js
  - components/CalendarGrid.js
  - components/SeoContent.js
  - DEVELOPMENT_LOG.md
- Why: 目前首頁資訊完整，但視覺層級、卡片節奏與區塊分層較偏功能導向，和新的設計參考相比，主標、搜尋工作區、月曆區與內容區之間的節奏不夠鮮明。
- Impact: 參考 editorial-style 設計後，首頁改為更清楚的 hero 區塊、微標籤、分層資訊卡與更柔和的卡片式月曆；搜尋與篩選工作區、月份導覽與下方 SEO 區塊同步收斂為較一致的圓角卡片與留白節奏；後續再將 Visible Entries / Watchlist 收進月份卡內並提高搜尋、自選與殖利率下拉面板的層級，避免 hero 容器裁切。現有搜尋、月份切換、篩選、modal 與資料流維持不變。
- Next: 以桌機與手機實機檢查新版首頁的間距、sticky 篩選列、搜尋建議下拉、月曆 hover 狀態與 SEO 區塊閱讀節奏是否符合預期。

## 2026-03-31 – Query History Replace Guard
- Status: done
- Priority: high
- Area: UX/UI
- Files:
  - hooks/useCalendarQueryState.js
  - DEVELOPMENT_LOG.md
- Why: 篩選與月份同步雖已改用 `router.replace`，但 hook 仍缺少外部 URL 變更回灌到本地 state 的同步；同時當推導出的 URL 與目前 URL 相同時也會重複觸發 navigation，影響返回與 history 行為的穩定性。
- Impact: 在 `useCalendarQueryState` 抽出統一的 query state parser，讓 `searchParams` 變化時可把月份與 `yield` 狀態同步回本地 state；同時保留 current URL / next URL guard，只有在 query 真正變動時才執行 `router.replace`。既有月份切換、殖利率篩選、`date` 參數清理與資料載入流程維持不變。
- Next: 以人工操作驗證返回鍵、前進鍵、月份切換、殖利率切換與從個股頁跳回日曆的 URL 同步流程。

## 2026-03-23 – Stock Meta Description Hardening
- Status: done
- Priority: high
- Area: SEO
- Files:
  - app/stock/[id]/page.js
  - app/not-found.js
  - TBD
- Why: 外部 SEO 健檢指出多個個股頁出現 meta description 過短或缺失，且在上游資料暫時失敗時更容易被爬蟲放大。
- Impact: `app/stock/[id]/page.js` 在查無資料時回傳完整 fallback metadata（title、description、openGraph、twitter）；新增 `buildStockMetaDescription(...)` 與 `buildStockFallbackDescription(...)` 統一描述文案來源；`getStockData` 改用 `cache(...)` 做 request-level memoization，降低同一請求內 metadata 與頁面重複打 API 的失敗率；`app/not-found.js` 補上 404 頁 metadata。
- Next: 觀察實際搜尋引擎收錄結果與 metadata 長度是否仍有缺口。

## 2026-03-18 – Cache Policy Adjustment
- Status: done
- Priority: medium
- Area: Performance
- Files:
  - lib/cache.js
  - TBD
- Why: 月份與個股視圖在 5 分鐘內常被重複開啟，依舊會頻繁打到 proxy。
- Impact: 將 in-memory cache TTL 自 5 分鐘延長到 10 分鐘，搭配 StockModal 詳細資料快取後，可顯著降低 `/api/dividends` 與 `/api/stock/:code` 的重複請求；代價是若後端在 10 分鐘內更新資料，使用者需重新整理才能即時看到最新值。
- Next: 觀察資料新鮮度與快取命中率，必要時改為更細緻的失效策略。

## 2026-03-18 – Accessibility and Feedback Hardening
- Status: done
- Priority: high
- Area: UX/UI
- Files:
  - TBD
- Why: 建議清單缺乏完整的 combobox 語意，且 axios 錯誤僅寫入 `console.error`，螢幕閱讀器與一般使用者都缺乏明確回饋。
- Impact: 以 `role="combobox"`、`aria-activedescendant`、`aria-live` 等語意補強 FilterBar，並為 Watchlist / High-Yield 控制加入 aria 屬性；同時將資料請求改成可取消的 async 流程並導入 `ToastProvider`，在 403/500 等失敗情境中提供一致訊息，避免 race condition 造成閃爍。
- Next: 補做鍵盤操作與錯誤提示的驗收檢查，確認所有互動元件行為一致。

## 2026-03-18 – Modal UX and Error Handling
- Status: done
- Priority: high
- Area: UX/UI
- Files:
  - app/layout
  - TBD
- Why: 分散式 Modal 缺乏 focus trap、Esc 與 ARIA，且 `alert` / `console.error` 沒有一致提示，錯誤容易被忽略。
- Impact: `ModalContainer` 統一處理焦點循環與遮罩關閉，Dividend、Stock、Watchlist、Yield 皆採用；`ToastProvider` 包在 `app/layout`，讓 Calendar 與 Yield Modal 流程出錯時能顯示一致 toast。
- Next: 持續收斂彈窗與全域提示元件，避免新流程再出現分散實作。

## 2026-03-17 – Calendar Performance and Architecture
- Status: done
- Priority: high
- Area: Architecture
- Files:
  - lib/cache.js
  - useCalendarQueryState
  - FilterBar
  - CalendarGrid
- Why: 月份切換與股票跳轉頻繁觸發 API，造成延遲與後端壓力；巨型 `CalendarClient` 也不利維護，URL 同步與 render 成本過高。
- Impact: 透過 5 分鐘 TTL 的 in-memory cache 與 250 ms debounce 減少重複請求；並將 `useCalendarQueryState`、`FilterBar`、`CalendarGrid` 分離責任，搭配 memoization 降低日曆 render 成本，方便後續擴充。
- Next: 盤點仍集中在 `CalendarClient` 的責任，持續降低元件耦合。

## 2026-03-16 – Security and Data Accuracy
- Status: done
- Priority: high
- Area: Security
- Files:
  - lib/proxy-client.js
  - TBD
- Why: 需要統一的 service token 邊界並防止 proxy 被濫用，同時修正個股頁除息日連結定位錯誤。
- Impact: `/api/proxy` 僅允許 `api/dividends|stocks|stock` 前綴並注入 `X-Service-Token`，`lib/proxy-client.js` 讓前端維持單一出口；個股頁改為直接帶入 `ex_date` 參數，讓日曆定位正確日期；App Router、SSR 初始資料與 UI 主題也完成基礎打底。
- Next: 補齊 proxy 使用面盤點，確保舊呼叫路徑全部收斂到同一安全邊界。

## 2026-03-24 – Architecture README Consolidation
- Status: done
- Priority: medium
- Area: Documentation
- Files:
  - README.md
  - DEVELOPMENT_LOG.md
- Why: 前後端目前已形成固定的 SSR + proxy + service token 架構，但缺少一份能快速回想請求流、安全邊界與部署方式的 repo 級摘要。
- Impact: 新增 `README.md`，明確記錄首頁與個股頁的 SSR 直連路徑、`/api/proxy` 的轉發角色、`SERVICE_TOKEN` 的伺服器邊界，以及目前 `BACKEND_INTERNAL_URL`、`NEXT_PUBLIC_API_URL`、`API_URL` 的分工，降低後續回看專案時的理解成本。
- Next: 若後續將所有 client 請求完全收斂到 `proxyGet`，同步更新 README 中的資料流與環境變數說明。

## Backlog

### Item 1
- Priority: high
- Status: done
- Category: UX/UI
- Owner: TBD
- Note: 已補上 URL -> state 同步與 `router.replace` guard，避免不必要 navigation 並改善返回 / 前進時的 query state 還原。
- Due: TBD

### Item 2
- Priority: high
- Status: todo
- Category: Security
- Owner: TBD
- Note: 將舊有 axios 呼叫改寫成 `proxyGet` 並共用錯誤處理；`CalendarClient`、`WatchlistModal` 仍繞過 helper，沒有統一 token 驗證與失敗訊息。
- Due: TBD

### Item 3
- Priority: medium
- Status: todo
- Category: Infrastructure
- Owner: TBD
- Note: 安裝依賴、產生 lockfile、串接 lint/test CI，以維護版本鎖定並提早攔截回歸問題。
- Due: TBD



