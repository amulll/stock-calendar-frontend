# UI / Behavior Task Status

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
