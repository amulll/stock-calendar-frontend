# Technical Development Log

## 2026-07-17 – Collapsible Mobile Agenda Dates

- Status: done
- Priority: high
- Area: UX/UI, Mobile, Accessibility
- Files:

  - components/AgendaList.js
  - DEVELOPMENT_LOG.md
  - task.md
  - ../ugoodly_ux_optimization_execution.md
- Why: Mobile agenda dates rendered every stock row at once, making data-heavy months unnecessarily long and difficult to scan.
- Impact: Agenda view now starts with compact date summaries and allows one date at a time to expand. Date headers retain the existing current-date auto-positioning, expose accessible disclosure state, and provide touch-sized keyboard-operable controls.
- Next: Run lint and production build in a Node-enabled environment, then verify expansion, month changes, filters, keyboard operation, and current-date positioning at 375px and 768px.


## 2026-07-17 – Compact Homepage and External Ad Rail

- Status: done
- Priority: high
- Area: UX/UI, Responsive Layout, Discoverability
- Files:

  - components/CalendarClient.js
  - components/CalendarSummary.js
  - components/FilterBar.js
  - DEVELOPMENT_LOG.md
  - task.md
  - ../ugoodly_ux_optimization_execution.md
- Why: The stacked workspace, upcoming strip, and centered ad delayed the calendar, while calendar subscription was difficult to discover inside the watchlist flow.
- Impact: The homepage workspace is more compact, duplicate month/count cards are removed, calendar subscription is available from the first-level toolbar, and the ad placeholder no longer interrupts the primary flow. At 1920px and wider, a fixed 300×250 placeholder uses the unused space outside the unchanged centered 1280px main content; narrower layouts show the 728×90 placeholder after the calendar.
- Next: Run lint and production build in a Node-enabled environment, then verify 375px, 768px, 1440px, and 1920px layouts plus clipboard and keyboard flows.


## 2026-07-17 – Center Mobile Watchlist Menu

- Status: done
- Priority: high
- Area: UX/UI, Mobile, Accessibility
- Files:

  - components/FilterBar.js
  - DEVELOPMENT_LOG.md
  - task.md
- Why: The watchlist filter menu was anchored to the right-aligned toolbar button on mobile, placing the panel off-center and making the interaction feel visually unbalanced.
- Impact: On small screens, the watchlist menu now opens in the center of the viewport with a subdued backdrop, an explicit close control, safe viewport bounds, and 44px filter/action targets. Desktop retains the existing button-anchored popover behavior.
- Next: Verify at 375px, mobile landscape, and the 640px breakpoint in a browser-enabled environment.


## 2026-07-16 – Workspace-First Homepage Content

- Status: done
- Priority: high
- Area: UX/UI, Content, SEO
- Files:

  - app/disclaimer/page.js
  - app/knowledge/page.js
  - app/layout.js
  - app/page.js
  - app/privacy/page.js
  - app/screener/page.js
  - components/AdUnit.js
  - components/SeoContent.js
  - components/screener/ScreenerClient.js
  - DEVELOPMENT_LOG.md
  - task.md
- Why: The homepage should prioritize recurring calendar and portfolio tasks while keeping detailed educational content reachable, and product language should describe data conditions without implying endorsement.
- Impact: The long homepage SEO article is replaced by a compact task summary, topic links to the existing knowledge page, and a short data/estimate note. Decorative English labels are localized, and endorsement-style wording in metadata and screener presets is replaced with neutral condition-based language. Existing visual direction, emoji, uGoodly Cat, ad placement, routes, and data behavior are unchanged.
- Next: Validate the homepage summary and knowledge anchor navigation at 375px and desktop widths, then monitor search performance after deployment.


## 2026-07-15 – Brand Dachshund Loading Restoration

- Status: done
- Priority: high
- Area: UX/UI, Brand, Accessibility
- Files:

  - components/Loading.js
  - components/Loading.module.css
  - DEVELOPMENT_LOG.md
  - task.md
