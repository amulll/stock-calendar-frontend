# UI / Behavior Task Status

## Active Product Roadmap

- The approved cross-repository plan is tracked in `ROADMAP.md`.
- Phase 0 metric/correctness foundation completed on 2026-08-20.
- Phase 1 conversion and portfolio productization completed on 2026-08-20.
- Phase 2 evergreen SEO acquisition and Phase 3 historical fill research completed on 2026-08-20.
- Remaining work is deployment validation: frontend runtime checks and production fill-sample distribution review.

## Current State
- This task file now reflects the actual repo state instead of the original planning draft.
- Significant frontend work has already been completed:
  - query/history synchronization hardening
  - homepage visual redesign and responsive cleanup
  - calendar density tuning and missing-yield `--` fallback
  - stock metadata hardening
- The main remaining work is no longer homepage visual polish. It is accessibility, modal/request stability, and a few deferred architecture chores.

## Completed

### Done
- `hooks/useCalendarQueryState.js`
  - URL -> state synchronization and `router.replace` guard are complete.
- `components/CalendarClient.js`
  - Homepage hero, current view card, responsive month layout, and mobile-first calendar emphasis are complete.
- `components/FilterBar.js`
  - Visual refresh, search suggestion styling, dropdown layering fixes, and popover/dialog semantics cleanup are complete.
- `components/CalendarGrid.js`
  - Calendar visual redesign, density tuning, missing-yield fallback display, and keyboard-focusable day cell activation are complete.
- `components/SeoContent.js`
  - Lower-page content blocks are visually aligned with the homepage redesign.
- `app/stock/[id]/page.js`
  - Stock metadata fallback and request-level memoization are complete.
- `app/not-found.js`
  - 404 metadata is complete.
- `components/YieldListModal.js`
  - Stale-request protection via request version guarding is complete.
- `components/ModalContainer.js`
  - Body scroll lock with cleanup is complete.
- `components/ToastProvider.js`
  - Accessible live-region semantics and timer lifecycle cleanup are complete.
- `components/CalendarClient.js`
  - Direct proxy requests now use the shared `proxyGet` helper instead of local axios paths.
- `components/FilterBar.js`, `components/ToastProvider.js`, `components/CalendarGrid.js`
  - Small UI/UX polish pass is complete: responsive popover widths, safer mobile toast placement, and cleaner calendar keyboard semantics.
- `components/CalendarClient.js`, `components/FilterBar.js`, `components/CalendarGrid.js`, `components/SeoContent.js`
  - Professional minimal visual polish is complete: reduced decoration, tighter card language, lighter shadows, smaller radii, and more scan-friendly hierarchy.
- `components/ModalContainer.js`
  - Nested modal scroll-lock handling is complete: body scroll is restored only after the last open modal closes.
- `app/stock/[id]/page.js`
  - Professional minimal visual polish is complete: stock detail page now aligns with the homepage utility-style card language.
- `app/disclaimer/page.js`, `app/knowledge/page.js`, `app/privacy/page.js`
  - Static informational pages now follow the same professional minimal card, border, and typography language.
- `app/stock/[id]/page.js`, `components/DividendCalculator.js`, `components/DividendChart.js`
  - Stock detail page compact visual pass is complete: mobile spacing, header contrast, calculator styling, and chart height now better support dense stock-information scanning.
- `UI_DESIGN_GUIDE.md`
  - Reference-driven UI direction is documented for future visual work.
- `components/CalendarClient.js`, `components/FilterBar.js`, `components/CalendarGrid.js`
  - Homepage dashboard pass phases 1-2 are complete: the first viewport now behaves more like a financial data workspace, FilterBar is closer to a compact toolbar, and calendar cells use denser ticker-row styling.
- `app/stock/[id]/page.js`, `components/DividendCalculator.js`, `components/DividendChart.js`
  - Stock detail report-style pass is complete: stock pages now use the same reference-driven financial report language, with a quieter header, compact key metrics, denser latest-dividend panel, calculator/chart report cards, and cleaner history table framing.
- `components/StockModal.js`, `components/DividendModal.js`, `components/WatchlistModal.js`, `components/YieldListModal.js`
  - Modal data-utility visual alignment is complete: modal headers, list rows, ticker chips, metric panels, and ranking rows now use the same lower-decoration financial tool language.
- `app/stock/[id]/page.js`, `components/DividendCalculator.js`, `components/DividendChart.js`, `UI_DESIGN_GUIDE.md`
  - Dividend Report Card polish is complete: stock detail pages now have a thin identity strip, three-metric summary, ex-date to pay-date timeline, subtle calculator/chart accents, and stronger data-table hierarchy.
- `app/stock/[id]/page.js`, `UI_DESIGN_GUIDE.md`
  - Stock history table color refinement is complete: table colors now use a neutral/navy financial data palette instead of broad emerald emphasis.
- `app/stock/[id]/page.js`, `UI_DESIGN_GUIDE.md`
  - Stock history table Primer-style palette is complete: table colors are reduced to GitHub-like white, slate subtle backgrounds, slate borders, muted text, and blue links.
