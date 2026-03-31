# UI / Behavior Task Plan

## Scope
- Frontend UX / behavior improvements only
- No API contract changes
- No dependency changes
- No deployment, auth, proxy, or security policy changes

## Goal
- Reduce UI architecture risk in the current calendar flows without broad rewrites
- Prioritize keyboard access, interaction semantics, async stability, and modal behavior
- Keep the blast radius local and verification explicit

## Working Method
- Use the local agent roles as review lenses:
  - `ux_auditor`
  - `state_flow_reviewer`
  - `frontend_implementer`
  - `regression_reviewer`
- Execute in small tranches
- Verify the smallest relevant behavior after each tranche
- Update `DEVELOPMENT_LOG.md` for meaningful changes

## Findings Summary

### 1. Calendar date cell accessibility
- Priority: high
- Affected files:
  - components/CalendarGrid.js
- User-visible issue:
  - Calendar day cells are clickable by mouse but are not keyboard-focusable controls
  - Keyboard users cannot reliably open the day detail flow from the grid
- Low-risk direction:
  - Convert the date cell interaction into a semantic button pattern without changing the public props
  - Preserve existing stock sub-actions and stop-propagation behavior
- Verification:
  - Tab through the calendar
  - Open a day with keyboard
  - Ensure stock buttons inside the cell still work

### 2. Filter dropdown semantics
- Priority: high
- Affected files:
  - components/FilterBar.js
- User-visible issue:
  - Watchlist and yield panels use `role="menu"` even though they contain toggles, range input, and action buttons
  - Current semantics do not match the interaction model
- Low-risk direction:
  - Reframe these panels as labeled popovers / grouped controls instead of menus
  - Keep current visuals and behavior
- Verification:
  - Open and close both panels
  - Confirm keyboard focus remains usable
  - Confirm toggle and slider interactions still work

### 3. Yield modal stale request risk
- Priority: high
- Affected files:
  - components/YieldListModal.js
- User-visible issue:
  - Rapid threshold changes or close/reopen cycles can allow an older request to overwrite newer state
- Low-risk direction:
  - Add request version guarding or effect-scoped cancellation
  - Keep the same API and UI
- Verification:
  - Open modal, change threshold quickly, reopen, and confirm latest threshold wins
  - Confirm loading, error, and empty states still render correctly

### 4. Modal background scroll behavior
- Priority: medium
- Affected files:
  - components/ModalContainer.js
- User-visible issue:
  - Background content can still scroll while modal is open, especially on narrow viewports
- Low-risk direction:
  - Add temporary body scroll lock with cleanup on close
- Verification:
  - Open modal on desktop and mobile-width viewport
  - Ensure background does not scroll
  - Ensure scroll state restores on close

### 5. Toast accessibility
- Priority: medium
- Affected files:
  - components/ToastProvider.js
- User-visible issue:
  - Toasts are visible but not clearly announced for assistive technology
- Low-risk direction:
  - Add `aria-live` / `role="status"` semantics and tighten timer cleanup
- Verification:
  - Trigger success and error toasts
  - Confirm UI remains unchanged and timers still dismiss correctly

### 6. CalendarClient responsibility load
- Priority: medium
- Affected files:
  - components/CalendarClient.js
- User-visible issue:
  - Not an immediate bug, but the component still centralizes too many responsibilities
- Low-risk direction:
  - Do not refactor yet
  - Revisit only after the behavior-critical items above are stable
- Verification:
  - N/A for this tranche

## Recommended Execution Order

### Tranche 1
- `components/CalendarGrid.js`
- `components/FilterBar.js`
- Goal:
  - Fix the two clearest semantic and keyboard UX gaps with local edits only

### Tranche 2
- `components/YieldListModal.js`
- `components/ModalContainer.js`
- Goal:
  - Stabilize async behavior and modal scroll handling

### Tranche 3
- `components/ToastProvider.js`
- Goal:
  - Improve assistive feedback and timer cleanup

### Deferred
- `components/CalendarClient.js`
- Goal:
  - Reassess only if later changes show maintainability pain or regression risk

## Risks
- Semantic changes around calendar cells can affect nested click behavior if event boundaries are not preserved
- Changing panel semantics in `FilterBar` can affect focus order if not verified manually
- Request guarding in `YieldListModal` must not hide legitimate error states
- Body scroll lock must restore correctly to avoid trapping the page after modal close

## Out of Scope
- Proxy helper consolidation
- API changes
- SSR/data fetching redesign
- Large component restructuring
- Dependency additions

## Verification Matrix
- Keyboard flow:
  - calendar day selection
  - stock suggestion navigation
  - filter panel open/close
  - modal close via Escape
- Async flow:
  - yield modal rapid threshold changes
  - close during loading
- Visual behavior:
  - current month navigation unchanged
  - existing modal visuals unchanged
  - loading / error / empty states still visible
- History behavior:
  - no regression against the existing query sync work

## Next Decision
- Proposed first implementation tranche:
  - `components/CalendarGrid.js`
  - `components/FilterBar.js`
- Reason:
  - Highest UX value
  - Smallest code surface
  - No API or architectural changes