- Why: The dachshund loading animation is a deliberate product highlight and should remain part of uGoodly's brand experience.
- Impact: Full-page and localized loading states again show the dachshund, without the previous `cm` measurement text. Compact contexts use a scaled version, and reduced-motion users receive a static dog.
- Next: Verify the full and compact variants visually in a Node-enabled browser environment.


## 2026-07-15 – P1 Calendar Utility and Retention UX

- Status: done
- Priority: high
- Area: UX/UI, Accessibility
- Files:

  - components/AgendaList.js
  - components/CalendarClient.js
  - components/CalendarSubscribeGuide.js
  - components/PortfolioModal.js
  - components/WatchlistModal.js
  - lib/calendarSubscribe.js
  - task.md
  - DEVELOPMENT_LOG.md
- Why: Users needed faster access to current events, clearer calendar-subscription steps, a timely local-data backup reminder, and a non-visual equivalent for the monthly cash-flow chart.
- Impact: Non-current months now offer a return-to-today action; mobile Agenda view locates the next relevant current-month date; both subscription entry points show the same dismissible Google/Apple guide; customized portfolios can show a one-time backup reminder; and the cash-flow chart exposes an accessible summary and 12-month table. APIs, routes, ad placement, and P2 discussion items are unchanged.
- Next: Run lint and production build in a Node-enabled environment, then verify 375px/768px layouts, keyboard and screen-reader flows, reduced motion, clipboard fallback, and unavailable localStorage behavior.


## 2026-06-11 – Calendar Month Controls Relocation
- Status: done
- Priority: medium
- Area: UX/UI
- Files:
  - components/CalendarClient.js
  - task.md
  - DEVELOPMENT_LOG.md
- Why: The homepage month switcher lived in the top workspace panel, which separated the control from the calendar grid it affects.
- Impact: Month navigation now sits directly above the calendar grid in a compact calendar toolbar, with visible entry count and active filter summary nearby. Query state, router behavior, data fetching, modal behavior, and API contracts are unchanged.
- Next: Manually review desktop and mobile homepage to confirm month switching feels more direct and the calendar remains prominent.


## 2026-06-11 – Stock Detail Primer Style Unification
- Status: done
- Priority: high
- Area: UX/UI
- Files:
  - app/stock/[id]/page.js
  - components/DividendCalculator.js
  - components/DividendChart.js
  - UI_DESIGN_GUIDE.md
  - task.md
  - DEVELOPMENT_LOG.md
- Why: The stock detail page still combined too many visual color systems across the summary, dividend panel, calculator, chart, and table. The requested direction was to use GitHub-like design as the template.
- Impact: Stock detail page colors are now unified around white canvas, slate subtle surfaces, slate borders, muted text, and blue reserved for links, focus states, and selected controls. Broad emerald/amber surfaces and decorative gradient/accent treatments were removed from the stock detail page. API calls, metadata, JSON-LD, calculator math, chart data processing, and date links are unchanged.
- Next: Manually review /stock/00929 and /stock/2330 to confirm the page now feels unified and Primer-like without losing financial readability.


## 2026-06-10 – Primer Style Table Palette
- Status: done
- Priority: medium
- Area: UX/UI
- Files:
  - app/stock/[id]/page.js
  - UI_DESIGN_GUIDE.md
  - task.md
  - DEVELOPMENT_LOG.md
- Why: The previous stock history table still had too many color elements, including navy, warm tint, green emphasis, amber badges, and blue links in the same surface.
- Impact: The history table now follows a GitHub Primer-like palette with white canvas, slate subtle headers and group cells, slate borders, muted text, and blue reserved for links. Table grouping, row spans, date links, API calls, metadata, and JSON-LD are unchanged.
- Next: Manually review /stock/00929 and /stock/2330 to confirm the table now feels calmer and more GitHub-like.


## 2026-06-10 – Stock History Table Palette Refinement
- Status: done
- Priority: medium
- Area: UX/UI
- Files:
  - app/stock/[id]/page.js
  - UI_DESIGN_GUIDE.md
  - task.md
  - DEVELOPMENT_LOG.md
