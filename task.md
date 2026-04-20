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

## Remaining Work

### Deferred
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
