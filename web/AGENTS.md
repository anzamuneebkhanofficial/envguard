# AGENTS.md (Frontend Web Scope)

> **Context:** This directory contains the React and Vite client application. It inherits all root `.agents/rules/` from the parent directory.

## Subfolder Rules & Layout
- **Architecture:** `src/components/` (shared widgets), `src/pages/` (routes), `src/services/` (Axios API calls), `src/hooks/` (custom hooks).
- **Styling:** Use Tailwind utility classes. Follow brand colors and dark/light mode standards from `PROJECT.md`.
- **API Service Layer:** Never hardcode fetch URLs in UI components. Route all API calls through `src/services/api.js`.
- **Boundaries:** Do not edit files outside `web/` when working on frontend tasks.
