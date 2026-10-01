# GEMINI.md (Antigravity Behavior Guardrails)

## Agent Interaction Rules
- **Confirmation on Destructive Actions:** Stop and ask explicit confirmation before dropping tables/collections, deleting files, or running destructive shell commands.
- **Small Plan First:** For multi-step tasks, state a 2-3 bullet point implementation plan before writing code. Specify clearly whether the change affects `api/`, `web/`, or both.
- **Scoped Tool Usage:** Never run browser tools (Playwright/Chrome DevTools MCP) automatically. Run browser QA on `web/` only when explicitly requested.
- **Package Discipline:** Always run package commands in the proper directory (e.g. `npm install` inside `api/` or `web/`, never accidentally mixed up).
