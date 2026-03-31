# Repository Rules

## Project Context
- This project includes a user-facing frontend and Python-backed services.
- Prioritize UX clarity, accessibility, performance, and minimal disruption to existing behavior.
- Preserve current API contracts unless an explicit approval is given.

## Repository Expectations
- Read relevant files before proposing changes.
- Do not rewrite large modules unless the refactor has been explicitly approved.
- Prefer incremental changes over broad rewrites.
- Reuse existing patterns and helpers before introducing new ones.
- When a change touches both frontend behavior and data flow, keep the blast radius small and clearly state the boundary.

## Safe Frontend Autonomy
The agent may proceed without pausing for approval when changes are limited to:
- UI copy, spacing, layout, and visual refinements
- accessibility improvements
- loading / empty / error state improvements
- route history behavior fixes such as replace vs push
- refactoring frontend components without changing public API contracts
- adopting existing helper utilities when behavior remains consistent
- adding or updating tests for approved behavior
- updating README / DEVELOPMENT_LOG.md to reflect implemented changes

Pause for approval before:
- adding or removing dependencies
- changing API contracts
- changing file/folder structure in a meaningful way
- large component rewrites
- changing auth, security, proxy policy, or environment variable behavior
- changing deployment, CI/CD, or build pipeline
- introducing caching, background jobs, or persistent state with new behavior
- deleting code with non-trivial downstream impact

When approval is needed, provide:
1. what will change
2. why it should change
3. affected files
4. risks
5. rollback or safer alternative

## Commands
- Run backend tests with: pytest
- Run backend lint with: ruff check .
- Run backend format with: ruff format .
- If typing is enabled, run: mypy .

## Frontend Verification
For frontend-facing changes, verify when available:
- relevant lint checks
- relevant test checks
- production build
- manual verification notes for:
  - loading state
  - error state
  - empty state
  - keyboard / focus behavior
  - browser history behavior
  - mobile / narrow viewport behavior

## Planning Rules
For medium or large tasks:
1. inspect the relevant files
2. propose a short implementation plan
3. if the task stays within approved safe-autonomy scope, proceed
4. otherwise pause for approval
5. verify
6. update the development log if the change is meaningful

When useful, break work into phases:
1. analysis
2. plan
3. implementation
4. verification
5. log update

## Done When
A task is not complete until:
- the requested behavior is implemented
- impacted files are reviewed
- relevant checks have been run
- risks or unverified areas are explicitly stated
- visible user impact is summarized for frontend-facing changes
- `DEVELOPMENT_LOG.md` is updated when the change is meaningful

## Logging
Use `DEVELOPMENT_LOG.md` as the main project development record.

For meaningful changes, use this exact structure:

# Technical Development Log

## YYYY-MM-DD – Short Title
- Status: todo | in_progress | done
- Priority: low | medium | high
- Area:
- Files:
  - relative/path
- Why:
- Impact:
- Next:

Rules:
- Keep all fields present.
- Use `TBD` when a value is not yet known.
- Files must be relative paths.
- Title should be short and specific.

## Backlog
Normalize backlog entries to the fixed field order:
- Priority
- Status
- Category
- Owner
- Note
- Due