- Why: The stock history table palette overused emerald and felt visually noisy compared with higher-quality financial data interfaces.
- Impact: The history table now uses a neutral/navy financial data palette: dark header, warm white section framing, neutral numeric cells, muted amber yield chips, and reduced green emphasis. Data rendering, links, API calls, metadata, JSON-LD, and table grouping logic are unchanged.
- Next: Manually review /stock/00929 and /stock/2330 to confirm the table feels more premium and remains readable on mobile.


## 2026-06-10 – Dividend Report Card Polish
- Status: done
- Priority: medium
- Area: UX/UI
- Files:
  - app/stock/[id]/page.js
  - components/DividendCalculator.js
  - components/DividendChart.js
  - UI_DESIGN_GUIDE.md
  - task.md
  - DEVELOPMENT_LOG.md
- Why: The stock detail page was well categorized but still felt visually pale, with limited identity and weak date-sequence storytelling for dividend events.
- Impact: Stock detail pages now use a thin report identity strip, a three-metric summary for price/dividend/yield, an ex-date to pay-date timeline, subtle calculator/chart module accents, and stronger history table hierarchy. API calls, metadata, JSON-LD, calculator math, chart processing, and date links are unchanged.
- Next: Manually review /stock/00929 and one non-ETF stock on desktop and mobile to confirm the added identity improves clarity without becoming decorative.


## 2026-06-01 – Modal Data Utility Visual Alignment
- Status: done
- Priority: medium
- Area: UX/UI
- Files:
  - components/StockModal.js
  - components/DividendModal.js
  - components/WatchlistModal.js
  - components/YieldListModal.js
  - task.md
  - DEVELOPMENT_LOG.md
- Why: Modal surfaces still used heavier gradients, shadows, rounded cards, and list styling that no longer matched the homepage dashboard and stock report visual direction.
- Impact: Stock, dividend-date, watchlist, and high-yield modals now use quieter data-utility styling: white headers, thin borders, lower-radius panels, ticker-like rows, restrained metric cards, and reduced decorative color. Modal props, fetch behavior, sorting, watchlist actions, date navigation, calendar export actions, and scroll-lock behavior are unchanged.
- Next: Manually review each modal on desktop and mobile, especially nested stock-to-date modal navigation and high-yield sorting.


## 2026-06-01 – Stock Detail Report Visual Direction
- Status: done
- Priority: high
- Area: UX/UI
- Files:
  - app/stock/[id]/page.js
  - components/DividendCalculator.js
  - components/DividendChart.js
  - task.md
  - DEVELOPMENT_LOG.md
- Why: The stock detail page still carried a generic AI-styled visual language, including a dark decorative header, isolated card stack, stronger shadows, and uneven density compared with the new homepage dashboard direction.
- Impact: Stock detail pages now use a calmer financial report layout with a white ticker header, compact key metrics, a denser latest-dividend panel, report-style calculator/chart cards, and cleaner history table framing. Metadata, JSON-LD, API calls, calculator math, chart data processing, and calendar back-links are unchanged.
- Next: Manually review /stock/00929 on desktop and mobile, then align modal surfaces with the same data-utility language in a later pass.


## 2026-06-01 – Homepage Dashboard Visual Direction
- Status: done
- Priority: high
- Area: UX/UI
- Files:
  - UI_DESIGN_GUIDE.md
  - components/CalendarClient.js
  - components/FilterBar.js
  - components/CalendarGrid.js
  - task.md
  - DEVELOPMENT_LOG.md
- Why: The homepage still read like a generic AI-generated landing layout, with excessive hero language, decorative labels, rounded cards, shadows, and inconsistent financial-tool hierarchy.
- Impact: Added a reference-driven UI guide and converted the homepage first viewport into a compact financial dashboard workspace. Search, month navigation, filter state, entries, watchlist count, and calendar cells now use denser data-utility styling. API calls, query state, router behavior, modal flow, and data contracts are unchanged.
- Next: Manually review desktop and mobile homepage layouts, then apply the same reference-driven report language to stock detail and modal surfaces in a later pass.


## 2026-05-28 – Stock Page Compact Visual Pass
- Status: done
- Priority: medium
- Area: UX/UI
- Files:
  - app/stock/[id]/page.js
  - components/DividendCalculator.js
  - components/DividendChart.js
  - task.md
  - DEVELOPMENT_LOG.md
