# uGoodly Product Roadmap

This is the cross-repository product execution roadmap. Backend-specific implementation status is mirrored in `../stock-calendar-backend/ROADMAP.md`. Update both files when a phase changes backend contracts or behavior.

Status values: `TODO`, `IN PROGRESS`, `DONE`, `BLOCKED`, `DEFERRED`.

## Product Direction

uGoodly is a Taiwan-stock dividend cash-flow and distribution research tool. The core journey is:

```text
Dividend events -> stock research -> yield/fill research -> screener
-> watchlist -> portfolio cash flow -> calendar subscription -> return visits
```

## Phase 0 — Metric & Correctness Foundation

- Status: `DONE`
- Goal: Ensure every financial label, SEO promise, and date shown by the frontend matches the underlying data contract.
- Scope: Metric definitions, canonical backend metrics, stock metadata, sitemap, last-buy trading date, homepage calendar wording, deployment configuration contract.
- Dependencies: Existing stock-detail and screener APIs; TWSE official holiday schedule; no database migration.

### Tasks

- [x] Document the metric contract for event yield, current-year announced cash/yield, fill rate, average fill days, and portfolio estimates.
- [x] Consume backend stock metrics in stock SEO content instead of recalculating them in the browser layer.
- [x] Rename screener labels and SEO copy to the announced-current-year metric definition.
- [x] Make stock metadata year data-driven and add focused coverage.
- [x] Remove unverifiable sitemap `lastModified` values.
- [x] Consume backend-provided `last_buy_date` and expose official/fallback status.
- [x] Align homepage metadata and copy with a pay-date-first calendar.
- [x] Document crawler/freshness production database secret mapping as deployment validation required.
- [x] Update proxy documentation drift.

### Done Criteria

- Metric names and formulas agree across stock, screener, SEO, and portfolio surfaces.
- Stock titles do not claim a system year without matching event data.
- Sitemap does not manufacture freshness.
- Upcoming last-buy dates use the backend trading calendar and visibly identify fallback estimates.
- Homepage wording accurately describes the main pay-date calendar.
- Focused frontend/backend checks pass, or unavailable checks are recorded.

### Validation

- Backend: focused unit tests, `pytest`, `python -m compileall -q app run_cron.py`.
- Frontend: metadata/metric helper tests if supported; lint/build when dependencies are available; static regression inspection otherwise.
- Regression: homepage calendar, stock page, screener, watchlist/portfolio entry points, metadata, sitemap, existing API fields.

### Notes / Decisions

- `annual_cash` means current-calendar-year announced cash dividends stored by uGoodly.
- `annual_yield` means that announced cash total divided by the latest stored price; it is not forward yield.
- `Dividend.updated_at` is maintenance time and is not automatically official-source publication time.
- Main calendar remains pay-date-first in Phase 0; ex-date visibility remains in UpcomingFocus and stock detail.
- Completed 2026-08-20. Backend unit/compile checks passed; frontend runtime checks remain unverified because Node/npm are unavailable in this workspace.
- Correctness follow-up completed 2026-08-20: stock history consumes canonical backend `fill_status` and no longer infers observing versus never-calculated from an ambiguous null result.

## Phase 1 — Conversion & Portfolio Productization

- Status: `DONE`
- Goal: Complete the Stock -> Watchlist -> Portfolio -> Calendar subscription journey.
- Scope: Stock watchlist client control, shared portfolio content/calculations, `/portfolio`, hydration, internal links, focused GA4 funnel.
- Dependencies: Phase 0 metric wording and API stability.

### Tasks

- [x] Add accessible watchlist add/remove control to `/stock/[id]`.
- [x] Expose a natural stock-to-portfolio link after activation.
- [x] Extract shared Portfolio calculations/data/content without duplicating Modal and Page.
- [x] Add `/portfolio` with local-only hydration/loading and unavailable-storage handling.
- [x] Mark `/portfolio` `noindex` and keep it out of sitemap.
- [x] Preserve backup/import/share/ICS behavior.
- [x] Add acquisition/activation/retention-intent analytics without duplicative events.
- [x] Verify Stock, Screener, Homepage, and Portfolio internal links.

### Done Criteria

- Stock detail can add/remove the same local watchlist used by the homepage.
- Modal and `/portfolio` share core content and calculations.
- Personalized data does not flash an incorrect empty state before hydration.
- Mobile/desktop, keyboard, empty, loading, and storage-failure states are covered.

### Validation

- Frontend lint/build when install state permits.
- Static and browser checks at narrow and desktop widths when browser tooling is available.
- Regression of backup, import, share card, calendar subscription, modal close/focus, and stock navigation.

### Notes / Decisions

- Phase 1 remains localStorage-only: no login, account database, cloud sync, or portfolio backend CRUD.
- Modal is a quick view; `/portfolio` is the deep-linkable workspace.
- Completed 2026-08-20. Modal and page share the same Portfolio component and pure calculation helpers. Static checks passed; runtime UI checks remain pending in a Node/browser-enabled environment.
- Correctness follow-up completed 2026-08-20: Portfolio positions explicitly distinguish current-year data, estimates, successful responses without usable history, request failures, and loading. Unavailable positions are excluded and disclosed in totals. GA4 now separates CTA intent (`portfolio_cta_click`) from rendered workspace views (`portfolio_view`).

