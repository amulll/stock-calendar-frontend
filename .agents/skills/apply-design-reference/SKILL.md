---
name: apply-design-reference
description: Use this when the user provides UI references, screenshots, inspiration sites, or design direction and wants the current frontend adapted safely to match the reference style.
---

# Apply Design Reference

This skill is for adapting an existing frontend page or component using design references while keeping the product stable and implementation-focused.

Use this skill when the user asks for things like:
- 「參考這個網站幫我改首頁」
- 「照這張圖的風格優化目前頁面」
- 「把這幾個設計範本融合到現在的 UI」
- 「先參考這個設計，再幫我改成適合我網站的版本」

## Goals
- absorb the useful parts of the reference
- map them onto the current codebase
- avoid unnecessary redesign scope
- preserve existing product behavior unless the user explicitly asks otherwise
- produce a safe implementation plan and verification checklist

## Default workflow

### 1. Read the local rules first
- Read `AGENTS.md`
- Read any relevant repo-specific docs or development log entries
- Respect the repo's safe-autonomy boundaries

### 2. Inspect the current target UI
Before proposing changes, inspect:
- the page/component the user wants changed
- surrounding shared components/layout patterns
- any existing spacing / card / button / typography conventions
- relevant responsive or state-driven behavior

### 3. Analyze the reference
Extract reusable design patterns from the reference:
- visual hierarchy
- section rhythm
- density / whitespace balance
- card/container treatment
- CTA style
- typography emphasis
- responsive layout direction
- loading / empty / error presentation

Do **not** treat the reference as something to clone literally.
Instead, identify:
- what should be borrowed
- what should be adapted
- what should be avoided

### 4. Call the right subagents
For this workflow, prefer this split:

- `design_reference_mapper`
  - translate the design reference into implementation-ready UI guidance

- `ux_auditor`
  - identify current user-flow friction, visual inconsistency, accessibility concerns, and state presentation gaps

- `frontend_implementer`
  - make the smallest effective changes that bring the target UI closer to the desired direction

- `regression_reviewer`
  - inspect risks to current behavior, accessibility, and manual verification coverage

- `state_flow_reviewer`
  - call only if the proposed design change may affect routing, query state, async flow, modal behavior, request timing, or browser history

### 5. Keep the scope controlled
Default to:
- low-risk visual improvements
- layout refinements
- hierarchy improvements
- copy presentation improvements
- better empty / loading / error states
- consistent CTA styling
- better mobile spacing and rhythm

Pause and ask for approval if the design change would require:
- public API changes
- new dependencies
- large rewrites
- major routing/state redesign
- changing auth/proxy/security/deployment behavior
- replacing large parts of the component architecture

### 6. Implement incrementally
Prefer:
- reuse of existing components and helpers
- small edits with visible impact
- preserving current naming and structure where reasonable
- avoiding speculative cleanup unrelated to the design task

### 7. Verify before declaring done
Verify as much as the repo supports.

At minimum, report:
- what was visually changed
- what was behaviorally unchanged
- what was manually checked
- what remains unverified

For frontend visual work, explicitly check:
- desktop layout
- narrow/mobile layout
- loading state
- empty state
- error state
- button hierarchy
- spacing consistency
- keyboard/focus behavior
- whether the new look still fits the product

## Required output format
At the end of the task, provide:
1. changed files
2. design patterns borrowed from the reference
3. implementation summary
4. verification performed
5. unverified risks
6. suggested `DEVELOPMENT_LOG.md` entry when meaningful

## Notes
- Prefer adaptation over imitation.
- Prefer clarity over decoration.
- Prefer product consistency over visual novelty.
- When in doubt, make the UI better without widening the architectural scope.