- Why: The stock detail page still felt too white and vertically long on mobile because the header, calculator, chart, and dividend panels had similar visual weight and generous spacing.
- Impact: The stock detail page now has a darker financial-tool header, tighter mobile spacing, more compact metric panels, a calculator aligned to the slate/emerald visual language, and a shorter mobile chart area. API requests, metadata, JSON-LD, links, calculator math, chart data processing, and route behavior are unchanged.
- Next: Manually review /stock/00929 on mobile and desktop to confirm the page feels denser without losing readability.


## 2026-05-28 – Static Pages Visual Alignment
- Status: done
- Priority: medium
- Area: UX/UI
- Files:
  - app/disclaimer/page.js
  - app/knowledge/page.js
  - app/privacy/page.js
  - task.md
  - DEVELOPMENT_LOG.md
- Why: The legal, privacy, and knowledge pages still used slightly softer standalone card styling and did not fully match the homepage and stock page's professional minimal utility style.
- Impact: Static informational pages now use consistent white surfaces, thin slate borders, restrained shadows, smaller heading scale, and tighter card language. Metadata, structured data, links, and page content are unchanged.
- Next: Manually review `/disclaimer`, `/privacy`, and `/knowledge` on mobile and desktop to confirm readability and spacing.

## 2026-05-28 – Stock Page Visual Alignment
- Status: done
- Priority: medium
- Area: UX/UI
- Files:
  - app/stock/[id]/page.js
  - task.md
  - DEVELOPMENT_LOG.md
- Why: The stock detail page still used a heavier blue gradient header and larger rounded cards, which no longer matched the homepage's more professional minimal financial-tool direction.
- Impact: The stock detail page now uses a calmer white header, thinner borders, lighter metric cards, smaller radii, tighter content spacing, and a more consistent history table container. Metadata, API requests, JSON-LD, links back to the calendar, chart/calculator wiring, and data contracts are unchanged.
- Next: Manually compare `/stock/2330` and `/stock/0050` on desktop and mobile to confirm the page still feels clear and sufficiently branded.

## 2026-05-28 – Nested Modal Scroll Lock Fix
- Status: done
- Priority: high
- Area: UX/UI
- Files:
  - components/ModalContainer.js
  - task.md
  - DEVELOPMENT_LOG.md
- Why: Opening a dividend-date modal from inside the stock modal could leave `document.body.style.overflow` stuck at `hidden`, because each modal instance restored body scroll independently and one modal could capture `hidden` as its previous state.
- Impact: `ModalContainer` now uses a shared open-modal counter. Body scroll is locked once when the first modal opens and restored only after the final modal closes, so switching from `StockModal` to `DividendModal` no longer leaves the page unscrollable. API paths, router behavior, data flow, and modal props are unchanged.
- Next: Manually verify stock history date clicks for older months, then close the resulting modal and confirm page scrolling is restored.

## 2026-05-28 – Professional Minimal Visual Polish
- Status: done
- Priority: medium
- Area: UX/UI
- Files:
  - components/CalendarClient.js
  - components/FilterBar.js
  - components/CalendarGrid.js
  - components/SeoContent.js
  - task.md
  - DEVELOPMENT_LOG.md
- Why: The homepage still had a landing-page-like visual weight: large hero type, decorative background elements, oversized radii, and heavy shadows that made the financial utility feel less focused than the underlying data workflow.
- Impact: The homepage, filter controls, calendar grid, and SEO content now use a more restrained finance-tool visual language: white surfaces, thinner borders, lighter shadows, smaller radii, tighter section spacing, and calmer labels. Existing API paths, query state, modal behavior, data flow, and dependencies are unchanged.
- Next: Manually compare desktop and mobile screenshots to confirm the interface still feels sufficiently branded while improving scan speed and professionalism.

## 2026-05-28 – Frontend UX Polish Pass
- Status: done
- Priority: medium
- Area: UX/UI
- Files:
  - components/FilterBar.js
  - components/CalendarGrid.js
  - components/ToastProvider.js
  - task.md
  - DEVELOPMENT_LOG.md
