# Repository Rules

## Project Context
- This project is primarily Python-based.
- Prioritize maintainability and minimal disruption to existing behavior.
- Preserve current API contracts unless an explicit approval is given.

## Repository Expectations
- Read relevant files before proposing changes.
- Do not rewrite large modules unless the refactor has been explicitly approved.
- Prefer incremental changes over broad rewrites.

## Commands
- Run tests with: pytest
- Run lint with: ruff check .
- Run format with: ruff format .
- If typing is enabled, run: mypy .

## Done When
A task is not complete until:
- the requested behavior is implemented
- impacted files are reviewed
- relevant checks have been run
- risks or unverified areas are explicitly stated
- develop_log.md is updated when the change is meaningful

## Logging
Use `DEVELOPMENT_LOG.md` as the main project development record.

## Backlog
Normalize backlog entries to the fixed field order:
- Priority
- Status
- Category
- Owner
- Note
- Due