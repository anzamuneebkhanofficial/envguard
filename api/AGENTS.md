# AGENTS.md (Backend API Scope)

> **Context:** This directory contains the Express.js and MongoDB backend service. It inherits all root `.agents/rules/` from the parent directory.

## Subfolder Rules & Layout
- **Architecture:** `src/routes/` -> `src/controllers/` -> `src/services/` -> `src/models/`.
- **Validation:** Enforce validation on every route using Zod or Joi middleware before reaching controllers.
- **Async Errors:** Use express async error wrapper or centralized error middleware (`src/middlewares/errorHandler.js`).
- **Response Format:** `{ "success": boolean, "data": any, "message": string }`.
- **Boundaries:** Do not edit files outside `api/` when working on backend tasks.