- Why: A focused skill-based review found a few remaining small interaction risks: filter popovers could feel cramped on narrow screens, the toast container could overflow on mobile because it combined `w-full` with right offset positioning, and calendar date activation still depended on an outer interactive wrapper around stock buttons.
- Impact: Filter popovers now use viewport-constrained widths and the search clear control uses a proper icon button. Toast placement now uses inset mobile positioning with pointer-event isolation. Calendar date keyboard activation now lives on the visible date button instead of making the whole day cell a nested interactive region. API paths, router behavior, data contracts, modal flow, and dependencies are unchanged.
- Next: Manually verify mobile filter popovers, toast placement, and keyboard activation for dividend dates in a browser.

## 2026-04-20 – Proxy Helper Consolidation
- Status: done
- Priority: medium
- Area: Request Flow
- Files:
  - components/CalendarClient.js
  - task.md
  - DEVELOPMENT_LOG.md
- Why: CalendarClient still used local axios proxy calls even though the repo already had a shared proxyGet helper, which left client-side proxy usage inconsistent and kept error/token handling split across patterns.
- Impact: CalendarClient now routes dividend and latest-stock proxy requests through lib/proxy-client.js, reusing the shared proxy path builder and fetch behavior without changing routes, props, cache behavior, or modal flow. task.md now reflects that the helper-consolidation backlog item is complete and that WatchlistModal has no direct request path left to normalize.
- Next: If request flow cleanup continues, evaluate whether StockModal should also migrate off local axios usage without changing its public API.

## 2026-04-20 – Toast Accessibility And Timer Cleanup
- Status: done
- Priority: medium
- Area: UX/UI
- Files:
  - components/ToastProvider.js
  - task.md
  - DEVELOPMENT_LOG.md
- Why: 雖然畫面上已有 toast 提示，但目前缺少清楚的 assistive live-region 語意，且 timeout 沒有集中管理，元件卸載時可能殘留未清理的 timer。
- Impact: `ToastProvider` 現在為 toast 容器補上 `aria-live`，並依 variant 對單筆 toast 使用 `role="status"` 或 `role="alert"`；同時將 timeout 集中到 `Map` 管理，在 toast 移除與 provider 卸載時一併清理。外觀與 `addToast` 使用方式維持不變。`task.md` 也同步將此項標記為完成，剩餘主要 backlog 集中在 request/helper consolidation 與 deferred 的 `CalendarClient` 責任拆分。
- Next: 若後續要進一步補強，可在實機驗證錯誤 toast 與成功 toast 的讀屏行為，並評估是否需要手動關閉按鈕或更細緻的優先級管理。

## 2026-04-20 – Modal Body Scroll Lock
- Status: done
- Priority: medium
- Area: UX/UI
- Files:
  - components/ModalContainer.js
  - task.md
  - DEVELOPMENT_LOG.md
- Why: modal 開啟時背景仍可滾動，尤其在手機或窄視窗下會讓使用者誤滑到底層頁面，造成關閉後位置感混亂。
- Impact: 在共用 `ModalContainer` 加入 body scroll lock 與 cleanup。modal 開啟時會暫存既有 `body` style，鎖住背景捲動，並在有 scrollbar 時補上 `padding-right` 避免畫面跳動；關閉時完整還原。既有 focus trap、Esc 關閉與 modal 內容結構維持不變。`task.md` 也同步將此項標記為完成，並把下一個優先項目推進到 `ToastProvider` live-region cleanup。
- Next: 實機驗證各 modal 在桌機與手機寬度下開啟時背景不再滾動，且關閉後頁面位置與焦點恢復正常，再處理 `ToastProvider` 的 assistive feedback 補強。

## 2026-04-20 – Yield Modal Stale Request Guard
- Status: done
- Priority: high
- Area: UX/UI
- Files:
  - components/YieldListModal.js
  - task.md
  - DEVELOPMENT_LOG.md