- `app/stock/[id]/page.js`, `components/DividendCalculator.js`, `components/DividendChart.js`, `UI_DESIGN_GUIDE.md`
  - Stock detail page Primer-style unification is complete: stock detail colors are reduced to white/slate surfaces with blue reserved for links, focus, and selected controls.
- `components/CalendarClient.js`
  - Homepage month navigation is now placed directly above the calendar grid, with the active filter summary and visible entry count in the same calendar toolbar.
- `components/CalendarClient.js`, `components/CalendarSummary.js`, `components/UpcomingFocus.js`, `components/Loading.js`
  - P0 trust and activation pass is complete: API-backed freshness is visible, homepage copy is outcome-led, mobile view preference is persisted without hydration-unsafe initialization, and month changes use localized dachshund loading instead of a full-screen blocker; the `cm` measurement is removed while the brand animation remains.
- `lib/analytics.js`, `components/PortfolioModal.js`, `lib/calendarSubscribe.js`
  - Privacy-limited GA4 product events are complete for sample activation, search, watchlist addition, portfolio use, subscription, backup, sharing, and stock-detail opening; no stock codes, holdings, costs, or calculated amounts are sent.
- `components/ModalContainer.js`, modal components, `components/CalendarGrid.js`, `components/FilterBar.js`, `app/layout.js`
  - P0 accessibility pass is complete: dialogs have programmatic names, primary touch targets are enlarged, missing button types and icon labels are filled, and a skip link reaches the main content.
- `components/CalendarClient.js`, `components/AgendaList.js`
  - P1 calendar navigation is complete: non-current months offer a return-to-today control, and the mobile Agenda view locates today or the next current-month date with data without hiding past entries.
- `components/CalendarSubscribeGuide.js`, `components/WatchlistModal.js`, `components/PortfolioModal.js`, `lib/calendarSubscribe.js`
  - P1 subscription guidance is complete: both ICS entry points share a dismissible Google/Apple setup guide while preserving the clipboard fallback.
- `components/PortfolioModal.js`
  - P1 data-retention and chart accessibility work is complete: eligible customized portfolios receive a one-time backup reminder, and monthly cash flow has a screen-reader summary plus a semantic 12-month table.
- `components/SeoContent.js`, `app/knowledge/page.js`, `app/layout.js`, `app/page.js`
  - Approved P2 homepage content work is complete: the workspace remains primary, the previous long SEO article is now a concise task summary with knowledge-page links, and metadata uses neutral product descriptions.
- `app/disclaimer/page.js`, `app/privacy/page.js`, `app/screener/page.js`, `components/screener/ScreenerClient.js`
  - Approved P2 brand-language work is complete: decorative English labels are localized and endorsement-style screener wording is replaced with condition-based labels while emoji, uGoodly Cat, and the existing financial visual direction remain.
- `components/FilterBar.js`
  - Mobile watchlist menu positioning is complete: the panel is centered with a dismissible backdrop and touch-sized controls, while desktop keeps its anchored popover.
- `components/CalendarClient.js`, `components/CalendarSummary.js`, `components/FilterBar.js`
  - Compact homepage and responsive ad placement are complete: duplicate summary metrics are consolidated into the calendar toolbar, calendar subscription is a first-level action, the unchanged 1280px main content gains an external 300×250 ad rail only at 1920px and wider, and narrower layouts place the horizontal placeholder after the calendar.
- `components/AgendaList.js`
  - Mobile agenda date groups now start collapsed and expose one stock list at a time through touch-sized, keyboard-operable disclosure buttons without changing current-date auto-positioning.

## Remaining Work

### Deferred
- Repo-wide UI surfaces
  - Status: deferred
  - Task: perform a final visual consistency pass after manual review on deployed desktop and mobile views.
  - Why: homepage, stock detail pages, and modal surfaces are aligned; remaining issues should be based on rendered screenshots rather than further broad class edits.
- `components/CalendarClient.js`
  - Status: deferred
  - Task: reassess whether responsibility should be split further.
  - Why: the component is still heavy, but this is not the highest-risk issue right now.

## Non-UI Backlog

### Security / Request Flow
- `components/CalendarClient.js`
- `components/WatchlistModal.js`
  - Status: done
  - Task: consolidate old client-side proxy requests behind shared helper behavior.
  - Why: `CalendarClient` now uses `proxyGet`; `WatchlistModal` no longer has direct request logic to consolidate.

### Infrastructure
- Repo-wide
  - Status: todo
  - Task: add dependency lockfile discipline and wire up lint/test CI.
  - Why: verification still depends too much on manual checking.

## Recommended Next Order
1. dependency lockfile discipline and lint/test CI

## Verification Focus
- Regression against existing month navigation, search suggestions, and stock modal opening
- Validate GA4 events with DebugView while confirming analytics blocking never breaks product actions.
- Validate 375px and 768px layouts, keyboard-only modal flows, stored view preference, localStorage failure fallback, and reduced-motion loading.
- Validate P1 Agenda auto-positioning, clipboard fallback and subscription guide dismissal, one-time backup reminder behavior, and cash-flow output with a screen reader.
