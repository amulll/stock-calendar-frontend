# DEVELOPMENT_LOG

## ✅ Completed

- [x] App Router skeleton established.
- [x] SSR data fetching for landing page.
- [x] Base UI theme and layout shipped.

## 🚨 High Priority

- [x] Removed `dangerouslySetInnerHTML` in `StockModal`.
- [x] Unified client requests behind `/api/proxy` (updated `YieldListModal`).
- [x] Fixed ex-date link on stock detail page.

## 🔧 Medium Priority

- [ ] Refactor `CalendarClient` into composable hooks/components.
- [ ] Memoize filtered dividend data to avoid O(N²) renders.
- [ ] Replace router navigation with `router.replace` for URL sync.

## 🎨 Low Priority

- [ ] Add modal accessibility (focus trap, aria labels, ESC close).
- [ ] Introduce global error/toast reporting.

## 📝 Notes

- Added `lib/proxy-client.js` plus proxy whitelist to keep tokens server-side.
- Still missing lockfile and `node_modules`; install deps and commit lockfile when ready.