- Why: `YieldListModal` 在快速切換 threshold、關閉後立即重開時，舊請求有機會晚於新請求返回，覆蓋最新狀態，造成列表與目前門檻不一致。
- Impact: 以 request version guard 保護 `YieldListModal` 的請求結果。當 modal 關閉或新的 threshold 請求發出時，舊請求即使晚回來也不再覆蓋 `dividends`、`error` 或 `loading`；UI、API 介面與排序行為維持不變。`task.md` 也同步將此項標記為完成，並把下一個優先項目推進到 `ModalContainer` scroll lock。
- Next: 實機驗證快速切換殖利率門檻、關閉再重開 modal、以及錯誤情境下的 loading / error / empty state 是否仍正常，再處理 `ModalContainer` 的背景 scroll lock。

## 2026-04-20 – Filter Popover Semantics Cleanup
- Status: done
- Priority: high
- Area: UX/UI
- Files:
  - components/FilterBar.js
  - task.md
  - DEVELOPMENT_LOG.md
- Why: `FilterBar` 的自選與殖利率面板原本使用 `role="menu"` / `menuitem`，但實際內容是 toggle、slider 與一般操作按鈕，語意模型不準確，也不利於後續鍵盤與焦點驗證。
- Impact: 將兩個面板改為較符合目前內容的 non-modal dialog/popover 語意，觸發按鈕改用 `aria-haspopup="dialog"`，面板本體改為 `role="dialog"` 並加上 `aria-labelledby`；同時補上 `Escape` 關閉面板，但不改既有外觀、篩選邏輯或資料流。`task.md` 也同步將此項標記為完成，並把下一個優先項目推進到 `YieldListModal` stale-request guard。
- Next: 以實機驗證自選/殖利率面板的開關、Escape 關閉、滑鼠點外關閉，以及 slider / toggle / action button 在新語意下的行為是否正常，再處理 `YieldListModal` 的非同步保護。

## 2026-04-20 – Calendar Grid Keyboard Access
- Status: done
- Priority: high
- Area: UX/UI
- Files:
  - components/CalendarGrid.js
  - task.md
  - DEVELOPMENT_LOG.md
- Why: `task.md` 的第一個未完成項目是日曆日期格的鍵盤可操作性；目前日期格只能滑鼠點擊，鍵盤使用者無法可靠地開啟當日股利清單。
- Impact: `CalendarGrid` 的有資料日期格現在可透過 `Tab` 聚焦，並以 `Enter` / `Space` 開啟當日明細；同時保留格內個股按鈕的既有點擊行為，不引入巢狀 button 問題。`task.md` 也同步將此項標記為完成，並把下一個優先項目推進到 `FilterBar` semantics cleanup。
- Next: 以鍵盤實際驗證日期格焦點樣式、`Enter` / `Space` 啟動、以及格內股票按鈕不受影響後，再處理 `FilterBar` 的語意模型修正。

## 2026-04-17 – Task And Log Sync
- Status: done
- Priority: medium
- Area: Documentation
- Files:
  - task.md
  - DEVELOPMENT_LOG.md
- Why: `task.md` 已落後於實際進度，仍停留在早期 tranche 規劃，容易和目前已完成的首頁 UI、query/history 與 metadata 調整產生認知落差。
- Impact: 將 `task.md` 重寫為現況版 backlog，明確區分已完成項目、仍待處理的 accessibility / modal / toast / request-flow 工作，以及延後處理的 `CalendarClient` 責任拆分；同時保留 `DEVELOPMENT_LOG.md` 作為已完成工作時間線。
- Next: 後續若再完成 `CalendarGrid` accessibility、`FilterBar` semantics 或 modal/request 穩定性修正，應同步更新 `task.md` 與對應的 development log 條目。

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
- Impact: 參考 editorial-style 設計後，首頁改為更清楚的 hero 區塊、微標籤、分層資訊卡與更柔和的卡片式月曆；搜尋與篩選工作區、月份導覽與下方 SEO 區塊同步收斂為較一致的圓角卡片與留白節奏；後續再將 Visible Entries / Watchlist 收進月份卡內並提高搜尋、自選與殖利率下拉面板的層級，避免 hero 容器裁切；之後再把月份卡在桌機與手機寬度下收斂為不換行版本，並在手機隱藏日曆前的次要摘要卡，讓月曆更快成為首屏主體。手機版 `Current View` 上半部再改為兩欄配置，讓月份資訊獨占首列，避免與 `Entries` 重疊；日曆每日格子的內距、個股列 padding 與代號/殖利率間距也同步收斂，讓每列能露出更多股票資訊；同時當日曆格子內沒有可用殖利率時，前端以 `--` 顯示，避免看起來像資料漏掉。現有搜尋、月份切換、篩選、modal 與資料流維持不變。
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

