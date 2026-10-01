# AGENTS.md (MERN Monorepo Root)

## Architecture Overview
This workspace is a split MERN project containing:
- `api/` — Node.js & Express API backend
- `web/` — React & Vite frontend application

## Mandatory Pre-Flight Check (Run Before Every Task)
1. **Skill Check:** Review installed skills. If working on `web/`, check UI/design skills; if working on `api/`, check backend/database/security skills.
2. **Stack Detection:** Inspect `package.json` inside the target subfolder (`api/package.json` or `web/package.json`). Never assume package versions across boundaries.
3. **Freshness Directive:** Never use deprecated APIs or patterns. Follow current versions indicated in each subfolder's manifest.

## Rules Index (Root Shared)
Read `.agents/rules/` before acting (applies across both `api/` and `web/`):
- `00-token-economy.md` — Anti-rescan, anti-rewrite, targeted diffs, quota preservation.
- `01-workflow-and-increments.md` — 2-3 bullet plan, incremental builds, isolated changes.
- `02-code-freshness-and-security.md` — Anti-deprecation, zero secret leaks, input validation.
- `03-ui-and-frontend-policy.md` — Modern aesthetics, responsive UI, strict browser MCP rule (applies to `web/`).
- `04-backend-and-database-policy.md` — High performance queries, indexing, pagination, DB safety (applies to `api/`).

## Absolute Boundaries
### Ask Before Doing
- Adding or upgrading dependencies in either `api/` or `web/`
- Altering or dropping database schemas / collections
- Deleting existing files
- Running destructive terminal commands or production migrations

### Never Do
- Commit `.env` files in root, `api/`, or `web/`
- Rewrite an entire file when a targeted edit suffices
- Scan the entire repository when working on a single package (`api/` or `web/`)
- Duplicate the `.agents/` folder inside `api/` or `web/`

## Project Specifics
Ports, shared contracts, and monorepo configurations live in `PROJECT.md`.
