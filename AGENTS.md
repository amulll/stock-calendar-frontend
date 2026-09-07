# Repository Rules

## Project Context

This repository contains a user-facing frontend with Python-backed services.

Prioritize:

- clear and accessible UX
- responsive behavior
- frontend performance
- minimal disruption to existing behavior

Preserve existing API contracts unless a task explicitly requires changing them.

## Implementation

Follow existing components, helpers, patterns, and project conventions before introducing new abstractions.

Prefer focused changes over broad rewrites.

For changes spanning frontend behavior and backend data flow, keep the boundary clear and minimize the blast radius.

Proceed directly with normal implementation work within the requested scope.

Pause before:

- adding or removing dependencies
- changing API contracts
- major component or module rewrites
- meaningful file or folder restructuring
- changing authentication, security, proxy, or environment-variable behavior
- changing deployment, CI/CD, or build configuration
- introducing new caching, background jobs, or persistent state
- deleting code with significant downstream impact

## Verification

Use checks relevant to the affected area.

Backend:

```bash
pytest
ruff check .
ruff format .
```

Run `mypy .` when typing is configured for the affected code.

For frontend-facing changes, verify when applicable:

- relevant lint and tests
- production build
- loading, empty, and error states
- keyboard and focus behavior
- browser history behavior
- mobile and narrow viewport behavior

Do not run unrelated broad checks without a concrete reason.

## Development Log

`DEVELOPMENT_LOG.md` is the project development record.

Update it for meaningful changes using its existing structure.

A meaningful change generally includes:

- new or changed user-facing behavior
- non-trivial bug fixes
- architecture or data-flow changes
- significant refactors
- operational or deployment changes

Minor copy, formatting, or trivial implementation changes do not require a log entry unless requested.

## Completion

For frontend-facing work, include the visible user impact in the completion report.

A task is complete when the requested behavior is implemented and the relevant verification has been performed or explicitly reported as unverified.