## 2026-07-14 – Activation and Retention UX
- Status: done
- Priority: high
- Area: Frontend UX
- Files:
  - app/layout.js
  - components/CalendarClient.js
  - components/CalendarSummary.js
  - components/FilterBar.js
  - components/PortfolioModal.js
  - components/WatchlistModal.js
  - hooks/useWatchlist.js
  - lib/calendarSubscribe.js
  - DEVELOPMENT_LOG.md
- Why: 降低新使用者建立自選股的門檻、改善手機日曆可讀性，並把行事曆訂閱與本機資料備份提升為容易找到的留存入口。
- Impact: 修正 OG 圖片尺寸；手機掛載後預設使用清單視圖；空狀態可一鍵加入三檔範例；搜尋建議可直接切換自選；ICS 訂閱共用同一行為；自選股、持股數與成本可用版本化 JSON 匯出及覆蓋匯入。
- Next: T6 已另案完成；目前環境無 Node/npm，需在可用環境補跑 lint、production build 與瀏覽器互動驗證。

## 2026-07-14 – Share Card QR Code
- Status: done
- Priority: medium
- Area: Frontend Sharing
- Files:
  - package.json
  - lib/shareCard.js
  - DEVELOPMENT_LOG.md
- Why: 分享成績單原本只有純文字網址，轉貼到社群後缺少可直接回站的入口。
- Impact: 新增 `qrcode` 1.5.4；分享卡會先產生並載入指向 uGoodly 首頁的 QR code，再繪製完整 Canvas，讓 Web Share 與下載 PNG 都包含相同的可掃描入口。
- Next: 在具備 Node/npm 的環境安裝依賴並執行 lint、production build；實際產生 PNG 後以手機掃描 QR，並驗證 Web Share 與桌機下載結果。

## 2026-07-15 – P0 Trust, Activation, and Accessibility
- Status: done
- Priority: high
- Area: Frontend UX
- Files:
  - app/layout.js
  - components/AdUnit.js
  - components/AgendaList.js
  - components/CalendarClient.js
  - components/CalendarGrid.js
  - components/CalendarSummary.js
  - components/DividendCalculator.js
  - components/DividendChart.js
  - components/DividendModal.js
  - components/FilterBar.js
  - components/Loading.js
  - components/Loading.module.css
  - components/ModalContainer.js
  - components/PortfolioModal.js
  - components/SeoContent.js
  - components/StockModal.js
  - components/UpcomingFocus.js
  - components/WatchlistModal.js
  - components/YieldListModal.js
  - lib/analytics.js
  - lib/calendarSubscribe.js
  - lib/shareCard.js
  - task.md
  - DEVELOPMENT_LOG.md
- Why: 首頁更新時間、啟用文案、手機初始視圖、觸控尺寸、Dialog 命名與全頁 loading 仍會影響資料可信度、首次啟用與無障礙體驗，且 GA4 缺少產品漏斗事件。
- Impact: 更新資訊改用 API 時間並修正排程文案；首頁改為結果導向 CTA；新增不含投資組合敏感值的 GA4 事件；保存 grid/list 偏好並以 SSR 安全 placeholder 避免手機閃動；Modal、skip link 與主要觸控目標完成可及性補強；月份更新改為保留內容的局部 loading，保留品牌臘腸狗並移除 cm 動畫文字。
- Next: 目前環境沒有 Node/npm；合併前須在可用環境執行 lint、production build、GA DebugView，以及 375px、768px、鍵盤與 reduced-motion 瀏覽器驗證。

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

