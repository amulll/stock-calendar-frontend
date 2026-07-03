# UI Design Guide

## Design Read
- Product type: Taiwan stock dividend calendar and dividend research utility.
- Audience: investors who need quick scanning, filtering, and stock detail lookup.
- Direction: professional financial data utility, not a landing page.
- References: TradingView for market-density patterns, Mobbin/Pageflows for real product flow patterns, Godly only for restraint and spacing inspiration.

## Visual Principles
- Data first: prioritize month navigation, search, filters, calendar cells, and stock rows.
- Reduce decoration: avoid large gradients, heavy shadows, oversized rounded cards, and ornamental uppercase labels.
- Consistent density: desktop should feel like a compact workstation; mobile should get to the calendar quickly.
- Clear hierarchy: numbers and dates can be bold; supporting labels should stay quiet.
- Stable interactions: styling changes must not alter API calls, query state, modal flow, or data contracts.

## Tokens And Patterns
- Background: `bg-slate-50` or white surfaces with thin `border-slate-200`.
- Primary accent: blue for navigation, links, focus, and selected controls.
- Semantic accents: avoid broad green/yellow/red surfaces on stock detail pages. Use neutral slate by default; reserve color for links, focus, watchlist state, or clear warnings.
- Watchlist: rose only for heart/watchlist state.
- Radius: prefer `rounded-xl` for major panels, `rounded-lg` for controls and chips.
- Shadow: avoid shadows by default; use borders and subtle background contrast.
- Labels: prefer Chinese product labels over decorative English uppercase labels unless they clarify data semantics.
- Tables: follow a GitHub Primer-like palette: white canvas, slate-50 subtle headers/group cells, slate borders, muted text, and blue only for links. Avoid navy table headers, warm tints, broad green emphasis, and attention colors unless they communicate an action or warning.

## Homepage Rules
- The first viewport should behave like a dashboard header, not a marketing hero.
- Month controller, entries count, watchlist count, and filters should be close together.
- Active filter summaries should be compact text, not extra cards on mobile.
- Calendar cells should show ticker rows as dense data, not decorative chips.

## Stock Page Rules
- Treat stock detail pages like compact financial reports.
- Keep key metrics near the symbol/name header.
- Calculator and chart panels should be useful but visually secondary to current dividend and history data.
- SEO content should be readable but visually lower priority.
- Avoid decorative accent strips on stock detail pages when using the Primer-style direction; rely on layout, typography, borders, and links for hierarchy.
- Prefer dividend timelines for ex-date to pay-date relationships because date sequencing is core to the product.
- Header summaries may use three compact metrics: latest price, cash dividend, and estimated yield.

## Change Control
- Do not add dependencies for visual polish unless explicitly approved.
- Do not change backend API, data shape, metadata behavior, router behavior, or modal lifecycle as part of styling passes.
- Meaningful UI changes must update `task.md` and `DEVELOPMENT_LOG.md`.