## Phase 2 — Evergreen SEO Acquisition

- Status: `DONE`
- Goal: Add a small number of useful, indexable research pages without programmatic SEO spam.
- Scope: `/ranking/fill-rate`, `/ranking/consecutive-dividend`, `/ranking/high-yield`, methodology, samples, internal links, sitemap, landing analytics.
- Dependencies: Phase 0 metric contract and enough evaluated fill coverage.

### Tasks

- [x] Record a conservative minimum fill sample threshold; validate the production distribution after deployment.
- [x] Build fill-rate ranking with success/evaluated counts and average fill days.
- [x] Build consecutive-dividend ranking with methodology and limitations.
- [x] Build current-year announced-yield ranking with seasonal incompleteness disclosure.
- [x] Add SSR metadata/canonical, data date, methodology, stock/screener links, sitemap entries, and landing events.

### Done Criteria

- Three distinct SSR pages provide useful ranking data and sample context.
- No query-parameter-generated SEO inventory or thin doorway pages.
- ETF-specific rankings remain deferred until reliable instrument classification exists.

### Validation

- Metadata/canonical and sitemap inspection.
- Empty/low-coverage and normal ranking result checks.
- Internal link and responsive table checks.

### Notes / Decisions

- Completed 2026-08-20. Fill ranking requires at least 5 evaluated events and always shows success/evaluated and evaluated/total samples.
- The local workspace has no production dataset, so the 5-event threshold is intentionally conservative and must be checked against production distribution after deployment before it is tuned.
- Rankings use the mixed market dataset already supported by the screener; ETF-specific claims remain deferred.
- Correctness follow-up completed 2026-08-20: successful empty responses remain legitimate empty rankings, while non-200, network, and invalid upstream responses render an explicit unavailable state. Frequency labels identify the latest complete basis year.

## Phase 3 — Dividend / Fill Differentiation

- Status: `DONE`
- Goal: Make existing historical fill data a trustworthy descriptive research capability.
- Scope: Stock-level fill summary, coverage, historical state clarity, and limited dashboard exploration.
- Dependencies: Phase 0 canonical metrics and Phase 2 sample/coverage decisions.

### Tasks

- [x] Show fill success rate, evaluated count, total event count, and average days on stock detail.
- [x] Distinguish filled, over-observation unfilled, observing, and not-calculated states.
- [x] Expose coverage such as evaluated/total historical events.
- [x] Evaluate a small historical fill dashboard using existing assets; retain the stock summary, ranking, and event table instead of adding another dashboard.

### Done Criteria

- Stock fill research is explicitly historical and descriptive.
- Partial coverage cannot be mistaken for complete history.
- Existing event history remains the drill-down truth.

### Validation

- State matrix coverage and accessible text alternatives.
- Stock page regression on stocks with full, partial, and no evaluated history.

### Notes / Decisions

- Completed 2026-08-20. The stock summary is descriptive, exposes partial coverage, and keeps the event table as drill-down truth.
- Phase 3 state labels now map the backend canonical filled, unfilled-after-window, observing, not-calculated, and not-applicable values.
- No prediction, backtest engine, or separate dashboard was added; the new ranking plus stock summary already cover the useful exploration path with less duplication.

## Later / Deferred

- Status: `DEFERRED`
- Reliable official-source `instrument_type` classification and ETF rankings.
- Event-level provenance model with source identity, reference, fetched time, and publication time.
- Minimal owner operations UI for crawl/source/data/cache health.
- Evidence-driven batch portfolio API, materialized metrics, cache versioning, distributed locks, migration-job separation, or async SQLAlchemy.

## Explicit Don't Do

- Login/account or cloud portfolio sync.
- K-line terminal, broad technical analysis, institutional/chip portal, stock news portal, or broad financial-statements portal.
- AI stock recommendations or investment-advice features.
- One SEO landing page per screener filter.
- Large architecture rewrites or premature scaling work.

## Execution Record

| Phase | Status | Completion summary | Validation | Decisions / deviations |
|---|---|---|---|---|
| Phase 0 | DONE | Canonical metric/date/SEO semantics | Backend tests + compile; frontend static checks | No migration; frontend runtime unavailable. |
| Phase 1 | DONE | Shared local Portfolio modal/page and stock activation | Static route/import/diff checks | localStorage-only; `/portfolio` noindex. |
| Phase 2 | DONE | Three transparent SSR ranking pages | Static metadata/sitemap/internal-link checks | 5-event fill threshold; production distribution check pending; ETF-specific ranking deferred. |
| Phase 3 | DONE | Stock fill summary, coverage, and state clarity | Backend metric tests + frontend static checks | Descriptive research only; no separate dashboard. |
